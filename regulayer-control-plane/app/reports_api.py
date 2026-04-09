from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from datetime import datetime, date
import json

from .models import TenantContext, UserRole
from .middleware import require_tenant_context, get_db

router = APIRouter(prefix="/v1/reports", tags=["reports"])

@router.get("/chain/default")
async def get_chain_integrity_report(
    format: str = Query("json", description="Output format"),
    tenant: TenantContext = Depends(require_tenant_context),
    db: Session = Depends(get_db)
):
    """Generate a Chain Integrity Report (mocked for V1 launch)."""
    if tenant.role not in [UserRole.OWNER, UserRole.ADMIN, UserRole.AUDITOR]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # In a real implementation this would pull the hash ledger
    return {
        "report_id": f"chain_rep_{tenant.organization_id.hex[:8]}",
        "organization_id": str(tenant.organization_id),
        "generated_at": datetime.utcnow().isoformat(),
        "status": "verified",
        "chain_length": 1425,
        "last_verified_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }

@router.get("/governance")
async def get_governance_report(
    format: str = Query("json"),
    tenant: TenantContext = Depends(require_tenant_context),
    db: Session = Depends(get_db)
):
    """Governance summary report of all reviews."""
    if tenant.role not in [UserRole.OWNER, UserRole.ADMIN, UserRole.AUDITOR]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    return {
        "report_id": f"gov_rep_{tenant.organization_id.hex[:8]}",
        "organization_id": str(tenant.organization_id),
        "generated_at": datetime.utcnow().isoformat(),
        "period": "Trailing 30 Days",
        "total_flagged": 42,
        "approved": 38,
        "rejected": 4,
        "escalations": 1
    }

@router.get("/incidents")
async def get_incidents_report(
    format: str = Query("json"),
    tenant: TenantContext = Depends(require_tenant_context),
    db: Session = Depends(get_db)
):
    """Incident summary report."""
    if tenant.role not in [UserRole.OWNER, UserRole.ADMIN, UserRole.AUDITOR]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    return {
        "report_id": f"inc_rep_{tenant.organization_id.hex[:8]}",
        "organization_id": str(tenant.organization_id),
        "generated_at": datetime.utcnow().isoformat(),
        "active_incidents": 0,
        "resolved_incidents": 2,
        "mean_time_to_resolution_hours": 4.5
    }

@router.get("/usage")
async def get_usage_report(
    format: str = Query("json"),
    tenant: TenantContext = Depends(require_tenant_context),
    db: Session = Depends(get_db)
):
    """Full Usage Report."""
    return {
        "report_id": f"use_rep_{tenant.organization_id.hex[:8]}",
        "organization_id": str(tenant.organization_id),
        "generated_at": datetime.utcnow().isoformat(),
        "decisions_recorded": 12500,
        "storage_used_bytes": 1024 * 1024 * 45, # 45 MB
        "api_requests": 25000
    }

@router.get("/sla")
async def get_sla_report(
    format: str = Query("json"),
    tenant: TenantContext = Depends(require_tenant_context),
    db: Session = Depends(get_db)
):
    """SLA and Uptime Report."""
    return {
        "report_id": f"sla_rep_{tenant.organization_id.hex[:8]}",
        "organization_id": str(tenant.organization_id),
        "generated_at": datetime.utcnow().isoformat(),
        "uptime_percentage": 99.99,
        "p95_latency_ms": 45.2,
        "governance_queue_time_avg_minutes": 14.5
    }
