"""
Time Anchor Models

Optional, external, non-authoritative time anchoring.

CORE PRINCIPLE:
Time anchoring is evidence, not authority.
Verification remains purely mathematical.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class AnchorType(str, Enum):
    """Supported time anchoring methods."""
    RFC3161 = "rfc3161"              # RFC 3161 Timestamp Authority
    TRANSPARENCY_LOG = "transparency_log"  # Public append-only log
    PUBLIC_BLOCKCHAIN = "public_blockchain"  # Bitcoin/Ethereum timestamp
    NOTARY = "notary"                # Court/legal notary


class TimeAnchor(BaseModel):
    """
    External time anchor for a record.
    
    GUARANTEES:
    - Anchors reference record_hash (not content)
    - Anchors are append-only
    - Anchors NEVER affect chain validity
    - Missing anchors don't invalidate records
    
    TRUST MODEL:
    - Anchors prove existence BY a date
    - Anchors do NOT prove correctness
    - Anchors are external to Regulayer
    """
    
    anchor_type: AnchorType = Field(
        description="Type of time anchoring service"
    )
    
    anchor_reference: str = Field(
        description="Reference to anchor (TSA response, tx hash, etc.)"
    )
    
    anchor_timestamp: datetime = Field(
        description="Timestamp from the anchoring service"
    )
    
    anchoring_hash: str = Field(
        description="SHA-256 of record_hash that was anchored"
    )
    
    verification_hint: str = Field(
        default="",
        description="How to verify this anchor independently"
    )
    
    raw_response: Optional[str] = Field(
        default=None,
        description="Base64-encoded raw response from anchor service"
    )


class AnchorRequest(BaseModel):
    """Request to create a time anchor."""
    
    record_hash: str = Field(
        description="The record hash to anchor"
    )
    
    anchor_types: List[AnchorType] = Field(
        default=[AnchorType.RFC3161],
        description="Which anchor types to request"
    )
    
    metadata: Optional[dict] = Field(
        default=None,
        description="Optional metadata for the request"
    )


class AnchorResult(BaseModel):
    """Result of an anchoring operation."""
    
    success: bool
    anchor: Optional[TimeAnchor] = None
    error: Optional[str] = None
    anchor_type: AnchorType
    requested_at: datetime
    completed_at: Optional[datetime] = None


class AnchorVerificationResult(BaseModel):
    """Result of verifying a time anchor."""
    
    valid: bool = Field(
        description="Whether the anchor itself is valid"
    )
    
    message: str = Field(
        description="Human-readable verification result"
    )
    
    anchor_type: AnchorType
    
    claimed_timestamp: datetime
    
    hash_matches: bool = Field(
        description="Whether anchored hash matches record hash"
    )
    
    notes: List[str] = Field(
        default_factory=list,
        description="Additional verification notes"
    )


# ============================================================
# Verification Semantics
# ============================================================

class VerificationWithAnchor(BaseModel):
    """
    Extended verification result including anchor status.
    
    CRITICAL SEMANTICS:
    - Anchor failures NEVER invalidate records
    - Missing anchors are informational only
    - Record validity is independent of anchor validity
    """
    
    # Core verification (always required)
    hash_valid: bool
    signature_valid: bool
    chain_valid: bool
    
    # Anchor verification (optional, informational)
    anchor_status: str = Field(
        default="not_present",
        description="One of: valid, invalid, not_present, verification_failed"
    )
    
    anchor_results: List[AnchorVerificationResult] = Field(
        default_factory=list
    )
    
    @property
    def record_valid(self) -> bool:
        """
        Record validity is NEVER affected by anchor status.
        This is the core invariant.
        """
        return self.hash_valid and self.signature_valid and self.chain_valid
    
    @property
    def has_time_evidence(self) -> bool:
        """Whether any valid time anchors exist."""
        return any(r.valid for r in self.anchor_results)


# ============================================================
# Legal Framing
# ============================================================

LEGAL_DISCLAIMER = """
TIME ANCHOR LEGAL NOTICE

Time anchors provide corroborating evidence of existence by a date.
They do NOT:
- Guarantee the accuracy of the timestamp
- Prevent backdating through other means
- Replace legal expert opinion on timing
- Constitute legal proof in all jurisdictions

Time anchors SUPPORT temporal claims. They do not PROVE them.
"""
