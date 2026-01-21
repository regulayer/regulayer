"""
Regulayer Governance - Evidence Generator

CRITICAL CONSTRAINTS:
1. READ-ONLY: No writes, no mutations
2. DETERMINISTIC: Same inputs → same outputs
3. IDEMPOTENT: Can regenerate at any time
4. NO CRYPTOGRAPHIC DATA: Never includes hashes, signatures, chain links
"""

from datetime import datetime, timezone
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .evidence_models import (
    GovernanceEvidenceBundle,
    PolicyEvaluationEvidence,
    StateTransitionEvidence,
    ApprovalEvidence,
    AnnotationEvidence,
    GovernanceTimeline,
    TimelineEvent
)
from .storage import (
    GovernanceMetadataDB,
    GovernanceTagDB,
    GovernanceAnnotationDB
)

# Import from policy module if available
try:
    from regulayer_governance_policy.app.storage import (
        PolicyEvaluationLogDB,
        ApprovalRecordDB,
        GovernancePolicyDB
    )
    POLICY_MODULE_AVAILABLE = True
except ImportError:
    POLICY_MODULE_AVAILABLE = False


class EvidenceGenerator:
    """
    Generates governance evidence bundles.
    
    This is a READ-ONLY service that assembles evidence from governance tables.
    It NEVER includes cryptographic data (hashes, signatures, chain links).
    """
    
    async def generate_evidence(
        self,
        decision_id: UUID,
        session: AsyncSession,
        policy_session: AsyncSession = None
    ) -> GovernanceEvidenceBundle:
        """
        Generate a complete governance evidence bundle.
        
        Args:
            decision_id: The decision to generate evidence for
            session: Governance database session
            policy_session: Policy database session (optional)
            
        Returns:
            GovernanceEvidenceBundle with all governance data
        """
        # Get current review state
        stmt = select(GovernanceMetadataDB).where(
            GovernanceMetadataDB.decision_id == decision_id
        )
        result = await session.execute(stmt)
        metadata = result.scalars().first()
        
        current_state = metadata.review_state if metadata else "unreviewed"
        
        # Get annotations
        stmt = select(GovernanceAnnotationDB).where(
            GovernanceAnnotationDB.decision_id == decision_id
        ).order_by(GovernanceAnnotationDB.created_at)
        result = await session.execute(stmt)
        annotations_db = result.scalars().all()
        
        annotations = [
            AnnotationEvidence(
                author_role=a.author_role,
                note=a.note,
                timestamp=a.created_at
            )
            for a in annotations_db
        ]
        
        # Get policy evaluations and approvals (if policy module available)
        policies_evaluated = []
        approvals = []
        timeline = []
        
        if POLICY_MODULE_AVAILABLE and policy_session:
            policies_evaluated, approvals, timeline = await self._get_policy_evidence(
                decision_id, policy_session
            )
        
        return GovernanceEvidenceBundle(
            governance_evidence_version="1.0.0",
            decision_id=decision_id,
            generated_at=datetime.now(timezone.utc),
            policies_evaluated=policies_evaluated,
            review_state_timeline=timeline,
            approvals=approvals,
            annotations=annotations,
            current_review_state=current_state
        )
    
    async def _get_policy_evidence(
        self,
        decision_id: UUID,
        session: AsyncSession
    ) -> tuple:
        """Get policy-related evidence."""
        
        # Get policy evaluations
        stmt = select(PolicyEvaluationLogDB).where(
            PolicyEvaluationLogDB.decision_id == decision_id
        ).order_by(PolicyEvaluationLogDB.evaluated_at)
        result = await session.execute(stmt)
        eval_logs = result.scalars().all()
        
        # Get policy names
        policy_names = {}
        if eval_logs:
            policy_ids = [e.policy_id for e in eval_logs]
            stmt = select(GovernancePolicyDB).where(
                GovernancePolicyDB.policy_id.in_(policy_ids)
            )
            result = await session.execute(stmt)
            for p in result.scalars().all():
                policy_names[p.policy_id] = p.name
        
        policies_evaluated = [
            PolicyEvaluationEvidence(
                policy_id=e.policy_id,
                name=policy_names.get(e.policy_id, "Unknown"),
                matched=e.matched,
                evaluated_at=e.evaluated_at,
                actions_triggered=e.actions_executed
            )
            for e in eval_logs
        ]
        
        # Get approvals
        stmt = select(ApprovalRecordDB).where(
            ApprovalRecordDB.decision_id == decision_id
        ).order_by(ApprovalRecordDB.created_at)
        result = await session.execute(stmt)
        approvals_db = result.scalars().all()
        
        approvals = [
            ApprovalEvidence(
                role=a.role,
                approved=a.approved,
                note=a.note,
                timestamp=a.created_at
            )
            for a in approvals_db
        ]
        
        # Build timeline from policy matches and approvals
        timeline = []
        
        # Add state transitions from policy matches
        for e in eval_logs:
            if e.matched:
                for action in e.actions_executed:
                    if "set_review_state" in action:
                        timeline.append(
                            StateTransitionEvidence(
                                from_state="(previous)",
                                to_state=action.split(":")[-1] if ":" in action else "unknown",
                                timestamp=e.evaluated_at,
                                trigger=f"policy:{policy_names.get(e.policy_id, 'Unknown')}"
                            )
                        )
        
        # Add transitions from approvals (implicitly move to reviewed)
        for a in approvals_db:
            if a.approved:
                timeline.append(
                    StateTransitionEvidence(
                        from_state="in_review",
                        to_state="reviewed",
                        timestamp=a.created_at,
                        trigger=f"approval:{a.role}"
                    )
                )
        
        return policies_evaluated, approvals, timeline
    
    async def generate_timeline(
        self,
        decision_id: UUID,
        session: AsyncSession,
        policy_session: AsyncSession = None
    ) -> GovernanceTimeline:
        """
        Generate a human-readable governance timeline.
        
        Combines all governance events into a chronological view.
        """
        events: List[TimelineEvent] = []
        
        # Get annotations
        stmt = select(GovernanceAnnotationDB).where(
            GovernanceAnnotationDB.decision_id == decision_id
        )
        result = await session.execute(stmt)
        annotations_db = result.scalars().all()
        
        for a in annotations_db:
            events.append(TimelineEvent(
                event_type="annotation",
                timestamp=a.created_at,
                title=f"Annotation by {a.author_role}",
                description=a.note[:100] + "..." if len(a.note) > 100 else a.note,
                metadata={"author_role": a.author_role}
            ))
        
        # Get policy evaluations if available
        if POLICY_MODULE_AVAILABLE and policy_session:
            stmt = select(PolicyEvaluationLogDB).where(
                PolicyEvaluationLogDB.decision_id == decision_id
            )
            result = await policy_session.execute(stmt)
            eval_logs = result.scalars().all()
            
            for e in eval_logs:
                if e.matched:
                    events.append(TimelineEvent(
                        event_type="policy_match",
                        timestamp=e.evaluated_at,
                        title="Policy Matched",
                        description=f"Policy triggered {len(e.actions_executed)} action(s)",
                        metadata={"policy_id": str(e.policy_id), "actions": e.actions_executed}
                    ))
            
            stmt = select(ApprovalRecordDB).where(
                ApprovalRecordDB.decision_id == decision_id
            )
            result = await policy_session.execute(stmt)
            approvals_db = result.scalars().all()
            
            for a in approvals_db:
                events.append(TimelineEvent(
                    event_type="approval",
                    timestamp=a.created_at,
                    title=f"{'Approved' if a.approved else 'Rejected'} by {a.role}",
                    description=a.note or "No note provided",
                    metadata={"role": a.role, "approved": a.approved}
                ))
        
        # Sort by timestamp
        events.sort(key=lambda e: e.timestamp)
        
        return GovernanceTimeline(
            decision_id=decision_id,
            events=events,
            generated_at=datetime.now(timezone.utc)
        )


# Global evidence generator instance
evidence_generator = EvidenceGenerator()
