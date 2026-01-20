"""
Regulayer Verification UI - Response Models

Read-only response schemas for UI API.
"""

from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel
from uuid import UUID


class ChainStatus(BaseModel):
    """Chain status overview."""
    
    chain_id: str
    total_records: int
    first_record_timestamp: Optional[datetime]
    last_record_timestamp: Optional[datetime]
    integrity_status: Literal["PASS", "FAIL", "UNKNOWN"]
    failure_reason: Optional[str] = None


class VerificationResult(BaseModel):
    """Full chain verification result."""
    
    is_valid: bool
    total_records_checked: int
    broken_at_record_id: Optional[int] = None
    verification_duration_ms: float
    errors: List[str] = []


class DecisionSummary(BaseModel):
    """Decision list item."""
    
    decision_id: UUID
    record_id: int
    server_timestamp: datetime
    system_name: str
    event_state: str
    record_hash: str


class DecisionListResponse(BaseModel):
    """Paginated decision list."""
    
    decisions: List[DecisionSummary]
    total: int
    limit: int
    offset: int


class DecisionDetail(BaseModel):
    """Detailed decision record."""
    
    decision_id: UUID
    record_id: int
    record_hash: str
    previous_record_hash: Optional[str]
    canonical_payload: dict  # Read-only JSON
    canonical_payload_hash: str
    sdk_instance_id: UUID
    server_timestamp: datetime
    system_name: str
    risk_level: str
    event_state: str
    sdk_version: str
    verification_status: str = "unverified"


class SpotVerification(BaseModel):
    """Single decision verification result."""
    
    decision_id: UUID
    hash_matches: bool
    chain_link_valid: bool
    record_valid: bool
    verification_timestamp: datetime
