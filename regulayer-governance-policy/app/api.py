"""
Regulayer Governance Policy - API Endpoints

CRITICAL CONSTRAINTS:
1. Policies never modify recorder DB
2. All mutations are append-only or state transitions
3. Invalid policy definitions are rejected
"""

from fastapi import APIRouter, HTTPException, Depends, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from uuid import UUID, uuid4
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from .models import (
    GovernancePolicy,
    GovernancePolicyCreate,
    PolicyCondition,
    PolicyAction,
    ApprovalRecord,
    ApprovalRecordCreate,
    WorkflowStatus,
    PolicyEvaluationResult
)
from .storage import (
    get_policy_session,
    GovernancePolicyDB,
    PolicyEvaluationLogDB
)
from .evaluator import evaluator
from .workflows import workflow_engine
from .config import settings
from .anomaly import anomaly_detector

router = APIRouter(prefix="/v1", tags=["policies"])


async def dispatch_audit_log(
    action: str,
    resource_type: str,
    org_id: str = None,
    resource_id: str = None,
    details: dict = None,
    actor_email: str = None
):
    """Fire-and-forget audit log to control plane's internal audit endpoint."""
    import httpx
    import logging
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            await client.post(
                f"{settings.control_plane_url}/v1/internal/audit-logs",
                json={
                    "organization_id": org_id,
                    "action": action,
                    "actor_email": actor_email,
                    "resource_type": resource_type,
                    "resource_id": resource_id,
                    "details": details or {}
                },
                headers={"X-Internal-Secret": settings.control_plane_internal_secret}
            )
    except Exception as e:
        logging.error(f"Audit dispatch failed for {action}: {e}")


# ============ Policy Management ============

@router.get("/policies", response_model=List[GovernancePolicy])
async def list_policies(
    x_org_id: Optional[str] = Header(None, alias="X-Org-Id"),
    session: AsyncSession = Depends(get_policy_session)
) -> List[GovernancePolicy]:
    """List all governance policies."""
    from sqlalchemy import or_
    stmt = select(GovernancePolicyDB)
    
    if x_org_id:
        try:
            org_uuid = UUID(x_org_id)
            stmt = stmt.where(GovernancePolicyDB.org_id == org_uuid)
        except ValueError:
            pass # Invalid UUID, ignore filter
            
    stmt = stmt.order_by(GovernancePolicyDB.created_at.desc())
    result = await session.execute(stmt)
    policies_db = result.scalars().all()
    
    return [
        GovernancePolicy(
            policy_id=p.policy_id,
            name=p.name,
            description=p.description,
            org_id=p.org_id,
            project_id=p.project_id,
            enabled=p.enabled,
            applies_to=p.applies_to,
            conditions=[PolicyCondition(**c) for c in p.conditions],
            actions=[PolicyAction(**a) for a in p.actions],
            created_at=p.created_at,
            updated_at=p.updated_at
        )
        for p in policies_db
    ]

# ============ Mode 1 Governance Intake ============

class GovernanceIntakeEvent(BaseModel):
    event: str
    decision_id: UUID
    org_id: str
    project_id: str
    environment: str
    payload: Dict[str, Any]

from fastapi import BackgroundTasks

