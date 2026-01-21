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
from typing import List, Optional, Literal
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


# Valid state transitions (enforced in API)
VALID_REVIEW_TRANSITIONS = {
    GovernanceReviewState.UNREVIEWED: [GovernanceReviewState.IN_REVIEW],
    GovernanceReviewState.IN_REVIEW: [GovernanceReviewState.REVIEWED, GovernanceReviewState.ESCALATED],
    GovernanceReviewState.REVIEWED: [GovernanceReviewState.ESCALATED, GovernanceReviewState.IN_REVIEW],
    GovernanceReviewState.ESCALATED: [GovernanceReviewState.IN_REVIEW],
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


class ReviewStateUpdate(BaseModel):
    """Request model for updating review state."""
    new_state: GovernanceReviewState = Field(
        ..., description="Target review state"
    )
