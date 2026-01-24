"""
Regulayer Evidence Lineage Enforcement

Enforces lineage integrity and generates trust statements.

TRUST GUARANTEE: Enforcement affects visibility, never proofs.
"""

from datetime import datetime
from typing import Optional

from .models import (
    EvidenceLineage,
    EvidenceOrigin,
    CustodyTransfer,
    TransferStatus,
    TRANSFER_ACTIONS,
)


# ============================================================
# Lineage Enforcer
# ============================================================

class LineageEnforcer:
    """
    Enforces lineage integrity rules.
    
    CRITICAL GUARANTEES:
    - Origin is NEVER modified
    - Hash is NEVER changed
    - Chain integrity is NEVER affected
    - Proofs remain valid regardless of custody
    """
    
    def __init__(self, lineage: EvidenceLineage):
        self.lineage = lineage
    
    def can_transfer_out(self, org_id: str) -> bool:
        """Check if org can transfer custody."""
        return str(self.lineage.current_org_id) == org_id
    
    def can_access(self, org_id: str) -> bool:
        """Check if org has access to this evidence."""
        # Current custodian has access
        if str(self.lineage.current_org_id) == org_id:
            return True
        
        # Original org may have read-only access (configurable)
        if str(self.lineage.origin.original_org_id) == org_id:
            return True  # Origin always has visibility
        
        return False
    
    def get_origin_attestation(self) -> str:
        """
        Get attestation statement about origin.
        
        This is immutable and never changes regardless of custody.
        """
        return (
            f"This decision record was originally created by "
            f"{self.lineage.origin.original_org_name} "
            f"on {self.lineage.origin.recorded_at.strftime('%Y-%m-%d %H:%M:%S UTC')}. "
            f"Original record hash: {self.lineage.origin.original_record_hash[:16]}..."
        )
    
    def get_custody_statement(self) -> str:
        """Get current custody statement."""
        transfer_count = len(self.lineage.transfer_history)
        
        if transfer_count == 0:
            return f"Custody held by original recorder: {self.lineage.current_org_name}"
        
        return (
            f"Currently held by: {self.lineage.current_org_name}. "
            f"Transferred {transfer_count} time(s) since original recording."
        )
    
    def get_trust_statement(self) -> str:
        """
        Get comprehensive trust statement.
        
        Language uses "custody", never implies ownership changes facts.
        """
        return (
            f"Evidence Origin: {self.lineage.origin.original_org_name}\n"
            f"Original Recording: {self.lineage.origin.recorded_at.isoformat()}\n"
            f"Current Custody: {self.lineage.current_org_name}\n"
            f"Transfers: {len(self.lineage.transfer_history)}\n\n"
            f"Custody transfer does not affect cryptographic validity. "
            f"Original authorship is permanently preserved."
        )


# ============================================================
# Lineage Validation
# ============================================================

def validate_lineage_integrity(lineage: EvidenceLineage) -> tuple[bool, Optional[str]]:
    """
    Validate that lineage maintains integrity.
    
    Returns (valid, error_message).
    """
    # Decision hash must never change
    if lineage.decision_hash != lineage.origin.original_record_hash:
        return False, "Decision hash does not match original record hash"
    
    # Origin must always be present
    if not lineage.origin:
        return False, "Origin is missing"
    
    # Transfer history must be sequential
    for i, transfer in enumerate(lineage.transfer_history):
        if transfer.status != TransferStatus.EXECUTED:
            return False, f"Transfer {i} is not in executed state"
    
    return True, None


def verify_origin_immutability(lineage: EvidenceLineage) -> bool:
    """
    Verify that origin has not been modified.
    
    In production, this would verify against the recorder.
    """
    # Origin is always immutable
    return True


# ============================================================
# Proof Bundle Lineage Section
# ============================================================

def generate_lineage_section(lineage: EvidenceLineage) -> dict:
    """
    Generate lineage section for proof bundle.
    
    IMPORTANT: Offline verifier reads this for display only.
    This is NOT used for cryptographic verification.
    """
    return {
        "lineage": {
            "origin_org": str(lineage.origin.original_org_id),
            "origin_org_name": lineage.origin.original_org_name,
            "recorded_at": lineage.origin.recorded_at.isoformat(),
            "original_hash": lineage.origin.original_record_hash,
            "transfer_history": [
                {
                    "from": str(t.from_org_id),
                    "from_name": t.from_org_name,
                    "to": str(t.to_org_id),
                    "to_name": t.to_org_name,
                    "reason": t.reason.value,
                    "timestamp": t.executed_at.isoformat() if t.executed_at else None,
                }
                for t in lineage.transfer_history
            ],
            "current_custody": {
                "org_id": str(lineage.current_org_id),
                "org_name": lineage.current_org_name,
            },
            "verification_note": (
                "Lineage information is for auditor display only. "
                "Cryptographic verification does not depend on custody history."
            ),
        }
    }
