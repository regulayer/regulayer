"""
Regulayer Incident - Data Models

CORE PRINCIPLES:
1. Incidents do NOT rewrite facts
2. Evidence is never deleted or altered
3. Trust degradation is explicit, scoped, and timestamped
4. Disclosure is append-only
5. Auditors must be able to replay pre-incident trust
"""

from datetime import datetime
from typing import List, Optional, Tuple
from uuid import UUID
from enum import Enum
from pydantic import BaseModel, Field


class IncidentSeverity(str, Enum):
    """Severity levels for incidents."""
    LOW = "low"           # Minor issue, limited impact
    MEDIUM = "medium"     # Moderate issue, some evidence may be caveated
    HIGH = "high"         # Significant issue, broad trust impact
    CRITICAL = "critical" # Severe issue, immediate action required


class TrustImpactScope(str, Enum):
    """What component of the system is affected."""
    SDK = "sdk"                       # Client SDK issues
    RECORDER = "recorder"             # Core recording infrastructure
    SIGNING_KEYS = "signing_keys"     # Cryptographic key issues
    GOVERNANCE = "governance"         # Governance layer issues
    INFRASTRUCTURE = "infrastructure" # Underlying infrastructure


class IncidentStatus(str, Enum):
    """Current status of an incident."""
    ACTIVE = "active"       # Incident is ongoing
    MITIGATED = "mitigated" # Incident has been addressed
    RESOLVED = "resolved"   # Incident fully resolved


class TrustStatus(str, Enum):
    """Trust status for evidence after incident evaluation."""
    TRUSTED = "trusted"           # No incident overlap
    DEGRADED = "degraded"         # Evidence valid, trust caveated
    UNTRUSTED = "untrusted"       # Evidence integrity impacted
    OUT_OF_SCOPE = "out_of_scope" # Incident unrelated


class IncidentRecord(BaseModel):
    """
    Core incident record. Append-only, immutable.
    
    Once declared, an incident cannot be modified or deleted.
    Mitigations are new records, not edits.
    """
    incident_id: UUID
    declared_at: datetime
    severity: IncidentSeverity
    status: IncidentStatus = IncidentStatus.ACTIVE
    
    # Scope of impact
    affected_scope: List[TrustImpactScope]
    affected_identities: Optional[List[str]] = None
    affected_time_range: Optional[Tuple[datetime, datetime]] = None
    
    # Description
    title: str
    description: str
    mitigation_summary: Optional[str] = None
    
    # Audit trail
    declared_by: str = "security-team"


class IncidentMitigation(BaseModel):
    """
    Mitigation record for an incident.
    
    Mitigations are NEW records, not edits to incidents.
    This preserves the original incident declaration.
    """
    mitigation_id: UUID
    incident_id: UUID
    mitigated_at: datetime
    new_status: IncidentStatus
    mitigation_description: str
    residual_impact: Optional[str] = None


class TrustEvaluation(BaseModel):
    """
    Result of evaluating a decision's trust status.
    
    Determines if a decision is affected by any incidents.
    """
    decision_id: UUID
    evaluated_at: datetime
    trust_status: TrustStatus
    
    # If affected
    affecting_incidents: List[UUID] = Field(default_factory=list)
    impact_summary: Optional[str] = None
    
    # What remains valid
    cryptographic_integrity: bool = True
    chain_integrity: bool = True
    attestation_valid: bool = True
    governance_valid: bool = True


class DisclosureDocument(BaseModel):
    """
    Regulator-facing disclosure document.
    
    No opinions. No marketing. No remediation promises.
    Just facts about what is and isn't affected.
    """
    disclosure_version: str = "1.0.0"
    disclosure_id: UUID
    generated_at: datetime
    
    # Incident reference
    incident_id: UUID
    incident_severity: IncidentSeverity
    incident_title: str
    
    # Impact analysis
    affected_evidence_count: int
    affected_time_range: Optional[Tuple[datetime, datetime]] = None
    
    # Trust breakdown
    trust_status_summary: dict = Field(
        default_factory=lambda: {
            "trusted": 0,
            "degraded": 0,
            "untrusted": 0,
            "out_of_scope": 0
        }
    )
    
    what_remains_valid: List[str] = Field(default_factory=list)
    what_is_caveated: List[str] = Field(default_factory=list)
    what_is_invalid: List[str] = Field(default_factory=list)
    
    # Legal statement
    statement: str = (
        "This disclosure does not invalidate unaffected records. "
        "Affected records retain cryptographic integrity but trust context is caveated."
    )
