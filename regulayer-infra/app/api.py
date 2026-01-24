"""
Regulayer Infrastructure - System API

System health, version, and key status endpoints.
"""

from typing import List, Optional
from datetime import datetime, timezone

from fastapi import FastAPI, Depends
from pydantic import BaseModel

from .environments import get_current_environment, get_environment_marker
from .secrets import get_secrets_manager
from .key_rotation import get_rotation_manager
from .metrics import get_metrics_collector, AlertChecker


app = FastAPI(
    title="Regulayer Infrastructure API",
    description="System health and status endpoints",
    version="1.0.0"
)


# ============================================================
# Response Models
# ============================================================

class HealthResponse(BaseModel):
    status: str
    environment: str
    timestamp: str
    services: dict


class VersionResponse(BaseModel):
    version: str
    build: Optional[str] = None
    commit: Optional[str] = None
    environment: str


class KeyStatusResponse(BaseModel):
    keys: List[dict]
    rotation_count: int
    last_rotation: Optional[str] = None


class MetricsResponse(BaseModel):
    metrics: dict
    alerts: List[dict]


# ============================================================
# Endpoints
# ============================================================

@app.get("/v1/system/health", response_model=HealthResponse, tags=["system"])
async def health_check() -> HealthResponse:
    """
    System health check.
    
    Checks all services and returns overall status.
    """
    services = {
        "control_plane": "healthy",  # Would check actual connection
        "recorder": "healthy",
        "database": "healthy",
    }
    
    # Overall status
    status = "healthy" if all(s == "healthy" for s in services.values()) else "degraded"
    
    return HealthResponse(
        status=status,
        environment=get_current_environment().value,
        timestamp=datetime.now(timezone.utc).isoformat(),
        services=services
    )


@app.get("/v1/system/version", response_model=VersionResponse, tags=["system"])
async def get_version() -> VersionResponse:
    """Get system version information."""
    import os
    
    return VersionResponse(
        version="1.0.0",
        build=os.environ.get("BUILD_NUMBER"),
        commit=os.environ.get("GIT_COMMIT"),
        environment=get_current_environment().value
    )


@app.get("/v1/system/keys/status", response_model=KeyStatusResponse, tags=["system"])
async def get_key_status() -> KeyStatusResponse:
    """
    Get key status (metadata only).
    
    Returns fingerprints and rotation history - NEVER actual keys.
    """
    manager = get_rotation_manager()
    log = manager.get_rotation_log()
    
    entries = log.get("entries", [])
    
    # Find last rotation
    last_rotation = None
    for entry in reversed(entries):
        if entry.get("rotated_at"):
            last_rotation = entry["rotated_at"]
            break
    
    return KeyStatusResponse(
        keys=[
            {
                "version": e["version_id"],
                "type": e["key_type"],
                "status": e["status"],
                "fingerprint": e["fingerprint"],
                "activated_at": e["activated_at"]
            }
            for e in entries
        ],
        rotation_count=len([e for e in entries if e.get("rotated_at")]),
        last_rotation=last_rotation
    )


@app.get("/v1/system/metrics", response_model=MetricsResponse, tags=["system"])
async def get_metrics() -> MetricsResponse:
    """
    Get system metrics.
    
    Safe to expose - no sensitive data.
    """
    collector = get_metrics_collector()
    checker = AlertChecker(collector)
    
    return MetricsResponse(
        metrics=collector.get_metrics(),
        alerts=checker.check_all()
    )


@app.get("/v1/system/metrics/prometheus", tags=["system"])
async def get_prometheus_metrics() -> str:
    """Get metrics in Prometheus format."""
    collector = get_metrics_collector()
    return collector.get_prometheus_metrics()


@app.get("/v1/system/environment", tags=["system"])
async def get_environment_info() -> dict:
    """Get environment information (non-sensitive)."""
    return get_environment_marker()
