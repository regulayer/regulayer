"""
Regulayer Reports - API Endpoints

CRITICAL CONSTRAINTS:
1. READ-ONLY: No modifications to any data
2. Reports are pre-assembled from already-verified data
3. No verification logic in endpoints
"""

from fastapi import APIRouter, Response
from datetime import datetime, timezone
from uuid import UUID
from typing import Literal

from .generator import report_generator
from .renderers.json import json_renderer
from .models import (
    SystemTrustReport,
    DecisionTrustReport,
    ChainIntegrityReport
)

router = APIRouter(prefix="/v1/reports", tags=["reports"])


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
    
    This report provides cryptographic evidence for one AI decision.
    Governance context is clearly marked as non-authoritative.
    """
    # In production, fetch data from recorder and governance APIs
    # For demo, use mock data
    report = report_generator.generate_decision_report(
        decision_id=decision_id,
        record_id=1,
        system_name="demo-system",
        recorded_at=datetime.now(timezone.utc),
        record_hash="sha256:abc123...",
        previous_record_hash=None,
        canonical_payload_hash="sha256:def456...",
        chain_id="default",
        hash_valid=True,
        chain_valid=True,
        attestation={
            "identity_id": "guard-001",
            "algorithm": "Ed25519",
            "signed_at": datetime.now(timezone.utc),
            "revocation_status": "active"
        },
        signature_valid=True,
        governance={
            "review_state": "reviewed",
            "tags": ["high-risk", "gdpr"],
            "approvals": ["compliance"],
            "last_updated": datetime.now(timezone.utc)
        }
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
    
    Shows whether the historical record is intact.
    """
    # In production, fetch and verify chain from recorder
    # For demo, use mock data
    report = report_generator.generate_chain_report(
        chain_id=chain_id,
        record_count=100,
        first_timestamp=datetime(2026, 1, 1, tzinfo=timezone.utc),
        last_timestamp=datetime.now(timezone.utc),
        is_intact=True,
        hash_excerpt=[
            {"index": 1, "hash": "sha256:abc123...", "timestamp": "2026-01-01T00:00:00Z"},
            {"index": 2, "hash": "sha256:def456...", "timestamp": "2026-01-01T00:01:00Z"},
        ]
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
