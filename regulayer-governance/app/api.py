"""
Regulayer Governance - API Endpoints

CRITICAL CONSTRAINTS:
1. All endpoints are READ-ONLY or APPEND-ONLY
2. Annotations cannot be edited or deleted
3. Tags cannot be deleted in Phase 4.1
4. Invalid review state transitions return 409 Conflict
5. Governance data NEVER affects cryptographic verification
6. Access control enforces Segregation of Duties (Phase 4.4)
"""

from fastapi import APIRouter, HTTPException, Depends, status, Header, Body, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timezone
from uuid import UUID
import uuid
from uuid import UUID
import uuid
import sqlalchemy.exc as sa_exc
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel

from .models import (
    GovernanceMetadata,
    GovernanceTag,
    GovernanceAnnotation,
    GovernanceTagCreate,
    GovernanceAnnotationCreate,
    GovernanceReviewState,
    ReviewStateUpdate,
    VALID_REVIEW_TRANSITIONS
)
from .storage import (
    get_governance_session,
    GovernanceTagDB,
    GovernanceAnnotationDB,
    GovernanceReviewHistoryDB
)
from .access_control import (
    GovernanceRole,
    GovernancePermission,
    require_permission,
    raise_403,
    raise_conflict_403,
    check_approver_conflict,
    AccessControlError,
    ConflictOfInterestError,
    get_role_capabilities
)
from .audit_logger import log_governance_action, GovernanceAction
from .config import settings
from .ai_reviewer import analyze_decision_risk
from .models import (
    GovernanceAssignmentQueueCreate, GovernanceAssignmentQueue,
    GovernancePoliciesCreate, GovernancePolicies,
    GovernanceProposalCreate, GovernanceProposal,
    GateResolution, GateResolutionCreate
)
from .storage import (
    GovernanceAssignmentQueueDB, GovernancePoliciesDB, GovernanceProposalDB,
    GateResolutionDB
)
from .webhooks import dispatch_slack_interception
import asyncio

def get_actor_role(x_actor_role: Optional[str] = Header(None, alias="X-Actor-Role")) -> GovernanceRole:
    """
    Extract actor role from request header.
    
    In production, this would come from authentication/authorization middleware.
    """
    if not x_actor_role:
        return GovernanceRole.ANALYST  # Default for demo
    
    try:
        return GovernanceRole(x_actor_role.lower())
    except ValueError:
        return GovernanceRole.ANALYST




def verify_internal_auth(x_internal_auth: Optional[str] = Header(None, alias="X-Internal-Auth")):
    """
    Verify request comes from trusted internal source (Gateway/Recorder).
    """
    if not x_internal_auth or x_internal_auth != settings.internal_secret:
        raise HTTPException(status_code=403, detail="Forbidden: Internal Auth Required")


def verify_org_not_frozen(x_org_status: Optional[str] = Header(None, alias="X-Org-Status")):
    """
    Block writes if Organization is Frozen.
    """

    if x_org_status and x_org_status.lower() == "frozen":
        raise HTTPException(
            status_code=403, 
            detail="Forbidden: Organization is Frozen. Governance actions are disabled."
        )


router = APIRouter(prefix="/v1/governance", tags=["governance"], dependencies=[Depends(verify_internal_auth)])

@router.get("/roles/{role}/capabilities")
async def get_capabilities(role: str):
    """
    Get capabilities for a role (for UI state).
    
    Returns what actions a role can perform.
    """
    try:
        governance_role = GovernanceRole(role.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Unknown role: {role}")
    
    return {
        "role": role,
        "capabilities": get_role_capabilities(governance_role)
    }


async def get_current_review_state(session: AsyncSession, decision_id: UUID) -> GovernanceReviewState:
    """
    Compute current review state from history.
    """
    stmt = (
        select(GovernanceReviewHistoryDB)
        .where(GovernanceReviewHistoryDB.decision_id == decision_id)
        .order_by(
            desc(GovernanceReviewHistoryDB.timestamp),
            desc(GovernanceReviewHistoryDB.id)
        )
        .limit(1)
    )
    result = await session.execute(stmt)
    history = result.scalars().first()
    
    if history:
        return GovernanceReviewState(history.review_state)
    return GovernanceReviewState.UNREVIEWED


@router.get(
    "/queue",
    response_model=List[GovernanceMetadata],
    summary="Get queue of decisions for review"
)
async def get_review_queue(
    status: Optional[str] = "unreviewed",
    limit: int = 50,
    offset: int = 0,
    x_org_id: Optional[str] = Header(None, alias="X-Org-Id"),
    session: AsyncSession = Depends(get_governance_session)
) -> List[GovernanceMetadata]:
    """
    List decisions pending review.
    
    Performance: Uses the governance_assignment_queue table as the driving 
    table with a LATERAL join for the latest review state. This avoids the
    expensive DISTINCT ON scan over the full history table.
    """
    from sqlalchemy import text

    filter_status = None
    if status and status.lower() != "all":
        try:
            filter_status = GovernanceReviewState(status).value
        except ValueError:
            filter_status = status

    params = {"lim": limit, "off": offset}
    
    # Build optional WHERE clauses
    where_clauses = []
    
    if x_org_id:
        try:
            import uuid as _uuid
            org_uuid = _uuid.UUID(x_org_id)
            where_clauses.append("(h.org_id = :org_id OR h.org_id IS NULL)")
            params["org_id"] = str(org_uuid)
        except ValueError:
            pass
    
    if filter_status:
        where_clauses.append("h.review_state = :status")
        params["status"] = filter_status
    
    where_sql = (" WHERE " + " AND ".join(where_clauses)) if where_clauses else ""
    
    # Use assignment_queue as driving table → small table, fast scan.
    # LATERAL subquery gets the latest history entry per decision using
    # the existing idx_gov_review_history_decision_ts index.
    raw_sql = text(
        f'SELECT q.decision_id, h.review_state, h.timestamp'
        f' FROM governance_assignment_queue q'
        f' LEFT JOIN LATERAL ('
        f'   SELECT review_state, org_id, timestamp'
        f'   FROM governance_review_history'
        f'   WHERE decision_id = q.decision_id'
        f'   ORDER BY timestamp DESC, id DESC'
        f'   LIMIT 1'
        f' ) h ON true'
        f'{where_sql}'
        f' ORDER BY q.assigned_at DESC'
        f' LIMIT :lim OFFSET :off'
    )
    result = await session.execute(raw_sql, params)
    rows = result.all()
    
    full_results = []
    for r in rows:
        review_state = r.review_state or "escalated"
        full_results.append(GovernanceMetadata(
            decision_id=r.decision_id,
            review_state=GovernanceReviewState(review_state),
            tags=[],
            annotations=[],
            last_updated=r.timestamp or datetime.now(timezone.utc)
        ))
        
    return full_results


@router.get(
    "/{decision_id:uuid}",
    response_model=GovernanceMetadata,
    summary="Get governance metadata for a decision"
)
async def get_governance(
    decision_id: UUID,
    session: AsyncSession = Depends(get_governance_session)
) -> GovernanceMetadata:
    """
    Retrieve full governance metadata for a decision.
    """
    # 1. Compute Review State (Deterministic)
    current_state = await get_current_review_state(session, decision_id)
    
    # 2. Get tags
    stmt = select(GovernanceTagDB).where(GovernanceTagDB.decision_id == decision_id)
    result = await session.execute(stmt)
    tags_db = result.scalars().all()
    
    # 3. Get annotations
    stmt = select(GovernanceAnnotationDB).where(
        GovernanceAnnotationDB.decision_id == decision_id
    ).order_by(desc(GovernanceAnnotationDB.created_at))
    result = await session.execute(stmt)
    annotations_db = result.scalars().all()
    
    # 4. Get last updated timestamp from latest history or annotation
    last_updated = datetime.now(timezone.utc) # Default?
    # Ideally max(latest_history, latest_annotation, latest_tag)
    # Simplify: just use now or latest_history timestamp if available
    
    stmt = (
        select(GovernanceReviewHistoryDB.timestamp)
        .where(GovernanceReviewHistoryDB.decision_id == decision_id)
        .order_by(desc(GovernanceReviewHistoryDB.timestamp))
        .limit(1)
    )
    res_ts = await session.execute(stmt)
    ts = res_ts.scalar_one_or_none()
    if ts:
        last_updated = ts

    return GovernanceMetadata(
        decision_id=decision_id,
        review_state=current_state,
        tags=[
            GovernanceTag(
                id=t.id,
                decision_id=t.decision_id,
                name=t.name,
                category=t.category,
                source=t.source,
                created_at=t.created_at
            ) for t in tags_db
        ],
        annotations=[
            GovernanceAnnotation(
                id=a.id,
                decision_id=a.decision_id,
                author_role=a.author_role,
                note=a.note,
                created_at=a.created_at
            ) for a in annotations_db
        ],
        last_updated=last_updated
    )


@router.post(
    "/{decision_id:uuid}/annotations",
    response_model=GovernanceAnnotation,
    status_code=status.HTTP_201_CREATED,
    summary="Add annotation (append-only)",
    dependencies=[Depends(verify_internal_auth), Depends(verify_org_not_frozen)]
)
async def add_annotation(
    decision_id: UUID,
    body: GovernanceAnnotationCreate,
    x_actor_id: Optional[str] = Header(None, alias="X-Actor-Id"),
    session: AsyncSession = Depends(get_governance_session)
) -> GovernanceAnnotation:
    """
    Append an annotation to a decision.
    """
    # Create annotation
    annotation = GovernanceAnnotationDB(
        decision_id=decision_id,
        author_role=body.author_role,
        note=body.note,
        created_at=datetime.now(timezone.utc)
    )
    session.add(annotation)
    
    # Audit Log
    try:
        actor_uuid = UUID(x_actor_id) if x_actor_id else uuid.uuid4()
    except ValueError:
        actor_uuid = uuid.uuid4()
        
    await log_governance_action(
        session,
        decision_id=decision_id,
        action=GovernanceAction.ANNOTATION_ADDED,
        actor_id=actor_uuid,
        actor_role=body.author_role,
        details={"note_preview": body.note[:50]}
    )
    
    await session.commit()
    await session.refresh(annotation)
    
    return GovernanceAnnotation(
        id=annotation.id,
        decision_id=annotation.decision_id,
        author_role=annotation.author_role,
        note=annotation.note,
        created_at=annotation.created_at
    )


@router.post(
    "/{decision_id:uuid}/tags",
    response_model=GovernanceTag,
    status_code=status.HTTP_201_CREATED,
    summary="Add tag (no deletion in Phase 4.1)",
    dependencies=[Depends(verify_internal_auth), Depends(verify_org_not_frozen)]
)
async def add_tag(
    decision_id: UUID,
    body: GovernanceTagCreate,
    x_actor_id: Optional[str] = Header(None, alias="X-Actor-Id"),
    session: AsyncSession = Depends(get_governance_session)
) -> GovernanceTag:
    """
    Add a tag to a decision.
    """
    # Create tag
    tag = GovernanceTagDB(
        decision_id=decision_id,
        name=body.name,
        category=body.category,
        source=body.source,
        created_at=datetime.now(timezone.utc)
    )
    session.add(tag)
    
    try:
        actor_uuid = UUID(x_actor_id) if x_actor_id else uuid.uuid4()
    except ValueError:
        actor_uuid = uuid.uuid4()

    await log_governance_action(
        session,
        decision_id=decision_id,
        action=GovernanceAction.TAG_ADDED,
        actor_id=actor_uuid,
        actor_role="system", # Tags often auto / analyst
        details={"tag": body.name, "category": body.category}
    )
    
    await session.commit()
    await session.refresh(tag)
    
    return GovernanceTag(
        id=tag.id,
        decision_id=tag.decision_id,
        name=tag.name,
        category=tag.category,
        source=tag.source,
        created_at=tag.created_at
    )


@router.post(
    "/{decision_id:uuid}/reviews", # Changed from PATCH review-state to POST reviews (append)
    response_model=GovernanceMetadata,
    summary="Submit review decision (append-only)",
    dependencies=[Depends(verify_internal_auth), Depends(verify_org_not_frozen)]
)
async def update_review_state(
    decision_id: UUID,
    body: ReviewStateUpdate,
    x_actor_role: str = Header(..., alias="X-Actor-Role"), # Required for review
    x_actor_id: Optional[str] = Header(None, alias="X-Actor-Id"),
    background_tasks: BackgroundTasks = None,
    session: AsyncSession = Depends(get_governance_session)
) -> GovernanceMetadata:
    """
    Submit a review decision.
    
    Appends to history. Latest wins.
    """
    # Role Enforcement
    role = GovernanceRole(x_actor_role.lower())
    if role not in [GovernanceRole.COMPLIANCE]:
         # Strict check: Members/Analysts/Auditors/Admins cannot review
         # Only Compliance
         raise HTTPException(status_code=403, detail="Forbidden: Insufficient permissions to review.")

    current_state = await get_current_review_state(session, decision_id)
    new_state = body.new_state
    
    # Validate transition
    allowed_transitions = VALID_REVIEW_TRANSITIONS.get(current_state, [])
    if new_state not in allowed_transitions:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": "InvalidStateTransition",
                "message": f"Cannot transition from '{current_state.value}' to '{new_state.value}'",
                "allowed_transitions": [s.value for s in allowed_transitions]
            }
        )
    
    # Fetch previous history entry to carry over org_id and project_id
    stmt = select(GovernanceReviewHistoryDB).where(
        GovernanceReviewHistoryDB.decision_id == decision_id
    ).order_by(GovernanceReviewHistoryDB.timestamp.desc()).limit(1)
    res = await session.execute(stmt)
    prev_entry = res.scalar_one_or_none()
    
    org_id_val = prev_entry.org_id if prev_entry else None
    proj_id_val = prev_entry.project_id if prev_entry else None
    
    try:
        actor_uuid = UUID(x_actor_id) if x_actor_id else uuid.uuid4()
    except ValueError:
        actor_uuid = uuid.uuid4()
    
    history_entry = GovernanceReviewHistoryDB(
        decision_id=decision_id,
        org_id=org_id_val,
        project_id=proj_id_val,
        review_state=new_state.value,
        actor_role=role.value,
        actor_id=actor_uuid,
        action_reason=body.action_reason,
        risk_level=body.risk_level,
        timestamp=datetime.now(timezone.utc)
    )
    session.add(history_entry)
    
    import json
    await log_governance_action(
        decision_id=decision_id,
        actor_role=role.value,
        action=GovernanceAction.CHANGE_REVIEW_STATE,
        session=session,
        details=json.dumps({"old_state": current_state.value, "new_state": new_state.value, "actor_id": str(actor_uuid)})
    )
    
    await session.commit()
    
    # Emit Incident on Rejection
    if new_state.value == "rejected" and background_tasks:
        import httpx
        from .config import settings
        import logging
        async def emit_rejection_incident(d_id: str, reason: str, actor: str):
            try:
                inc_url = f"{settings.incidents_url}/internal/incidents"
                async with httpx.AsyncClient(timeout=2.0) as client:
                    await client.post(
                        inc_url,
                        json={
                            "incident_type": "GOVERNANCE_REJECTED",
                            "severity": "critical",
                            "source": "governance",
                            "message": f"Decision {d_id} was REJECTED by {actor}. Reason: {reason}",
                            "metadata": {
                                "decision_id": d_id,
                                "reviewer": actor,
                                "reason": reason
                            }
                        },
                        headers={"X-Internal-Auth": settings.incidents_internal_secret}
                    )
            except Exception as e:
                logging.error(f"Failed to emit rejection incident for {d_id}: {e}")
                
        background_tasks.add_task(
            emit_rejection_incident,
            d_id=str(decision_id),
            reason=body.action_reason or "No reason provided",
            actor=role.value
        )
    
    # Return full metadata
    return await get_governance(decision_id, session)


