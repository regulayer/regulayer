"""
Regulayer Governance Policy - Workflow Engine

CRITICAL CONSTRAINTS:
1. Workflows operate on governance metadata only
2. Approvals are APPEND-ONLY and immutable
3. No automatic rollback to earlier review states
"""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .models import (
    ApprovalRole,
    ApprovalRecord,
    ApprovalRecordCreate,
    WorkflowStatus,
    PolicyEvaluationResult,
    PolicyAction,
    PolicyActionType
)
from .storage import (
    ApprovalRecordDB,
    RequiredApprovalDB,
    PolicyEvaluationLogDB
)


class WorkflowEngine:
    """
    Workflow management for governance approvals.
    
    All actions are traceable and append-only.
    """
    
    async def get_workflow_status(
        self,
        decision_id: UUID,
        session: AsyncSession
    ) -> WorkflowStatus:
        """Get current workflow status for a decision."""
        
        # Get required approvals
        stmt = select(RequiredApprovalDB).where(
            RequiredApprovalDB.decision_id == decision_id
        )
        result = await session.execute(stmt)
        required_db = result.scalars().all()
        required_roles = [ApprovalRole(r.role) for r in required_db]
        
        # Get received approvals
        stmt = select(ApprovalRecordDB).where(
            ApprovalRecordDB.decision_id == decision_id
        ).order_by(ApprovalRecordDB.created_at.desc())
        result = await session.execute(stmt)
        approvals_db = result.scalars().all()
        
        received_approvals = [
            ApprovalRecord(
                id=a.id,
                decision_id=a.decision_id,
                role=ApprovalRole(a.role),
                approved=a.approved,
                note=a.note,
                created_at=a.created_at
            )
            for a in approvals_db
        ]
        
        # Calculate pending roles (only approved=True counts)
        approved_roles = {
            a.role for a in received_approvals 
            if a.approved
        }
        pending_roles = [r for r in required_roles if r not in approved_roles]
        
        # Get policy evaluation logs
        stmt = select(PolicyEvaluationLogDB).where(
            PolicyEvaluationLogDB.decision_id == decision_id
        ).order_by(PolicyEvaluationLogDB.evaluated_at.desc())
        result = await session.execute(stmt)
        eval_logs = result.scalars().all()
        
        policies_applied = [
            PolicyEvaluationResult(
                policy_id=log.policy_id,
                policy_name="",  # Would need join to get name
                matched=log.matched,
                actions_executed=log.actions_executed,
                evaluated_at=log.evaluated_at
            )
            for log in eval_logs
        ]
        
        return WorkflowStatus(
            decision_id=decision_id,
            required_approvals=required_roles,
            received_approvals=received_approvals,
            pending_roles=pending_roles,
            is_fully_approved=len(pending_roles) == 0 and len(required_roles) > 0,
            policies_applied=policies_applied
        )
    
    async def record_approval(
        self,
        decision_id: UUID,
        approval: ApprovalRecordCreate,
        session: AsyncSession
    ) -> ApprovalRecord:
        """
        Record an approval decision.
        
        IMMUTABILITY: Approvals cannot be edited or deleted.
        """
        approval_db = ApprovalRecordDB(
            decision_id=decision_id,
            role=approval.role.value,
            approved=approval.approved,
            note=approval.note,
            created_at=datetime.now(timezone.utc)
        )
        session.add(approval_db)
        await session.commit()
        await session.refresh(approval_db)
        
        return ApprovalRecord(
            id=approval_db.id,
            decision_id=approval_db.decision_id,
            role=ApprovalRole(approval_db.role),
            approved=approval_db.approved,
            note=approval_db.note,
            created_at=approval_db.created_at
        )
    
    async def add_required_approval(
        self,
        decision_id: UUID,
        role: ApprovalRole,
        policy_id: UUID,
        session: AsyncSession
    ) -> None:
        """Add a required approval for a decision (triggered by policy)."""
        
        # Check if already required
        stmt = select(RequiredApprovalDB).where(
            RequiredApprovalDB.decision_id == decision_id,
            RequiredApprovalDB.role == role.value
        )
        result = await session.execute(stmt)
        existing = result.scalars().first()
        
        if not existing:
            required = RequiredApprovalDB(
                decision_id=decision_id,
                role=role.value,
                required_by_policy_id=policy_id,
                created_at=datetime.now(timezone.utc)
            )
            session.add(required)
            await session.commit()
    
    async def log_policy_evaluation(
        self,
        decision_id: UUID,
        result: PolicyEvaluationResult,
        session: AsyncSession
    ) -> None:
        """Log a policy evaluation result (immutable)."""
        log = PolicyEvaluationLogDB(
            decision_id=decision_id,
            policy_id=result.policy_id,
            matched=result.matched,
            actions_executed=result.actions_executed,
            evaluated_at=result.evaluated_at
        )
        session.add(log)
        await session.commit()


# Global workflow engine instance
workflow_engine = WorkflowEngine()
