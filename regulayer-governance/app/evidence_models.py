"""
Regulayer Governance - Evidence Bundle Models

CRITICAL CONSTRAINTS:
1. Evidence documents organizational process, NOT cryptographic facts
2. Evidence NEVER includes record hashes, signatures, or chain data
3. Evidence must be reproducible at any time
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class PolicyEvaluationEvidence(BaseModel):
    """Evidence of a policy evaluation."""
    policy_id: UUID
    name: str
    matched: bool
    evaluated_at: datetime
    actions_triggered: List[str]


class StateTransitionEvidence(BaseModel):
    """Evidence of a review state transition."""
    from_state: str
    to_state: str
    timestamp: datetime
    trigger: str  # e.g., "policy:High Risk Escalation" or "approval:compliance"


class ApprovalEvidence(BaseModel):
    """Evidence of an approval decision."""
    role: str
    approved: bool
    note: Optional[str]
    timestamp: datetime


class AnnotationEvidence(BaseModel):
    """Evidence of an annotation."""
    author_role: str
    note: str
    timestamp: datetime


class GovernanceEvidenceBundle(BaseModel):
    """
    Complete governance evidence bundle for a decision.
    
    This documents ORGANIZATIONAL PROCESS, not cryptographic facts.
    It is safe to share with auditors, legal teams, and regulators.
    
    WARNING: This NEVER includes:
    - Record hashes
    - Signatures
    - Chain links
    - Proof bundle data
    """
    governance_evidence_version: str = "1.0.0"
    decision_id: UUID
    generated_at: datetime
    
    policies_evaluated: List[PolicyEvaluationEvidence]
    review_state_timeline: List[StateTransitionEvidence]
    approvals: List[ApprovalEvidence]
    annotations: List[AnnotationEvidence]
    
    current_review_state: str
    
    disclaimer: str = Field(
        default="This document does not attest to AI correctness or cryptographic integrity. "
                "It documents organizational review processes only."
    )


class TimelineEvent(BaseModel):
    """A single event in the governance timeline."""
    event_type: str  # "policy_match", "state_change", "approval", "annotation"
    timestamp: datetime
    title: str
    description: str
    metadata: dict = Field(default_factory=dict)


class GovernanceTimeline(BaseModel):
    """Human-readable governance timeline."""
    decision_id: UUID
    events: List[TimelineEvent]
    generated_at: datetime
