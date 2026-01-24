"""
Regulayer Identity Models

Data models for enterprise identity management.

TRUST RULE: Identity controls access, never truth.
SSO never touches: Recorder, Proof Verifier, Exported Bundles.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID, uuid4

from pydantic import BaseModel, EmailStr


# ============================================================
# Provider Types
# ============================================================

class ProviderType(str, Enum):
    SAML = "SAML"
    OIDC = "OIDC"


class ProviderStatus(str, Enum):
    ACTIVE = "active"
    DISABLED = "disabled"
    PENDING = "pending"  # Awaiting configuration
    FAILED = "failed"    # Connection failed


# ============================================================
# Identity Provider
# ============================================================

class IdentityProvider(BaseModel):
    """
    Represents an external identity provider (Okta, Azure AD, Google, etc.)
    """
    id: UUID
    org_id: UUID
    type: ProviderType
    name: str  # e.g., "Okta Production"
    issuer: str  # IdP issuer URL
    metadata_url: Optional[str] = None  # SAML metadata URL
    client_id: Optional[str] = None  # OIDC client ID
    # client_secret stored separately in secrets manager
    
    enabled: bool = False
    status: ProviderStatus = ProviderStatus.PENDING
    
    # Domain routing
    email_domains: List[str] = []  # e.g., ["company.com", "corp.company.com"]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None


class IdentityProviderCreate(BaseModel):
    """Request to create a new identity provider."""
    type: ProviderType
    name: str
    issuer: str
    metadata_url: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    email_domains: List[str] = []


# ============================================================
# External Identity Mapping
# ============================================================

class ExternalIdentity(BaseModel):
    """
    Maps external IdP user to internal Regulayer user.
    
    Example:
    - External: "user@okta.company.com" from Okta
    - Internal: User ID in Regulayer with specific role
    """
    id: UUID
    provider_id: UUID
    external_user_id: str  # Subject ID from IdP
    email: EmailStr
    mapped_user_id: UUID  # Internal Regulayer user
    
    # Metadata from IdP
    display_name: Optional[str] = None
    groups: List[str] = []  # IdP groups
    
    # Timestamps
    first_seen_at: datetime
    last_seen_at: datetime


# ============================================================
# Auto-Provisioning Rules
# ============================================================

class AutoProvisionRule(str, Enum):
    """
    What happens when a new SSO user logs in?
    
    SECURITY: OWNER role cannot be auto-assigned.
    SECURITY: ADMIN role requires manual assignment.
    """
    REJECT = "reject"        # Block unknown users
    MEMBER = "member"        # Auto-create as MEMBER
    AUDITOR = "auditor"      # Auto-create as AUDITOR (read-only)


class ProvisioningConfig(BaseModel):
    """Configuration for auto-provisioning SSO users."""
    provider_id: UUID
    
    # Default behavior for unknown users
    default_rule: AutoProvisionRule = AutoProvisionRule.REJECT
    
    # Domain-specific rules
    allowed_domains: List[str] = []
    
    # Group-to-role mapping
    auditor_groups: List[str] = []  # IdP groups that get AUDITOR role
    member_groups: List[str] = []   # IdP groups that get MEMBER role
    
    # Manual override required for these roles
    # OWNER and ADMIN cannot be auto-assigned
    require_manual_approval: bool = True


# ============================================================
# SSO Session
# ============================================================

class SSOSession(BaseModel):
    """Represents an active SSO session."""
    id: UUID
    user_id: UUID
    provider_id: UUID
    external_identity_id: UUID
    
    # Session metadata
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    # Timestamps
    created_at: datetime
    expires_at: datetime
    last_activity_at: datetime


# ============================================================
# SSO Events (Audit)
# ============================================================

class SSOEventType(str, Enum):
    PROVIDER_ENABLED = "provider_enabled"
    PROVIDER_DISABLED = "provider_disabled"
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILURE = "login_failure"
    AUTO_PROVISIONED = "auto_provisioned"
    ROLE_ASSIGNED = "role_assigned"
    SESSION_EXPIRED = "session_expired"


class SSOEvent(BaseModel):
    """Append-only SSO audit event."""
    id: UUID
    org_id: UUID
    event_type: SSOEventType
    
    # Actor
    actor_email: Optional[str] = None
    actor_user_id: Optional[UUID] = None
    
    # Target
    target_provider_id: Optional[UUID] = None
    target_user_id: Optional[UUID] = None
    
    # Details
    details: dict = {}
    
    # Timestamp
    timestamp: datetime
