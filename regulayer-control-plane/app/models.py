"""
Regulayer Control Plane - Tenancy Models

CORE PRINCIPLE:
Tenancy affects access and organization — NEVER cryptographic truth.
Hash chains remain pure. Proof bundles remain verifiable outside SaaS.
Tenancy is metadata + access control, not part of the proof.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID
from enum import Enum
from pydantic import BaseModel, Field, EmailStr


from .enums import OrgStatus, ProjectEnvironment, UserRole, ApiKeyScope


# ============================================================
# Organization
# ============================================================

class OrganizationCreate(BaseModel):
    """Request to create an organization."""
    name: str = Field(min_length=1, max_length=255)
    

class Organization(BaseModel):
    """Organization (tenant) in Regulayer SaaS."""
    id: UUID
    name: str
    status: OrgStatus = OrgStatus.ACTIVE
    is_demo: bool = False
    environment: str = "prod"  # "dev", "staging", "prod"
    stripe_customer_id: Optional[str] = None
    subscription_status: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# ============================================================
# Project
# ============================================================

class ProjectCreate(BaseModel):
    """Request to create a project."""
    name: str = Field(min_length=1, max_length=255)
    environment: ProjectEnvironment = ProjectEnvironment.DEV


class Project(BaseModel):
    """Project within an organization."""
    id: UUID
    organization_id: UUID
    name: str
    environment: ProjectEnvironment
    created_at: datetime
    updated_at: Optional[datetime] = None


# ============================================================
# API Key
# ============================================================

class ApiKeyCreate(BaseModel):
    """Request to create an API key."""
    name: str = Field(min_length=1, max_length=255)
    scopes: List[ApiKeyScope] = [ApiKeyScope.INGEST]


class ApiKey(BaseModel):
    """API key for SDK authentication."""
    id: UUID
    project_id: UUID
    name: str
    key_prefix: str = Field(description="First 8 chars of key for identification")
    scopes: List[ApiKeyScope]
    is_demo_key: bool = False
    created_at: datetime
    revoked_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    
    @property
    def is_active(self) -> bool:
        return self.revoked_at is None


class ApiKeyWithSecret(ApiKey):
    """API key with the secret (only returned on creation)."""
    key_secret: str = Field(description="Full API key - only shown once!")


# ============================================================
# User
# ============================================================

class UserCreate(BaseModel):
    """Request to create a user."""
    email: EmailStr
    role: UserRole = UserRole.MEMBER


class User(BaseModel):
    """User in the SaaS platform."""
    id: UUID
    email: str
    role: UserRole
    organization_id: UUID
    created_at: datetime
    last_login_at: Optional[datetime] = None


class UserWithOrg(User):
    """User with organization details."""
    org: Organization


# ============================================================
# Tenant Context (Runtime)
# ============================================================

class OrgStatusUpdate(BaseModel):
    """Request to update organization status."""
    status: OrgStatus

class TenantContext(BaseModel):
    """
    Runtime context for tenant-scoped operations.
    
    Injected by middleware, used throughout request lifecycle.
    """
    organization_id: UUID
    project_id: UUID
    api_key_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    role: Optional[UserRole] = None
    org_status: Optional[OrgStatus] = None
    scopes: List[ApiKeyScope] = Field(default_factory=list)
    
    def has_scope(self, scope: ApiKeyScope) -> bool:
        """Check if context has a specific scope."""
        return scope in self.scopes


# ============================================================
# Validation Response
# ============================================================

class KeyValidationResult(BaseModel):
    """Result of API key validation."""
    valid: bool
    organization_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    environment: Optional[str] = None
    org_status: Optional[OrgStatus] = None
    is_demo_key: bool = False
    scopes: List[ApiKeyScope] = Field(default_factory=list)
    error: Optional[str] = None

# ============================================================
# Audit Logs
# ============================================================

class AuditLog(BaseModel):
    """Audit log entry for organization activity."""
    id: UUID
    organization_id: UUID
    actor_id: Optional[UUID] = None
    actor_email: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[UUID] = None
    details: Optional[dict] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime

