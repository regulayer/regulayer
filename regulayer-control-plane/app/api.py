"""
Regulayer Control Plane - API

REST API for tenant management.
"""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid4
import stripe

from fastapi import FastAPI, HTTPException, Depends, Request, Header, BackgroundTasks

from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from .enums import ProjectEnvironment, UserRole

from .models import (
    Organization, OrganizationCreate,
    Project, ProjectCreate, ProjectUpdate,
    ApiKey, ApiKeyCreate, ApiKeyWithSecret,
    User, UserCreate, UserWithOrg, OrgStatusUpdate, OrganizationUpdate,
    TenantContext, KeyValidationResult, AuditLog,
    PasswordResetRequest, PasswordResetConfirm,
    CheckoutSessionRequest, PortalSessionRequest,
    Invitation, InvitationCreate, InvitationAccept
)
from .billing import BillingService
from .storage import (
    get_db, init_db,
    OrganizationDB, ProjectDB, UserDB, ApiKeyDB,
    SessionDB, OtpCodeDB, PasswordResetTokenDB,
    AuditLogDB, UsageEventDB, UsageMeterDB,
    OrgStatus, UserRole, InvitationDB
)
from .auth import AuthService
from .audit import AuditService

from .middleware import require_tenant_context, get_tenant_context, require_internal_secret
from .config import settings
from .config import settings
from .rbac import has_permission, Permission


app = FastAPI(
    title="Regulayer Control Plane",
    description="Multi-tenant SaaS management for Regulayer",
    version="1.0.0"
)


# NOTE: No CORS middleware here. The ingestion gateway is the sole CORS layer.
# Internal services must NOT add their own CORS headers to avoid duplicates.

from .observability import RequestIdMiddleware, StructuredLoggerMiddleware, SecurityHeadersMiddleware

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(StructuredLoggerMiddleware)
app.add_middleware(RequestIdMiddleware)

from .compliance_api import router as compliance_router
app.include_router(compliance_router)


# ============================================================
# Billing Webhooks (Stripe)
# ============================================================

