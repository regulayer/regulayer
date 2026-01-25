"""
Time Anchor Registry and Operations

Manages time anchoring across multiple providers.
"""

import hashlib
from datetime import datetime
from typing import List, Optional, Dict, Any

from .models import (
    TimeAnchor,
    AnchorType,
    AnchorRequest,
    AnchorResult,
    AnchorVerificationResult,
)


class AnchorRegistry:
    """
    Registry of available anchor providers.
    
    Anchors are OPTIONAL. No anchors = record still valid.
    """
    
    def __init__(self):
        self.adapters: Dict[AnchorType, "BaseAnchorAdapter"] = {}
    
    def register(self, anchor_type: AnchorType, adapter: "BaseAnchorAdapter"):
        """Register an anchor adapter."""
        self.adapters[anchor_type] = adapter
    
    async def create_anchor(
        self,
        record_hash: str,
        anchor_type: AnchorType
    ) -> AnchorResult:
        """
        Create a time anchor for a record hash.
        
        The anchor proves the record_hash existed at or before
        the anchor timestamp. It does NOT prove record correctness.
        """
        if anchor_type not in self.adapters:
            return AnchorResult(
                success=False,
                error=f"No adapter for {anchor_type}",
                anchor_type=anchor_type,
                requested_at=datetime.utcnow()
            )
        
        adapter = self.adapters[anchor_type]
        
        try:
            anchor = await adapter.anchor(record_hash)
            return AnchorResult(
                success=True,
                anchor=anchor,
                anchor_type=anchor_type,
                requested_at=datetime.utcnow(),
                completed_at=datetime.utcnow()
            )
        except Exception as e:
            return AnchorResult(
                success=False,
                error=str(e),
                anchor_type=anchor_type,
                requested_at=datetime.utcnow()
            )
    
    async def verify_anchor(
        self,
        anchor: TimeAnchor,
        expected_record_hash: str
    ) -> AnchorVerificationResult:
        """
        Verify a time anchor.
        
        CRITICAL: Anchor verification failure does NOT invalidate
        the underlying record. It only means the anchor is not usable
        as corroborating time evidence.
        """
        # Check hash matches
        expected_anchoring_hash = compute_anchoring_hash(expected_record_hash)
        hash_matches = anchor.anchoring_hash == expected_anchoring_hash
        
        if not hash_matches:
            return AnchorVerificationResult(
                valid=False,
                message="Anchored hash does not match record hash",
                anchor_type=anchor.anchor_type,
                claimed_timestamp=anchor.anchor_timestamp,
                hash_matches=False,
                notes=["Record is still valid; anchor cannot be used as time evidence"]
            )
        
        # Verify with adapter if available
        if anchor.anchor_type in self.adapters:
            adapter = self.adapters[anchor.anchor_type]
            try:
                adapter_valid = await adapter.verify(anchor)
                if adapter_valid:
                    return AnchorVerificationResult(
                        valid=True,
                        message="Anchor verified successfully",
                        anchor_type=anchor.anchor_type,
                        claimed_timestamp=anchor.anchor_timestamp,
                        hash_matches=True,
                        notes=["Time evidence is corroborated by external source"]
                    )
                else:
                    return AnchorVerificationResult(
                        valid=False,
                        message="Anchor verification failed",
                        anchor_type=anchor.anchor_type,
                        claimed_timestamp=anchor.anchor_timestamp,
                        hash_matches=True,
                        notes=["Anchor service could not verify; record still valid"]
                    )
            except Exception as e:
                return AnchorVerificationResult(
                    valid=False,
                    message=f"Anchor verification error: {e}",
                    anchor_type=anchor.anchor_type,
                    claimed_timestamp=anchor.anchor_timestamp,
                    hash_matches=True,
                    notes=["Record remains valid despite anchor verification failure"]
                )
        
        # No adapter - trust based on hash match only
        return AnchorVerificationResult(
            valid=True,
            message="Anchor hash verified (no adapter for deep verification)",
            anchor_type=anchor.anchor_type,
            claimed_timestamp=anchor.anchor_timestamp,
            hash_matches=True,
            notes=["Shallow verification only; adapter not available"]
        )


def compute_anchoring_hash(record_hash: str) -> str:
    """
    Compute the hash that gets anchored.
    
    This is SHA-256(record_hash) to create a uniform format
    regardless of record_hash format.
    """
    data = record_hash.encode("utf-8")
    return f"sha256:{hashlib.sha256(data).hexdigest()}"


class BaseAnchorAdapter:
    """Base class for anchor adapters."""
    
    async def anchor(self, record_hash: str) -> TimeAnchor:
        """Create an anchor for the given record hash."""
        raise NotImplementedError
    
    async def verify(self, anchor: TimeAnchor) -> bool:
        """Verify an anchor is valid."""
        raise NotImplementedError


# Default registry
default_registry = AnchorRegistry()
