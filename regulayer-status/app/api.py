"""
Regulayer Status - API

Public status API for operational visibility.
"""

from datetime import datetime, timezone
from typing import List

from fastapi import FastAPI
from pydantic import BaseModel

from .models import OverallStatus, ComponentStatus, ErrorCode, ERROR_DESCRIPTIONS
from .aggregator import get_status_aggregator


app = FastAPI(
    title="Regulayer Status",
    description="Public system status and health",
    version="1.0.0"
)


# ============================================================
# Response Models
# ============================================================

class ComponentResponse(BaseModel):
    name: str
    status: str
    latency_ms: float | None = None
    message: str | None = None


class StatusResponse(BaseModel):
    status: str
    components: dict[str, str]
    last_updated: str
    active_incidents: int = 0


class OrgHealthResponse(BaseModel):
    org_id: str
    ingestion_success_rate: float
    queue_latency_ms: float
    recorder_acceptance_rate: float
    verification_failures: int


class ErrorCodeResponse(BaseModel):
    code: str
    description: str


# ============================================================
# Endpoints
# ============================================================

@app.get("/v1/status", response_model=StatusResponse, tags=["status"])
async def get_status():
    """
    Get current system status.
    
    This is the primary endpoint for status.regulayer.io
    """
    aggregator = get_status_aggregator()
    health = await aggregator.get_system_health()
    
    components = {
        name: comp.status.value
        for name, comp in health.components.items()
    }
    
    return StatusResponse(
        status=health.status.value,
        components=components,
        last_updated=health.last_updated.isoformat(),
        active_incidents=health.active_incidents
    )


@app.get("/v1/status/components", response_model=List[ComponentResponse], tags=["status"])
async def get_components():
    """Get detailed status for each component."""
    aggregator = get_status_aggregator()
    health = await aggregator.get_system_health()
    
    return [
        ComponentResponse(
            name=comp.name,
            status=comp.status.value,
            latency_ms=comp.latency_ms,
            message=comp.message
        )
        for comp in health.components.values()
    ]


@app.get("/v1/orgs/{org_id}/health", response_model=OrgHealthResponse, tags=["org"])
async def get_org_health(org_id: str):
    """
    Get operational health for an organization.
    
    Shows operational metrics only — NOT cryptographic internals.
    """
    aggregator = get_status_aggregator()
    health = await aggregator.get_org_health(org_id)
    
    return OrgHealthResponse(
        org_id=health.org_id,
        ingestion_success_rate=health.ingestion_success_rate,
        queue_latency_ms=health.queue_latency_ms,
        recorder_acceptance_rate=health.recorder_acceptance_rate,
        verification_failures=health.verification_failures
    )


@app.get("/v1/error-codes", response_model=List[ErrorCodeResponse], tags=["reference"])
async def get_error_codes():
    """
    Get public error code taxonomy.
    
    These codes are stable for SLA and integration purposes.
    """
    return [
        ErrorCodeResponse(code=code.value, description=desc)
        for code, desc in ERROR_DESCRIPTIONS.items()
    ]


@app.get("/health", tags=["system"])
async def health_check():
    """Health check for the status service itself."""
    return {"status": "healthy", "service": "status"}
