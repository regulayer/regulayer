"""
Regulayer Governance - Data Models

CRITICAL CONSTRAINTS:
1. Governance metadata NEVER affects cryptographic verification
2. Annotations are APPEND-ONLY and NEVER editable, even by admins
3. Tags cannot be deleted in Phase 4.1
4. Review state transitions are explicitly enforced
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Literal, Any, Dict
from uuid import UUID
from pydantic import BaseModel, Field


class GovernanceReviewState(str, Enum):
    """
    Review tracking states.
    
    NOTE: This is tracking, NOT approval.
    Review state does not affect decision validity or verification.
    """
    UNREVIEWED = "unreviewed"
    IN_REVIEW = "in_review"
    REVIEWED = "reviewed"
    ESCALATED = "escalated"
    PENDING = "pending"
    REJECTED = "rejected"
    APPROVED = "approved"


# Valid state transitions (enforced in API)
VALID_REVIEW_TRANSITIONS = {
    GovernanceReviewState.UNREVIEWED: [GovernanceReviewState.IN_REVIEW, GovernanceReviewState.APPROVED, GovernanceReviewState.REJECTED],
    GovernanceReviewState.IN_REVIEW: [GovernanceReviewState.REVIEWED, GovernanceReviewState.ESCALATED, GovernanceReviewState.APPROVED, GovernanceReviewState.REJECTED],
    GovernanceReviewState.REVIEWED: [GovernanceReviewState.ESCALATED, GovernanceReviewState.IN_REVIEW, GovernanceReviewState.APPROVED, GovernanceReviewState.REJECTED],
    GovernanceReviewState.ESCALATED: [GovernanceReviewState.IN_REVIEW, GovernanceReviewState.APPROVED, GovernanceReviewState.REJECTED],
    GovernanceReviewState.PENDING: [GovernanceReviewState.APPROVED, GovernanceReviewState.REJECTED, GovernanceReviewState.IN_REVIEW, GovernanceReviewState.ESCALATED],
    GovernanceReviewState.APPROVED: [GovernanceReviewState.IN_REVIEW],  # Can reopen if needed
    GovernanceReviewState.REJECTED: [GovernanceReviewState.IN_REVIEW],  # Can reopen if needed
}


class GovernanceTagCreate(BaseModel):
    """Request model for creating a tag."""
    name: str = Field(..., max_length=100, description="Tag name, e.g. 'high-risk', 'gdpr'")
    category: str = Field(..., max_length=100, description="Category, e.g. 'risk', 'regulation', 'business'")
    source: Literal["manual", "imported", "policy"] = Field(
        default="manual",
        description="Origin of tag: manual (user), imported (external), policy (automated)"
    )


class GovernanceTag(BaseModel):
    """
    Descriptive tag attached to a decision.
    
    Tags are ADD-ONLY in Phase 4.1 (no deletion).
    Tags do not affect cryptographic validity.
    """
    id: int
    decision_id: UUID
    name: str
    category: str
    source: Literal["manual", "imported", "policy"]
    created_at: datetime


class GovernanceAnnotationCreate(BaseModel):
    """Request model for creating an annotation."""
    author_role: Literal["analyst", "auditor", "compliance"] = Field(
        ..., description="Role of the person adding the annotation"
    )
    note: str = Field(..., min_length=1, max_length=2000, description="Annotation text")


class GovernanceAnnotation(BaseModel):
    """
    Append-only note attached to a decision.
    
    IMMUTABILITY RULE:
    Annotations are APPEND-ONLY and NEVER editable, even by admins.
    This ensures audit defensibility.
    """
    id: int
    decision_id: UUID
    author_role: Literal["analyst", "auditor", "compliance"]
    note: str
    created_at: datetime


class GovernanceMetadata(BaseModel):
    """
    Aggregate governance view for a decision.
    
    WARNING: Governance metadata does NOT affect cryptographic validity.
    Auditors can ignore this entirely and still verify truth.
    """
    decision_id: UUID
    review_state: GovernanceReviewState
    tags: List[GovernanceTag]
    annotations: List[GovernanceAnnotation]
    last_updated: datetime
    risk_level: Optional[str] = None
    reviewer: Optional[str] = None
    reviewer_email: Optional[str] = None
    system_name: Optional[str] = None
    assigned_to: Optional[str] = None
    sla_deadline: Optional[str] = None


class ReviewStateUpdate(BaseModel):
    """Request model for updating review state."""
    new_state: GovernanceReviewState = Field(
        ..., description="Target review state"
    )
    action_reason: Optional[str] = Field(None, description="Reason for the review action")
    risk_level: Optional[str] = Field(None, description="Updated risk level classification")


class GovernanceReviewHistory(BaseModel):
    id: int
    decision_id: UUID
    org_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    review_state: str
    actor_role: str
    actor_id: UUID
    action_reason: Optional[str] = None
    risk_level: Optional[str] = None
    timestamp: datetime


class GovernanceAssignmentQueueBase(BaseModel):
    decision_id: UUID
    assigned_to: Optional[UUID] = None
    priority: str = "normal"

class GovernanceAssignmentQueueCreate(GovernanceAssignmentQueueBase):
    pass

class GovernanceAssignmentQueue(GovernanceAssignmentQueueBase):
    id: int
    assigned_at: datetime


class GovernancePoliciesBase(BaseModel):
    policy_json: Dict[str, Any] = Field(default_factory=dict)

class GovernancePoliciesCreate(GovernancePoliciesBase):
    org_id: UUID

class GovernancePolicies(GovernancePoliciesBase):
    org_id: UUID
    created_at: datetime
    updated_at: datetime

class GovernanceProposalCreate(BaseModel):
    org_id: Optional[str] = None
    project_id: Optional[str] = None
    environment: str = "prod"
    proposed_payload: Dict[str, Any]

class GovernanceProposal(BaseModel):
    id: UUID
    org_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    environment: str
    proposed_payload: Dict[str, Any]
    status: str
    decision_id: Optional[UUID] = None
    action_reason: Optional[str] = None
    risk_level: Optional[str] = None
    edit_chain: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

class GateResolutionCreate(BaseModel):
    status: Literal["approved", "declined"]
    edited_output: Optional[Dict[str, Any]] = None
    decline_message: Optional[str] = None

class GateResolution(BaseModel):
    decision_id: UUID
    status: str
    edited_output: Optional[Dict[str, Any]] = None
    decline_message: Optional[str] = None
    resolved_by: str
    resolved_at: datetime
