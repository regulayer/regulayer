"""
Regulayer Control Plane - API

REST API for tenant management.
"""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid4

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .enums import ProjectEnvironment, UserRole

from .models import (
    Organization, OrganizationCreate,
    Project, ProjectCreate,
    ApiKey, ApiKeyCreate, ApiKeyWithSecret,
    User, UserCreate, UserWithOrg, OrgStatusUpdate, # Added imports
    TenantContext, KeyValidationResult, AuditLog
)
from .storage import (
    get_db, init_db,
    OrganizationDB, ProjectDB, UserDB, ApiKeyDB,
    OrgStatus
)
from .auth import AuthService
from .audit import AuditService

from .middleware import require_tenant_context, get_tenant_context
from .config import settings


app = FastAPI(
    title="Regulayer Control Plane",
    description="Multi-tenant SaaS management for Regulayer",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Billing Webhooks (Stripe)
# ============================================================

@app.post("/v1/billing/webhook")
async def billing_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Stripe webhooks for subscription status updates.
    """
    try:
        payload = await request.json()
        event_type = payload.get("type")
        data = payload.get("data", {}).get("object", {})
        
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

@app.patch("/v1/orgs/{org_id}/status", tags=["organizations"])
async def patch_organization_status(
    org_id: UUID,
    request: OrgStatusUpdate,
    db: Session = Depends(get_db)
) -> dict:
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
async def create_organization(
    request: OrganizationCreate,
    db: Session = Depends(get_db)
) -> Organization:
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
async def get_organization(
    org_id: UUID,
    db: Session = Depends(get_db)
) -> Organization:
    """Get organization details."""
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
async def list_organizations(
    db: Session = Depends(get_db)
) -> List[Organization]:
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


# ============================================================
# Project Endpoints
# ============================================================

@app.post("/v1/orgs/{org_id}/projects", response_model=Project, tags=["projects"])
async def create_project(
    org_id: UUID,
    request: ProjectCreate,
    db: Session = Depends(get_db),
    audit: AuditService = Depends(get_audit_service)
) -> Project:
    """Create a new project within an organization."""
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
        created_at=project.created_at
    )


@app.get("/v1/projects/{project_id}", response_model=Project, tags=["projects"])
async def get_project(
    project_id: UUID,
    db: Session = Depends(get_db)
) -> Project:
    """Get project details."""
    project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return Project(
        id=project.id,
        organization_id=project.organization_id,
        name=project.name,
        environment=project.environment,
        created_at=project.created_at,
        updated_at=project.updated_at
    )


@app.get("/v1/orgs/{org_id}/projects", response_model=List[Project], tags=["projects"])
async def list_org_projects(
    org_id: UUID,
    db: Session = Depends(get_db)
) -> List[Project]:
    """List all projects in an organization."""
    projects = db.query(ProjectDB).filter(ProjectDB.organization_id == org_id).all()
    
    return [
        Project(
            id=p.id,
            organization_id=p.organization_id,
            name=p.name,
            environment=p.environment,
            created_at=p.created_at,
            updated_at=p.updated_at
        )
        for p in projects
    ]


# ============================================================
# API Key Endpoints
# ============================================================

@app.post("/v1/projects/{project_id}/keys", response_model=ApiKeyWithSecret, tags=["api-keys"])
async def create_api_key(
    project_id: UUID,
    request: ApiKeyCreate,
    db: Session = Depends(get_db)
) -> ApiKeyWithSecret:
    """
    Create a new API key for a project.
    
    ⚠️ The key secret is only shown once! Store it securely.
    """
    auth_service = AuthService(db)
    
    try:
        return auth_service.create_api_key(project_id, request)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/v1/projects/{project_id}/keys", response_model=List[ApiKey], tags=["api-keys"])
async def list_project_keys(
    project_id: UUID,
    db: Session = Depends(get_db)
) -> List[ApiKey]:
    """List all API keys for a project."""
    auth_service = AuthService(db)
    return auth_service.get_project_keys(project_id)


@app.post("/v1/keys/{key_id}/revoke", tags=["api-keys"])
async def revoke_api_key(
    key_id: UUID,
    db: Session = Depends(get_db)
) -> dict:
    """Revoke an API key."""
    auth_service = AuthService(db)
    
    if not auth_service.revoke_api_key(key_id):
        raise HTTPException(status_code=404, detail="Key not found")
    
    return {"status": "revoked", "key_id": str(key_id)}


# ============================================================
# Auth Context Endpoints (API Keys)
# ============================================================

@app.get("/v1/me", response_model=TenantContext, tags=["auth"])
async def get_current_context(
    tenant: TenantContext = Depends(require_tenant_context)
) -> TenantContext:
    """Get current authentication context."""
    return tenant


@app.post("/v1/auth/validate", response_model=KeyValidationResult, tags=["auth"])
async def validate_key(
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
from .user_auth import UserAuthService
from .rbac import Permission, get_role_permissions, get_role_capabilities


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
async def login(
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
async def get_current_user(
    token: str,
    db: Session = Depends(get_db)
) -> UserWithOrg:
    """Get current user from session token."""
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
        from .user_auth import hash_password
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
        from .user_auth import hash_password
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
    db: Session = Depends(get_db)
) -> User:
    """Create a new user in an organization."""
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
    db: Session = Depends(get_db)
) -> List[User]:
    """List all users in an organization."""
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
    db: Session = Depends(get_db)
) -> dict:
    """Change a user's role."""
    auth_service = UserAuthService(db)
    
    if not auth_service.change_role(user_id, request.role):
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"status": "role_updated", "user_id": str(user_id), "new_role": request.role.value}


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
async def get_project_usage(
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


@app.get("/v1/usage/orgs/{org_id}", response_model=List[UsageResponse], tags=["usage"])
async def get_org_usage(
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

STUB_PLANS = {
    "free": Plan(id="free", name="Free Tier", price="$0", features=["10k Decisions/mo", "Community Support"], limit_decisions=10000),
    "pro": Plan(id="pro", name="Pro", price="$99/mo", features=["100k Decisions/mo", "Email Support", "Advanced Reports"], limit_decisions=100000),
    "enterprise": Plan(id="enterprise", name="Enterprise", price="Custom", features=["Unlimited", "SLA", "Audit Logs"], limit_decisions=1000000),
}

@app.get("/v1/plans", tags=["billing"])
async def list_plans() -> List[Plan]:
    """List available subscription plans."""
    return list(STUB_PLANS.values())

@app.get("/v1/orgs/{org_id}/billing", response_model=BillingStatus, tags=["billing"])
async def get_billing_status(
    org_id: UUID,
    db: Session = Depends(get_db)
) -> BillingStatus:
    """Get billing status for organization."""
    # In a real app, query Stripe/Billing DB
    # Here we mock based on Org Status or simple logic
    org = db.query(OrganizationDB).filter(OrganizationDB.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Org not found")
        
    # Default to Free if not specified (we don't have plan column yet, assume Free)
    # If org is suspended, status is 'frozen'
    status = "active"
    if org.status == OrgStatus.SUSPENDED:
        status = "frozen"
        
    return BillingStatus(
        plan=STUB_PLANS["free"],
        status=status,
        current_period_end=date.today().replace(day=28),
        invoices=[
            {"id": "inv_stub_001", "date": "2025-01-01", "amount": "$0.00", "status": "paid"}
        ]
    )

@app.post("/v1/orgs/{org_id}/billing/subscription", tags=["billing"])
async def update_subscription(
    org_id: UUID,
    update: SubscriptionUpdate,
    db: Session = Depends(get_db)
) -> BillingStatus:
    """Upgrade/Downgrade plan (Stub)."""
    if update.plan_id not in STUB_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan ID")
        
    # In real app: Call Stripe to update subscription
    # Here: Just return success with new plan mocked
    return BillingStatus(
        plan=STUB_PLANS[update.plan_id],
        status="active",
        current_period_end=date.today().replace(day=28),
        invoices=[]
    )


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
    audit: AuditService = Depends(get_audit_service)
) -> List[AuditLog]:
    """Get audit logs for an organization."""
    return audit.get_logs(org_id, limit, offset)