@router.post("/intake", status_code=status.HTTP_202_ACCEPTED)
async def process_decision_intake(
    event: GovernanceIntakeEvent,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_policy_session)
):
    """
    Mode 1 Governance (Async Non-Blocking) Webhook Intake.
    Receives events directly from the Recorder without delaying the AI response.
    """
    if event.event != "DECISION_RECORDED":
        return {"status": "ignored", "reason": f"Unknown event: {event.event}"}
    
    # Run the equivalent of re_evaluate_policies but without fetching back from Recorder
    from sqlalchemy import or_
    # Build project/org filters: global rules (project_id/org_id IS NULL) always apply,
    # plus rules matching the specific org and project if provided
    filters = []
    
    if event.org_id and event.org_id.strip():
        try:
            org_uuid = UUID(event.org_id)
            filters.append(or_(
                GovernancePolicyDB.org_id == org_uuid,
                GovernancePolicyDB.org_id == None
            ))
        except (ValueError, AttributeError):
            pass

    if event.project_id and event.project_id.strip():
        try:
            proj_uuid = UUID(event.project_id)
            filters.append(or_(
                GovernancePolicyDB.project_id == proj_uuid,
                GovernancePolicyDB.project_id == None
            ))
        except (ValueError, AttributeError):
            pass  # Invalid UUID, just use global rules
    
    stmt = select(GovernancePolicyDB).where(
        GovernancePolicyDB.enabled == True,
        *filters
    )
    result = await session.execute(stmt)
    all_policies_db = result.scalars().all()
    
    # Filter out disabled policies (already done in query)
    # We must explicitly check the applies_to inside Python because it's JSON array
    policies_db = []
    
    # If the rule has an org_id, it MUST match the event's org_id
    # If the rule has a project_id, it MUST match the event's project_id
    
    for p in all_policies_db:
        # Strict Org Scoping: Global rules (None) apply to all. Specific rules MUST MATCH.
        if p.org_id and event.org_id:
            try:
                if p.org_id != UUID(event.org_id):
                    continue
            except ValueError:
                continue
                
        # Strict Project Scoping: Global (None) apply to all. Specific MUST MATCH.
        if p.project_id and event.project_id:
            try:
                if p.project_id != UUID(event.project_id):
                    continue
            except ValueError:
                continue
                
        policies_db.append(p)
    
    if not policies_db:
        return {"status": "skipped", "reason": "No policies matching project scope"}
        
    context = evaluator.build_context(
        decision_data=event.payload,
        governance_data={}
    )
    
    results = []
    actions_to_dispatch = []
    
    import asyncio
    
    policies = []
    for p in policies_db:
        policies.append(GovernancePolicy(
            policy_id=p.policy_id,
            name=p.name,
            description=p.description,
            org_id=p.org_id,
            project_id=p.project_id,
            enabled=p.enabled,
            applies_to=p.applies_to,
            conditions=[PolicyCondition(**c) for c in p.conditions],
            actions=[PolicyAction(**a) for a in p.actions],
            created_at=p.created_at,
            updated_at=p.updated_at
        ))
        
    # Evaluate concurrently
    eval_results = await asyncio.gather(*(evaluator.evaluate_policy(pol, context) for pol in policies))
    
    for pol, eval_result in zip(policies, eval_results):
        if eval_result.matched:
            actions_to_dispatch.extend(pol.actions)
        results.append(eval_result)

    # Statistical ML Anomaly Tracking
    # Determine if this decision violated policies (generated a block or require_approval)
    is_violation = any(
        isinstance(a.type, str) and a.type.lower() in ("block", "require_approval")
        or (not isinstance(a.type, str) and getattr(a.type, 'value', '').lower() in ("block", "require_approval"))
        for a in actions_to_dispatch
    )
    
    project_id_str = str(event.project_id) if event.project_id else "global"
    is_anomalous, reason = anomaly_detector.record_decision(project_id_str, is_violation)

    
    if is_anomalous:
        # Trigger an overarching anomaly freeze
        freeze_action = PolicyAction(
            type="block", 
            parameters={"reason": f"ANOMALY_FREEZE: {reason}"}
        )
        actions_to_dispatch.append(freeze_action)
        # We also need to emit an incident!
        import httpx
        import asyncio
        import logging
        
        async def emit_anomaly_incident():
            try:
                inc_url = f"{settings.incidents_url}/internal/incidents"
                secret = getattr(settings, 'internal_secret', "regulayer_internal_secret_value_change_in_prod")
                async with httpx.AsyncClient(timeout=2.0) as client:
                    await client.post(
                        inc_url,
                        json={
                            "incident_type": "ANOMALY_FREEZE",
                            "severity": "critical",
                            "source": "policy_engine",
                            "message": f"Emergency Freeze initiated for {project_id_str}: {reason}",
                            "metadata": {
                                "decision_id": str(event.decision_id),
                                "project_id": project_id_str,
                                "reason": reason
                            }
                        },
                        headers={"X-Internal-Auth": secret}
                    )
            except Exception as e:
                logging.error(f"Failed to emit anomaly incident: {e}")
                
        asyncio.create_task(emit_anomaly_incident())
        
    # Dispatch Actions securely to regulayer-governance service
    if actions_to_dispatch:
        import httpx
        from .config import settings
        import asyncio
        import logging
        
        gov_url = getattr(settings, 'governance_url', "http://governance:8002")
        secret = getattr(settings, 'internal_secret', "regulayer_internal_secret_value_change_in_prod")
        
        async def dispatch_action(action: PolicyAction):
            try:
                headers = {"X-Internal-Auth": secret}
                async with httpx.AsyncClient(timeout=3.0) as client:
                    action_type = str(action.type).lower()
                    if action_type in ["require_approval", "block", "auto_approve", "set_review_state", "add_tag"]:
                        # Push to Governance Service Queue Endpoint
                        await client.post(
                            f"{gov_url}/v1/governance/intake/action",
                            json={
                                "decision_id": str(event.decision_id),
                                "action_type": action_type,
                                "parameters": action.parameters
                            },
                            headers=headers
                        )
                    elif action.type == "notify_webhook":
                        webhook_url = action.parameters.get("url")
                        if webhook_url:
                            # Forward limited context to external webhook
                            await client.post(
                                webhook_url,
                                json={"event": "policy_action", "decision_id": str(event.decision_id)}
                            )
                    elif action.type == "notify_email":
                        email = action.parameters.get("email")
                        if email:
                            # In production, dispatch to SMTP queue or incident service
                            logging.info(f"Mock email dispatch to {email} for decision {event.decision_id}")
            except Exception as e:
                logging.error(f"Failed to dispatch action {action.type}: {e}")
                
        # Send actions asynchronously
        async def _dispatch_all():
            await asyncio.gather(*[dispatch_action(act) for act in actions_to_dispatch])
        asyncio.create_task(_dispatch_all())
    
    async def log_evaluations_background(decision_id: UUID, eval_results: list):
        from .storage import AsyncSessionLocal
        try:
            async with AsyncSessionLocal() as bg_session:
                for res in eval_results:
                    await workflow_engine.log_policy_evaluation(decision_id, res, bg_session)
        except Exception as e:
            import logging
            logging.error(f"Background policy evaluation logging failed for {decision_id}: {e}")

    # Add to FastAPI background tasks
    background_tasks.add_task(log_evaluations_background, event.decision_id, results)

    return {
        "status": "processed", 
        "policies_evaluated": len(results), 
        "actions_dispatched": len(actions_to_dispatch),
        "actions": [a.model_dump(mode="json") for a in actions_to_dispatch]
    }


