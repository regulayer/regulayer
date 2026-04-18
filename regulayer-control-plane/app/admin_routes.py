"""
Regulayer Control Plane - Super Admin API

Endpoints for platform-wide administration, strictly guarded.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from datetime import datetime, timezone

from .storage import (
    get_db, UserDB, OrganizationDB, ProjectDB, SessionDB, 
    UsageMeterDB, OrgStatus, ApiKeyDB, AuditLogDB
)
from .user_auth import UserAuthService
from .models import UserRole

router = APIRouter(prefix="/v1/admin", tags=["Super Admin"])

def get_auth_service(db: Session = Depends(get_db)) -> UserAuthService:
    return UserAuthService(db)

def verify_superadmin(
    authorization: Optional[str] = Header(None), 
    auth_service: UserAuthService = Depends(get_auth_service),
    db: Session = Depends(get_db)
):
    """Dependency to verify token belongs to a superadmin."""
    token = authorization.replace("Bearer ", "") if authorization else ""
    user_id = auth_service.session_service.validate_session(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user or getattr(user, 'is_superadmin', False) is not True:
        raise HTTPException(status_code=403, detail="Forbidden: Super Admin access required.")
    return user

# Super Admin Response Models

class AdminOverview(BaseModel):
    total_organizations: int
    total_users: int
    total_decisions: int

class AdminOrgListItem(BaseModel):
    id: UUID
    name: str
    status: OrgStatus
    environment: str
    owner_email: Optional[str]
    member_count: int
    decisions_ingested: int
    proofs_exported: int
    custom_decision_cap: Optional[int]
    created_at: datetime

class AdminUserListItem(BaseModel):
    id: UUID
    email: str
    role: UserRole
    created_at: datetime
    last_login_at: Optional[datetime]

class AdminProjectItem(BaseModel):
    id: UUID
    name: str
    governance_mode: str
    created_at: datetime

class AdminApiKeyItem(BaseModel):
    id: UUID
    name: str
    key_prefix: str
    scopes: List[str]
    created_at: datetime

class AdminAuditLogItem(BaseModel):
    id: UUID
    actor_email: Optional[str]
    action: str
    resource_type: str
    ip_address: Optional[str]
    created_at: datetime

class AdminOrgDetails(BaseModel):
    organization: AdminOrgListItem
    projects: List[AdminProjectItem]
    api_keys: List[AdminApiKeyItem]
    audit_logs: List[AdminAuditLogItem]

class SetQuotaRequest(BaseModel):
    custom_decision_cap: Optional[int] = None

# Endpoints

@router.get("/overview", response_model=AdminOverview)
def get_overview(
    admin: UserDB = Depends(verify_superadmin),
    db: Session = Depends(get_db)
):
    """Get platform-wide statistics."""
    total_orgs = db.query(OrganizationDB).count()
    total_users = db.query(UserDB).count()
    total_decisions = db.query(func.sum(UsageMeterDB.decisions_ingested)).scalar() or 0
    
    return AdminOverview(
        total_organizations=total_orgs,
        total_users=total_users,
        total_decisions=int(total_decisions)
    )

@router.get("/organizations", response_model=List[AdminOrgListItem])
def list_organizations(
    admin: UserDB = Depends(verify_superadmin),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """List all organizations with enriched usage metadata."""
    orgs = db.query(OrganizationDB).offset(skip).limit(limit).all()
    
    result = []
    for org in orgs:
        # Get member count
        member_count = db.query(UserDB).filter(UserDB.organization_id == org.id).count()
        # Get owner email
        owner = db.query(UserDB).filter(UserDB.organization_id == org.id, UserDB.role == UserRole.OWNER).first()
        
        # Get usage stats for sum of all projects in this org
        # Projects -> UsageMeters
        projects = db.query(ProjectDB.id).filter(ProjectDB.organization_id == org.id).all()
        project_ids = [p.id for p in projects]
        
        decisions_ingested = 0
        proofs_exported = 0
        if project_ids:
            decisions_ingested = db.query(func.sum(UsageMeterDB.decisions_ingested)).filter(UsageMeterDB.project_id.in_(project_ids)).scalar() or 0
            proofs_exported = db.query(func.sum(UsageMeterDB.proofs_exported)).filter(UsageMeterDB.project_id.in_(project_ids)).scalar() or 0
        
        result.append(AdminOrgListItem(
            id=org.id,
            name=org.name,
            status=org.status,
            environment=org.environment,
            owner_email=owner.email if owner else None,
            member_count=member_count,
            decisions_ingested=int(decisions_ingested),
            proofs_exported=int(proofs_exported),
            custom_decision_cap=getattr(org, 'custom_decision_cap', None),
            created_at=org.created_at
        ))
    return result

@router.get("/organizations/{org_id}/users", response_model=List[AdminUserListItem])
def list_organization_users(
    org_id: UUID,
    admin: UserDB = Depends(verify_superadmin),
    db: Session = Depends(get_db)
):
    """List all users belonging to a specific organization."""
    users = db.query(UserDB).filter(UserDB.organization_id == org_id).all()
    return [
        AdminUserListItem(
            id=u.id,
            email=u.email,
            role=u.role,
            created_at=u.created_at,
            last_login_at=u.last_login_at
        ) for u in users
    ]

@router.get("/organizations/{org_id}/details", response_model=AdminOrgDetails)
def get_organization_details(
    org_id: UUID,
    admin: UserDB = Depends(verify_superadmin),
    db: Session = Depends(get_db)
):
    """Deep inspect an organization."""
    org = db.query(OrganizationDB).filter(OrganizationDB.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    member_count = db.query(UserDB).filter(UserDB.organization_id == org.id).count()
    owner = db.query(UserDB).filter(UserDB.organization_id == org.id, UserDB.role == UserRole.OWNER).first()
    
    projects = db.query(ProjectDB).filter(ProjectDB.organization_id == org.id).all()
    project_ids = [p.id for p in projects]
    
    decisions_ingested = 0
    proofs_exported = 0
    if project_ids:
        decisions_ingested = db.query(func.sum(UsageMeterDB.decisions_ingested)).filter(UsageMeterDB.project_id.in_(project_ids)).scalar() or 0
        proofs_exported = db.query(func.sum(UsageMeterDB.proofs_exported)).filter(UsageMeterDB.project_id.in_(project_ids)).scalar() or 0

    org_summary = AdminOrgListItem(
        id=org.id,
        name=org.name,
        status=org.status,
        environment=org.environment,
        owner_email=owner.email if owner else None,
        member_count=member_count,
        decisions_ingested=int(decisions_ingested),
        proofs_exported=int(proofs_exported),
        custom_decision_cap=getattr(org, 'custom_decision_cap', None),
        created_at=org.created_at
    )

    api_keys = []
    if project_ids:
        api_keys = db.query(ApiKeyDB).filter(ApiKeyDB.project_id.in_(project_ids)).all()

    audit_logs = db.query(AuditLogDB).filter(AuditLogDB.organization_id == org.id).order_by(AuditLogDB.created_at.desc()).limit(50).all()

    return AdminOrgDetails(
        organization=org_summary,
        projects=[AdminProjectItem(id=p.id, name=p.name, governance_mode=p.governance_mode, created_at=p.created_at) for p in projects],
        api_keys=[AdminApiKeyItem(id=k.id, name=k.name, key_prefix=k.key_prefix, scopes=k.scopes, created_at=k.created_at) for k in api_keys],
        audit_logs=[AdminAuditLogItem(id=log.id, actor_email=log.actor_email, action=log.action, resource_type=log.resource_type, ip_address=log.ip_address, created_at=log.created_at) for log in audit_logs]
    )

@router.post("/organizations/{org_id}/quota")
def update_organization_quota(
    org_id: UUID,
    payload: SetQuotaRequest,
    admin: UserDB = Depends(verify_superadmin),
    db: Session = Depends(get_db)
):
    """Update custom quota limits for an organization (-1 means unlimited)."""
    org = db.query(OrganizationDB).filter(OrganizationDB.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    org.custom_decision_cap = payload.custom_decision_cap
    db.commit()
    return {"status": "success", "custom_decision_cap": getattr(org, 'custom_decision_cap', None)}

@router.post("/organizations/{org_id}/suspend")
def suspend_organization(
    org_id: UUID,
    admin: UserDB = Depends(verify_superadmin),
    db: Session = Depends(get_db)
):
    """Immediately freeze an organization's API access."""
    org = db.query(OrganizationDB).filter(OrganizationDB.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    org.status = OrgStatus.SUSPENDED
    db.commit()
    return {"status": "success", "org_status": "suspended"}

@router.post("/organizations/{org_id}/activate")
def activate_organization(
    org_id: UUID,
    admin: UserDB = Depends(verify_superadmin),
    db: Session = Depends(get_db)
):
    """Reactivate a suspended organization."""
    org = db.query(OrganizationDB).filter(OrganizationDB.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    org.status = OrgStatus.ACTIVE
    db.commit()
    return {"status": "success", "org_status": "active"}

@router.delete("/organizations/{org_id}")
def delete_organization(
    org_id: UUID,
    admin: UserDB = Depends(verify_superadmin),
    db: Session = Depends(get_db)
):
    """Hard delete an organization (Proceed with extreme caution)."""
    # Extremely destructive action. Note that WORM logs in the recorder microservice 
    # will still physically exist, but the control plane tenant is destroyed.
    org = db.query(OrganizationDB).filter(OrganizationDB.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    # Order matters for foreign keys
    project_ids = db.query(ProjectDB.id).filter(ProjectDB.organization_id == org_id).all()
    project_ids_list = [p.id for p in project_ids]
    
    if project_ids_list:
        db.query(ApiKeyDB).filter(ApiKeyDB.project_id.in_(project_ids_list)).delete(synchronize_session=False)
        db.query(UsageEventDB).filter(UsageEventDB.project_id.in_(project_ids_list)).delete(synchronize_session=False)
        db.query(UsageMeterDB).filter(UsageMeterDB.project_id.in_(project_ids_list)).delete(synchronize_session=False)

    db.query(InvitationDB).filter(InvitationDB.organization_id == org_id).delete()
    
    # Needs cascading or manual cleanup...
    db.execute(SessionDB.__table__.delete().where(SessionDB.user_id.in_(db.query(UserDB.id).filter(UserDB.organization_id == org_id))))
    db.execute(UserDB.__table__.delete().where(UserDB.organization_id == org_id))
    db.execute(ProjectDB.__table__.delete().where(ProjectDB.organization_id == org_id))
    db.delete(org)
    
    db.commit()
    return {"status": "success", "message": "Organization deleted"}
