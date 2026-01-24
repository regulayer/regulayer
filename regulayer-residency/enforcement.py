"""
Regulayer Residency Enforcement

Enforces residency policies at API level.

TRUST GUARANTEE: Enforcement is operational, not cryptographic.
Export is NEVER blocked.
"""

from datetime import datetime
from typing import Optional, Tuple
from uuid import uuid4

from .models import (
    ResidencyRegion,
    ResidencyPolicy,
    ResidencyEvent,
    ResidencyEventType,
)
from .rules import get_rules, requires_export_notice
from .routing import ResidencyRouter, ResidencyViolationError


# ============================================================
# API Error Codes
# ============================================================

class ResidencyErrorCode:
    """Residency-related API error codes."""
    
    RESIDENCY_VIOLATION = "RESIDENCY_VIOLATION"  # Region not allowed
    REGION_LOCKED = "REGION_LOCKED"              # Primary region immutable
    EXPORT_NOTICE_LOGGED = "EXPORT_NOTICE_LOGGED"  # Informational only
    
    # Note: No crypto-related errors exposed


# ============================================================
# Enforcement Logic
# ============================================================

class ResidencyEnforcer:
    """
    Enforces residency policies.
    
    CRITICAL GUARANTEE:
    - Export is NEVER blocked
    - Verification is NEVER restricted
    - Proofs are ALWAYS valid
    """
    
    def __init__(self, policy: ResidencyPolicy):
        self.policy = policy
        self.router = ResidencyRouter(policy)
        self.rules = get_rules(policy.primary_region)
    
    def validate_ingestion(
        self,
        requested_region: Optional[ResidencyRegion] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate an ingestion request.
        
        Returns (allowed, error_message).
        """
        try:
            self.router.route_ingestion(requested_region)
            return True, None
        except ResidencyViolationError as e:
            return False, e.message
    
    def can_export(self) -> bool:
        """
        Check if export is allowed.
        
        CRITICAL: This ALWAYS returns True.
        Export is never blocked by residency.
        """
        return True  # ALWAYS
    
    def export_requires_notice(self) -> bool:
        """Check if export requires a notice to be logged."""
        return requires_export_notice(self.policy.primary_region)
    
    def log_export_notice(
        self,
        export_type: str,
        destination: Optional[str] = None
    ) -> ResidencyEvent:
        """
        Log an export notice (informational only).
        
        Returns the logged event.
        """
        return ResidencyEvent(
            id=uuid4(),
            org_id=self.policy.org_id,
            event_type=ResidencyEventType.EXPORT_NOTICE,
            region=self.policy.primary_region,
            details={
                "export_type": export_type,
                "destination": destination,
                "notice": "Export logged for compliance. Not blocked.",
            },
            timestamp=datetime.utcnow(),
        )
    
    def can_change_primary_region(self) -> bool:
        """Check if primary region can be changed."""
        return not self.policy.region_locked
    
    def get_trust_statement(self) -> str:
        """
        Get trust statement for residency policy.
        
        IMPORTANT: Uses "supports", never "complies".
        """
        region_name = self.policy.primary_region.value.upper()
        return (
            f"This organization's data is stored in the {region_name} region. "
            f"Residency controls where data lives, not what can be proven. "
            f"Proofs exported from this region verify identically anywhere in the world, offline."
        )


# ============================================================
# Export Semantics (Critical)
# ============================================================

EXPORT_GUARANTEES = {
    # Export is ALWAYS allowed regardless of state
    "active": True,
    "frozen": True,
    "org_closed": True,
    "region_outage": True,
    "regulayer_down": True,  # Offline verification
}


def is_export_blocked_by_residency() -> bool:
    """
    Check if export is blocked by residency.
    
    CRITICAL: This ALWAYS returns False.
    We NEVER block export.
    """
    return False  # NEVER block export


# ============================================================
# Legal Artifact Generation
# ============================================================

def generate_residency_statement(policy: ResidencyPolicy) -> str:
    """
    Generate DATA_RESIDENCY_STATEMENT.md content.
    
    Language uses "supports" and "enables", never "complies".
    """
    region = policy.primary_region.value.upper()
    
    return f"""# Data Residency Statement

## Organization
- Primary Region: {region}
- Allowed Regions: {', '.join(r.value.upper() for r in policy.allowed_regions)}

## Guarantees

This deployment **supports** the following:

1. **Data Storage**: Decision records are stored in the {region} region.
2. **Processing**: Ingestion and recording occur in the {region} region.
3. **Export**: Proof export is always available and unrestricted.
4. **Verification**: Proofs verify identically regardless of export destination.

## Clarifications

- Residency controls **where** data is stored, not **what** can be proven.
- Proofs exported from this region can be verified offline, anywhere.
- This statement **enables** compliance; it does not constitute legal advice.

---
Generated: {datetime.utcnow().isoformat()}
"""


def generate_export_independence_note(policy: ResidencyPolicy) -> str:
    """
    Generate EXPORT_INDEPENDENCE_NOTE.md content.
    """
    return """# Export Independence Note

## Critical Guarantee

**Export is never blocked by residency policy.**

Regardless of:
- Organization status (active, frozen, closed)
- Region status (healthy, degraded, outage)
- Regulayer availability

Proof bundles can always be:
1. Exported from the system
2. Verified offline
3. Presented to any third party

## Verification

Exported proofs are cryptographically self-contained.
No network access to Regulayer is required for verification.

---
This note does not constitute legal advice.
"""