@app.post("/v1/billing/webhook")
async def billing_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Stripe webhooks for subscription status updates.
    """
    payload_body = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        # VERIFY SIGNATURE
        event = stripe.Webhook.construct_event(
            payload_body, sig_header, settings.stripe_webhook_secret
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail="Invalid signature")

    try:
        event_type = event["type"]
        data = event["data"]["object"]
        
        # Extract Customer ID
        customer_id = data.get("customer")
        
        if not event_type or not customer_id:
            # Some events might not have customer, ignore safely
            return {"status": "ignored", "reason": "missing_data"}

        # Find Organization by Stripe Customer ID
        org = db.query(OrganizationDB).filter(
            OrganizationDB.stripe_customer_id == customer_id
        ).first()

        if not org:
            print(f"Billing Webhook: Org not found for customer {customer_id}")
            return {"status": "ignored", "reason": "org_not_found"}

        print(f"Billing Event: {event_type} for Org {org.id}")

        if event_type == "checkout.session.completed":
            org.status = OrgStatus.ACTIVE
            org.subscription_status = "active"
            db.commit()

        elif event_type == "invoice.payment_failed":
            org.status = OrgStatus.FROZEN
            org.subscription_status = "past_due"
            db.commit()

        elif event_type == "customer.subscription.deleted":
            org.status = OrgStatus.FROZEN
            org.subscription_status = "canceled"
            db.commit()
            
        return {"status": "success"}

    except Exception as e:
        print(f"Webhook Error: {str(e)}")
        return {"status": "error", "message": str(e)}


def get_audit_service(db: Session = Depends(get_db)) -> AuditService:
    return AuditService(db)


@app.on_event("startup")
async def startup():
    init_db()


# ============================================================
# Organization Endpoints
# ============================================================

@app.patch("/v1/orgs/{org_id}", response_model=Organization, tags=["organizations"])
def update_organization(
    org_id: UUID,
    request: OrganizationUpdate,
    db: Session = Depends(get_db),
    audit: AuditService = Depends(get_audit_service),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """Update organization details (Name, Logo)."""
    # Authorization: Must be Owner or Admin of THAT org
    if tenant.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Enforce Role - RBAC

    if not has_permission(tenant.role, Permission.ORG_EDIT):
        raise HTTPException(status_code=403, detail="Permission denied: org:edit")
    
    org = db.query(OrganizationDB).filter(OrganizationDB.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    changes = {}
    if request.name is not None:
        changes["name"] = {"from": org.name, "to": request.name}
        org.name = request.name
    
    if request.logo_url is not None:
        changes["logo_url"] = {"from": org.logo_url, "to": request.logo_url}
        org.logo_url = request.logo_url
        
    db.commit()
    db.refresh(org)
    
    # Audit log
    if changes:
        audit.log(
            organization_id=org_id,
            action="org.update",
            resource_type="organization",
            actor_id=tenant.user_id,
            actor_email=tenant.email,
            resource_id=org_id,
            details={"changes": changes}
        )
    
    return Organization(
        id=org.id,
        name=org.name,
        logo_url=org.logo_url,
        status=org.status,
        is_demo=org.is_demo,
        environment=org.environment,
        stripe_customer_id=org.stripe_customer_id,
        subscription_status=org.subscription_status,
        created_at=org.created_at,
        updated_at=org.updated_at
    )


@app.patch("/v1/orgs/{org_id}/status", tags=["organizations"])
def patch_organization_status(
    org_id: UUID,
    request: OrgStatusUpdate,
    db: Session = Depends(get_db),
    internal_check: None = Depends(require_internal_secret)
):
    """Update organization status (e.g. suspend/freeze)."""
    org = db.query(OrganizationDB).filter(OrganizationDB.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # PHASE I.1: Demo orgs cannot be converted to production
    if org.is_demo:
        raise HTTPException(
            status_code=409,
            detail="Demo organizations cannot change status. Demo orgs are permanent."
        )
        
    org.status = request.status
    db.commit()
    
    return {"status": "updated", "id": str(org_id), "new_status": org.status}


@app.post("/v1/orgs", response_model=Organization, tags=["organizations"])
def create_organization(
    request: OrganizationCreate,
    db: Session = Depends(get_db),
    internal_check: None = Depends(require_internal_secret)
):
    """Create a new organization (tenant)."""
    org = OrganizationDB(
        id=uuid4(),
        name=request.name,
        status=OrgStatus.ACTIVE
    )
    
    db.add(org)
    db.commit()
    db.refresh(org)
    
    return Organization(
        id=org.id,
        name=org.name,
        status=org.status,
        created_at=org.created_at
    )


@app.get("/v1/orgs/{org_id}", response_model=Organization, tags=["organizations"])
def get_organization(
    org_id: UUID,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """Get organization details."""
    # Authorization
    if org_id != tenant.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")

    org = db.query(OrganizationDB).filter(OrganizationDB.id == org_id).first()
    
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    return Organization(
        id=org.id,
        name=org.name,
        status=org.status,
        created_at=org.created_at,
        updated_at=org.updated_at
    )



@app.get("/v1/orgs", response_model=List[Organization], tags=["organizations"])
def list_organizations(
    db: Session = Depends(get_db),
    internal_check: None = Depends(require_internal_secret)
):
    """List all organizations."""
    orgs = db.query(OrganizationDB).all()
    
    return [
        Organization(
            id=org.id,
            name=org.name,
            status=org.status,
            created_at=org.created_at,
            updated_at=org.updated_at
        )
        for org in orgs
    ]


@app.get("/v1/usage/{org_id}", tags=["billing"])
async def get_usage(
    org_id: UUID,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """Get organization usage quotas."""
    if org_id != tenant.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")

    billing_service = BillingService(db)
    status = billing_service.get_billing_status(org_id)
    
    # Map to what frontend expects for now
    # Frontend MetricDisplay uses: value={usage?.data?.decision_count}
    return {
        "decision_count": 0, # TODO: calculate real usage from decisions table
        "limit": status.get("plan", {}).get("limit_decisions", 1000),
        "tier": status.get("plan", {}).get("name", "Free")
    }


@app.get("/v1/orgs/{org_id}/audit-logs", response_model=List[AuditLog], tags=["audit"])
def get_org_audit_logs(
    org_id: UUID,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """Get audit logs for an organization."""
    if org_id != tenant.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    audit_service = AuditService(db)
    return audit_service.get_logs(org_id)


class UserMember(BaseModel):
    id: UUID
    email: EmailStr
    role: UserRole
    status: str = "active"
    joined_at: datetime

class RoleUpdate(BaseModel):
    role: UserRole


@app.get("/v1/orgs/{org_id}/members", response_model=List[UserMember], tags=["organizations"])
def list_org_members(
    org_id: UUID,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """List members of an organization."""
    if org_id != tenant.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    users = db.query(UserDB).filter(UserDB.organization_id == org_id).all()
    
    return [
        UserMember(
            id=u.id,
            email=u.email,
            role=u.role,
            status="active",
            joined_at=u.created_at
        )
        for u in users
    ]


# ============================================================
# Project Endpoints
# ============================================================

def check_manage_hierarchy(actor_role: UserRole, target_role: UserRole) -> bool:
    """Helper to ensure admins can only manage members/auditors, and owners can manage anyone."""
    if actor_role == UserRole.OWNER:
        return True
    if actor_role == UserRole.ADMIN:
        return target_role in [UserRole.MEMBER, UserRole.AUDITOR]
    return False

@app.put("/v1/orgs/{org_id}/members/{user_id}", tags=["organizations"])
def change_org_member_role(
    org_id: UUID,
    user_id: UUID,
    request: RoleUpdate,
    db: Session = Depends(get_db),
    audit: AuditService = Depends(get_audit_service),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """Change the role of an existing organization member."""
    if org_id != tenant.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    target_user = db.query(UserDB).filter(UserDB.id == user_id, UserDB.organization_id == org_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found in organization")
        
    if tenant.user_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
        
    if not check_manage_hierarchy(tenant.role, target_user.role):
        raise HTTPException(status_code=403, detail=f"Cannot manage users with role {target_user.role.value}")
        
    if not check_manage_hierarchy(tenant.role, request.role):
        raise HTTPException(status_code=403, detail=f"Cannot assign role {request.role.value}")

    old_role = target_user.role.value
    target_user.role = request.role
    db.commit()
    
    # Audit log
    audit.log(
        organization_id=org_id,
        action="member.role_change",
        resource_type="user",
        actor_id=tenant.user_id,
        actor_email=tenant.email,
        resource_id=user_id,
        details={"target_email": target_user.email, "old_role": old_role, "new_role": request.role.value}
    )
    
    return {"status": "success"}

@app.delete("/v1/orgs/{org_id}/members/{user_id}", tags=["organizations"])
def remove_org_member(
    org_id: UUID,
    user_id: UUID,
    db: Session = Depends(get_db),
    audit: AuditService = Depends(get_audit_service),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """Remove a member from the organization."""
    if org_id != tenant.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    target_user = db.query(UserDB).filter(UserDB.id == user_id, UserDB.organization_id == org_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found in organization")
        
    if tenant.user_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
        
    if not check_manage_hierarchy(tenant.role, target_user.role):
        raise HTTPException(status_code=403, detail=f"Cannot remove user with role {target_user.role.value}")

    # Capture details before deletion
    removed_email = target_user.email
    removed_role = target_user.role.value

    # Remove user's pending invitations sent by them
    from .storage import InvitationDB, SessionDB
    db.query(InvitationDB).filter(InvitationDB.inviter_id == user_id).delete()
    
    # Remove their active sessions
    db.query(SessionDB).filter(SessionDB.user_id == user_id).delete()
    
    # Finally, remove the user
    db.delete(target_user)
    db.commit()
    
    # Audit log
    audit.log(
        organization_id=org_id,
        action="member.removed",
        resource_type="user",
        actor_id=tenant.user_id,
        actor_email=tenant.email,
        resource_id=user_id,
        details={"removed_email": removed_email, "removed_role": removed_role}
    )
    
    return {"status": "success"}


# ============================================================

@app.post("/v1/orgs/{org_id}/projects", response_model=Project, tags=["projects"])
def create_project(
    org_id: UUID,
    request: ProjectCreate,
    db: Session = Depends(get_db),
    audit: AuditService = Depends(get_audit_service),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """Create a new project within an organization."""
    # Authorization
    if org_id != tenant.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Enforce Role - RBAC
    if not has_permission(tenant.role, Permission.PROJECTS_CREATE):
        raise HTTPException(status_code=403, detail="Permission denied: projects:create")

    # Verify org exists
    org = db.query(OrganizationDB).filter(OrganizationDB.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    project = ProjectDB(
        id=uuid4(),
        organization_id=org_id,
        name=request.name,
        environment=request.environment
    )
    
    db.add(project)
    db.commit()
    db.refresh(project)
    
    # Audit log
    audit.log(
        organization_id=org_id,
        action="project.create",
        resource_type="project",
        resource_id=project.id,
        details={"name": request.name, "environment": request.environment}
    )
    
    return Project(
        id=project.id,
        organization_id=project.organization_id,
        name=project.name,
        environment=project.environment,
        governance_mode=project.governance_mode,
        gate_decline_message=project.gate_decline_message,
        created_at=project.created_at
    )


@app.get("/v1/projects/{project_id}", response_model=Project, tags=["projects"])
def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """Get project details."""
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Authorization
    if project.organization_id != tenant.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return Project(
        id=project.id,
        organization_id=project.organization_id,
        name=project.name,
        environment=project.environment,
        governance_mode=project.governance_mode,
        gate_decline_message=project.gate_decline_message,
        created_at=project.created_at,
        updated_at=project.updated_at
    )



@app.patch("/v1/projects/{project_id}", response_model=Project, tags=["projects"])
def update_project(
    project_id: UUID,
    request: ProjectUpdate,
    http_request: Request,
    db: Session = Depends(get_db),
    audit: AuditService = Depends(get_audit_service),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """Update project details (Name)."""
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.organization_id != tenant.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Enforce Role - RBAC
    if not has_permission(tenant.role, Permission.PROJECTS_EDIT):
        raise HTTPException(status_code=403, detail="Permission denied: projects:edit")

    changes = {}
    if request.name is not None:
        changes["name"] = {"from": project.name, "to": request.name}
        project.name = request.name
        
    if request.governance_mode is not None:
        changes["governance_mode"] = {"from": project.governance_mode, "to": request.governance_mode}
        project.governance_mode = request.governance_mode
        
    if request.gate_decline_message is not None:
        changes["gate_decline_message"] = {"from": project.gate_decline_message, "to": request.gate_decline_message}
        project.gate_decline_message = request.gate_decline_message
        
    db.commit()
    db.refresh(project)
    
    # Audit log
    if changes:
        audit.log(
            organization_id=tenant.organization_id,
            action="project.update",
            resource_type="project",
            actor_id=tenant.user_id if hasattr(tenant, 'user_id') else None,
            actor_email=tenant.email if hasattr(tenant, 'email') else None,
            resource_id=project.id,
            details={"changes": changes},
            ip_address=http_request.client.host if http_request.client else None,
            user_agent=http_request.headers.get("user-agent")
        )
    
    return Project(
        id=project.id,
        organization_id=project.organization_id,
        name=project.name,
        environment=project.environment,
        governance_mode=project.governance_mode,
        gate_decline_message=project.gate_decline_message,
        created_at=project.created_at,
        updated_at=project.updated_at
    )


@app.get("/v1/orgs/{org_id}/projects", response_model=List[Project], tags=["projects"])
def list_org_projects(
    org_id: UUID,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """List all projects in an organization."""
    if org_id != tenant.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    projects = db.query(ProjectDB).filter(ProjectDB.organization_id == org_id).all()
    
    return [
        Project(
            id=p.id,
            organization_id=p.organization_id,
            name=p.name,
            environment=p.environment,
            governance_mode=p.governance_mode,
            gate_decline_message=p.gate_decline_message,
            created_at=p.created_at,
            updated_at=p.updated_at
        )
        for p in projects
    ]


# ============================================================
# API Key Endpoints
# ============================================================

@app.post("/v1/projects/{project_id}/keys", response_model=ApiKeyWithSecret, tags=["api-keys"])
def create_api_key(
    project_id: UUID,
    request: ApiKeyCreate,
    http_request: Request,
    db: Session = Depends(get_db),
    audit: AuditService = Depends(get_audit_service),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """
    Create a new API key for a project.
    
    ⚠️ The key secret is only shown once! Store it securely.
    """
    # Verify project ownership
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not project or project.organization_id != tenant.organization_id:
        raise HTTPException(status_code=404, detail="Project not found") # 404 to verify existence/ownership same time

    # Enforce Role - RBAC
    if not has_permission(tenant.role, Permission.KEYS_CREATE):
        raise HTTPException(status_code=403, detail="Permission denied: keys:create")

    auth_service = AuthService(db)
    
    try:
        result = auth_service.create_api_key(project_id, request)
        # Audit log
        audit.log(
            organization_id=tenant.organization_id,
            action="api_key.create",
            resource_type="api_key",
            actor_id=tenant.user_id if hasattr(tenant, 'user_id') else None,
            actor_email=tenant.email if hasattr(tenant, 'email') else None,
            resource_id=result.id if hasattr(result, 'id') else None,
            details={"key_name": request.name, "project_id": str(project_id), "scopes": request.scopes or ["ingest"]},
            ip_address=http_request.client.host if http_request.client else None,
            user_agent=http_request.headers.get("user-agent")
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/v1/projects/{project_id}/keys", response_model=List[ApiKey], tags=["api-keys"])
def list_project_keys(
    project_id: UUID,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """List all API keys for a project."""
    # Verify project ownership
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not project or project.organization_id != tenant.organization_id:
        raise HTTPException(status_code=404, detail="Project not found")

    auth_service = AuthService(db)
    return auth_service.get_project_keys(project_id)


@app.post("/v1/keys/{key_id}/revoke", tags=["api-keys"])
def revoke_api_key(
    key_id: UUID,
    http_request: Request,
    db: Session = Depends(get_db),
    audit: AuditService = Depends(get_audit_service),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """Revoke an API key."""
    # We need to verify that this key belongs to a project in the tenant's organization
    # Fetch key -> project -> org
    key = db.query(ApiKeyDB).filter(ApiKeyDB.id == key_id).first()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
        
    project = db.query(ProjectDB).filter(ProjectDB.id == key.project_id).first()
    if not project or project.organization_id != tenant.organization_id:
         raise HTTPException(status_code=404, detail="Key not found") # Obfuscate
    
    # Enforce Role - RBAC
    if not has_permission(tenant.role, Permission.KEYS_REVOKE):
        raise HTTPException(status_code=403, detail="Permission denied: keys:revoke")

    auth_service = AuthService(db)
    
    if not auth_service.revoke_api_key(key_id):
        raise HTTPException(status_code=404, detail="Key not found")
    
    # Audit log
    audit.log(
        organization_id=tenant.organization_id,
        action="api_key.revoke",
        resource_type="api_key",
        actor_id=tenant.user_id if hasattr(tenant, 'user_id') else None,
        actor_email=tenant.email if hasattr(tenant, 'email') else None,
        resource_id=key_id,
        details={"key_name": key.name, "key_prefix": key.key_prefix, "project_id": str(key.project_id)},
        ip_address=http_request.client.host if http_request.client else None,
        user_agent=http_request.headers.get("user-agent")
    )
    
    return {"status": "revoked", "key_id": str(key_id)}


# ============================================================
# Auth Context Endpoints (API Keys)
# ============================================================

@app.get("/v1/me", response_model=TenantContext, tags=["auth"])
def get_current_context(
    tenant: TenantContext = Depends(require_tenant_context)
) -> TenantContext:
    """Get current authentication context."""
    return tenant


@app.post("/v1/auth/validate", response_model=KeyValidationResult, tags=["auth"])
def validate_key(
    api_key: str,
    db: Session = Depends(get_db)
) -> KeyValidationResult:
    """
    Validate an API key.
    
    Used by other services to validate SDK requests.
    """
    auth_service = AuthService(db)
    return auth_service.validate_api_key(api_key)


# ============================================================
# Human Auth Endpoints (Login/Logout)
# ============================================================

from pydantic import BaseModel, EmailStr
from .user_auth import UserAuthService, OtpService, InvitationService, hash_password
from .rbac import Permission, has_permission, get_role_permissions, get_role_capabilities


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    token: str
    user: UserWithOrg


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.MEMBER


@app.post("/v1/auth/login", response_model=LoginResponse, tags=["auth"])
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
) -> LoginResponse:
    """Login with email and password."""
    auth_service = UserAuthService(db)
    result = auth_service.login(request.email, request.password)
    
    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token, user = result
    
    # Fetch Org for UserWithOrg
    org = db.query(OrganizationDB).filter(OrganizationDB.id == user.organization_id).first()
    
    user_with_org = UserWithOrg(
        **user.dict(),
        org=Organization(
            id=org.id,
            name=org.name,
            status=org.status,
            created_at=org.created_at,
            updated_at=org.updated_at
        )
    )
    
    return LoginResponse(token=token, user=user_with_org)


@app.post("/v1/auth/logout", tags=["auth"])
async def logout(
    token: str,
    db: Session = Depends(get_db)
) -> dict:
    """Logout and invalidate session."""
    auth_service = UserAuthService(db)
    auth_service.logout(token)
    return {"status": "logged_out"}


@app.get("/v1/auth/me", response_model=UserWithOrg, tags=["auth"])
def get_current_user(
    token: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> UserWithOrg:
    """Get current user from session token."""
    # Extract token from header if not in query param
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    auth_service = UserAuthService(db)
    user = auth_service.get_user_from_token(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    # Fetch Org
    org = db.query(OrganizationDB).filter(OrganizationDB.id == user.organization_id).first()
    if not org:
        # Should not happen if foreign keys enforce it
         raise HTTPException(status_code=500, detail="User organization not found")

    return UserWithOrg(
        **user.dict(),
        org=Organization(
            id=org.id,
            name=org.name,
            status=org.status,
            created_at=org.created_at,
            updated_at=org.updated_at
        )
    )


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    orgName: str


@app.post("/v1/auth/signup", response_model=LoginResponse, tags=["auth"])
async def signup(
    request: SignupRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new organization and owner user.
    """
    # 1. Check if user already exists
    existing_user = db.query(UserDB).filter(UserDB.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    try:
        # 2. Create Organization (REAL, never demo via this endpoint)
        org = OrganizationDB(
            id=uuid4(),
            name=request.orgName,
            status=OrgStatus.ACTIVE,
            is_demo=False,
            environment="prod"
        )
        db.add(org)
        
        # 3. Create User (Owner)

        user = UserDB(
            id=uuid4(),
            organization_id=org.id,
            email=request.email,
            password_hash=hash_password(request.password),
            role=UserRole.OWNER
        )
        db.add(user)
        
        # 4. Create separate default project? (Optional but good UX)
        project = ProjectDB(
            id=uuid4(),
            organization_id=org.id,
            name="Default Project",
            environment=ProjectEnvironment.DEV
        )
        db.add(project)

        db.commit()
        db.refresh(user)
        
        # 5. Login
        auth_service = UserAuthService(db)
        # We can reuse login logic or just issue token since we have user
        # But logging in properly ensures session creation
        result = auth_service.login(request.email, request.password)
        if not result:
             raise HTTPException(status_code=500, detail="Signup successful but login failed")
             
        token, user_model = result
        
        # Populate UserWithOrg
        # We have the org object already in scope ("org") but need to map it to Pydantic
        user_with_org = UserWithOrg(
            **user_model.dict(),
            org=Organization(
                id=org.id,
                name=org.name,
                status=org.status,
                is_demo=org.is_demo,
                environment=org.environment,
                created_at=org.created_at
            )
        )
        return LoginResponse(token=token, user=user_with_org)

    except Exception as e:
        db.rollback()
        # Handle unique constraint for Org Name 
        if "organizations_name_key" in str(e): # PSQL error string guess
             raise HTTPException(status_code=400, detail="Organization name already taken")
        raise HTTPException(status_code=400, detail=str(e))



# ============================================================
# OTP Signup Endpoints
# ============================================================

class OtpRequest(BaseModel):
    email: EmailStr

class OtpVerifyRequest(BaseModel):
    email: EmailStr
    code: str

class OtpVerifyResponse(BaseModel):
    signup_token: str
    email: EmailStr

class SignupCompleteRequest(BaseModel):
    signup_token: str
    orgName: str
    password: str

@app.post("/v1/auth/signup/otp-request", tags=["auth"])
def request_otp(
    request: OtpRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Step 1: Request an OTP for email verification.
    """

    otp_service = OtpService(db)
    
    try:
        code = otp_service.request_otp(request.email)
        
        # Send via Email
        from .mailer import send_otp_email
        # Run in background to not block request
        background_tasks.add_task(send_otp_email, request.email, code)
        
        return {"status": "otp_sent", "message": "Check your email for the code"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/v1/auth/signup/otp-verify", response_model=OtpVerifyResponse, tags=["auth"])
def verify_otp(
    request: OtpVerifyRequest,
    db: Session = Depends(get_db)
):
    """
    Step 2: Verify OTP and get a signup token.
    """
    otp_service = OtpService(db)
    
    token = otp_service.verify_otp(request.email, request.code)
    if not token:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    return OtpVerifyResponse(signup_token=token, email=request.email)

# ============================================================
# Service Proxies (Gateway Mode)
# ============================================================
import httpx

GOVERNANCE_URL = "http://governance:8002"
INCIDENTS_URL = "http://incidents:8000"

@app.get("/v1/incidents", tags=["incidents"])
async def proxy_get_incidents():
    """Proxy to Incidents Service."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{INCIDENTS_URL}/v1/incidents")
            if resp.status_code == 200:
                return resp.json()
            return []
    except Exception as e:
        print(f"Incidents Proxy Error: {e}")
        return []


# NOTE: /v1/decisions is handled by decisions_proxy.py router
# (included via app.include_router at the bottom of this file)
# which includes proper scope enforcement and usage recording.


@app.get("/v1/governance/queue", tags=["governance"])
async def proxy_governance_queue(
    status: str = "unreviewed",
    tenant: TenantContext = Depends(require_tenant_context)
):
    """Proxy Governance Queue."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{GOVERNANCE_URL}/v1/governance/queue", params={"status": status})
            if resp.status_code == 200:
                return resp.json()
            return []
    except Exception as e:
        print(f"Governance Queue Proxy Error: {e}")
        return []
@app.post("/v1/auth/signup/complete", response_model=LoginResponse, tags=["auth"])
def complete_signup(
    request: SignupCompleteRequest,
    db: Session = Depends(get_db)
):
    """
    Step 3: Complete signup with verified token.
    """
    otp_service = OtpService(db)

    try:
        # Create Org, User, Project
        token, user = otp_service.complete_signup(
            request.signup_token,
            request.orgName,
            request.password
        )
        
        # Populate UserWithOrg
        # We need to fetch the Org to return full object
        org = db.query(OrganizationDB).filter(OrganizationDB.id == user.organization_id).first()
        
        user_with_org = UserWithOrg(
            **user.dict(),
            org=Organization(
                id=org.id,
                name=org.name,
                status=org.status,
                is_demo=org.is_demo,
                environment=org.environment,
                created_at=org.created_at
            )
        )
        return LoginResponse(token=token, user=user_with_org)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/v1/auth/forgot-password", tags=["auth"])
async def forgot_password(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """
    Initiate password reset.
    
    Generates a token and sends a password reset email.
    """
    auth_service = UserAuthService(db)
    token = auth_service.create_reset_token(request.email)
    
    if token:
        base_url = settings.frontend_url if hasattr(settings, 'frontend_url') else "http://localhost:3000"
        reset_link = f"{base_url}/reset-password?token={token}"
        
        # Send password reset email (non-blocking)
        import asyncio
        from .mailer import send_password_reset_email
        asyncio.create_task(send_password_reset_email(
            to_email=request.email,
            reset_link=reset_link,
            expiry_time="1 hour"
        ))
    
    # Always return success to prevent email enumeration
    return {"status": "email_sent"}


@app.post("/v1/auth/reset-password", tags=["auth"])
async def reset_password_endpoint(
    request: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """Complete password reset with token."""
    auth_service = UserAuthService(db)
    if not auth_service.reset_password(request.token, request.new_password):
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    return {"status": "password_reset"}




# ============================================================
# Demo Signup (Explicit Demo Org Creation)
# ============================================================

@app.post("/demo/signup", response_model=LoginResponse, tags=["demo"])
async def demo_signup(
    request: SignupRequest,
    db: Session = Depends(get_db)
):
    """
    Register a DEMO organization.
    
    Demo orgs:
    - Cannot be upgraded to paid
    - Cannot rotate recorder keys
    - Always show demo banner
    - Generate demo API keys (rl_demo_...)
    """
    # 1. Check if user already exists
    existing_user = db.query(UserDB).filter(UserDB.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    try:
        # 2. Create DEMO Organization
        org = OrganizationDB(
            id=uuid4(),
            name=f"[DEMO] {request.orgName}",
            status=OrgStatus.ACTIVE,
            is_demo=True,  # DEMO!
            environment="demo"
        )
        db.add(org)
        
        # 3. Create User (Owner)
        user = UserDB(
            id=uuid4(),
            organization_id=org.id,
            email=request.email,
            password_hash=hash_password(request.password),
            role=UserRole.OWNER
        )
        db.add(user)
        
        # 4. Create default demo project
        project = ProjectDB(
            id=uuid4(),
            organization_id=org.id,
            name="Demo Project",
            environment=ProjectEnvironment.DEV
        )
        db.add(project)

        db.commit()
        db.refresh(user)
        
        # 5. Login
        auth_service = UserAuthService(db)
        result = auth_service.login(request.email, request.password)
        if not result:
             raise HTTPException(status_code=500, detail="Signup successful but login failed")
             
        token, user_model = result
        
        user_with_org = UserWithOrg(
            **user_model.dict(),
            org=Organization(
                id=org.id,
                name=org.name,
                status=org.status,
                is_demo=org.is_demo,
                environment=org.environment,
                created_at=org.created_at
            )
        )
        return LoginResponse(token=token, user=user_with_org)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================
# User Management Endpoints
# ============================================================

@app.post("/v1/orgs/{org_id}/users", response_model=User, tags=["users"])
async def create_user(
    org_id: UUID,
    request: RegisterRequest,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
) -> User:
    """Create a new user in an organization."""
    # Authorization
    if tenant.organization_id != org_id:
         raise HTTPException(status_code=403, detail="Access denied")

    if tenant.role not in [UserRole.OWNER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only Admins can manage users")

    auth_service = UserAuthService(db)
    
    try:
        return auth_service.register_user(
            email=request.email,
            password=request.password,
            organization_id=org_id,
            role=request.role
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/v1/orgs/{org_id}/users", response_model=List[User], tags=["users"])
async def list_org_users(
    org_id: UUID,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
) -> List[User]:
    """List all users in an organization."""
    if tenant.organization_id != org_id:
         raise HTTPException(status_code=403, detail="Access denied")

    users = db.query(UserDB).filter(UserDB.organization_id == org_id).all()
    
    return [
        User(
            id=u.id,
            email=u.email,
            role=u.role,
            organization_id=u.organization_id,
            created_at=u.created_at,
            last_login_at=u.last_login_at
        )
        for u in users
    ]


class RoleChangeRequest(BaseModel):
    role: UserRole


@app.patch("/v1/users/{user_id}/role", tags=["users"])
async def change_user_role(
    user_id: UUID,
    request: RoleChangeRequest,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
) -> dict:
    """Change a user's role."""
    if tenant.role != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only Owners can change roles")

    # Verify target user belongs to same org
    target_user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if target_user.organization_id != tenant.organization_id:
        raise HTTPException(status_code=404, detail="User not found")

    auth_service = UserAuthService(db)
    
    if not auth_service.change_role(user_id, request.role):
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"status": "role_updated", "user_id": str(user_id), "new_role": request.role.value}


