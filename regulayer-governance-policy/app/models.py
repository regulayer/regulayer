"""
Regulayer Governance Policy - Data Models

CRITICAL CONSTRAINTS:
1. Policies NEVER modify decision facts
2. Policies NEVER affect hash chains
3. Policies NEVER invalidate proof bundles
4. All actions are traceable and append-only
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Any, Literal
from uuid import UUID
from pydantic import BaseModel, Field


class PolicyConditionField(str, Enum):
    """Fields that policies can evaluate."""
    RISK_LEVEL = "risk_level"
    EVENT_STATE = "event_state"
    ATTESTATION_STATUS = "attestation_status"
    REVIEW_STATE = "review_state"
    TAG = "tag"
    SYSTEM_NAME = "system_name"


class PolicyConditionOperator(str, Enum):
    """Supported operators for conditions."""
    EQ = "eq"
    NEQ = "neq"
    IN = "in"
    NOT_IN = "not_in"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    STARTS_WITH = "starts_with"
    REGEX = "regex"
    LLM_EVALUATE = "llm_evaluate"
    GT = "gt"
    LT = "lt"
    GTE = "gte"
    LTE = "lte"


class PolicyCondition(BaseModel):
    """
    Declarative condition for policy evaluation.
    
    No arbitrary code. No scripting. No side effects.
    """
    field: str
    operator: PolicyConditionOperator
    value: Any = Field(..., description="Value to compare against")


class PolicyActionType(str, Enum):
    """Types of actions a policy can trigger."""
    SET_REVIEW_STATE = "set_review_state"
    ADD_TAG = "add_tag"
    REQUIRE_APPROVAL = "require_approval"
    NOTIFY = "notify"
    NOTIFY_EMAIL = "notify_email"
    NOTIFY_WEBHOOK = "notify_webhook"
    BLOCK = "block"
    AUTO_APPROVE = "auto_approve"


class PolicyAction(BaseModel):
    """
    Action to execute when policy conditions match.
    
    Actions modify governance metadata only, never facts.
    """
    type: str
    parameters: dict = Field(default_factory=dict)


class GovernancePolicyCreate(BaseModel):
    """Request model for creating a policy."""
    name: str = Field(..., max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    org_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    applies_to: List[str] = Field(
        default_factory=list,
        description="System names this policy applies to. Empty = all systems."
    )
    conditions: List[PolicyCondition]
    actions: List[PolicyAction]


class GovernancePolicy(BaseModel):
    """
    Enterprise governance policy definition.
    
    Policies evaluate metadata + decision attributes.
    Policies produce governance changes, never recorder changes.
    """
    policy_id: UUID
    name: str
    description: Optional[str] = None
    org_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    enabled: bool = True
    applies_to: List[str]
    conditions: List[PolicyCondition]
    actions: List[PolicyAction]
    created_at: datetime
    updated_at: datetime


class PolicyEvaluationResult(BaseModel):
    """Result of evaluating a policy against a decision."""
    policy_id: UUID
    policy_name: str
    matched: bool
    actions_executed: List[str]
    evaluated_at: datetime


class ApprovalRole(str, Enum):
    """Roles that can provide approvals."""
    ANALYST = "analyst"
    COMPLIANCE = "compliance"
    LEGAL = "legal"
    MANAGER = "manager"


class ApprovalRecordCreate(BaseModel):
    """Request model for creating an approval."""
    role: ApprovalRole
    approved: bool
    note: Optional[str] = Field(None, max_length=1000)


class ApprovalRecord(BaseModel):
    """
    Immutable approval record.
    
    IMMUTABILITY RULE:
    Approvals are APPEND-ONLY. No edits, no deletes.
    Every approval is permanent evidence.
    """
    id: int
    decision_id: UUID
    role: ApprovalRole
    approved: bool
    note: Optional[str]
    created_at: datetime


class WorkflowStatus(BaseModel):
    """Current workflow status for a decision."""
    decision_id: UUID
    required_approvals: List[ApprovalRole]
    received_approvals: List[ApprovalRecord]
    pending_roles: List[ApprovalRole]
    is_fully_approved: bool
    policies_applied: List[PolicyEvaluationResult]
