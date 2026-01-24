"""
Regulayer Control Plane - API

REST API for tenant management.
"""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid4

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .models import (
    Organization, OrganizationCreate,
    Project, ProjectCreate, ProjectEnvironment,
    ApiKey, ApiKeyCreate, ApiKeyWithSecret,
    User, UserCreate,
    TenantContext, KeyValidationResult
)
from .storage import (
    get_db, init_db,
    OrganizationDB, ProjectDB, UserDB, ApiKeyDB,
    OrgStatus
)
from .auth import AuthService
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


@app.on_event("startup")
async def startup():
    init_db()


# ============================================================
# Organization Endpoints
# ============================================================

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
    db: Session = Depends(get_db)
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
    user: User


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
    return LoginResponse(token=token, user=user)


@app.post("/v1/auth/logout", tags=["auth"])
async def logout(
    token: str,
    db: Session = Depends(get_db)
) -> dict:
    """Logout and invalidate session."""
    auth_service = UserAuthService(db)
    auth_service.logout(token)
    return {"status": "logged_out"}


@app.get("/v1/auth/me", response_model=User, tags=["auth"])
async def get_current_user(
    token: str,
    db: Session = Depends(get_db)
) -> User:
    """Get current user from session token."""
    auth_service = UserAuthService(db)
    user = auth_service.get_user_from_token(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    return user


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
# Health Check
# ============================================================

@app.get("/health", tags=["system"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "control-plane"}
