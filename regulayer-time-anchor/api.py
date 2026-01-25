"""
Time Anchor API

Public API for time anchoring operations.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .models import TimeAnchor, AnchorType, AnchorRequest, AnchorResult
from .anchors import default_registry


router = APIRouter(prefix="/time-anchors", tags=["Time Anchors"])


# ============================================================
# Request/Response Models
# ============================================================

class AnchorRequestAPI(BaseModel):
    """API request to create time anchor."""
    record_hash: str = Field(description="Record hash to anchor")
    anchor_types: List[str] = Field(
        default=["rfc3161"],
        description="Anchor types to request"
    )


class AnchorResponseAPI(BaseModel):
    """API response for anchor creation."""
    success: bool
    anchors: List[dict]
    errors: List[dict]


class VerifyAnchorRequest(BaseModel):
    """Request to verify time anchors."""
    bundle: dict = Field(description="Evidence bundle with time_anchors")


class VerifyAnchorResponse(BaseModel):
    """Response for anchor verification."""
    anchor_status: str
    results: List[dict]
    note: str = "Time anchor verification is informational. Record validity is independent."


# ============================================================
# Endpoints
# ============================================================

@router.post("/create", response_model=AnchorResponseAPI)
async def create_anchors(request: AnchorRequestAPI):
    """
    Create time anchors for a record hash.
    
    Time anchors are OPTIONAL and provide corroborating
    evidence of existence at a point in time.
    
    IMPORTANT:
    - Anchors do NOT affect record validity
    - Anchors are external to the evidence chain
    - Multiple anchor types can be requested
    """
    anchors = []
    errors = []
    
    for anchor_type_str in request.anchor_types:
        try:
            anchor_type = AnchorType(anchor_type_str)
            result = await default_registry.create_anchor(
                request.record_hash,
                anchor_type
            )
            
            if result.success and result.anchor:
                anchors.append({
                    "anchor_type": result.anchor.anchor_type.value,
                    "anchor_reference": result.anchor.anchor_reference,
                    "anchor_timestamp": result.anchor.anchor_timestamp.isoformat(),
                    "anchoring_hash": result.anchor.anchoring_hash,
                    "verification_hint": result.anchor.verification_hint,
                })
            else:
                errors.append({
                    "anchor_type": anchor_type_str,
                    "error": result.error
                })
        except ValueError:
            errors.append({
                "anchor_type": anchor_type_str,
                "error": f"Unknown anchor type: {anchor_type_str}"
            })
    
    return AnchorResponseAPI(
        success=len(anchors) > 0,
        anchors=anchors,
        errors=errors
    )


@router.post("/verify", response_model=VerifyAnchorResponse)
async def verify_anchors(request: VerifyAnchorRequest):
    """
    Verify time anchors in an evidence bundle.
    
    CRITICAL SEMANTICS:
    - Anchor verification is INFORMATIONAL ONLY
    - Record validity is NEVER affected by anchor status
    - Invalid anchors mean "cannot use for time evidence"
    - Missing anchors are normal and expected
    """
    from .evidence import extract_anchors_from_bundle
    
    anchors = extract_anchors_from_bundle(request.bundle)
    record_hash = request.bundle.get("decision", {}).get("record_hash", "")
    
    if not anchors:
        return VerifyAnchorResponse(
            anchor_status="not_present",
            results=[],
            note="No time anchors present. Record validity is unaffected."
        )
    
    results = []
    for anchor in anchors:
        result = await default_registry.verify_anchor(anchor, record_hash)
        results.append({
            "anchor_type": result.anchor_type.value,
            "valid": result.valid,
            "message": result.message,
            "claimed_timestamp": result.claimed_timestamp.isoformat(),
            "hash_matches": result.hash_matches,
            "notes": result.notes,
        })
    
    # Determine overall status
    if all(r["valid"] for r in results):
        status = "valid"
    elif any(r["valid"] for r in results):
        status = "partial"
    else:
        status = "invalid"
    
    return VerifyAnchorResponse(
        anchor_status=status,
        results=results,
        note="Time anchors provide corroborating evidence only. Record validity is independent."
    )


@router.get("/types")
async def list_anchor_types():
    """
    List available anchor types.
    """
    return {
        "anchor_types": [
            {
                "type": "rfc3161",
                "name": "RFC 3161 Time-Stamp Authority",
                "trust_model": "External time authority",
                "latency": "Low (seconds)",
            },
            {
                "type": "transparency_log",
                "name": "Transparency Log",
                "trust_model": "Public append-only log",
                "latency": "Low (seconds)",
            },
            {
                "type": "public_blockchain",
                "name": "Public Blockchain",
                "trust_model": "Blockchain immutability",
                "latency": "High (minutes to hours)",
            },
            {
                "type": "notary",
                "name": "Court/Legal Notary",
                "trust_model": "Jurisdictional authority",
                "latency": "Variable",
            },
        ],
        "note": "All anchor types are optional. None affect record validity."
    }
