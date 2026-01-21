"""
Regulayer Governance - Access Control & Segregation of Duties

CRITICAL CONSTRAINTS:
1. Trust in AI decisions is meaningless if human governance is not constrained
2. SoD must be: Explicit, Enforced by code, Auditable, Non-bypassable
3. Admins cannot approve decisions. Ever.
"""

from enum import Enum
from typing import Set, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .storage import GovernanceAnnotationDB


class GovernanceRole(str, Enum):
    """
    Hard-coded governance roles.
    
    SYSTEM    - AI decision producer (no governance access)
    ANALYST   - Can annotate, cannot approve
    COMPLIANCE - Can approve, cannot annotate initial findings
    AUDITOR   - Read-only, export-only
    ADMIN     - Infrastructure only (no decision governance)
    """
    SYSTEM = "system"
    ANALYST = "analyst"
    COMPLIANCE = "compliance"
    AUDITOR = "auditor"
    ADMIN = "admin"


class GovernancePermission(str, Enum):
    """Granular permissions for governance actions."""
    VIEW = "view"
    ANNOTATE = "annotate"
    TAG = "tag"
    APPROVE = "approve"
    CHANGE_REVIEW_STATE = "change_review_state"
    EXPORT_EVIDENCE = "export_evidence"


# Role to permissions mapping (hard-coded, not configurable)
ROLE_PERMISSIONS: dict[GovernanceRole, Set[GovernancePermission]] = {
    GovernanceRole.SYSTEM: set(),  # No governance access
    GovernanceRole.ANALYST: {
        GovernancePermission.VIEW,
        GovernancePermission.ANNOTATE,
        GovernancePermission.TAG,
    },
    GovernanceRole.COMPLIANCE: {
        GovernancePermission.VIEW,
        GovernancePermission.APPROVE,
        GovernancePermission.CHANGE_REVIEW_STATE,
    },
    GovernanceRole.AUDITOR: {
        GovernancePermission.VIEW,
        GovernancePermission.EXPORT_EVIDENCE,
    },
    GovernanceRole.ADMIN: {
        GovernancePermission.VIEW,
        # NOTE: Admins cannot approve, annotate, or change governance state
    },
}


class AccessControlError(Exception):
    """Raised when access control check fails."""
    def __init__(self, required_permission: GovernancePermission, actor_role: GovernanceRole):
        self.required_permission = required_permission
        self.actor_role = actor_role
        super().__init__(f"Role {actor_role} lacks permission {required_permission}")


class ConflictOfInterestError(Exception):
    """Raised when segregation of duties is violated."""
    def __init__(self, reason: str):
        self.reason = reason
        super().__init__(reason)


def require_permission(
    actor_role: GovernanceRole,
    required_permission: GovernancePermission
) -> None:
    """
    Enforce that a role has the required permission.
    
    Raises:
        AccessControlError if permission is denied
    """
    permissions = ROLE_PERMISSIONS.get(actor_role, set())
    
    if required_permission not in permissions:
        raise AccessControlError(required_permission, actor_role)


def raise_403(error: AccessControlError) -> None:
    """Raise HTTP 403 with structured error response."""
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={
            "error": "INSUFFICIENT_PRIVILEGES",
            "required_permission": error.required_permission.value,
            "actor_role": error.actor_role.value,
            "message": f"Role '{error.actor_role.value}' cannot perform '{error.required_permission.value}'"
        }
    )


def raise_conflict_403(error: ConflictOfInterestError) -> None:
    """Raise HTTP 403 for segregation of duties violations."""
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={
            "error": "CONFLICT_OF_INTEREST",
            "reason": error.reason,
            "message": "Segregation of Duties violation"
        }
    )


async def check_approver_conflict(
    decision_id: UUID,
    actor_role: GovernanceRole,
    session: AsyncSession
) -> str:
    """
    Check if approver has annotated this decision.
    
    Approvers cannot approve decisions they have annotated.
    
    Returns:
        "passed" if no conflict
        
    Raises:
        ConflictOfInterestError if conflict detected
    """
    if actor_role not in [GovernanceRole.COMPLIANCE]:
        return "not_applicable"
    
    # Check if this role has annotated this decision
    # In real implementation, we'd track actor identity, not just role
    stmt = select(GovernanceAnnotationDB).where(
        GovernanceAnnotationDB.decision_id == decision_id,
        GovernanceAnnotationDB.author_role == actor_role.value
    )
    result = await session.execute(stmt)
    existing = result.scalars().first()
    
    if existing:
        raise ConflictOfInterestError(
            f"Cannot approve decision {decision_id}: you have previously annotated it. "
            "Segregation of Duties requires independent review."
        )
    
    return "passed"


def get_role_description(role: GovernanceRole) -> str:
    """Get human-readable description of a role."""
    descriptions = {
        GovernanceRole.SYSTEM: "AI decision producer (no governance access)",
        GovernanceRole.ANALYST: "Can annotate and tag, cannot approve",
        GovernanceRole.COMPLIANCE: "Can approve and change review state",
        GovernanceRole.AUDITOR: "Read-only, export-only access",
        GovernanceRole.ADMIN: "Infrastructure only (no decision governance)",
    }
    return descriptions.get(role, "Unknown role")


def get_role_capabilities(role: GovernanceRole) -> dict:
    """Get capabilities for a role (for UI state)."""
    permissions = ROLE_PERMISSIONS.get(role, set())
    return {
        "can_view": GovernancePermission.VIEW in permissions,
        "can_annotate": GovernancePermission.ANNOTATE in permissions,
        "can_tag": GovernancePermission.TAG in permissions,
        "can_approve": GovernancePermission.APPROVE in permissions,
        "can_change_state": GovernancePermission.CHANGE_REVIEW_STATE in permissions,
        "can_export": GovernancePermission.EXPORT_EVIDENCE in permissions,
    }
