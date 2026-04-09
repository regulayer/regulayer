"""
Regulayer Control Plane - RBAC (Role-Based Access Control)

Hard-coded permissions matrix for human users.
CRITICAL: RBAC only gates visibility and actions — never cryptographic facts.
"""

from enum import Enum
from typing import Set
from functools import wraps

from fastapi import HTTPException, Depends

from .models import TenantContext
from .enums import UserRole


class Permission(str, Enum):
    """All permissions in the system."""
    
    # Organization
    ORG_VIEW = "org:view"
    ORG_EDIT = "org:edit"
    ORG_BILLING = "org:billing"
    
    # Users
    USERS_VIEW = "users:view"
    USERS_INVITE = "users:invite"
    USERS_MANAGE = "users:manage"
    
    # Projects
    PROJECTS_VIEW = "projects:view"
    PROJECTS_CREATE = "projects:create"
    PROJECTS_EDIT = "projects:edit"
    
    # API Keys
    KEYS_VIEW = "keys:view"
    KEYS_CREATE = "keys:create"
    KEYS_REVOKE = "keys:revoke"
    
    # Decisions (View Only - no one can modify)
    DECISIONS_VIEW = "decisions:view"
    DECISIONS_ANNOTATE = "decisions:annotate"
    
    # Governance
    GOVERNANCE_VIEW = "governance:view"
    GOVERNANCE_APPROVE = "governance:approve"
    
    # Export
    EXPORT_PROOFS = "export:proofs"
    EXPORT_REPORTS = "export:reports"
    
    # Usage
    USAGE_VIEW = "usage:view"


# ============================================================
# Role -> Permissions Matrix
# ============================================================

ROLE_PERMISSIONS: dict[UserRole, Set[Permission]] = {
    
    UserRole.OWNER: {
        # Full org control
        Permission.ORG_VIEW,
        Permission.ORG_EDIT,
        Permission.ORG_BILLING,
        
        # User management
        Permission.USERS_VIEW,
        Permission.USERS_INVITE,
        Permission.USERS_MANAGE,
        
        # Projects
        Permission.PROJECTS_VIEW,
        Permission.PROJECTS_CREATE,
        Permission.PROJECTS_EDIT,
        
        # Keys
        Permission.KEYS_VIEW,
        Permission.KEYS_CREATE,
        Permission.KEYS_REVOKE,
        
        # Decisions (view + annotate, never modify)
        Permission.DECISIONS_VIEW,
        Permission.DECISIONS_ANNOTATE,
        
        # Governance
        Permission.GOVERNANCE_VIEW,
        Permission.GOVERNANCE_APPROVE,
        
        # Export
        Permission.EXPORT_PROOFS,
        Permission.EXPORT_REPORTS,
        
        # Usage
        Permission.USAGE_VIEW,
    },
    
    UserRole.ADMIN: {
        # View org (no billing)
        Permission.ORG_VIEW,
        
        # User management
        Permission.USERS_VIEW,
        Permission.USERS_INVITE,
        Permission.USERS_MANAGE,
        
        # Projects
        Permission.PROJECTS_VIEW,
        Permission.PROJECTS_CREATE,
        Permission.PROJECTS_EDIT,
        
        # Keys
        Permission.KEYS_VIEW,
        Permission.KEYS_CREATE,
        Permission.KEYS_REVOKE,
        
        # Decisions
        Permission.DECISIONS_VIEW,
        Permission.DECISIONS_ANNOTATE,
        
        # Governance
        Permission.GOVERNANCE_VIEW,
        Permission.GOVERNANCE_APPROVE,
        
        # Export
        Permission.EXPORT_PROOFS,
        Permission.EXPORT_REPORTS,
        
        # Usage
        Permission.USAGE_VIEW,
    },
    
    UserRole.MEMBER: {
        # View only for org
        Permission.ORG_VIEW,
        
        # View users
        Permission.USERS_VIEW,
        
        # Projects
        Permission.PROJECTS_VIEW,
        
        # Keys (view only)
        Permission.KEYS_VIEW,
        
        # Decisions
        Permission.DECISIONS_VIEW,
        Permission.DECISIONS_ANNOTATE,
        
        # Governance (view, no approve)
        Permission.GOVERNANCE_VIEW,
        
        # Export reports only
        Permission.EXPORT_REPORTS,
    },
    
    UserRole.AUDITOR: {
        # View only - no write actions
        Permission.ORG_VIEW,
        Permission.USERS_VIEW,
        Permission.PROJECTS_VIEW,
        Permission.KEYS_VIEW,
        Permission.DECISIONS_VIEW,
        Permission.GOVERNANCE_VIEW,
        
        # Export (auditors need full export)
        Permission.EXPORT_PROOFS,
        Permission.EXPORT_REPORTS,
        
        # Usage read
        Permission.USAGE_VIEW,
        
        # EXPLICITLY NOT INCLUDED:
        # - DECISIONS_ANNOTATE (auditors cannot annotate)
        # - GOVERNANCE_APPROVE (auditors cannot approve)
        # - Any create/edit permissions
    },
}


