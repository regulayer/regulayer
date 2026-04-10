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
    id: Optional[UUID] = None
    """Request to create an organization."""
    name: str = Field(min_length=1, max_length=255)
    logo_url: Optional[str] = None
    data_region: Optional[str] = Field(None, description="e.g. eu-central-1, us-east-1")


class Organization(BaseModel):
    """Organization (tenant) in Regulayer SaaS."""
    id: UUID
    name: str
    logo_url: Optional[str] = None
    status: OrgStatus = OrgStatus.ACTIVE
    is_demo: bool = False
    environment: str = "prod"  # "dev", "staging", "prod"
    data_region: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    subscription_status: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class OrganizationUpdate(BaseModel):
    """Request to update organization details."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    logo_url: Optional[str] = None
    data_region: Optional[str] = None


# ============================================================
# Project
# ============================================================

class ProjectCreate(BaseModel):
    id: Optional[UUID] = None
    """Request to create a project."""
    name: str = Field(min_length=1, max_length=255)
    environment: ProjectEnvironment = ProjectEnvironment.DEV
    data_region: Optional[str] = Field(None, description="Overrides organization region if set")
    ai_act_risk_category: Optional[str] = Field(None, description="minimal, limited, high, unacceptable")
    governance_mode: str = Field("observe", description="'observe' (Mode 1: instant response) or 'gate' (Mode 2: hold until approval)")
    gate_decline_message: str = Field("Decision declined by governance.", description="Custom message returned when a reviewer declines a queued gate decision.")


class Project(BaseModel):
    """Project within an organization."""
    id: UUID
    organization_id: UUID
    name: str
    environment: ProjectEnvironment
    data_region: Optional[str] = None
    ai_act_risk_category: Optional[str] = None
    governance_mode: str = "observe"
    gate_decline_message: str = "Decision declined by governance."
    created_at: datetime
    updated_at: Optional[datetime] = None

class ProjectUpdate(BaseModel):
    """Request to update project details."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    data_region: Optional[str] = None
    ai_act_risk_category: Optional[str] = None
    governance_mode: Optional[str] = Field(None, description="'observe' or 'gate'")
    gate_decline_message: Optional[str] = Field(None, description="Custom message returned when a reviewer declines a queued gate decision.")


class CheckoutSessionRequest(BaseModel):
    """Request to create a checkout session."""
    plan_id: str
    success_url: str
    cancel_url: str


class PortalSessionRequest(BaseModel):
    """Request to create a portal session."""
    return_url: str


# ============================================================
# API Key
# ============================================================

class ApiKeyCreate(BaseModel):
    id: Optional[UUID] = None
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
    id: Optional[UUID] = None
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
# Invitations
# ============================================================

class InvitationCreate(BaseModel):
    id: Optional[UUID] = None
    """Request to invite a user."""
    email: EmailStr
    role: UserRole = UserRole.MEMBER


class Invitation(BaseModel):
    """Pending invitation details."""
    id: UUID
    organization_id: UUID
    email: EmailStr
    role: UserRole
    inviter_id: UUID
    expires_at: datetime
    created_at: datetime


class InvitationAccept(BaseModel):
    """Request to accept an invitation."""
    token: str
    password: str = Field(min_length=8)


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
    project_id: Optional[UUID] = None
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
    governance_mode: str = "observe"
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


# ============================================================
# Password Reset
# ============================================================

class PasswordResetRequest(BaseModel):
    """Request to initiate password reset."""
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    """Request to complete password reset."""
    token: str
    new_password: str = Field(min_length=8)


# ============================================================
# Notification Preferences
# ============================================================

class NotificationPreferenceUpdate(BaseModel):
    """Update settings for notifications."""
    incident_alerts: Optional[bool] = None
    governance_reviews: Optional[bool] = None
    billing_updates: Optional[bool] = None
    email_enabled: Optional[bool] = None
    in_app_enabled: Optional[bool] = None

class NotificationPreference(BaseModel):
    """User notification preferences."""
    id: UUID
    user_id: UUID
    organization_id: UUID
    incident_alerts: bool
    governance_reviews: bool
    billing_updates: bool
    email_enabled: bool
    in_app_enabled: bool
    created_at: datetime
    updated_at: Optional[datetime] = None


# ============================================================
# Webhook Destinations
# ============================================================

class WebhookDestinationCreate(BaseModel):
    id: Optional[UUID] = None
    """Create a new webhook destination."""
    name: str
    url: str
    events: List[str]

class WebhookDestinationUpdate(BaseModel):
    """Update an existing webhook destination."""
    name: Optional[str] = None
    url: Optional[str] = None
    events: Optional[List[str]] = None
    status: Optional[str] = None

class WebhookDestination(BaseModel):
    """Webhook destination."""
    id: UUID
    organization_id: UUID
    name: str
    url: str
    events: List[str]
    status: str
    secret: str
    created_at: datetime
    updated_at: Optional[datetime] = None



# ============================================================
# EU AI Act Compliance
# ============================================================

class AISystemCreate(BaseModel):
    id: Optional[UUID] = None
    name: str
    version: str
    description: str
    intended_purpose: str
    provider_name: str
    risk_tier: str
    annex_category: str
    lifecycle_status: str
    classification_rationale: str
    member_states: List[str]

class AISystemModel(AISystemCreate):
    id: UUID
    organization_id: UUID
    deployment_date: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class ConformityAssessmentCreate(BaseModel):
    id: Optional[UUID] = None
    system_id: UUID
    system_name: Optional[str] = None
    status: str
    assessment_type: str
    checklist: list
    ce_declaration_generated: bool

class ConformityAssessmentModel(ConformityAssessmentCreate):
    id: UUID
    organization_id: UUID
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class FRIACreate(BaseModel):
    id: Optional[UUID] = None
    system_id: UUID
    system_name: Optional[str] = None
    status: str
    deployer_info: dict
    system_description: dict
    rights_analysis: list
    mitigation_measures: list
    human_oversight_plan: str
    monitoring_commitments: str
    authority_submission: Optional[dict] = None

class FRIAModel(FRIACreate):
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: datetime

class TechDocumentationCreate(BaseModel):
    id: Optional[UUID] = None
    system_id: UUID
    system_name: Optional[str] = None
    overall_completeness: int
    sections: list

class TechDocumentationModel(TechDocumentationCreate):
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: datetime

class MonitoringPlanCreate(BaseModel):
    id: Optional[UUID] = None
    system_id: UUID
    system_name: Optional[str] = None
    review_frequency: str
    next_review_date: str
    alerts_enabled: bool
    kpis: list

class MonitoringPlanModel(MonitoringPlanCreate):
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: datetime

class IncidentReportCreate(BaseModel):
    id: Optional[UUID] = None
    system_id: UUID
    system_name: Optional[str] = None
    severity: str
    deadline_days: int
    deadline_date: str
    status: str
    authority_name: str
    submission_date: Optional[str] = None
    linked_incident_ids: list
    form_data: dict

class IncidentReportModel(IncidentReportCreate):
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: datetime