@router.post(
    "/intake",
    status_code=status.HTTP_201_CREATED,
    summary="Receive new decision for governance and trigger AI review",
    dependencies=[Depends(verify_internal_auth)]
)
async def intake_decision(
    payload: dict = Body(...),
    session: AsyncSession = Depends(get_governance_session)
):
    """
    Intake a decision from the gateway, run AI risk analysis, and queue for review.
    """
    decision_id = payload.get("decision_id")
    org_id = payload.get("org_id")
    project_id = payload.get("project_id")
    # Recorder sends decision data nested under "payload" key
    inner_payload = payload.get("payload", {})
    decision_input = inner_payload.get("input", payload.get("input", {}))
    decision_output = inner_payload.get("output", payload.get("output", {}))
    
    if not decision_id:
        raise HTTPException(status_code=400, detail="Missing decision_id")
        
    try:
        decision_uuid = UUID(decision_id)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail=f"Invalid decision_id: {decision_id}")
    
    # org_id and project_id may be non-UUID values like "default_org" or "global"
    org_uuid = None
    if org_id:
        try:
            org_uuid = UUID(org_id)
        except (ValueError, AttributeError):
            pass  # Non-UUID org_id (e.g. "default_org") — skip org-specific logic
    
    proj_uuid = None
    if project_id:
        try:
            proj_uuid = UUID(project_id)
        except (ValueError, AttributeError):
            pass  # Non-UUID project_id (e.g. "global") — skip project-specific logic

    # Fetch active policy (gracefully handle missing org_id column on legacy deployments)
    policy_json = {}
    if org_uuid:
        try:
            stmt = select(GovernancePoliciesDB).where(GovernancePoliciesDB.org_id == org_uuid)
            res = await session.execute(stmt)
            policy_db = res.scalar_one_or_none()
            if policy_db:
                policy_json = policy_db.policy_json
        except Exception:
            # governance_policies table may not have org_id column yet on older deployments
            await session.rollback()
            policy_json = {}

    # Run AI Analysis
    risk_level, action_reason, suggested_assignment = await analyze_decision_risk(
        decision_input=decision_input,
        decision_output=decision_output,
        policy_json=policy_json
    )

    # Check for existing state (in case intake/action ran first)
    current_state = await get_current_review_state(session, decision_uuid)
    new_state = current_state.value if current_state != GovernanceReviewState.UNREVIEWED else GovernanceReviewState.UNREVIEWED.value

    # Initial History Entry
    history_entry = GovernanceReviewHistoryDB(
        decision_id=decision_uuid,
        org_id=org_uuid,
        project_id=proj_uuid,
        review_state=new_state,
        actor_role="system",
        actor_id=uuid.uuid4(),  # System actor
        action_reason=action_reason,
        risk_level=risk_level,
        timestamp=datetime.now(timezone.utc)
    )
    session.add(history_entry)

    # Assignment Queue — check for existing entry to avoid unique constraint violation
    priority = "high" if risk_level == "high" else "normal"
    existing_queue = await session.execute(
        select(GovernanceAssignmentQueueDB).where(
            GovernanceAssignmentQueueDB.decision_id == decision_uuid
        )
    )
    if not existing_queue.scalars().first():
        queue_entry = GovernanceAssignmentQueueDB(
            decision_id=decision_uuid,
            assigned_to=None,
            priority=priority,
            assigned_at=datetime.now(timezone.utc)
        )
        session.add(queue_entry)

    try:
        await session.commit()
    except sa_exc.IntegrityError:
        # Race condition: another request inserted into queue
        await session.rollback()
        # Re-add just the history entry (history does not have a unique constraint)
        session.add(history_entry)
        await session.commit()
    
    return {"message": "Intake processed", "risk_level": risk_level, "priority": priority}