@router.post(
    "/policies",
    response_model=GovernancePolicy,
    status_code=status.HTTP_201_CREATED
)
async def create_policy(
    body: GovernancePolicyCreate,
    x_org_id: Optional[str] = Header(None, alias="X-Org-Id"),
    x_actor_email: Optional[str] = Header(None, alias="X-Actor-Email"),
    session: AsyncSession = Depends(get_policy_session)
) -> GovernancePolicy:
    """
    Create a new governance policy.
    
    Policies are validated to ensure they are declarative only.
    """
    # Validate conditions have valid fields/operators
    for cond in body.conditions:
        if not cond.field or not cond.operator:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid condition: missing field or operator"
            )
    
    # Validate actions have valid types
    for action in body.actions:
        if not action.type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid action: missing type"
            )
    
    now = datetime.now(timezone.utc)
    org_uuid = None
    if x_org_id:
        try:
            org_uuid = UUID(x_org_id)
        except ValueError:
            pass

    policy_db = GovernancePolicyDB(
        policy_id=uuid4(),
        name=body.name,
        description=body.description,
        org_id=org_uuid,
        project_id=body.project_id,
        enabled=True,
        applies_to=body.applies_to,
        conditions=[c.model_dump() for c in body.conditions],
        actions=[a.model_dump() for a in body.actions],
        created_at=now,
        updated_at=now
    )
    
    session.add(policy_db)
    await session.commit()
    await session.refresh(policy_db)
    
    # Audit log: policy created
    if org_uuid:
        import asyncio
        asyncio.create_task(dispatch_audit_log(
            action="policy.created",
            resource_type="governance_policy",
            org_id=str(org_uuid),
            actor_email=x_actor_email,
            resource_id=str(policy_db.policy_id),
            details={"name": body.name, "conditions_count": len(body.conditions), "actions_count": len(body.actions)}
        ))
    
    return GovernancePolicy(
        policy_id=policy_db.policy_id,
        name=policy_db.name,
        description=policy_db.description,
        org_id=policy_db.org_id,
        project_id=policy_db.project_id,
        enabled=policy_db.enabled,
        applies_to=policy_db.applies_to,
        conditions=[PolicyCondition(**c) for c in policy_db.conditions],
        actions=[PolicyAction(**a) for a in policy_db.actions],
        created_at=policy_db.created_at,
        updated_at=policy_db.updated_at
    )


