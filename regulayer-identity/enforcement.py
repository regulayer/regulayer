"""
Regulayer Identity - Role Enforcement

Maps SSO identities to internal roles with strict safety rules.

CRITICAL SECURITY RULES:
1. OWNER role cannot be auto-assigned via SSO
2. ADMIN role cannot be auto-assigned via SSO
3. SSO can only assign: MEMBER, AUDITOR
4. Role escalation requires manual approval
"""

from enum import Enum
from typing import Optional, List
from uuid import UUID

from .models import (
    AutoProvisionRule,
    ProvisioningConfig,
    ExternalIdentity,
)


# ============================================================
# Role Definitions
# ============================================================

class Role(str, Enum):
    """
    Regulayer user roles.
    
    Ordered by privilege level (lowest to highest).
    """
    AUDITOR = "auditor"   # View & export only
    MEMBER = "member"     # Annotate & tag
    ADMIN = "admin"       # Governance + approvals
    OWNER = "owner"       # Full org control + billing


# Roles that can be assigned via SSO
SSO_ASSIGNABLE_ROLES = {Role.AUDITOR, Role.MEMBER}

# Roles that require manual assignment
MANUAL_ONLY_ROLES = {Role.ADMIN, Role.OWNER}


# ============================================================
# Role Enforcement
# ============================================================

class RoleEnforcer:
    """
    Enforces role assignment rules for SSO users.
    
    Prevents:
    - Privilege escalation via IdP
    - Compromised IdP causing governance abuse
    """
    
    def __init__(self, config: ProvisioningConfig):
        self.config = config
    
    def determine_role(
        self,
        email: str,
        idp_groups: List[str],
        existing_role: Optional[Role] = None
    ) -> tuple[Optional[Role], str]:
        """
        Determine role for SSO user.
        
        Args:
            email: User email from IdP
            idp_groups: Group memberships from IdP
            existing_role: User's current role (if any)
            
        Returns:
            (role, reason) - Role to assign and reason
        """
        # Check if user already has manual role
        if existing_role in MANUAL_ONLY_ROLES:
            return existing_role, "Existing manual role preserved"
        
        # Check domain allowlist
        domain = email.split("@")[-1] if "@" in email else None
        if domain and self.config.allowed_domains:
            if domain not in self.config.allowed_domains:
                return None, f"Domain {domain} not in allowed list"
        
        # Check for auditor group membership
        if self.config.auditor_groups:
            if any(g in idp_groups for g in self.config.auditor_groups):
                return Role.AUDITOR, "Matched auditor group"
        
        # Check for member group membership
        if self.config.member_groups:
            if any(g in idp_groups for g in self.config.member_groups):
                return Role.MEMBER, "Matched member group"
        
        # Apply default rule
        if self.config.default_rule == AutoProvisionRule.REJECT:
            return None, "Default rule: reject unknown users"
        elif self.config.default_rule == AutoProvisionRule.MEMBER:
            return Role.MEMBER, "Default rule: auto-provision as member"
        elif self.config.default_rule == AutoProvisionRule.AUDITOR:
            return Role.AUDITOR, "Default rule: auto-provision as auditor"
        
        return None, "No matching rule"
    
    def can_escalate(self, from_role: Role, to_role: Role) -> bool:
        """
        Check if role escalation is allowed.
        
        SSO cannot escalate to ADMIN or OWNER.
        """
        if to_role in MANUAL_ONLY_ROLES:
            return False
        
        # Allow SSO to assign/reassign SSO-assignable roles
        return to_role in SSO_ASSIGNABLE_ROLES
    
    def validate_role_assignment(
        self,
        role: Role,
        via_sso: bool = True
    ) -> tuple[bool, str]:
        """
        Validate that a role assignment is allowed.
        
        Args:
            role: Role to assign
            via_sso: Whether assignment is via SSO
            
        Returns:
            (allowed, reason)
        """
        if via_sso and role in MANUAL_ONLY_ROLES:
            return False, f"Role {role.value} cannot be assigned via SSO"
        
        return True, "Role assignment allowed"


# ============================================================
# Separation of Duties
# ============================================================

class SeparationOfDuties:
    """
    Enforces separation of duties constraints.
    
    Examples:
    - Approver cannot annotate same decision
    - Auditor cannot approve
    """
    
    @staticmethod
    def can_approve(role: Role, annotated_by_user: bool) -> bool:
        """Check if user can approve a decision."""
        if role == Role.AUDITOR:
            return False  # Auditors are view-only
        
        if annotated_by_user:
            return False  # Cannot approve own annotation
        
        return role in {Role.ADMIN, Role.OWNER}
    
    @staticmethod
    def can_annotate(role: Role) -> bool:
        """Check if user can annotate decisions."""
        return role in {Role.MEMBER, Role.ADMIN, Role.OWNER}
    
    @staticmethod
    def can_export(role: Role) -> bool:
        """Check if user can export proofs."""
        # All roles can export - this is a trust guarantee
        return True
    
    @staticmethod
    def can_manage_billing(role: Role) -> bool:
        """Check if user can manage billing."""
        return role == Role.OWNER