class PolicyActionIntake(BaseModel):
    decision_id: UUID
    action_type: str
    parameters: dict

@router.post(
    "/intake/action",
    status_code=status.HTTP_201_CREATED,
    summary="Mode 1 Governance Action Intake",
    dependencies=[Depends(verify_internal_auth)]
)
async def intake_policy_action(
    payload: PolicyActionIntake,
    session: AsyncSession = Depends(get_governance_session)
):
    """
    Receive a required action from the Policy Engine asynchronously.
    Creates review tracking and assignments based on the action.
    """
    if payload.action_type == "require_approval":
        assigned_role = payload.parameters.get("assign_role", "analyst")
        
        # 1. Update/Add Review History State
        history_entry = GovernanceReviewHistoryDB(
            decision_id=payload.decision_id,
            org_id=UUID(payload.parameters.get("org_id")) if payload.parameters.get("org_id") else None,
            project_id=UUID(payload.parameters.get("project_id")) if payload.parameters.get("project_id") else None,
            review_state=GovernanceReviewState.ESCALATED.value,
            actor_role="system",
            actor_id=uuid.uuid4(),
            action_reason=f"Policy required approval by {assigned_role}",
            risk_level="unknown", # Metadata fetched independently later if needed
            timestamp=datetime.now(timezone.utc)
        )
        session.add(history_entry)
        
        # 2. Add Assignment Queue Task (upsert to avoid unique constraint violations)
        # assigned_to is a UUID column (nullable), store role in priority for routing
        existing_stmt = select(GovernanceAssignmentQueueDB).where(
            GovernanceAssignmentQueueDB.decision_id == payload.decision_id
        )
        existing_result = await session.execute(existing_stmt)
        existing_queue = existing_result.scalar_one_or_none()
        
        if existing_queue:
            # Update existing entry with latest priority
            existing_queue.priority = f"high:{assigned_role}"
            existing_queue.assigned_at = datetime.now(timezone.utc)
        else:
            queue_entry = GovernanceAssignmentQueueDB(
                decision_id=payload.decision_id,
                assigned_to=None,
                priority=f"high:{assigned_role}",
                assigned_at=datetime.now(timezone.utc)
            )
            session.add(queue_entry)
        
        try:
            await session.commit()
        except sa_exc.IntegrityError:
            # Race condition: another request inserted into queue
            await session.rollback()
            # Re-add just the history entry (history does not have a unique constraint)
            session.add(history_entry)
            await session.commit()
        
        # Slack Webhook Dispatch
        webhook_url = payload.parameters.get("webhook_url") or settings.slack_webhook_url
        if webhook_url:
            async def _slack_dispatch():
                try:
                    import httpx
                    recorder_url = getattr(settings, 'recorder_url', "http://recorder:8001")
                    async with httpx.AsyncClient(timeout=3.0) as client:
                        resp = await client.get(f"{recorder_url}/v1/decisions/{payload.decision_id}")
                        if resp.status_code == 200:
                            data = resp.json()
                            canonical = data.get("canonical_payload", {})
                            d_in = canonical.get("input", {})
                            d_out = canonical.get("output", {})
                            sys_name = data.get("system_name", "Unknown System")
                            project_id_str = data.get("chain_id", "global")
                            
                            await dispatch_slack_interception(
                                webhook_url=webhook_url,
                                decision_id=str(payload.decision_id),
                                project_id=project_id_str,
                                risk_level="high", # Escalation implies risk
                                reason=f"Policy required approval by {assigned_role}",
                                system_name=sys_name,
                                decision_input=d_in,
                                decision_output=d_out
                            )
                except Exception as e:
                    import logging
                    logging.error(f"Slack Dispatch failed: {e}")
            
            asyncio.create_task(_slack_dispatch())
        
        return {"status": "action_recorded", "action": payload.action_type}
        
    elif payload.action_type in ["block", "auto_approve", "set_review_state"]:
        state_map = {
            "block": GovernanceReviewState.REJECTED.value,
            "auto_approve": GovernanceReviewState.APPROVED.value,
        }
        review_state = state_map.get(payload.action_type) or payload.parameters.get("state", GovernanceReviewState.PENDING.value)
        
        history_entry = GovernanceReviewHistoryDB(
            decision_id=payload.decision_id,
            org_id=UUID(payload.parameters.get("org_id")) if payload.parameters.get("org_id") else None,
            project_id=UUID(payload.parameters.get("project_id")) if payload.parameters.get("project_id") else None,
            review_state=review_state,
            actor_role="system",
            actor_id=uuid.uuid4(),
            action_reason=f"Policy applied action: {payload.action_type}",
            risk_level="unknown",
            timestamp=datetime.now(timezone.utc)
        )
        session.add(history_entry)
        await session.commit()
        
        if payload.action_type == "block":
            reason = payload.parameters.get("reason", "Policy Violation (Blocked)")
            webhook_url = payload.parameters.get("webhook_url") or settings.slack_webhook_url
            if webhook_url:
                async def _slack_dispatch_block():
                    try:
                        import httpx
                        recorder_url = getattr(settings, 'recorder_url', "http://recorder:8001")
                        async with httpx.AsyncClient(timeout=3.0) as client:
                            resp = await client.get(f"{recorder_url}/v1/decisions/{payload.decision_id}")
                            if resp.status_code == 200:
                                data = resp.json()
                                canonical = data.get("canonical_payload", {})
                                d_in = canonical.get("input", {})
                                d_out = canonical.get("output", {})
                                sys_name = data.get("system_name", "Unknown System")
                                project_id_str = data.get("chain_id", "global")
                                
                                await dispatch_slack_interception(
                                    webhook_url=webhook_url,
                                    decision_id=str(payload.decision_id),
                                    project_id=project_id_str,
                                    risk_level="critical",
                                    reason=f"BLOCKED: {reason}",
                                    system_name=sys_name,
                                    decision_input=d_in,
                                    decision_output=d_out
                                )
                    except Exception as e:
                        import logging
                        logging.error(f"Slack Dispatch failed on block: {e}")
                
                asyncio.create_task(_slack_dispatch_block())
        
        return {"status": "action_recorded", "action": payload.action_type}
        
    elif payload.action_type == "add_tag":
        tag_name = payload.parameters.get("tag")
        if tag_name:
            tag_entry = GovernanceTagDB(
                decision_id=payload.decision_id,
                name=tag_name,
                category="policy_auto_tag",
                source="system",
                created_at=datetime.now(timezone.utc)
            )
            session.add(tag_entry)
            await session.commit()
        return {"status": "action_recorded", "action": payload.action_type}

    return {"status": "ignored", "reason": "Unknown action_type"}


