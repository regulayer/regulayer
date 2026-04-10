from typing import List
from uuid import UUID, uuid4
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from .models import (
    AISystemCreate, AISystemModel,
    ConformityAssessmentCreate, ConformityAssessmentModel,
    FRIACreate, FRIAModel,
    TechDocumentationCreate, TechDocumentationModel,
    MonitoringPlanCreate, MonitoringPlanModel,
    IncidentReportCreate, IncidentReportModel,
    TenantContext
)
from .storage import (
    get_db, OrganizationDB, 
    AISystemDB, ConformityAssessmentDB, 
    FRIADB, TechDocumentationDB, 
    MonitoringPlanDB, IncidentReportDB
)
from .middleware import require_tenant_context

router = APIRouter(tags=["compliance"])

def _verify_org_access(organization_id: UUID, tenant: TenantContext, db: Session):
    org = db.query(OrganizationDB).filter(OrganizationDB.id == organization_id).first()
    if not org or org.id != tenant.organization_id:
        raise HTTPException(status_code=404, detail="Organization not found")

# ============================================================
# AI Systems
# ============================================================
@router.post("/v1/orgs/{organization_id}/compliance/ai-systems", response_model=AISystemModel)
def create_ai_system(organization_id: UUID, request: AISystemCreate, db: Session = Depends(get_db), tenant: TenantContext = Depends(require_tenant_context)):
    _verify_org_access(organization_id, tenant, db)
    if request.id:
        db_item = db.query(AISystemDB).filter(AISystemDB.id == request.id).first()
        if db_item:
            for k, v in request.dict(exclude={'id'}).items():
                setattr(db_item, k, v)
            db.commit()
            db.refresh(db_item)
            return db_item

    db_item = AISystemDB(id=request.id or uuid4(), organization_id=organization_id, **request.dict(exclude={'id'}))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/v1/orgs/{organization_id}/compliance/ai-systems", response_model=List[AISystemModel])
def list_ai_systems(organization_id: UUID, db: Session = Depends(get_db), tenant: TenantContext = Depends(require_tenant_context)):
    _verify_org_access(organization_id, tenant, db)
    return db.query(AISystemDB).filter(AISystemDB.organization_id == organization_id).all()

# ============================================================
# Conformity Assessments
# ============================================================
@router.post("/v1/orgs/{organization_id}/compliance/conformity", response_model=ConformityAssessmentModel)
def create_conformity(organization_id: UUID, request: ConformityAssessmentCreate, db: Session = Depends(get_db), tenant: TenantContext = Depends(require_tenant_context)):
    _verify_org_access(organization_id, tenant, db)
    if request.id:
        db_item = db.query(ConformityAssessmentDB).filter(ConformityAssessmentDB.id == request.id).first()
        if db_item:
            for k, v in request.dict(exclude={'id'}).items():
                setattr(db_item, k, v)
            db.commit()
            db.refresh(db_item)
            return db_item

    db_item = ConformityAssessmentDB(id=request.id or uuid4(), organization_id=organization_id, **request.dict(exclude={'id'}))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/v1/orgs/{organization_id}/compliance/conformity", response_model=List[ConformityAssessmentModel])
def list_conformity(organization_id: UUID, db: Session = Depends(get_db), tenant: TenantContext = Depends(require_tenant_context)):
    _verify_org_access(organization_id, tenant, db)
    return db.query(ConformityAssessmentDB).filter(ConformityAssessmentDB.organization_id == organization_id).all()

# ============================================================
# FRIA
# ============================================================
@router.post("/v1/orgs/{organization_id}/compliance/fria", response_model=FRIAModel)
def create_fria(organization_id: UUID, request: FRIACreate, db: Session = Depends(get_db), tenant: TenantContext = Depends(require_tenant_context)):
    _verify_org_access(organization_id, tenant, db)
    if request.id:
        db_item = db.query(FRIADB).filter(FRIADB.id == request.id).first()
        if db_item:
            for k, v in request.dict(exclude={'id'}).items():
                setattr(db_item, k, v)
            db.commit()
            db.refresh(db_item)
            return db_item

    db_item = FRIADB(id=request.id or uuid4(), organization_id=organization_id, **request.dict(exclude={'id'}))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/v1/orgs/{organization_id}/compliance/fria", response_model=List[FRIAModel])
