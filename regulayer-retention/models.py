"""
Regulayer Retention Models

Data models for retention policies and deletion requests.

CORE PRINCIPLE (NON-NEGOTIABLE):
Facts cannot be deleted. Access, visibility, and linkage can.
Deletion is a legal and UI operation, not a cryptographic one.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, Literal, List
from uuid import UUID

from pydantic import BaseModel, Field


# ============================================================
# Retention Policy
# ============================================================

class RetentionScope(str, Enum):
    """What the retention policy applies to."""
    METADATA = "metadata"      # UI metadata, tags, annotations
    GOVERNANCE = "governance"  # Governance decisions, approvals
    UI = "ui"                 # UI visibility


class RetentionPolicy(BaseModel):
    """
    Organization-level retention policy.
    
    CRITICAL INVARIANT:
    cryptographic_records_affected == False ALWAYS
    """
    
    id: UUID
    org_id: UUID
    
    # Retention configuration
    retention_days: int = Field(ge=1, le=3650)  # 1 day to 10 years
    applies_to: RetentionScope
    
    # IMMUTABLE INVARIANT - This is ALWAYS False
    cryptographic_records_affected: bool = False
    
    # Status
    enabled: bool = True
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    def model_post_init(self, __context):
        # Enforce invariant - crypto records are NEVER affected
        object.__setattr__(self, 'cryptographic_records_affected', False)


class RetentionPolicyCreate(BaseModel):
    """Request to create a retention policy."""
    retention_days: int = Field(ge=1, le=3650)
    applies_to: RetentionScope


# ============================================================
# Deletion Request
# ============================================================

class DeletionRequestType(str, Enum):
    """Type of deletion request."""
    GDPR = "gdpr"           # GDPR Article 17
    DPDP = "dpdp"           # India DPDP Act
    CONTRACTUAL = "contractual"  # Contractual obligation
    INTERNAL = "internal"   # Internal policy


class DeletionScope(str, Enum):
    """Scope of deletion."""
    VISIBILITY = "visibility"       # Hide from UI
    METADATA_ONLY = "metadata_only"  # Redact annotations/tags


class DeletionStatus(str, Enum):
    """Status of deletion request."""
    PENDING = "pending"
    APPROVED = "approved"
    EXECUTED = "executed"
    REJECTED = "rejected"


class DeletionRequest(BaseModel):
    """
    Request to "delete" a decision.
    
    IMPORTANT: This hides/redacts, it does NOT:
    - Delete hashes
    - Modify records
    - Break chain
    - Invalidate proofs
    """
    
    id: UUID
    org_id: UUID
    decision_id: UUID
    
    # Request details
    request_type: DeletionRequestType
    scope: DeletionScope
    
    # Requester
    requested_by: str  # Email or identifier
    reason: Optional[str] = None
    
    # Approval workflow
    status: DeletionStatus = DeletionStatus.PENDING
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    
    # Execution
    executed_at: Optional[datetime] = None
    execution_details: Optional[dict] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime


class DeletionRequestCreate(BaseModel):
    """Request to create a deletion request."""
    decision_id: UUID
    request_type: DeletionRequestType
    scope: DeletionScope
    reason: Optional[str] = None


# ============================================================
# Deletion Log (Append-Only)
# ============================================================

class DeletionEventType(str, Enum):
    REQUEST_CREATED = "request_created"
    REQUEST_APPROVED = "request_approved"
    REQUEST_REJECTED = "request_rejected"
    DELETION_EXECUTED = "deletion_executed"
    VISIBILITY_HIDDEN = "visibility_hidden"
    METADATA_REDACTED = "metadata_redacted"


class DeletionEvent(BaseModel):
    """Append-only audit log for deletion events."""
    id: UUID
    org_id: UUID
    request_id: UUID
    decision_id: UUID
    event_type: DeletionEventType
    
    # Actor
    actor: str
    
    # Details
    details: dict = {}
    
    # Timestamp
    timestamp: datetime


# ============================================================
# What Deletion Does and Does NOT Do
# ============================================================

DELETION_ACTIONS = {
    "does": {
        "ui": "Hides decision from UI",
        "governance_metadata": "Redacts annotations and tags",
        "search": "Removes from search indexes",
        "dashboards": "Removes from counts and analytics",
        "exports": "Requires explicit decision ID for export",
    },
    "never_does": {
        "hash": "❌ Never deletes hash",
        "record": "❌ Never modifies record",
        "chain": "❌ Never breaks chain",
        "proof": "❌ Never invalidates proof",
        "offline_verification": "❌ Never prevents offline verification",
    }
}