@router.post(
    "/policies",
    response_model=GovernancePolicies,
    summary="Update organization governance policies"
)
async def update_policies(
    body: GovernancePoliciesCreate,
    x_actor_role: str = Header(..., alias="X-Actor-Role"),
    session: AsyncSession = Depends(get_governance_session)
):
    """
    Override or set the org-specific JSON policy definition used by the AI and Review system.
    """
    role = GovernanceRole(x_actor_role.lower())
    if role not in [GovernanceRole.ADMIN, GovernanceRole.OWNER]:
        raise HTTPException(status_code=403, detail="Forbidden: Insufficient permissions to set policies.")

    stmt = select(GovernancePoliciesDB).where(GovernancePoliciesDB.org_id == body.org_id)
    res = await session.execute(stmt)
    policy = res.scalar_one_or_none()
    
    if policy:
        policy.policy_json = body.policy_json
    else:
        policy = GovernancePoliciesDB(
            org_id=body.org_id,
            policy_json=body.policy_json
        )
        session.add(policy)
        
    await session.commit()
    await session.refresh(policy)
    
    return GovernancePolicies(
        org_id=policy.org_id,
        policy_json=policy.policy_json,
        created_at=policy.created_at,
        updated_at=policy.updated_at
    )

# ============ Mode 2: Synchronous Blocking Governance ============

@router.post(
    "/propose",
    response_model=GovernanceProposal,
    status_code=status.HTTP_201_CREATED,
    summary="Mode 2: Propose a decision for future execution",
    dependencies=[Depends(verify_internal_auth)]
)
async def propose_decision(
    body: GovernanceProposalCreate,
    session: AsyncSession = Depends(get_governance_session)
):
    """
    Mode 2 Intake: Receive a proposal, run AI risk check, hold in PENDING state.
    """
    org_uuid = None
    if body.org_id:
        org_uuid = UUID(body.org_id)
    proj_uuid = None
    if body.project_id:
        proj_uuid = UUID(body.project_id)

    # Fetch active policy
    policy_json = {}
    if org_uuid:
        stmt = select(GovernancePoliciesDB).where(GovernancePoliciesDB.org_id == org_uuid)
        res = await session.execute(stmt)
        policy_db = res.scalar_one_or_none()
        if policy_db:
            policy_json = policy_db.policy_json

    # Run AI Analysis (on proposed input/output if they exist in payload)
    decision_input = body.proposed_payload.get("input", {})
    decision_output = body.proposed_payload.get("output", {})
    risk_level, action_reason, suggested_assignment = await analyze_decision_risk(
        decision_input=decision_input,
        decision_output=decision_output,
        policy_json=policy_json
    )

    proposal = GovernanceProposalDB(
        org_id=org_uuid,
        project_id=proj_uuid,
        environment=body.environment,
        proposed_payload=body.proposed_payload,
        status="pending",
        action_reason=action_reason,
        risk_level=risk_level
    )
    session.add(proposal)
    await session.commit()
    await session.refresh(proposal)

    return GovernanceProposal(
        id=proposal.id,
        org_id=proposal.org_id,
        project_id=proposal.project_id,
        environment=proposal.environment,
        proposed_payload=proposal.proposed_payload,
        status=proposal.status,
        decision_id=proposal.decision_id,
        action_reason=proposal.action_reason,
        risk_level=proposal.risk_level,
        edit_chain=proposal.edit_chain,
        created_at=proposal.created_at,
        updated_at=proposal.updated_at
    )


