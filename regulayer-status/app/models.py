"""
Regulayer Status - Models
"""

from enum import Enum
from typing import Dict, Optional, List
from datetime import datetime, timezone
from dataclasses import dataclass, field


class ComponentStatus(str, Enum):
    """Status of a system component."""
    OPERATIONAL = "operational"
    DEGRADED = "degraded"
    PARTIAL_OUTAGE = "partial_outage"
    MAJOR_OUTAGE = "major_outage"
    MAINTENANCE = "maintenance"


class OverallStatus(str, Enum):
    """Overall system status."""
    OPERATIONAL = "OPERATIONAL"
    DEGRADED = "DEGRADED"
    PARTIAL_OUTAGE = "PARTIAL_OUTAGE"
    MAJOR_OUTAGE = "MAJOR_OUTAGE"


@dataclass
class ComponentHealth:
    """Health of a single component."""
    name: str
    status: ComponentStatus
    latency_ms: Optional[float] = None
    message: Optional[str] = None
    last_check: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class SystemHealth:
    """Overall system health."""
    status: OverallStatus
    components: Dict[str, ComponentHealth]
    last_updated: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    active_incidents: int = 0


@dataclass
class OrgHealth:
    """Per-organization operational health."""
    org_id: str
    ingestion_success_rate: float  # 0-100%
    queue_latency_ms: float
    recorder_acceptance_rate: float  # 0-100%
    verification_failures: int  # Should be 0
    last_activity: Optional[datetime] = None


# ============================================================
# Error Codes - Public Taxonomy
# ============================================================

class ErrorCode(str, Enum):
    """Public error codes for SLA transparency."""
    
    # Ingestion
    INGEST_RATE_LIMITED = "INGEST_RATE_LIMITED"
    INGEST_QUOTA_EXCEEDED = "INGEST_QUOTA_EXCEEDED"
    INGEST_INVALID_PAYLOAD = "INGEST_INVALID_PAYLOAD"
    INGEST_UNAUTHORIZED = "INGEST_UNAUTHORIZED"
    
    # Recorder
    RECORDER_UNAVAILABLE = "RECORDER_UNAVAILABLE"
    RECORDER_OVERLOADED = "RECORDER_OVERLOADED"
    
    # Attestation
    ATTESTATION_INVALID = "ATTESTATION_INVALID"
    ATTESTATION_UNAVAILABLE = "ATTESTATION_UNAVAILABLE"
    
    # System
    SYSTEM_DEGRADED = "SYSTEM_DEGRADED"
    SYSTEM_MAINTENANCE = "SYSTEM_MAINTENANCE"


ERROR_DESCRIPTIONS = {
    ErrorCode.INGEST_RATE_LIMITED: "Too many requests. Please retry after the specified delay.",
    ErrorCode.INGEST_QUOTA_EXCEEDED: "Daily quota reached. Resets at midnight UTC.",
    ErrorCode.INGEST_INVALID_PAYLOAD: "Request payload is invalid or malformed.",
    ErrorCode.INGEST_UNAUTHORIZED: "API key is invalid, revoked, or missing.",
    ErrorCode.RECORDER_UNAVAILABLE: "Recorder temporarily unavailable. Requests are queued.",
    ErrorCode.RECORDER_OVERLOADED: "Recorder is processing high load. Please retry.",
    ErrorCode.ATTESTATION_INVALID: "Attestation signature verification failed.",
    ErrorCode.ATTESTATION_UNAVAILABLE: "Attestation service temporarily unavailable.",
    ErrorCode.SYSTEM_DEGRADED: "System operating with reduced capacity.",
    ErrorCode.SYSTEM_MAINTENANCE: "Scheduled maintenance in progress.",
}