@router.get("/policies/{policy_id}", response_model=GovernancePolicy)
async def get_policy(
    policy_id: UUID,
    session: AsyncSession = Depends(get_policy_session)
) -> GovernancePolicy:
    """Get a specific policy by ID."""
    stmt = select(GovernancePolicyDB).where(GovernancePolicyDB.policy_id == policy_id)
    result = await session.execute(stmt)
    policy_db = result.scalars().first()
    
    if not policy_db:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    return GovernancePolicy(
        policy_id=policy_db.policy_id,
        name=policy_db.name,
        description=policy_db.description,
        org_id=policy_db.org_id,
        project_id=policy_db.project_id,
        enabled=policy_db.enabled,
        applies_to=policy_db.applies_to,
        conditions=[PolicyCondition(**c) for c in policy_db.conditions],
        actions=[PolicyAction(**a) for a in policy_db.actions],
        created_at=policy_db.created_at,
        updated_at=policy_db.updated_at
    )


@router.patch("/policies/{policy_id}/enable")
async def toggle_policy(
    policy_id: UUID,
    enabled: bool,
    x_org_id: Optional[str] = Header(None, alias="X-Org-Id"),
    x_actor_email: Optional[str] = Header(None, alias="X-Actor-Email"),
    session: AsyncSession = Depends(get_policy_session)
):
    """Enable or disable a policy."""
    stmt = select(GovernancePolicyDB).where(GovernancePolicyDB.policy_id == policy_id)
    result = await session.execute(stmt)
    policy_db = result.scalars().first()
    
    if not policy_db:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    if x_org_id:
        try:
            org_uuid = UUID(x_org_id)
            if policy_db.org_id is None or policy_db.org_id != org_uuid:
                raise HTTPException(status_code=403, detail="Forbidden: Policy belongs to a different organization or is a global system rule.")
        except ValueError:
            pass
    
    policy_db.enabled = enabled
    policy_db.updated_at = datetime.now(timezone.utc)
    await session.commit()
    
    # Audit log: policy toggled
    org_id_str = str(policy_db.org_id) if policy_db.org_id else x_org_id
    if org_id_str:
        import asyncio
        asyncio.create_task(dispatch_audit_log(
            action="policy.enabled" if enabled else "policy.disabled",
            resource_type="governance_policy",
            org_id=org_id_str,
            actor_email=x_actor_email,
            resource_id=str(policy_id),
            details={"name": policy_db.name, "enabled": enabled}
        ))
    
    return {"policy_id": str(policy_id), "enabled": enabled}


@router.delete("/policies/{policy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_policy(
    policy_id: UUID,
    x_org_id: Optional[str] = Header(None, alias="X-Org-Id"),
    x_actor_email: Optional[str] = Header(None, alias="X-Actor-Email"),
    session: AsyncSession = Depends(get_policy_session)
):
    """Delete a governance policy."""
    stmt = select(GovernancePolicyDB).where(GovernancePolicyDB.policy_id == policy_id)
    result = await session.execute(stmt)
    policy_db = result.scalars().first()
    
    if not policy_db:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    if x_org_id:
        try:
            org_uuid = UUID(x_org_id)
            if policy_db.org_id is None or policy_db.org_id != org_uuid:
                raise HTTPException(status_code=403, detail="Forbidden: Policy belongs to a different organization or is a global system rule.")
        except ValueError:
            pass
        
    # Capture details before deletion
    deleted_name = policy_db.name
    org_id_str = str(policy_db.org_id) if policy_db.org_id else x_org_id
        
    await session.delete(policy_db)
    await session.commit()
    
    # Audit log: policy deleted
    if org_id_str:
        import asyncio
        asyncio.create_task(dispatch_audit_log(
            action="policy.deleted",
            resource_type="governance_policy",
            org_id=org_id_str,
            actor_email=x_actor_email,
            resource_id=str(policy_id),
            details={"name": deleted_name}
        ))