@router.get(
    "/proposals",
    response_model=List[GovernanceProposal],
    summary="Get queue of pending proposals (Mode 2)"
)
async def list_proposals(
    status: Optional[str] = "pending",
    decision_id: Optional[UUID] = None,
    limit: int = 50,
    offset: int = 0,
    x_org_id: Optional[str] = Header(None, alias="X-Org-Id"),
    session: AsyncSession = Depends(get_governance_session)
):
    from sqlalchemy import or_
    stmt = select(GovernanceProposalDB)
    
    if x_org_id:
        try:
            org_uuid = UUID(x_org_id)
            stmt = stmt.where(or_(
                GovernanceProposalDB.org_id == org_uuid,
                GovernanceProposalDB.org_id == None
            ))
        except ValueError:
            pass

    if status:
        stmt = stmt.where(GovernanceProposalDB.status == status)
    if decision_id:
        stmt = stmt.where(GovernanceProposalDB.decision_id == decision_id)
    stmt = stmt.order_by(desc(GovernanceProposalDB.created_at)).limit(limit).offset(offset)
    
    result = await session.execute(stmt)
    proposals = result.scalars().all()
    
    return [
        GovernanceProposal(
            id=p.id,
            org_id=p.org_id,
            project_id=p.project_id,
            environment=p.environment,
            proposed_payload=p.proposed_payload,
            status=p.status,
            decision_id=p.decision_id,
            action_reason=p.action_reason,
            risk_level=p.risk_level,
            created_at=p.created_at,
            updated_at=p.updated_at
        ) for p in proposals
    ]


@router.get(
    "/proposals/{proposal_id}",
    response_model=GovernanceProposal,
    summary="Get details of a specific Mode 2 proposal"
)
async def get_proposal(
    proposal_id: UUID,
    session: AsyncSession = Depends(get_governance_session)
):
    stmt = select(GovernanceProposalDB).where(GovernanceProposalDB.id == proposal_id)
    res = await session.execute(stmt)
    proposal = res.scalar_one_or_none()
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    return GovernanceProposal(
        id=proposal.id,
        org_id=proposal.org_id,
        project_id=proposal.project_id,
        environment=proposal.environment,
        proposed_payload=proposal.proposed_payload,
        status=proposal.status,
        decision_id=proposal.decision_id,
        action_reason=proposal.action_reason,
        risk_level=proposal.risk_level,
        edit_chain=proposal.edit_chain,
        created_at=proposal.created_at,
        updated_at=proposal.updated_at
    )


class ProposalReviewRequest(BaseModel):
    action: Literal["approve", "reject"]
    edited_payload: Optional[Dict[str, Any]] = None
    reason: str


@router.post(
    "/proposals/{proposal_id}/review",
    response_model=GovernanceProposal,
    summary="Review (Approve/Reject) a Mode 2 Proposal",
    dependencies=[Depends(verify_internal_auth), Depends(verify_org_not_frozen)]
)
async def review_proposal(
    proposal_id: UUID,
    body: ProposalReviewRequest,
    x_actor_role: str = Header(..., alias="X-Actor-Role"),
    x_actor_id: Optional[str] = Header(None, alias="X-Actor-Id"),
    x_org_id: Optional[str] = Header(None, alias="X-Org-Id"),
    session: AsyncSession = Depends(get_governance_session)
):
    # Role Enforcement
    role = GovernanceRole(x_actor_role.lower())
    if role not in [GovernanceRole.COMPLIANCE, GovernanceRole.OWNER]:
         raise HTTPException(status_code=403, detail="Forbidden: Insufficient permissions to review proposals.")

    stmt = select(GovernanceProposalDB).where(GovernanceProposalDB.id == proposal_id)
    res = await session.execute(stmt)
    proposal = res.scalar_one_or_none()
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    if proposal.status != "pending":
        raise HTTPException(status_code=400, detail=f"Proposal is already {proposal.status}")

    # Org Scoping Enforcement
    if x_org_id and proposal.org_id:
        try:
            if UUID(x_org_id) != proposal.org_id:
                raise HTTPException(status_code=403, detail="Forbidden: Proposal belongs to a different organization.")
        except ValueError:
            pass

    if body.action == "reject":
        proposal.status = "rejected"
        proposal.action_reason = f"Rejected by {role.value}: {body.reason}"
        await session.commit()
    elif body.action == "approve":
        # Finalize Payload
        final_payload = body.edited_payload if body.edited_payload else proposal.proposed_payload
        
        # Hash chain for audit integrity when response was edited
        if body.edited_payload:
            import hashlib
            import json as json_lib
            from datetime import datetime as dt, timezone as tz
            
            original_hash = hashlib.sha256(
                json_lib.dumps(proposal.proposed_payload, sort_keys=True, default=str).encode()
            ).hexdigest()
            edited_hash = hashlib.sha256(
                json_lib.dumps(body.edited_payload, sort_keys=True, default=str).encode()
            ).hexdigest()
            
            proposal.edit_chain = {
                "original_hash": original_hash,
                "edited_hash": edited_hash,
                "editor_id": x_actor_id or "unknown",
                "editor_role": role.value,
                "edited_at": dt.now(tz.utc).isoformat(),
                "chain_hash": hashlib.sha256(
                    f"{original_hash}:{edited_hash}:{x_actor_id}".encode()
                ).hexdigest()
            }
        
        proposal.proposed_payload = final_payload
        
        # NOTE: We now forward it to Recorder to act like a real decision
        import httpx
        try:
            recorder_url = getattr(settings, 'recorder_url', "http://recorder:8001")
            
            # Use appropriate headers. We might need identity headers if Recorder requires them.
            # Recorder validates X-Regulayer-Signature or expects internal auth?
            # Recorder 'ingest_decision' accepts legacy headers. We'll send it without signature,
            # wait, if Recorder requires signature, it might reject. 
            # In Phase 1, the Recorder ingestion was called by proxy (Gateway). 
            # We mock the headers to make the Recorder accept it, or use a new internal auth for Recorder.
            # For this demo, sending it to Recorder's POST /v1/decisions directly as legacy.
            async with httpx.AsyncClient(timeout=5.0) as client:
                headers = {
                    "X-Regulayer-Environment": proposal.environment,
                    "X-Regulayer-Project-Id": str(proposal.project_id) if proposal.project_id else "global"
                }
                resp = await client.post(
                    f"{recorder_url}/v1/decisions",
                    json=final_payload,
                    headers=headers
                )
                
                if resp.status_code == 201:
                    data = resp.json()
                    proposal.decision_id = UUID(data["decision_id"])
                    proposal.status = "approved"
                    proposal.action_reason = f"Approved by {role.value}: {body.reason}"
                else:
                    raise HTTPException(status_code=500, detail=f"Failed to record decision: {resp.text}")
                    
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed communicating with Recorder: {str(e)}")
            
        await session.commit()
        
    await session.refresh(proposal)
    
    return GovernanceProposal(
        id=proposal.id,
        org_id=proposal.org_id,
        project_id=proposal.project_id,
        environment=proposal.environment,
        proposed_payload=proposal.proposed_payload,
        status=proposal.status,
        decision_id=proposal.decision_id,
        action_reason=proposal.action_reason,
        risk_level=proposal.risk_level,
        edit_chain=proposal.edit_chain,
        created_at=proposal.created_at,
        updated_at=proposal.updated_at
    )


