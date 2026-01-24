"""
Regulayer Residency Routing

Routes ingestion requests to region-specific recorders.

TRUST GUARANTEE: Routing affects WHERE data goes,
never affects proof semantics or verification.
"""

from typing import Optional
from dataclasses import dataclass

from .models import ResidencyRegion, ResidencyPolicy, REGION_METADATA


# ============================================================
# Routing Errors
# ============================================================

class ResidencyViolationError(Exception):
    """Raised when a request violates residency policy."""
    
    def __init__(self, requested_region: str, allowed_regions: list):
        self.requested_region = requested_region
        self.allowed_regions = allowed_regions
        self.message = (
            f"Region '{requested_region}' not in allowed regions: {allowed_regions}. "
            f"Request blocked by residency policy."
        )
        super().__init__(self.message)


class RegionLockedError(Exception):
    """Raised when attempting to change locked region."""
    
    def __init__(self, locked_region: str):
        self.locked_region = locked_region
        self.message = f"Primary region '{locked_region}' is locked and cannot be changed."
        super().__init__(self.message)


# ============================================================
# Recorder Registry
# ============================================================

@dataclass
class RecorderEndpoint:
    """Recorder endpoint for a region."""
    region: ResidencyRegion
    endpoint: str
    healthy: bool = True


# Mock recorder registry - in production, this would be dynamic
RECORDER_REGISTRY = {
    ResidencyRegion.EU: RecorderEndpoint(
        region=ResidencyRegion.EU,
        endpoint="https://recorder.eu.regulayer.io",
    ),
    ResidencyRegion.INDIA: RecorderEndpoint(
        region=ResidencyRegion.INDIA,
        endpoint="https://recorder.in.regulayer.io",
    ),
    ResidencyRegion.US: RecorderEndpoint(
        region=ResidencyRegion.US,
        endpoint="https://recorder.us.regulayer.io",
    ),
    ResidencyRegion.US_GOV: RecorderEndpoint(
        region=ResidencyRegion.US_GOV,
        endpoint="https://recorder.gov.regulayer.io",
    ),
    ResidencyRegion.GLOBAL: RecorderEndpoint(
        region=ResidencyRegion.GLOBAL,
        endpoint="https://recorder.regulayer.io",
    ),
}


def recorder_for_region(region: ResidencyRegion) -> RecorderEndpoint:
    """Get recorder endpoint for a region."""
    return RECORDER_REGISTRY.get(region, RECORDER_REGISTRY[ResidencyRegion.GLOBAL])


# ============================================================
# Routing Logic
# ============================================================

class ResidencyRouter:
    """
    Routes requests to appropriate regional recorders.
    
    GUARANTEES:
    - No cross-region writes
    - No silent fallback
    - No replication across jurisdictions
    """
    
    def __init__(self, policy: ResidencyPolicy):
        self.policy = policy
    
    def route_ingestion(
        self,
        requested_region: Optional[ResidencyRegion] = None
    ) -> RecorderEndpoint:
        """
        Route an ingestion request to the appropriate recorder.
        
        Args:
            requested_region: Explicitly requested region, or None for default
            
        Returns:
            RecorderEndpoint to send the request to
            
        Raises:
            ResidencyViolationError: If requested region not allowed
        """
        # Use primary region if none specified
        target_region = requested_region or self.policy.primary_region
        
        # Validate against allowed regions
        if target_region not in self.policy.allowed_regions:
            raise ResidencyViolationError(
                requested_region=target_region.value,
                allowed_regions=[r.value for r in self.policy.allowed_regions]
            )
        
        return recorder_for_region(target_region)
    
    def get_primary_recorder(self) -> RecorderEndpoint:
        """Get the primary region's recorder."""
        return recorder_for_region(self.policy.primary_region)
    
    def can_route_to(self, region: ResidencyRegion) -> bool:
        """Check if routing to a region is allowed."""
        return region in self.policy.allowed_regions
    
    def get_allowed_recorders(self) -> list[RecorderEndpoint]:
        """Get all allowed recorders for this org."""
        return [recorder_for_region(r) for r in self.policy.allowed_regions]


# ============================================================
# Utility Functions
# ============================================================

def get_region_from_request(request_headers: dict) -> Optional[ResidencyRegion]:
    """
    Extract requested region from request headers.
    
    Header: X-Regulayer-Region
    """
    region_header = request_headers.get("x-regulayer-region")
    if region_header:
        try:
            return ResidencyRegion(region_header.lower())
        except ValueError:
            return None
    return None


def validate_region_change(
    current_policy: ResidencyPolicy,
    new_region: ResidencyRegion
) -> tuple[bool, Optional[str]]:
    """
    Validate a primary region change.
    
    Returns (allowed, error_message).
    """
    if current_policy.region_locked:
        return False, f"Primary region is locked to {current_policy.primary_region.value}"
    
    return True, None
