"""
Regulayer Deletion Logic

Executes deletion requests by hiding/redacting, never by deleting records.

CRITICAL GUARANTEES:
- No recorder access
- No cryptographic access
- No database writes to immutable tables
"""

from datetime import datetime
from typing import Optional
from uuid import uuid4

from .models import (
    DeletionRequest,
    DeletionStatus,
    DeletionScope,
    DeletionEvent,
    DeletionEventType,
)


# ============================================================
# Deletion Executor
# ============================================================

class DeletionExecutor:
    """
    Executes deletion requests.
    
    IMPORTANT: This class ONLY affects:
    - UI visibility
    - Governance metadata
    - Search indexes
    
    It NEVER touches:
    - Cryptographic records
    - Decision hashes
    - Chain integrity
    - Proof validity
    """
    
    def __init__(self, org_id: str):
        self.org_id = org_id
        self.events: list[DeletionEvent] = []
    
    def execute_deletion(self, request: DeletionRequest) -> DeletionEvent:
        """
        Execute a deletion request.
        
        This hides/redacts based on scope, never deletes cryptographic data.
        """
        if request.status != DeletionStatus.APPROVED:
            raise ValueError("Only approved requests can be executed")
        
        # Execute based on scope
        if request.scope == DeletionScope.VISIBILITY:
            self._hide_visibility(request.decision_id)
        
        if request.scope == DeletionScope.METADATA_ONLY:
            self._redact_metadata(request.decision_id)
        
        # Log the execution
        event = DeletionEvent(
            id=uuid4(),
            org_id=request.org_id,
            request_id=request.id,
            decision_id=request.decision_id,
            event_type=DeletionEventType.DELETION_EXECUTED,
            actor="system",
            details={
                "scope": request.scope.value,
                "request_type": request.request_type.value,
                "cryptographic_records_affected": False,  # ALWAYS False
            },
            timestamp=datetime.utcnow(),
        )
        self.events.append(event)
        
        return event
    
    def _hide_visibility(self, decision_id: str) -> None:
        """
        Hide decision from UI.
        
        This marks the decision as hidden in the governance layer.
        The cryptographic record remains unchanged.
        """
        # In production, this would:
        # 1. Update visibility flag in governance DB
        # 2. Remove from search indexes
        # 3. Remove from dashboard counts
        
        event = DeletionEvent(
            id=uuid4(),
            org_id=self.org_id,
            request_id=uuid4(),  # Placeholder
            decision_id=decision_id,
            event_type=DeletionEventType.VISIBILITY_HIDDEN,
            actor="system",
            details={
                "action": "Decision hidden from UI",
                "cryptographic_record": "unchanged",
            },
            timestamp=datetime.utcnow(),
        )
        self.events.append(event)
    
    def _redact_metadata(self, decision_id: str) -> None:
        """
        Redact governance metadata.
        
        This removes annotations, tags, and labels.
        The cryptographic record remains unchanged.
        """
        # In production, this would:
        # 1. Clear annotations in governance DB
        # 2. Clear custom tags
        # 3. Clear labels
        
        event = DeletionEvent(
            id=uuid4(),
            org_id=self.org_id,
            request_id=uuid4(),  # Placeholder
            decision_id=decision_id,
            event_type=DeletionEventType.METADATA_REDACTED,
            actor="system",
            details={
                "action": "Governance metadata redacted",
                "cryptographic_record": "unchanged",
            },
            timestamp=datetime.utcnow(),
        )
        self.events.append(event)


# ============================================================
# Deletion Request Workflow
# ============================================================

class DeletionWorkflow:
    """
    Manages deletion request lifecycle.
    """
    
    def __init__(self, org_id: str):
        self.org_id = org_id
        self.executor = DeletionExecutor(org_id)
    
    def approve(
        self,
        request: DeletionRequest,
        approved_by: str
    ) -> DeletionRequest:
        """Approve a deletion request."""
        if request.status != DeletionStatus.PENDING:
            raise ValueError("Only pending requests can be approved")
        
        request.status = DeletionStatus.APPROVED
        request.approved_by = approved_by
        request.approved_at = datetime.utcnow()
        request.updated_at = datetime.utcnow()
        
        return request
    
    def reject(
        self,
        request: DeletionRequest,
        rejected_by: str,
        reason: str
    ) -> DeletionRequest:
        """Reject a deletion request."""
        if request.status != DeletionStatus.PENDING:
            raise ValueError("Only pending requests can be rejected")
        
        request.status = DeletionStatus.REJECTED
        request.execution_details = {
            "rejected_by": rejected_by,
            "reason": reason,
        }
        request.updated_at = datetime.utcnow()
        
        return request
    
    def execute(self, request: DeletionRequest) -> DeletionEvent:
        """Execute an approved deletion request."""
        event = self.executor.execute_deletion(request)
        
        request.status = DeletionStatus.EXECUTED
        request.executed_at = datetime.utcnow()
        request.execution_details = {
            "event_id": str(event.id),
            "cryptographic_records_affected": False,
        }
        request.updated_at = datetime.utcnow()
        
        return event


# ============================================================
# Export Behavior
# ============================================================

def can_export_deleted_decision(decision_id: str) -> tuple[bool, str]:
    """
    Check if a deleted decision can be exported.
    
    IMPORTANT: Deleted decisions can ALWAYS be exported.
    This returns True with a warning banner.
    """
    return True, (
        "This decision is hidden due to a legal request. "
        "Cryptographic proof remains valid."
    )


def get_export_banner(is_deleted: bool) -> Optional[str]:
    """Get export banner for deleted decisions."""
    if is_deleted:
        return (
            "This decision is hidden due to a legal request. "
            "Cryptographic proof remains valid and can be verified offline."
        )
    return None
