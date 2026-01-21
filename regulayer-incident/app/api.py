"""
Regulayer Incident - API Endpoints

READ-ONLY + APPEND-ONLY endpoints for incident management.

POST endpoints restricted to internal security role only.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from uuid import UUID
from typing import List, Optional

from .models import (
    IncidentRecord,
    IncidentMitigation,
    IncidentSeverity,
    IncidentStatus,
    TrustImpactScope,
    TrustEvaluation,
    DisclosureDocument
)
from .registry import incident_registry
from .impact import trust_resolver
from .disclosure import disclosure_generator
from pydantic import BaseModel

router = APIRouter(prefix="/v1/incidents", tags=["incidents"])


# Request models
class DeclareIncidentRequest(BaseModel):
    severity: IncidentSeverity
    affected_scope: List[TrustImpactScope]
    title: str
    description: str
    affected_identities: Optional[List[str]] = None
    affected_time_start: Optional[datetime] = None
    affected_time_end: Optional[datetime] = None


class MitigateIncidentRequest(BaseModel):
    new_status: IncidentStatus
    description: str
    residual_impact: Optional[str] = None


@router.post(
    "/declare",
    response_model=IncidentRecord,
    summary="Declare a new incident"
)
async def declare_incident(
    request: DeclareIncidentRequest
) -> IncidentRecord:
    """
    Declare a new incident.
    
    ⚠️ RESTRICTED: Internal security role only.
    
    This action is APPEND-ONLY. Once declared, incidents cannot be modified.
    """
    time_range = None
    if request.affected_time_start and request.affected_time_end:
        time_range = (request.affected_time_start, request.affected_time_end)
    
    incident = incident_registry.declare_incident(
        severity=request.severity,
        affected_scope=request.affected_scope,
        title=request.title,
        description=request.description,
        affected_identities=request.affected_identities,
        affected_time_range=time_range
    )
    
    return incident


@router.post(
    "/{incident_id}/mitigate",
    response_model=IncidentMitigation,
    summary="Record incident mitigation"
)
async def mitigate_incident(
    incident_id: UUID,
    request: MitigateIncidentRequest
) -> IncidentMitigation:
    """
    Record a mitigation for an incident.
    
    Mitigations are NEW records, not edits to the original incident.
    """
    incident = incident_registry.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    mitigation = incident_registry.record_mitigation(
        incident_id=incident_id,
        new_status=request.new_status,
        description=request.description,
        residual_impact=request.residual_impact
    )
    
    return mitigation


@router.get(
    "",
    response_model=List[IncidentRecord],
    summary="List all incidents"
)
async def list_incidents(
    active_only: bool = False
) -> List[IncidentRecord]:
    """List all declared incidents."""
    if active_only:
        return incident_registry.get_active_incidents()
    return incident_registry.get_all_incidents()


@router.get(
    "/{incident_id}",
    response_model=IncidentRecord,
    summary="Get incident details"
)
async def get_incident(incident_id: UUID) -> IncidentRecord:
    """Get details of a specific incident."""
    incident = incident_registry.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.get(
    "/{incident_id}/disclosure",
    response_model=DisclosureDocument,
    summary="Generate disclosure document"
)
async def get_disclosure(incident_id: UUID) -> DisclosureDocument:
    """
    Generate a disclosure document for an incident.
    
    This is a regulator-facing document with no opinions or marketing.
    """
    try:
        disclosure = disclosure_generator.generate_disclosure(incident_id)
        return disclosure
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# Trust status router
trust_router = APIRouter(prefix="/v1/trust-status", tags=["trust-status"])


@trust_router.get(
    "/{decision_id}",
    response_model=TrustEvaluation,
    summary="Resolve trust status for a decision"
)
async def get_trust_status(
    decision_id: UUID,
    decision_time: Optional[datetime] = None
) -> TrustEvaluation:
    """
    Resolve the trust status for a specific decision.
    
    Checks if the decision is affected by any declared incidents.
    """
    evaluation = trust_resolver.resolve_trust_status(
        decision_id=decision_id,
        decision_time=decision_time or datetime.now(timezone.utc)
    )
    return evaluation