from .evidence_models import GovernanceEvidenceBundle, GovernanceTimeline
from .evidence import evidence_generator


@router.get(
    "/{decision_id:uuid}/evidence",
    response_model=GovernanceEvidenceBundle,
    summary="Export governance evidence bundle"
)
async def export_evidence(
    decision_id: UUID,
    session: AsyncSession = Depends(get_governance_session)
) -> GovernanceEvidenceBundle:
    """
    Export a complete governance evidence bundle.
    """
    return await evidence_generator.generate_evidence(decision_id, session)


@router.get(
    "/{decision_id:uuid}/timeline",
    response_model=GovernanceTimeline,
    summary="Get governance timeline"
)
async def get_timeline(
    decision_id: UUID,
    session: AsyncSession = Depends(get_governance_session)
) -> GovernanceTimeline:
    """
    Get a human-readable governance timeline.
    """
    return await evidence_generator.generate_timeline(decision_id, session)


# ============ Governance Rules (Structured Policies) ============

from .storage import GovernanceRuleDB

@router.get(
    "/rules",
    summary="List all governance rules"
)
async def list_rules(
    project_id: Optional[UUID] = None,
    x_org_id: Optional[str] = Header(None, alias="X-Org-Id"),
    session: AsyncSession = Depends(get_governance_session)
):
    """List all governance rules."""
    from sqlalchemy import or_
    stmt = select(GovernanceRuleDB)
    
    if x_org_id:
        try:
            org_uuid = UUID(x_org_id)
            stmt = stmt.where(GovernanceRuleDB.org_id == org_uuid)
        except ValueError:
            pass
            
    if project_id:
        stmt = stmt.where(GovernanceRuleDB.project_id == project_id)
    stmt = stmt.order_by(GovernanceRuleDB.created_at.desc())
    result = await session.execute(stmt)
    rules = result.scalars().all()
    return [
        {
            "policy_id": str(r.id),
            "name": r.name,
            "description": r.description,
            "enabled": r.enabled,
            "project_id": str(r.project_id) if r.project_id else None,
            "applies_to": r.applies_to or [],
            "conditions": r.conditions or [],
            "actions": r.actions or [],
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }
        for r in rules
    ]


@router.post(
    "/rules",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new governance rule"
)
async def create_rule(
    body: dict = Body(...),
    x_org_id: Optional[str] = Header(None, alias="X-Org-Id"),
    session: AsyncSession = Depends(get_governance_session)
):
    """Create a new governance rule with conditions and actions."""
    name = body.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="Rule name is required")

    org_uuid = None
    if x_org_id:
        try:
            org_uuid = UUID(x_org_id)
        except ValueError:
            pass

    rule = GovernanceRuleDB(
        name=name,
        description=body.get("description"),
        org_id=org_uuid,
        enabled=body.get("enabled", True),
        applies_to=body.get("applies_to", []),
        project_id=body.get("project_id"),
        conditions=body.get("conditions", []),
        actions=body.get("actions", []),
    )
    session.add(rule)
    await session.commit()
    await session.refresh(rule)
    return {
        "policy_id": str(rule.id),
        "name": rule.name,
        "description": rule.description,
        "enabled": rule.enabled,
        "project_id": str(rule.project_id) if rule.project_id else None,
        "applies_to": rule.applies_to or [],
        "conditions": rule.conditions or [],
        "actions": rule.actions or [],
        "created_at": rule.created_at.isoformat() if rule.created_at else None,
        "updated_at": rule.updated_at.isoformat() if rule.updated_at else None,
    }


