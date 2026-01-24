"""
Regulayer Evidence Lineage Models

Data models for cross-organization evidence tracking and custody transfers.

CORE PRINCIPLE (NON-NEGOTIABLE):
Evidence may change custody.
Facts never change authorship.

Ownership ≠ Origin.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel


# ============================================================
# Evidence Origin (Immutable)
# ============================================================

class EvidenceOrigin(BaseModel):
    """
    The original source of a decision record.
    
    CRITICAL INVARIANT: Origin NEVER changes.
    This is the permanent record of who first recorded the evidence.
    """
    
    original_org_id: UUID
    original_org_name: str
    original_project_id: UUID
    original_project_name: str
    recorded_at: datetime
    
    # Hash at time of recording (for verification)
    original_record_hash: str
    
    # This field is IMMUTABLE
    class Config:
        frozen = True


# ============================================================
# Transfer Reason
# ============================================================

class TransferReason(str, Enum):
    """Reason for custody transfer."""
    ACQUISITION = "acquisition"       # Company acquired
    SPIN_OFF = "spin_off"            # Division spun off
    COURT_ORDER = "court_order"      # Legal mandate
    REGULATORY_TRANSFER = "regulatory_transfer"  # Regulatory requirement
    ASSET_SALE = "asset_sale"        # Asset/IP sale
    INSOLVENCY = "insolvency"        # Company insolvency


class TransferStatus(str, Enum):
    """Status of custody transfer."""
    PENDING = "pending"
    APPROVED = "approved"
    EXECUTED = "executed"
    REJECTED = "rejected"


# ============================================================
# Custody Transfer
# ============================================================

class CustodyTransfer(BaseModel):
    """
    Records a custody transfer between organizations.
    
    IMPORTANT: Transfer affects visibility and billing,
    NOT cryptographic truth.
    """
    
    id: UUID
    
    # What is being transferred
    decision_id: UUID
    decision_hash: str  # Unchanged by transfer
    
    # Transfer parties
    from_org_id: UUID
    from_org_name: str
    to_org_id: UUID
    to_org_name: str
    
    # Transfer details
    reason: TransferReason
    notes: Optional[str] = None
    
    # Approval workflow
    status: TransferStatus = TransferStatus.PENDING
    requested_by: str
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    
    # Execution
    executed_at: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime


class CustodyTransferCreate(BaseModel):
    """Request to create a custody transfer."""
    decision_id: UUID
    to_org_id: UUID
    reason: TransferReason
    notes: Optional[str] = None


# ============================================================
# Evidence Lineage (Full History)
# ============================================================

class EvidenceLineage(BaseModel):
    """
    Complete lineage of a decision record.
    
    Includes origin and all custody transfers.
    """
    
    decision_id: UUID
    decision_hash: str
    
    # Origin (immutable)
    origin: EvidenceOrigin
    
    # Transfer history (append-only)
    transfer_history: List[CustodyTransfer] = []
    
    # Current custody
    current_org_id: UUID
    current_org_name: str
    
    def get_origin_statement(self) -> str:
        """Get a human-readable origin statement."""
        return (
            f"Originally recorded by {self.origin.original_org_name} "
            f"on {self.origin.recorded_at.strftime('%Y-%m-%d')}. "
            f"Custody transfers do not affect cryptographic validity."
        )


# ============================================================
# Lineage Audit Events
# ============================================================

class LineageEventType(str, Enum):
    TRANSFER_REQUESTED = "transfer_requested"
    TRANSFER_APPROVED = "transfer_approved"
    TRANSFER_REJECTED = "transfer_rejected"
    TRANSFER_EXECUTED = "transfer_executed"
    CUSTODY_CHANGED = "custody_changed"


class LineageEvent(BaseModel):
    """Append-only audit log for lineage events."""
    id: UUID
    decision_id: UUID
    event_type: LineageEventType
    
    # Actor
    actor: str
    from_org_id: Optional[UUID] = None
    to_org_id: Optional[UUID] = None
    
    # Details
    details: dict = {}
    
    # Timestamp
    timestamp: datetime


# ============================================================
# Transfer Semantics
# ============================================================

TRANSFER_ACTIONS = {
    "does": {
        "ui_visibility": "Moves to new org's view",
        "governance_metadata": "Forks or migrates",
        "billing": "New org billed going forward",
        "access": "Old org loses access (unless shared)",
    },
    "never_does": {
        "rehash": "❌ Never rehashes",
        "resign": "❌ Never re-signs",
        "modify_chain": "❌ Never modifies chain",
        "change_decision_id": "❌ Never changes decision_id",
        "change_record_hash": "❌ Never changes record_hash",
    }
}