# ============================================================
# Permission Checking
# ============================================================

def has_permission(role: UserRole, permission: Permission) -> bool:
    """Check if a role has a specific permission."""
    return permission in ROLE_PERMISSIONS.get(role, set())


def get_role_permissions(role: UserRole) -> Set[Permission]:
    """Get all permissions for a role."""
    return ROLE_PERMISSIONS.get(role, set())


def get_role_capabilities(role: UserRole) -> dict:
    """Get human-readable capabilities for a role."""
    permissions = ROLE_PERMISSIONS.get(role, set())
    
    return {
        "role": role.value,
        "permissions": [p.value for p in permissions],
        "can_modify_decisions": False,  # NEVER TRUE
        "can_modify_hashes": False,     # NEVER TRUE
        "can_modify_proofs": False,     # NEVER TRUE
        "can_annotate": Permission.DECISIONS_ANNOTATE in permissions,
        "can_approve": Permission.GOVERNANCE_APPROVE in permissions,
        "can_export_proofs": Permission.EXPORT_PROOFS in permissions,
        "can_manage_billing": Permission.ORG_BILLING in permissions,
    }


# ============================================================
# RBAC Enforcement
# ============================================================

class RBACError(Exception):
    """Raised when RBAC check fails."""
    def __init__(self, permission: Permission, role: UserRole):
        self.permission = permission
        self.role = role
        super().__init__(
            f"Role '{role.value}' does not have permission '{permission.value}'"
        )


def require_permission(permission: Permission):
    """
    Decorator/dependency to require a specific permission.
    
    Usage:
        @app.get("/endpoint")
        async def endpoint(
            context: TenantContext = Depends(require_permission(Permission.PROJECTS_VIEW))
        ):
            ...
    """
    async def permission_checker(context: TenantContext) -> TenantContext:
        if not context.user_role:
            raise HTTPException(
                status_code=401,
                detail="User authentication required"
            )
        
        if not has_permission(context.user_role, permission):
            raise HTTPException(
                status_code=403,
                detail=f"Permission denied: {permission.value}"
            )
        
        return context
    
    return permission_checker


# ============================================================
# Cryptographic Isolation Enforcement
# ============================================================

CRYPTO_PROTECTED_ACTIONS = [
    "modify_decision",
    "modify_hash",
    "modify_proof",
    "modify_chain",
    "delete_record",
]


def enforce_crypto_isolation(action: str, role: UserRole) -> None:
    """
    Enforce that no human can modify cryptographic data.
    
    This is a hard check that ALWAYS fails for protected actions.
    """
    if action in CRYPTO_PROTECTED_ACTIONS:
        raise HTTPException(
            status_code=403,
            detail=f"Action '{action}' is cryptographically protected. No human role can perform this action."
        )