@router.patch(
    "/rules/{rule_id}/enable",
    summary="Enable or disable a governance rule"
)
async def toggle_rule(
    rule_id: UUID,
    enabled: bool = True,
    x_org_id: Optional[str] = Header(None, alias="X-Org-Id"),
    session: AsyncSession = Depends(get_governance_session)
):
    """Toggle a governance rule on or off."""
    stmt = select(GovernanceRuleDB).where(GovernanceRuleDB.id == rule_id)
    result = await session.execute(stmt)
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    if x_org_id:
        try:
            org_uuid = UUID(x_org_id)
            if rule.org_id is None or rule.org_id != org_uuid:
                raise HTTPException(status_code=403, detail="Forbidden: Rule belongs to a different organization or is a global system rule.")
        except ValueError:
            pass

    rule.enabled = enabled
    await session.commit()
    await session.refresh(rule)
    return {
        "policy_id": str(rule.id),
        "name": rule.name,
        "enabled": rule.enabled,
    }

@router.delete(
    "/rules/{rule_id}",
    summary="Delete a governance rule"
)
async def delete_rule(
    rule_id: UUID,
    x_org_id: Optional[str] = Header(None, alias="X-Org-Id"),
    session: AsyncSession = Depends(get_governance_session)
):
    """Delete a governance rule completely."""
    stmt = select(GovernanceRuleDB).where(GovernanceRuleDB.id == rule_id)
    result = await session.execute(stmt)
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    if x_org_id:
        try:
            org_uuid = UUID(x_org_id)
            if rule.org_id is None or rule.org_id != org_uuid:
                raise HTTPException(status_code=403, detail="Forbidden: Rule belongs to a different organization or is a global system rule.")
        except ValueError:
            pass

    await session.delete(rule)
    await session.commit()
    return {"status": "success", "deleted_id": str(rule_id)}


@router.post(
    "/{decision_id:uuid}/resolve",
    response_model=GateResolution,
    status_code=status.HTTP_201_CREATED,
    summary="Resolve a gate-mode blocked decision",
    dependencies=[Depends(verify_internal_auth), Depends(verify_org_not_frozen)]
)
async def resolve_gate_decision(
    decision_id: UUID,
    body: GateResolutionCreate,
    x_actor_id: Optional[str] = Header(None, alias="X-Actor-Id"),
    x_actor_role: Optional[str] = Header(None, alias="X-Actor-Role"),
    session: AsyncSession = Depends(get_governance_session)
) -> GateResolution:
    """
    Resolve a decision blocked by gate mode policies (approve, edit, or decline).
    """
    # 1. Store the resolution
    try:
        actor_uuid = UUID(x_actor_id) if x_actor_id else uuid.uuid4()
    except ValueError:
        actor_uuid = uuid.uuid4()
        
    resolved_by = str(actor_uuid)
    if x_actor_role:
        resolved_by = f"{resolved_by} ({x_actor_role})"

    resolution = GateResolutionDB(
        decision_id=decision_id,
        status=body.status,
        edited_output=body.edited_output,
        decline_message=body.decline_message,
        resolved_by=resolved_by,
        resolved_at=datetime.now(timezone.utc)
    )
    session.add(resolution)
    
    # 2. Add History Entry
    review_state = GovernanceReviewState.APPROVED.value if body.status == "approved" else GovernanceReviewState.REJECTED.value
    
    # Needs to grab org_id/project_id if possible
    stmt = select(GovernanceReviewHistoryDB).where(
        GovernanceReviewHistoryDB.decision_id == decision_id
    ).order_by(GovernanceReviewHistoryDB.timestamp.desc()).limit(1)
    res = await session.execute(stmt)
    prev_entry = res.scalar_one_or_none()
    
    org_id_val = prev_entry.org_id if prev_entry else None
    proj_id_val = prev_entry.project_id if prev_entry else None
    
    history_entry = GovernanceReviewHistoryDB(
        decision_id=decision_id,
        org_id=org_id_val,
        project_id=proj_id_val,
        review_state=review_state,
        actor_role=x_actor_role or "system",
        actor_id=actor_uuid,
        action_reason=f"Gate Mode Resolution: {body.status}",
        risk_level=prev_entry.risk_level if prev_entry else "unknown",
        timestamp=datetime.now(timezone.utc)
    )
    session.add(history_entry)
    
    # 3. Clean up Assignment Queue
    stmt_queue = select(GovernanceAssignmentQueueDB).where(
        GovernanceAssignmentQueueDB.decision_id == decision_id
    )
    res_queue = await session.execute(stmt_queue)
    queue_entry = res_queue.scalar_one_or_none()
    if queue_entry:
        await session.delete(queue_entry)

    # 4. Audit log
    import json
    await log_governance_action(
        decision_id=decision_id,
        actor_role=x_actor_role or "system",
        action=GovernanceAction.CHANGE_REVIEW_STATE,
        session=session,
        details=json.dumps({"gate_resolution": body.status, "edited": bool(body.edited_output)})
    )
    
    await session.commit()
    await session.refresh(resolution)
    
    return GateResolution(
        decision_id=resolution.decision_id,
        status=resolution.status,
        edited_output=resolution.edited_output,
        decline_message=resolution.decline_message,
        resolved_by=resolution.resolved_by,
        resolved_at=resolution.resolved_at
    )


@router.get(
    "/resolutions/{decision_id:uuid}",
    response_model=GateResolution,
    summary="Get gate-mode resolution for a decision",
    dependencies=[Depends(verify_internal_auth)]
)
async def get_gate_resolution(
    decision_id: UUID,
    session: AsyncSession = Depends(get_governance_session)
) -> GateResolution:
    """Gets the resolution for a pending gate mode decision."""
    stmt = select(GateResolutionDB).where(GateResolutionDB.decision_id == decision_id)
    result = await session.execute(stmt)
    resolution = result.scalar_one_or_none()
    
    if not resolution:
        raise HTTPException(status_code=404, detail="No resolution found")
        
    return GateResolution(
        decision_id=resolution.decision_id,
        status=resolution.status,
        edited_output=resolution.edited_output,
        decline_message=resolution.decline_message,
        resolved_by=resolution.resolved_by,
        resolved_at=resolution.resolved_at
    )