# ============================================================
# Invitation Endpoints
# ============================================================

@app.post("/v1/orgs/{org_id}/invitations", response_model=Invitation, tags=["users"])
def create_invitation(
    org_id: UUID,
    request: InvitationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """Invite a user to the organization."""
    if tenant.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    if not has_permission(tenant.role, Permission.USERS_INVITE):
         raise HTTPException(status_code=403, detail="Permission denied: users:invite")

    # Enforce billing limits on team members
    from .billing import BillingService
    billing_status = BillingService(db).get_billing_status(org_id)
    member_limit = billing_status.get("plan", {}).get("limit_members", 2)
    
    user_count = db.query(UserDB).filter(UserDB.organization_id == org_id).count()
    invite_count = db.query(InvitationDB).filter(
        InvitationDB.organization_id == org_id,
        InvitationDB.accepted_at == None
    ).count()
    
    if (user_count + invite_count) >= member_limit:
        raise HTTPException(
            status_code=403,
            detail=f"Team member limit reached. Your plan allows up to {member_limit} members."
        )

    service = InvitationService(db)
    try:
        invite, token = service.create_invitation(org_id, request.email, request.role, tenant.user_id)
        
        # Determine Invite URL
        base_url = settings.frontend_url if hasattr(settings, 'frontend_url') else "http://localhost:3000"
        invite_link = f"{base_url}/accept-invite?token={token}"
        
        # Fetch inviter name and org name for the email
        inviter_user = db.query(UserDB).filter(UserDB.id == tenant.user_id).first()
        org = db.query(OrganizationDB).filter(OrganizationDB.id == org_id).first()
        
        inviter_name = inviter_user.email if inviter_user else "A team member"
        org_name = org.name if org else "your organization"
        role_display = request.role.value if hasattr(request.role, 'value') else str(request.role)
        expiry_date = invite.expires_at.strftime("%B %d, %Y") if invite.expires_at else "7 days from now"
        
        # Send invitation email (non-blocking)
        from .mailer import send_invitation_email
        background_tasks.add_task(
            send_invitation_email,
            to_email=request.email,
            inviter_name=inviter_name,
            org_name=org_name,
            role=role_display,
            invite_link=invite_link,
            expiry_date=expiry_date
        )
        
        return invite
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/v1/orgs/{org_id}/invitations", response_model=List[Invitation], tags=["users"])
def list_invitations(
    org_id: UUID,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """List pending invitations."""
    if tenant.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    invites = db.query(InvitationDB).filter(
        InvitationDB.organization_id == org_id,
        InvitationDB.accepted_at == None
    ).all()
    
    return [
        Invitation(
            id=i.id,
            organization_id=i.organization_id,
            email=i.email,
            role=i.role,
            inviter_id=i.inviter_id,
            expires_at=i.expires_at,
            created_at=i.created_at
        ) for i in invites
    ]


@app.delete("/v1/orgs/{org_id}/invitations/{invite_id}", tags=["users"])
def revoke_invitation(
    org_id: UUID,
    invite_id: UUID,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """Revoke an invitation."""
    if tenant.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not has_permission(tenant.role, Permission.USERS_INVITE):
         raise HTTPException(status_code=403, detail="Permission denied: users:invite")


    service = InvitationService(db)
    if service.revoke_invitation(invite_id):
        return {"status": "revoked"}
    else:
        raise HTTPException(status_code=404, detail="Invitation not found")


@app.get("/v1/auth/invitations/{token}", tags=["auth"])
async def validate_invitation(
    token: str,
    db: Session = Depends(get_db)
):
    """Validate invitation token and return info (Public)."""

    service = InvitationService(db)
    invite = service.get_invitation(token)
    if not invite:
        raise HTTPException(status_code=404, detail="Invalid or expired invitation")
        
    org = db.query(OrganizationDB).filter(OrganizationDB.id == invite.organization_id).first()
    
    return {
        "email": invite.email,
        "role": invite.role,
        "orgName": org.name if org else "Unknown Organization",
        "orgId": str(invite.organization_id)
    }


@app.post("/v1/auth/invitations/accept", response_model=LoginResponse, tags=["auth"])
def accept_invitation(
    request: InvitationAccept,
    db: Session = Depends(get_db),
    audit: AuditService = Depends(get_audit_service)
):
    """Accept invitation and set password (Public)."""

    service = InvitationService(db)
    try:
        token, user = service.accept_invitation(request.token, request.password)
        
        # Audit log: new member joined
        audit.log(
            organization_id=user.organization_id,
            action="member.joined",
            resource_type="user",
            actor_id=user.id,
            actor_email=user.email,
            resource_id=user.id,
            details={"email": user.email, "role": user.role.value if hasattr(user.role, 'value') else str(user.role)}
        )
        
        # Populate UserWithOrg
        org = db.query(OrganizationDB).filter(OrganizationDB.id == user.organization_id).first()
        
        user_with_org = UserWithOrg(
            **user.dict(),
            org=Organization(
                id=org.id,
                name=org.name,
                status=org.status,
                is_demo=org.is_demo,
                environment=org.environment,
                created_at=org.created_at
            )
        )
        return LoginResponse(token=token, user=user_with_org)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================
# Account Deletion (Owner-Only, OTP-Verified)
# ============================================================

class DeleteOtpRequest(BaseModel):
    """Empty body — token comes from session."""
    pass

class DeleteConfirmRequest(BaseModel):
    code: str

@app.post("/v1/orgs/{org_id}/delete/request-otp", tags=["organizations"])
async def request_delete_otp(
    org_id: UUID,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """
    Request an OTP to confirm account deletion.
    Owner-only. Sends a 6-digit code to the owner's email.
    """
    if org_id != tenant.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")
    if tenant.role != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only the organization owner can delete the account")

    # Generate 6-digit OTP
    import hashlib, secrets
    code = "".join([str(secrets.randbelow(10)) for _ in range(6)])
    code_hash = hashlib.sha256(code.encode()).hexdigest()

    # Store in OTP table (reuse the existing OtpCodeDB)
    otp_record = OtpCodeDB(
        id=uuid4(),
        email=tenant.email,
        code_hash=code_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
        verified=False
    )
    db.add(otp_record)
    db.commit()

    # Send the deletion OTP email
    org = db.query(OrganizationDB).filter(OrganizationDB.id == org_id).first()
    org_name = org.name if org else "your organization"

    import asyncio
    from .mailer import send_account_deletion_otp_email
    asyncio.create_task(send_account_deletion_otp_email(
        to_email=tenant.email,
        otp_code=code,
        org_name=org_name
    ))

    return {"status": "otp_sent", "email": tenant.email}


@app.post("/v1/orgs/{org_id}/delete/confirm", tags=["organizations"])
async def confirm_delete_org(
    org_id: UUID,
    request: DeleteConfirmRequest,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """
    Confirm account deletion with OTP code.
    Permanently deletes the organization and ALL associated data.
    """
    if org_id != tenant.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")
    if tenant.role != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only the organization owner can delete the account")

    # Verify OTP
    import hashlib
    code_hash = hashlib.sha256(request.code.encode()).hexdigest()

    otp_record = db.query(OtpCodeDB).filter(
        OtpCodeDB.email == tenant.email,
        OtpCodeDB.code_hash == code_hash,
        OtpCodeDB.expires_at > datetime.now(timezone.utc),
        OtpCodeDB.verified == False
    ).order_by(OtpCodeDB.created_at.desc()).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")

    # Mark OTP as used
    otp_record.verified = True
    db.commit()

    try:
        # ---- CASCADE DELETE (dependency order) ----

        # 1. Get all user IDs and project IDs for this org
        user_ids = [u.id for u in db.query(UserDB).filter(UserDB.organization_id == org_id).all()]
        project_ids = [p.id for p in db.query(ProjectDB).filter(ProjectDB.organization_id == org_id).all()]

        # 2. Delete audit logs
        db.query(AuditLogDB).filter(AuditLogDB.organization_id == org_id).delete()

        # 3. Delete sessions for all org users
        if user_ids:
            db.query(SessionDB).filter(SessionDB.user_id.in_(user_ids)).delete(synchronize_session='fetch')

        # 4. Delete password reset tokens for all org users
        db.query(PasswordResetTokenDB).filter(PasswordResetTokenDB.user_id.in_(user_ids)).delete(synchronize_session='fetch') if user_ids else None

        # 5. Delete OTP codes for all org user emails
        user_emails = [u.email for u in db.query(UserDB).filter(UserDB.organization_id == org_id).all()]
        if user_emails:
            db.query(OtpCodeDB).filter(OtpCodeDB.email.in_(user_emails)).delete(synchronize_session='fetch')

        # 6. Delete invitations
        db.query(InvitationDB).filter(InvitationDB.organization_id == org_id).delete()

        # 7. Delete API keys (via projects)
        if project_ids:
            db.query(ApiKeyDB).filter(ApiKeyDB.project_id.in_(project_ids)).delete(synchronize_session='fetch')

        # 8. Delete usage events and meters (via projects)
        if project_ids:
            db.query(UsageEventDB).filter(UsageEventDB.project_id.in_(project_ids)).delete(synchronize_session='fetch')
            db.query(UsageMeterDB).filter(UsageMeterDB.project_id.in_(project_ids)).delete(synchronize_session='fetch')

        # 9. Delete projects
        db.query(ProjectDB).filter(ProjectDB.organization_id == org_id).delete()

        # 10. Delete users
        db.query(UserDB).filter(UserDB.organization_id == org_id).delete()

        # 11. Delete the organization
        org = db.query(OrganizationDB).filter(OrganizationDB.id == org_id).first()
        if org:
            db.delete(org)

        db.commit()

        return {"status": "deleted", "message": "Organization and all data permanently deleted."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")


# ============================================================
# Usage & Billing Endpoints
# ============================================================

class UsageStats(BaseModel):
    period_start: datetime
    period_end: datetime
    decision_count: int
    used: int
    limit: int


@app.get("/v1/usage/orgs/{org_id}", response_model=UsageStats, tags=["usage"])
def get_org_usage(
    org_id: UUID,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
) -> UsageStats:
    """
    Get organization usage statistics.
    Aggregates decision counts from Recorder.
    """
    # Authorization
    if tenant.organization_id != org_id:
         raise HTTPException(status_code=403, detail="Access denied")
    
    if tenant.role not in [UserRole.OWNER, UserRole.ADMIN]:
         raise HTTPException(status_code=403, detail="Access denied")

    # 1. Get all projects for Org
    projects = db.query(ProjectDB).filter(ProjectDB.organization_id == org_id).all()
    project_ids = [str(p.id) for p in projects]
    
    if not project_ids:
        # Get plan limit from billing
        from .billing import BillingService
        billing = BillingService(db)
        billing_status = billing.get_billing_status(org_id)
        plan_limit = billing_status.get("plan", {}).get("limit_decisions", 1000)

        return UsageStats(
            period_start=datetime.now(timezone.utc),
            period_end=datetime.now(timezone.utc),
            decision_count=0,
            used=0,
            limit=plan_limit
        )

    # 2. Call Recorder Internal API
    import httpx
    # Assuming 'recorder' is the docker service name and port 8000
    # In config.py: recorder_url might be "http://recorder:8000"
    recorder_url = settings.recorder_url if hasattr(settings, 'recorder_url') else "http://recorder:8000"
    # Ensure no trailing slash
    recorder_url = recorder_url.rstrip("/")
    
    total_usage = 0
    
    try:
        with httpx.Client(timeout=3.0) as client:
            resp = client.get(
                f"{recorder_url}/v1/internal/usage",
                params={"project_ids": ",".join(project_ids)}
            )
            
            if resp.status_code == 200:
                counts = resp.json()
                total_usage = sum(counts.values())
            else:
                print(f"Failed to fetch usage from recorder: {resp.status_code} {resp.text}")
                # Fallback to 0 or error? Fallback to 0 to not break UI
                
    except Exception as e:
         print(f"Usage fetch error: {e}")
         # Fail graceful
         
    # Get plan limit from billing service
    from .billing import BillingService
    billing = BillingService(db)
    billing_status = billing.get_billing_status(org_id)
    plan_limit = billing_status.get("plan", {}).get("limit_decisions", 1000)

    return UsageStats(
        period_start=datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0),
        period_end=datetime.now(timezone.utc),
        decision_count=total_usage,
        used=total_usage,
        limit=plan_limit
    )


@app.get("/v1/usage/orgs/{org_id}/daily", tags=["usage"])
async def get_org_daily_usage(
    org_id: UUID,
    days: int = 30,
    project_id: Optional[str] = None,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """
    Get daily usage breakdown for an organization.
    Returns an array of {date, count} for the last N days.
    """
    # Authorization
    if tenant.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get projects for Org
    if project_id and project_id.lower() != 'all':
        project_ids = [project_id]
    else:
        projects = db.query(ProjectDB).filter(ProjectDB.organization_id == org_id).all()
        project_ids = [str(p.id) for p in projects]

    if not project_ids:
        return []

    # Call Recorder Internal API
    import httpx
    recorder_url = settings.recorder_url if hasattr(settings, 'recorder_url') else "http://recorder:8000"
    recorder_url = recorder_url.rstrip("/")

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{recorder_url}/v1/internal/daily-usage",
                params={"project_ids": ",".join(project_ids), "days": days}
            )

            if resp.status_code == 200:
                return resp.json()
            else:
                print(f"Failed to fetch daily usage: {resp.status_code} {resp.text}")
                return []
    except Exception as e:
        print(f"Daily usage fetch error: {e}")
        return []

# ============================================================
# RBAC Endpoints
# ============================================================

@app.get("/v1/roles", tags=["rbac"])
async def list_roles() -> dict:
    """List all roles and their capabilities."""
    return {
        "roles": [
            get_role_capabilities(role)
            for role in UserRole
        ]
    }


@app.get("/v1/roles/{role}/permissions", tags=["rbac"])
async def get_role_perms(role: UserRole) -> dict:
    """Get permissions for a specific role."""
    return get_role_capabilities(role)


# ============================================================
# Usage Metering Endpoints
# ============================================================

from datetime import date
from .usage import UsageMeteringService, UsageSummary


class UsageResponse(BaseModel):
    project_id: UUID
    period_start: date
    period_end: date
    decisions_ingested: int
    proofs_exported: int
    reports_generated: int
    api_calls: int


@app.get("/v1/usage/projects/{project_id}", response_model=UsageResponse, tags=["usage"])
def get_project_usage(
    project_id: UUID,
    period_start: Optional[date] = None,
    period_end: Optional[date] = None,
    db: Session = Depends(get_db)
) -> UsageResponse:
    """
    Get usage metrics for a project.
    
    Defaults to current month if no period specified.
    """
    metering = UsageMeteringService(db)
    
    if period_start and period_end:
        summary = metering.get_usage_summary(project_id, period_start, period_end)
    else:
        summary = metering.get_current_month_usage(project_id)
    
    return UsageResponse(
        project_id=summary.project_id,
        period_start=summary.period_start,
        period_end=summary.period_end,
        decisions_ingested=summary.decisions_ingested,
        proofs_exported=summary.proofs_exported,
        reports_generated=summary.reports_generated,
        api_calls=summary.api_calls
    )


@app.get("/v1/usage/orgs/{org_id}/breakdown", response_model=List[UsageResponse], tags=["usage"])
def get_org_usage(
    org_id: UUID,
    period_start: Optional[date] = None,
    period_end: Optional[date] = None,
    db: Session = Depends(get_db)
) -> List[UsageResponse]:
    """Get usage metrics for all projects in an organization."""
    metering = UsageMeteringService(db)
    
    today = date.today()
    if not period_start:
        period_start = today.replace(day=1)
    if not period_end:
        period_end = today
    
    summaries = metering.get_org_usage(org_id, period_start, period_end)
    
    return [
        UsageResponse(
            project_id=s.project_id,
            period_start=s.period_start,
            period_end=s.period_end,
            decisions_ingested=s.decisions_ingested,
            proofs_exported=s.proofs_exported,
            reports_generated=s.reports_generated,
            api_calls=s.api_calls
        )
        for s in summaries
    ]


# ============================================================
# Billing Endpoints (Stub)
# ============================================================

class Plan(BaseModel):
    id: str
    name: str
    price: str
    features: List[str]
    limit_decisions: int

class BillingStatus(BaseModel):
    plan: Plan
    status: str
    current_period_end: date
    invoices: List[dict]

class SubscriptionUpdate(BaseModel):
    plan_id: str

@app.get("/v1/plans", tags=["billing"])
def list_plans() -> List[Plan]:
    """List available subscription plans."""
    return [
        Plan(id="free", name="Developer", price="$0", features=["1k Decisions/mo", "Community Support"], limit_decisions=1000),
        Plan(id="pro", name="Pro", price="$99/mo", features=["250k Decisions/mo", "Email Support", "Advanced Reports"], limit_decisions=250000),
        Plan(id="enterprise", name="Enterprise", price="Custom", features=["Unlimited", "SLA", "Audit Logs"], limit_decisions=1000000),
    ]

@app.get("/v1/orgs/{org_id}/billing", response_model=BillingStatus, tags=["billing"])
def get_billing_status(
    org_id: UUID,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
) -> BillingStatus:
    """Get billing status for organization."""
    if tenant.organization_id != org_id:
         raise HTTPException(status_code=403, detail="Access denied")
         
    billing_service = BillingService(db)
    try:
        data = billing_service.get_billing_status(org_id)
        
        # Convert timestamps to dates for response model
        period_end = date.today()
        if data.get("current_period_end"):
            # Handle timestamp conversion safely
            ts = data["current_period_end"]
            if isinstance(ts, int):
                period_end = datetime.fromtimestamp(ts).date()
            else:
                period_end = ts
                
        # Convert invoices
        invoices = []
        for inv in data.get("invoices", []):
            inv_date = inv["date"]
            if isinstance(inv_date, int):
                 inv_date = datetime.fromtimestamp(inv_date).strftime("%Y-%m-%d")
            invoices.append({
                "id": inv["id"],
                "date": str(inv_date),
                "amount": inv["amount"],
                "status": inv["status"]
            })

        return BillingStatus(
            plan=Plan(**data["plan"]),
            status=data["status"],
            current_period_end=period_end,
            invoices=invoices
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/v1/orgs/{org_id}/billing/subscription", tags=["billing"])
def update_subscription(
    org_id: UUID,
    update: SubscriptionUpdate,
    db: Session = Depends(get_db),
    tenant: TenantContext = Depends(require_tenant_context)
):
    """
    Upgrade/Downgrade plan.
    DEPRECATED: Use /v1/billing/checkout or /v1/billing/portal for real flows.
    """
    raise HTTPException(status_code=400, detail="Please use Checkout or Portal for subscription changes.")


@app.get("/health", tags=["system"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "control-plane"}


# ============================================================
# Audit Endpoints
# ============================================================

@app.get("/v1/orgs/{org_id}/audit-logs", response_model=List[AuditLog], tags=["audit"])
async def get_audit_logs(
    org_id: UUID,
    limit: int = 50,
    offset: int = 0,
    audit: AuditService = Depends(get_audit_service),
    tenant: TenantContext = Depends(require_tenant_context)
) -> List[AuditLog]:
    """Get audit logs for an organization."""
    if tenant.organization_id != org_id:
         raise HTTPException(status_code=403, detail="Access denied")
         
    if tenant.role not in [UserRole.OWNER, UserRole.ADMIN]:
         raise HTTPException(status_code=403, detail="Access denied")

    return audit.get_logs(org_id, limit, offset)


class AuditLogCreate(BaseModel):
    """Request body for internal audit log creation."""
    organization_id: UUID
    action: str
    resource_type: str
    actor_id: Optional[UUID] = None
    actor_email: Optional[str] = None
    resource_id: Optional[UUID] = None
    details: Optional[dict] = None


@app.post("/v1/internal/audit-logs", tags=["audit"])
def create_internal_audit_log(
    entry: AuditLogCreate,
    db: Session = Depends(get_db),
    internal_check: None = Depends(require_internal_secret)
):
    """
    Allow internal microservices to write audit entries.
    
    Secured by X-Internal-Secret header. Used by governance-policy
    and other services to log administrative actions centrally.
    """
    audit_service = AuditService(db)
    audit_service.log(
        organization_id=entry.organization_id,
        action=entry.action,
        resource_type=entry.resource_type,
        actor_id=entry.actor_id,
        actor_email=entry.actor_email,
        resource_id=entry.resource_id,
        details=entry.details
    )
    return {"status": "logged"}

# ============================================================
# Real Billing Endpoints (Stripe)
# ============================================================

@app.post("/v1/billing/checkout", tags=["billing"])
async def create_checkout_session(
    request: CheckoutSessionRequest,
    tenant: TenantContext = Depends(require_tenant_context),
    db: Session = Depends(get_db)
):
    """Create a Stripe Checkout Session."""
    if tenant.role != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only owners can manage billing")
        
    billing_service = BillingService(db)
    try:
        url = billing_service.create_checkout_session(
            org_id=tenant.organization_id,
            plan_id=request.plan_id,
            success_url=request.success_url,
            cancel_url=request.cancel_url
        )
        return {"url": url}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[billing] Checkout error: {e}")
        raise HTTPException(status_code=502, detail=f"Billing provider error: {str(e)}")


@app.post("/v1/billing/portal", tags=["billing"])
async def create_portal_session(
    request: PortalSessionRequest,
    tenant: TenantContext = Depends(require_tenant_context),
    db: Session = Depends(get_db)
):
    """Create a Stripe Customer Portal Session."""
    if tenant.role != UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Only owners can manage billing")
        
    billing_service = BillingService(db)
    try:
        url = billing_service.create_portal_session(
            org_id=tenant.organization_id,
            return_url=request.return_url
        )
        return {"url": url}
    except ValueError as e:
         raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[billing] Portal error: {e}")
        raise HTTPException(status_code=502, detail=f"Billing provider error: {str(e)}")


# ============================================================
# Governance Proxy (Secure Access)
# ============================================================

from .governance_proxy import router as governance_router
from .decisions_proxy import router as decisions_router
from .reports_api import router as reports_router
from .policy_proxy import router as policy_router

app.include_router(reports_router)
app.include_router(governance_router)
app.include_router(decisions_router)
app.include_router(policy_router)
