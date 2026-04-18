
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
    status: str
    resolved_at: Optional[datetime] = None
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
    
    # Fire webhook via Control Plane
    if incident.org_id:
        import httpx
        import asyncio
        async def trigger_webhook():
            try:
                # Assuming control plane is accessible at 'http://control-plane:8000' in cluster
                async with httpx.AsyncClient() as client:
                    await client.post(
                        "http://control-plane:8000/internal/webhooks/dispatch",
                        json={
                            "org_id": str(incident.org_id),
                            "event_type": "incident.declared",
                            "data": {
                                "incident_id": str(db_incident.id),
                                "incident_type": db_incident.incident_type,
                                "message": db_incident.message,
                                "severity": db_incident.severity
                            }
                        },
                        timeout=3.0
                    )
            except Exception as e:
                import logging
                logging.error(f"Failed to trigger webhook dispatch: {e}")
                
        asyncio.create_task(trigger_webhook())
    
    return db_incident

# --- Public API (Read) ---

@router.get("/v1/incidents", response_model=List[IncidentRead])
async def list_incidents(
    org_id: Optional[UUID4] = Header(None, alias="X-Org-Id"),
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
        # If no Org ID provided, default to SYSTEM-WIDE only to prevent data leakage.
        # Unauthorized users should see only global platform incidents.
        stmt = stmt.where(IncidentEventDB.org_id == None)

    if severity:
        stmt = stmt.where(IncidentEventDB.severity == severity)
        
    result = await session.execute(stmt)
    return result.scalars().all()

@router.post("/v1/incidents/{incident_id}/resolve", response_model=IncidentRead)
async def resolve_incident(
    incident_id: UUID4,
    org_id: Optional[UUID4] = Header(None, alias="X-Org-Id"),
    session: AsyncSession = Depends(get_db_session)
):
    """
    Resolve an open incident.
    """
    stmt = select(IncidentEventDB).where(IncidentEventDB.id == incident_id)
    if org_id:
        stmt = stmt.where(IncidentEventDB.org_id == org_id)
        
    result = await session.execute(stmt)
    incident = result.scalar_one_or_none()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found or unauthorized")
        
    if incident.status == "resolved":
        return incident
        
    incident.status = "resolved"
    incident.resolved_at = datetime.utcnow()
    
    await session.commit()
    await session.refresh(incident)
    
    return incident

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