def list_fria(organization_id: UUID, db: Session = Depends(get_db), tenant: TenantContext = Depends(require_tenant_context)):
    _verify_org_access(organization_id, tenant, db)
    return db.query(FRIADB).filter(FRIADB.organization_id == organization_id).all()

# ============================================================
# Tech Documentation
# ============================================================
@router.post("/v1/orgs/{organization_id}/compliance/tech-docs", response_model=TechDocumentationModel)
def create_tech_docs(organization_id: UUID, request: TechDocumentationCreate, db: Session = Depends(get_db), tenant: TenantContext = Depends(require_tenant_context)):
    _verify_org_access(organization_id, tenant, db)
    if request.id:
        db_item = db.query(TechDocumentationDB).filter(TechDocumentationDB.id == request.id).first()
        if db_item:
            for k, v in request.dict(exclude={'id'}).items():
                setattr(db_item, k, v)
            db.commit()
            db.refresh(db_item)
            return db_item

    db_item = TechDocumentationDB(id=request.id or uuid4(), organization_id=organization_id, **request.dict(exclude={'id'}))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/v1/orgs/{organization_id}/compliance/tech-docs", response_model=List[TechDocumentationModel])
def list_tech_docs(organization_id: UUID, db: Session = Depends(get_db), tenant: TenantContext = Depends(require_tenant_context)):
    _verify_org_access(organization_id, tenant, db)
    return db.query(TechDocumentationDB).filter(TechDocumentationDB.organization_id == organization_id).all()

# ============================================================
# Monitoring Plans
# ============================================================
@router.post("/v1/orgs/{organization_id}/compliance/monitoring", response_model=MonitoringPlanModel)
def create_monitoring(organization_id: UUID, request: MonitoringPlanCreate, db: Session = Depends(get_db), tenant: TenantContext = Depends(require_tenant_context)):
    _verify_org_access(organization_id, tenant, db)
    if request.id:
        db_item = db.query(MonitoringPlanDB).filter(MonitoringPlanDB.id == request.id).first()
        if db_item:
            for k, v in request.dict(exclude={'id'}).items():
                setattr(db_item, k, v)
            db.commit()
            db.refresh(db_item)
            return db_item

    db_item = MonitoringPlanDB(id=request.id or uuid4(), organization_id=organization_id, **request.dict(exclude={'id'}))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/v1/orgs/{organization_id}/compliance/monitoring", response_model=List[MonitoringPlanModel])
def list_monitoring(organization_id: UUID, db: Session = Depends(get_db), tenant: TenantContext = Depends(require_tenant_context)):
    _verify_org_access(organization_id, tenant, db)
    return db.query(MonitoringPlanDB).filter(MonitoringPlanDB.organization_id == organization_id).all()

# ============================================================
# Incident Reports
# ============================================================
@router.post("/v1/orgs/{organization_id}/compliance/incidents", response_model=IncidentReportModel)
def create_incident(organization_id: UUID, request: IncidentReportCreate, db: Session = Depends(get_db), tenant: TenantContext = Depends(require_tenant_context)):
    _verify_org_access(organization_id, tenant, db)
    if request.id:
        db_item = db.query(IncidentReportDB).filter(IncidentReportDB.id == request.id).first()
        if db_item:
            for k, v in request.dict(exclude={'id'}).items():
                setattr(db_item, k, v)
            db.commit()
            db.refresh(db_item)
            return db_item

    db_item = IncidentReportDB(id=request.id or uuid4(), organization_id=organization_id, **request.dict(exclude={'id'}))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/v1/orgs/{organization_id}/compliance/incidents", response_model=List[IncidentReportModel])
def list_incidents(organization_id: UUID, db: Session = Depends(get_db), tenant: TenantContext = Depends(require_tenant_context)):
    _verify_org_access(organization_id, tenant, db)
    return db.query(IncidentReportDB).filter(IncidentReportDB.organization_id == organization_id).all()

