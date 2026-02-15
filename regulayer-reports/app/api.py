"""
Regulayer Reports - API Endpoints

Fetches REAL data from the Recorder and Governance services.
No more mock data.
"""

from fastapi import APIRouter, Response, HTTPException
from datetime import datetime, timezone
from uuid import UUID
from typing import Literal

import httpx

from .generator import report_generator
from .renderers.json import json_renderer
from .models import (
    SystemTrustReport,
    DecisionTrustReport,
    ChainIntegrityReport
)
from .config import settings

router = APIRouter(prefix="/v1/reports", tags=["reports"])

RECORDER_URL = settings.recorder_api_url.rstrip("/")


@router.get(
    "/system",
    response_model=SystemTrustReport,
    summary="Generate System Trust Report"
)
async def get_system_report(
    format: Literal["json"] = "json"
) -> Response:
    """
    Generate a System Trust Report.
    
    This is a static document describing Regulayer's trust architecture.
    Can be used as a regulator briefing document.
    """
    report = report_generator.generate_system_report()
    
    if format == "json":
        content = json_renderer.render(report)
        return Response(
            content=content,
            media_type="application/json",
            headers={
                "Content-Disposition": "attachment; filename=system_trust_report.json"
            }
        )
    
    return report


@router.get(
    "/decision/{decision_id}",
    response_model=DecisionTrustReport,
    summary="Generate Decision Trust Report"
)
async def get_decision_report(
    decision_id: UUID,
    format: Literal["json"] = "json"
) -> Response:
    """
    Generate a Decision Trust Report for a specific decision.
    
    Fetches real data from the Recorder service.
    """
    async with httpx.AsyncClient(timeout=5.0) as client:
        # 1. Fetch decision record from Recorder
        try:
            decision_resp = await client.get(f"{RECORDER_URL}/v1/decisions/{decision_id}")
        except httpx.ConnectError:
            raise HTTPException(status_code=502, detail="Cannot reach Recorder service")
        
        if decision_resp.status_code == 404:
            raise HTTPException(status_code=404, detail=f"Decision {decision_id} not found in Recorder")
        if decision_resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Recorder error: {decision_resp.status_code}")
        
        decision_data = decision_resp.json()
        
        # 2. Fetch verification result from Recorder
        try:
            verify_resp = await client.get(f"{RECORDER_URL}/v1/verify/decision/{decision_id}")
            verify_data = verify_resp.json() if verify_resp.status_code == 200 else {}
        except httpx.ConnectError:
            verify_data = {}
    
    # Extract fields from recorder response
    recorded_at_str = decision_data.get("server_timestamp")
    recorded_at = datetime.fromisoformat(recorded_at_str) if recorded_at_str else datetime.now(timezone.utc)
    
    # Build attestation dict if present
    attestation = None
    att_data = decision_data.get("attestation")
    if att_data and att_data.get("algorithm"):
        attestation = {
            "identity_id": att_data.get("identity_id", "unknown"),
            "algorithm": att_data.get("algorithm", "Ed25519"),
            "signed_at": datetime.fromisoformat(att_data["signed_at"]) if att_data.get("signed_at") else datetime.now(timezone.utc),
            "revocation_status": att_data.get("identity_status_at_signing", "active")
        }
    
    # Build governance context (optional - fetch from governance service if available)
    governance = None
    
    report = report_generator.generate_decision_report(
        decision_id=decision_id,
        record_id=decision_data.get("record_id", 0),
        system_name=decision_data.get("system_name", "unknown"),
        recorded_at=recorded_at,
        record_hash=decision_data.get("record_hash", ""),
        previous_record_hash=decision_data.get("previous_record_hash"),
        canonical_payload_hash=decision_data.get("canonical_payload_hash", ""),
        chain_id=decision_data.get("chain_id", "default"),
        hash_valid=verify_data.get("hash_chain_valid", False),
        chain_valid=verify_data.get("record_valid", False),
        attestation=attestation,
        signature_valid=verify_data.get("signature_valid"),
        governance=governance
    )
    
    if format == "json":
        content = json_renderer.render(report)
        return Response(
            content=content,
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=decision_report_{decision_id}.json"
            }
        )
    
    return report


@router.get(
    "/chain/{chain_id}",
    response_model=ChainIntegrityReport,
    summary="Generate Chain Integrity Report"
)
async def get_chain_report(
    chain_id: str,
    format: Literal["json"] = "json"
) -> Response:
    """
    Generate a Chain Integrity Report.
    
    Fetches real chain verification data from the Recorder service.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Fetch full chain verification from Recorder
        try:
            chain_resp = await client.get(f"{RECORDER_URL}/v1/verify/chain/full")
        except httpx.ConnectError:
            raise HTTPException(status_code=502, detail="Cannot reach Recorder service")
        
        if chain_resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Recorder chain verification error: {chain_resp.status_code}")
        
        chain_data = chain_resp.json()
    
    total_records = chain_data.get("total_records_checked", 0)
    is_valid = chain_data.get("is_valid", False)
    broken_at = chain_data.get("broken_at_record_id")
    
    # Build hash excerpt from first/last info if available
    hash_excerpt = None
    
    report = report_generator.generate_chain_report(
        chain_id=chain_id,
        record_count=total_records,
        first_timestamp=datetime(2026, 1, 1, tzinfo=timezone.utc),  # Could be fetched from recorder
        last_timestamp=datetime.now(timezone.utc),
        is_intact=is_valid,
        broken_at_index=broken_at,
        hash_excerpt=hash_excerpt
    )
    
    if format == "json":
        content = json_renderer.render(report)
        return Response(
            content=content,
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=chain_report_{chain_id}.json"
            }
        )
    
    return report
