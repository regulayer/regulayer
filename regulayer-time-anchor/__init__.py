"""
Time Anchor Module

Optional, external, non-authoritative time anchoring.

CORE PRINCIPLE:
Time anchoring is evidence, not authority.
Verification remains purely mathematical.
"""

from .models import (
    TimeAnchor,
    AnchorType,
    AnchorRequest,
    AnchorResult,
    AnchorVerificationResult,
    VerificationWithAnchor,
)
from .anchors import AnchorRegistry, BaseAnchorAdapter, default_registry
from .evidence import (
    add_anchors_to_bundle,
    extract_anchors_from_bundle,
    verify_bundle_with_anchors,
)

__all__ = [
    # Models
    "TimeAnchor",
    "AnchorType",
    "AnchorRequest",
    "AnchorResult",
    "AnchorVerificationResult",
    "VerificationWithAnchor",
    # Registry
    "AnchorRegistry",
    "BaseAnchorAdapter",
    "default_registry",
    # Evidence
    "add_anchors_to_bundle",
    "extract_anchors_from_bundle",
    "verify_bundle_with_anchors",
]
