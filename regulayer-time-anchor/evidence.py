"""
Evidence Integration for Time Anchors

Integrates time anchors into evidence bundles.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any

from .models import TimeAnchor, AnchorVerificationResult, VerificationWithAnchor


def add_anchors_to_bundle(
    bundle: Dict[str, Any],
    anchors: List[TimeAnchor]
) -> Dict[str, Any]:
    """
    Add time anchors to an evidence bundle.
    
    CRITICAL: This NEVER affects:
    - record_hash
    - attestation.signature
    - chain_position
    
    Time anchors are separate, optional metadata.
    """
    bundle_copy = dict(bundle)
    
    # Add anchors as separate field
    bundle_copy["time_anchors"] = [
        {
            "anchor_type": anchor.anchor_type.value,
            "anchor_reference": anchor.anchor_reference,
            "anchor_timestamp": anchor.anchor_timestamp.isoformat(),
            "anchoring_hash": anchor.anchoring_hash,
            "verification_hint": anchor.verification_hint,
        }
        for anchor in anchors
    ]
    
    return bundle_copy


def extract_anchors_from_bundle(bundle: Dict[str, Any]) -> List[TimeAnchor]:
    """Extract time anchors from an evidence bundle."""
    from .models import AnchorType
    
    raw_anchors = bundle.get("time_anchors", [])
    anchors = []
    
    for raw in raw_anchors:
        try:
            anchors.append(TimeAnchor(
                anchor_type=AnchorType(raw["anchor_type"]),
                anchor_reference=raw["anchor_reference"],
                anchor_timestamp=datetime.fromisoformat(raw["anchor_timestamp"].replace("Z", "+00:00")),
                anchoring_hash=raw["anchoring_hash"],
                verification_hint=raw.get("verification_hint", ""),
            ))
        except Exception:
            # Skip malformed anchors
            continue
    
    return anchors


def verify_bundle_with_anchors(
    bundle: Dict[str, Any],
    hash_valid: bool,
    signature_valid: bool,
    chain_valid: bool,
    anchor_results: Optional[List[AnchorVerificationResult]] = None
) -> VerificationWithAnchor:
    """
    Create verification result including anchor status.
    
    CRITICAL SEMANTICS:
    - record_valid is ONLY based on hash, signature, chain
    - anchor_status is informational
    - Missing anchors do NOT invalidate records
    """
    anchor_results = anchor_results or []
    
    # Determine anchor status
    if not anchor_results:
        anchor_status = "not_present"
    elif all(r.valid for r in anchor_results):
        anchor_status = "valid"
    elif any(r.valid for r in anchor_results):
        anchor_status = "partial"
    else:
        anchor_status = "invalid"
    
    return VerificationWithAnchor(
        hash_valid=hash_valid,
        signature_valid=signature_valid,
        chain_valid=chain_valid,
        anchor_status=anchor_status,
        anchor_results=anchor_results,
    )


# ============================================================
# Evidence Bundle Schema Extension
# ============================================================

BUNDLE_WITH_ANCHORS_SCHEMA = {
    "type": "object",
    "properties": {
        # ... existing bundle properties ...
        "time_anchors": {
            "type": "array",
            "description": "Optional external time anchors",
            "items": {
                "type": "object",
                "properties": {
                    "anchor_type": {
                        "type": "string",
                        "enum": ["rfc3161", "transparency_log", "public_blockchain", "notary"]
                    },
                    "anchor_reference": {"type": "string"},
                    "anchor_timestamp": {"type": "string", "format": "date-time"},
                    "anchoring_hash": {"type": "string"},
                    "verification_hint": {"type": "string"}
                },
                "required": ["anchor_type", "anchor_reference", "anchor_timestamp", "anchoring_hash"]
            }
        }
    }
}


# ============================================================
# Verification Semantics Table
# ============================================================

VERIFICATION_SEMANTICS = """
| Check             | Result    | Record Status | Anchor Status |
|-------------------|-----------|---------------|---------------|
| Hash valid        | ✅        | Valid         | -             |
| Signature valid   | ✅        | Valid         | -             |
| Chain valid       | ✅        | Valid         | -             |
| Anchor missing    | ⚠️        | Still Valid   | Not Present   |
| Anchor invalid    | ❌ (anchor) | Still Valid   | Invalid       |

TIME ANCHORS NEVER INVALIDATE RECORDS.
They provide corroborating evidence only.
"""
