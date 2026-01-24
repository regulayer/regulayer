"""
Regulayer Evidence Transfers

Executes custody transfers between organizations.

CRITICAL GUARANTEES:
- No recorder access
- No crypto access
- No proof mutation
"""

from datetime import datetime
from typing import Optional, Tuple
from uuid import uuid4

from .models import (
    CustodyTransfer,
    TransferStatus,
    TransferReason,
    LineageEvent,
    LineageEventType,
    EvidenceLineage,
    EvidenceOrigin,
)


# ============================================================
# Transfer Errors
# ============================================================

class TransferError(Exception):
    """Base exception for transfer errors."""
    pass


class UnauthorizedTransferError(TransferError):
    """Transfer not authorized."""
    pass


class InvalidTransferError(TransferError):
    """Invalid transfer request."""
    pass


# ============================================================
# Transfer Executor
# ============================================================

class TransferExecutor:
    """
    Executes custody transfers.
    
    IMPORTANT: This class ONLY affects:
    - UI visibility
    - Governance metadata
    - Billing attribution
    
    It NEVER touches:
    - Cryptographic records
    - Decision hashes
    - Chain integrity
    - Proof validity
    """
    
    def __init__(self):
        self.events: list[LineageEvent] = []
    
    def validate_authority(
        self,
        transfer: CustodyTransfer,
        actor: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate that the actor has authority to execute the transfer.
        
        Returns (authorized, error_message).
        """
        # In production, this would check:
        # 1. Actor is admin of from_org
        # 2. Transfer has been approved
        # 3. to_org has accepted
        
        if transfer.status != TransferStatus.APPROVED:
            return False, "Transfer must be approved before execution"
        
        return True, None
    
    def execute_transfer(self, transfer: CustodyTransfer) -> LineageEvent:
        """
        Execute a custody transfer.
        
        This moves visibility/billing, never modifies the record.
        """
        authorized, error = self.validate_authority(transfer, "system")
        if not authorized:
            raise UnauthorizedTransferError(error)
        
        # Update visibility
        self._update_visibility(transfer)
        
        # Log the transfer
        event = LineageEvent(
            id=uuid4(),
            decision_id=transfer.decision_id,
            event_type=LineageEventType.TRANSFER_EXECUTED,
            actor="system",
            from_org_id=transfer.from_org_id,
            to_org_id=transfer.to_org_id,
            details={
                "reason": transfer.reason.value,
                "hash_unchanged": True,
                "chain_unchanged": True,
                "cryptographic_records_affected": False,
            },
            timestamp=datetime.utcnow(),
        )
        self.events.append(event)
        
        return event
    
    def _update_visibility(self, transfer: CustodyTransfer) -> None:
        """
        Update visibility to new organization.
        
        In production, this would:
        1. Grant access to to_org
        2. Revoke access from from_org (unless shared)
        3. Update billing attribution
        """
        event = LineageEvent(
            id=uuid4(),
            decision_id=transfer.decision_id,
            event_type=LineageEventType.CUSTODY_CHANGED,
            actor="system",
            from_org_id=transfer.from_org_id,
            to_org_id=transfer.to_org_id,
            details={
                "action": "Custody transferred",
                "original_authorship": "preserved",
            },
            timestamp=datetime.utcnow(),
        )
        self.events.append(event)


# ============================================================
# Transfer Workflow
# ============================================================

class TransferWorkflow:
    """
    Manages custody transfer lifecycle.
    """
    
    def __init__(self):
        self.executor = TransferExecutor()
    
    def request_transfer(
        self,
        decision_id: str,
        from_org_id: str,
        to_org_id: str,
        reason: TransferReason,
        requested_by: str,
        notes: Optional[str] = None
    ) -> CustodyTransfer:
        """Create a transfer request."""
        transfer = CustodyTransfer(
            id=uuid4(),
            decision_id=decision_id,
            decision_hash="unchanged",  # Never changes
            from_org_id=from_org_id,
            from_org_name="Source Org",
            to_org_id=to_org_id,
            to_org_name="Target Org",
            reason=reason,
            notes=notes,
            status=TransferStatus.PENDING,
            requested_by=requested_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        return transfer
    
    def approve(
        self,
        transfer: CustodyTransfer,
        approved_by: str
    ) -> CustodyTransfer:
        """Approve a transfer request."""
        if transfer.status != TransferStatus.PENDING:
            raise InvalidTransferError("Only pending transfers can be approved")
        
        transfer.status = TransferStatus.APPROVED
        transfer.approved_by = approved_by
        transfer.approved_at = datetime.utcnow()
        transfer.updated_at = datetime.utcnow()
        
        return transfer
    
    def reject(
        self,
        transfer: CustodyTransfer,
        rejected_by: str,
        reason: str
    ) -> CustodyTransfer:
        """Reject a transfer request."""
        if transfer.status != TransferStatus.PENDING:
            raise InvalidTransferError("Only pending transfers can be rejected")
        
        transfer.status = TransferStatus.REJECTED
        transfer.updated_at = datetime.utcnow()
        
        return transfer
    
    def execute(self, transfer: CustodyTransfer) -> LineageEvent:
        """Execute an approved transfer."""
        event = self.executor.execute_transfer(transfer)
        
        transfer.status = TransferStatus.EXECUTED
        transfer.executed_at = datetime.utcnow()
        transfer.updated_at = datetime.utcnow()
        
        return event


# ============================================================
# Lineage Helpers
# ============================================================

def get_current_custody(lineage: EvidenceLineage) -> Tuple[str, str]:
    """Get current custody org ID and name."""
    return str(lineage.current_org_id), lineage.current_org_name


def is_original_org(lineage: EvidenceLineage, org_id: str) -> bool:
    """Check if org is the original recorder."""
    return str(lineage.origin.original_org_id) == org_id
