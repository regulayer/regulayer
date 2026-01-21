"""
Regulayer Governance - Audit Logger

CRITICAL CONSTRAINTS:
1. All governance actions must be logged
2. Logs are APPEND-ONLY (no update, no delete)
3. Used for evidence bundles and internal audit
"""

from datetime import datetime, timezone
from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from .storage import GovernanceAccessLogDB


async def log_governance_action(
    decision_id: UUID,
    actor_role: str,
    action: str,
    session: AsyncSession,
    details: Optional[str] = None
) -> None:
    """
    Log a governance action immutably.
    
    Args:
        decision_id: The decision being acted upon
        actor_role: The role performing the action
        action: The action type (e.g., "add_annotation", "approve", "change_state")
        session: Database session
        details: Optional additional details
    """
    log_entry = GovernanceAccessLogDB(
        decision_id=decision_id,
        actor_role=actor_role,
        action=action,
        details=details,
        timestamp=datetime.now(timezone.utc)
    )
    session.add(log_entry)
    # Note: Commit is handled by the calling function


# Action constants for consistency
class GovernanceAction:
    ADD_ANNOTATION = "add_annotation"
    ADD_TAG = "add_tag"
    CHANGE_REVIEW_STATE = "change_review_state"
    APPROVE = "approve"
    REJECT = "reject"
    VIEW = "view"
    EXPORT_EVIDENCE = "export_evidence"
    EXPORT_TIMELINE = "export_timeline"
    PERMISSION_DENIED = "permission_denied"
    CONFLICT_DETECTED = "conflict_detected"
