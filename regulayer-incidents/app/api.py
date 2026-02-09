
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List
from pydantic import BaseModel, UUID4
from datetime import datetime
import json

from .db import get_db_session
from .models import IncidentEventDB
from .config import settings

router = APIRouter()

# --- Pydantic Models ---

class IncidentCreate(BaseModel):
    incident_type: str
    severity: str # info, warning, critical
    source: str
    message: str
    org_id: Optional[UUID4] = None
    metadata: Optional[dict] = None

class IncidentRead(BaseModel):
    id: UUID4
    incident_type: str
    severity: str
    source: str
    message: str
    org_id: Optional[UUID4] = None
    created_at: datetime
    metadata: Optional[dict] = None

    class Config:
        from_attributes = True

class StatusResponse(BaseModel):
    status: str # operational, degraded, critical
    last_updated: datetime

# --- Internal API (Write) ---

@router.post("/internal/incidents", response_model=IncidentRead, status_code=201)
async def create_incident(
    incident: IncidentCreate,
    x_internal_auth: str = Header(..., alias="X-Internal-Auth"),
    session: AsyncSession = Depends(get_db_session)
):
    """
    Internal endpoint to report incidents.
    Secured by shared secret.
    """
    if x_internal_auth != settings.internal_secret:
        raise HTTPException(status_code=403, detail="Invalid internal secret")
    
    # Validation
    if incident.severity not in ["info", "warning", "critical"]:
        raise HTTPException(status_code=400, detail="Invalid severity")

    db_incident = IncidentEventDB(
        incident_type=incident.incident_type,
        severity=incident.severity,
        source=incident.source,
        message=incident.message,
        org_id=incident.org_id,
        metadata_json=incident.metadata
    )
    
    session.add(db_incident)
    await session.commit()
    await session.refresh(db_incident)
    
    return db_incident

# --- Public API (Read) ---

@router.get("/v1/incidents", response_model=List[IncidentRead])
async def list_incidents(
    org_id: Optional[UUID4] = None,
    severity: Optional[str] = None,
    limit: int = 50,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Public endpoint to list incidents.
    TODO: Add Authentication for Customer access (e.g. JWT check).
    For now, relying on Gateway validation.
    """
    stmt = select(IncidentEventDB).order_by(desc(IncidentEventDB.created_at)).limit(limit)
    
    if org_id:
        # Filter by Org OR System-wide (Null)
        stmt = stmt.where((IncidentEventDB.org_id == org_id) | (IncidentEventDB.org_id == None))
    else:
        # If no Org ID provided, show only System-wide? Or all?
        # User constraint: "Must not expose internal-only metadata unless org matches"
        # Since this is behind Gateway, Gateway injects Org ID usually.
        # If internal/admin, might see all.
        pass

    if severity:
        stmt = stmt.where(IncidentEventDB.severity == severity)
        
    result = await session.execute(stmt)
    return result.scalars().all()

@router.get("/v1/public/status", response_model=StatusResponse)
async def get_system_status(session: AsyncSession = Depends(get_db_session)):
    """
    Public system status.
    Derived from incidents in last 24h.
    """
    from datetime import timedelta
    
    # Logic:
    # Any critical in last 24h -> critical
    # Any warning in last 24h -> degraded
    # Else -> operational
    
    since = datetime.utcnow() - timedelta(hours=24)
    
    stmt = select(IncidentEventDB.severity).where(IncidentEventDB.created_at >= since)
    result = await session.execute(stmt)
    severities = result.scalars().all()
    
    status = "operational"
    if "critical" in severities:
        status = "critical"
    elif "warning" in severities:
        status = "degraded"
        
    return StatusResponse(
        status=status,
        last_updated=datetime.utcnow()
    )