# ============ Workflow Actions ============

@router.get("/workflows/{decision_id}", response_model=WorkflowStatus)
async def get_workflow_status(
    decision_id: UUID,
    session: AsyncSession = Depends(get_policy_session)
) -> WorkflowStatus:
    """Get workflow status for a decision."""
    return await workflow_engine.get_workflow_status(decision_id, session)


@router.post(
    "/workflows/{decision_id}/approve",
    response_model=ApprovalRecord,
    status_code=status.HTTP_201_CREATED
)
async def record_approval(
    decision_id: UUID,
    body: ApprovalRecordCreate,
    session: AsyncSession = Depends(get_policy_session)
) -> ApprovalRecord:
    """
    Record an approval decision.
    
    IMMUTABILITY: Approvals cannot be edited or deleted.
    """
    return await workflow_engine.record_approval(decision_id, body, session)


@router.post("/workflows/{decision_id}/re-evaluate")
async def re_evaluate_policies(
    decision_id: UUID,
    session: AsyncSession = Depends(get_policy_session)
):
    """
    Re-run all enabled policies against a decision.
    
    This is a read-only trigger that logs evaluation results.
    Actual action execution would be handled by a separate service.
    """
    # Make an authenticated call to the recorder to get the decision
    import httpx
    decision_data = {}
    try:
        recorder_url = getattr(settings, 'recorder_url', "http://recorder:8001")
        secret = getattr(settings, 'internal_secret', "regulayer_internal_secret_value_change_in_prod")
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(
                f"{recorder_url}/v1/decisions/{decision_id}",
                headers={"X-Internal-Auth": secret}
            )
            if resp.status_code == 200:
                decision_data = resp.json()
    except Exception as e:
        import logging
        logging.error(f"Failed to fetch decision from recorder: {e}")

    if not decision_data:
         raise HTTPException(status_code=404, detail="Decision data not found in recorder")

    # Filter policies by decision's org_id
    filters = []
    org_id = decision_data.get("metadata", {}).get("org_id")
    if org_id:
        try:
            org_uuid = UUID(org_id)
            from sqlalchemy import or_
            filters.append(or_(
                GovernancePolicyDB.org_id == org_uuid,
                GovernancePolicyDB.org_id == None
            ))
        except ValueError:
            pass

    # Get all enabled policies for this org
    stmt = select(GovernancePolicyDB).where(
        GovernancePolicyDB.enabled == True,
        *filters
    )
    result = await session.execute(stmt)
    all_policies_db = result.scalars().all()
    
    # Exact scoping
    policies_db = []
    for p in all_policies_db:
        if p.org_id and org_id:
            try:
                if p.org_id != UUID(org_id):
                    continue
            except ValueError:
                continue
        policies_db.append(p)

    context = evaluator.build_context(
        decision_data=decision_data,
        governance_data={} # TODO: Fetch from Governance Service if needed
    )
    
    results = []
    for p in policies_db:
        policy = GovernancePolicy(
            policy_id=p.policy_id,
            name=p.name,
            description=p.description,
            org_id=p.org_id,
            project_id=p.project_id,
            enabled=p.enabled,
            conditions=[PolicyCondition(**c) for c in p.conditions],
            actions=[PolicyAction(**a) for a in p.actions],
            created_at=p.created_at,
            updated_at=p.updated_at
        )
        
        eval_result = await evaluator.evaluate_policy(policy, context)
        await workflow_engine.log_policy_evaluation(decision_id, eval_result, session)
        results.append({
            "policy_id": str(eval_result.policy_id),
            "policy_name": eval_result.policy_name,
            "matched": eval_result.matched,
            "actions": eval_result.actions_executed
        })
    
    return {
        "decision_id": str(decision_id),
        "policies_evaluated": len(results),
        "results": results
    }
