"""
Regulayer Governance Policy - API Endpoints

CRITICAL CONSTRAINTS:
1. Policies never modify recorder DB
2. All mutations are append-only or state transitions
3. Invalid policy definitions are rejected
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from uuid import UUID, uuid4
from typing import List

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

router = APIRouter(prefix="/v1", tags=["policies"])


# ============ Policy Management ============

@router.get("/policies", response_model=List[GovernancePolicy])
async def list_policies(
    session: AsyncSession = Depends(get_policy_session)
) -> List[GovernancePolicy]:
    """List all governance policies."""
    stmt = select(GovernancePolicyDB).order_by(GovernancePolicyDB.created_at.desc())
    result = await session.execute(stmt)
    policies_db = result.scalars().all()
    
    return [
        GovernancePolicy(
            policy_id=p.policy_id,
            name=p.name,
            description=p.description,
            enabled=p.enabled,
            applies_to=p.applies_to,
            conditions=[PolicyCondition(**c) for c in p.conditions],
            actions=[PolicyAction(**a) for a in p.actions],
            created_at=p.created_at,
            updated_at=p.updated_at
        )
        for p in policies_db
    ]


@router.post(
    "/policies",
    response_model=GovernancePolicy,
    status_code=status.HTTP_201_CREATED
)
async def create_policy(
    body: GovernancePolicyCreate,
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
    policy_db = GovernancePolicyDB(
        policy_id=uuid4(),
        name=body.name,
        description=body.description,
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
    
    return GovernancePolicy(
        policy_id=policy_db.policy_id,
        name=policy_db.name,
        description=policy_db.description,
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
    session: AsyncSession = Depends(get_policy_session)
):
    """Enable or disable a policy."""
    stmt = select(GovernancePolicyDB).where(GovernancePolicyDB.policy_id == policy_id)
    result = await session.execute(stmt)
    policy_db = result.scalars().first()
    
    if not policy_db:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    policy_db.enabled = enabled
    policy_db.updated_at = datetime.now(timezone.utc)
    await session.commit()
    
    return {"policy_id": str(policy_id), "enabled": enabled}


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
    # Get all enabled policies
    stmt = select(GovernancePolicyDB).where(GovernancePolicyDB.enabled == True)
    result = await session.execute(stmt)
    policies_db = result.scalars().all()
    
    # TODO: Fetch actual decision data from recorder (read-only)
    # For now, use mock context
    context = {
        "decision_id": str(decision_id),
        "risk_level": "high",
        "event_state": "completed",
        "system_name": "demo-system",
        "attestation_status": "attested",
        "review_state": "unreviewed",
        "tags": []
    }
    
    results = []
    for p in policies_db:
        policy = GovernancePolicy(
            policy_id=p.policy_id,
            name=p.name,
            description=p.description,
            enabled=p.enabled,
            applies_to=p.applies_to,
            conditions=[PolicyCondition(**c) for c in p.conditions],
            actions=[PolicyAction(**a) for a in p.actions],
            created_at=p.created_at,
            updated_at=p.updated_at
        )
        
        eval_result = evaluator.evaluate_policy(policy, context)
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
