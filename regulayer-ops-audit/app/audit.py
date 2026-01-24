"""
Regulayer Ops Audit

Tracks operational changes for compliance auditing.

APPEND-ONLY. READ-ONLY EXPORT. NEVER LINKED TO DECISION FACTS.
"""

from datetime import datetime, timezone
from typing import Optional, List
from dataclasses import dataclass, field
from enum import Enum
from uuid import UUID, uuid4


class AuditEventType(str, Enum):
    """Types of auditable operational events."""
    
    # Configuration
    CONFIG_CHANGED = "config_changed"
    REGION_CHANGED = "region_changed"
    
    # Access
    KEY_CREATED = "key_created"
    KEY_REVOKED = "key_revoked"
    USER_ADDED = "user_added"
    USER_REMOVED = "user_removed"
    ROLE_CHANGED = "role_changed"
    
    # Organization
    ORG_FROZEN = "org_frozen"
    ORG_UNFROZEN = "org_unfrozen"
    PLAN_CHANGED = "plan_changed"
    
    # Incidents
    INCIDENT_DECLARED = "incident_declared"
    INCIDENT_RESOLVED = "incident_resolved"
    
    # System
    MAINTENANCE_STARTED = "maintenance_started"
    MAINTENANCE_ENDED = "maintenance_ended"


@dataclass
class AuditEvent:
    """An auditable operational event."""
    event_id: UUID
    event_type: AuditEventType
    timestamp: datetime
    actor_id: str  # User or system that caused the event
    org_id: Optional[str] = None
    project_id: Optional[str] = None
    details: dict = field(default_factory=dict)
    
    def to_dict(self) -> dict:
        return {
            "event_id": str(self.event_id),
            "event_type": self.event_type.value,
            "timestamp": self.timestamp.isoformat(),
            "actor_id": self.actor_id,
            "org_id": self.org_id,
            "project_id": self.project_id,
            "details": self.details,
        }


class OpsAuditLog:
    """
    Append-only operational audit log.
    
    This log tracks OPERATIONAL changes, not decision data.
    It is separate from decision records by design.
    """
    
    def __init__(self):
        self._events: List[AuditEvent] = []
    
    def log(
        self,
        event_type: AuditEventType,
        actor_id: str,
        org_id: Optional[str] = None,
        project_id: Optional[str] = None,
        **details
    ) -> AuditEvent:
        """Log an operational event. Append-only."""
        event = AuditEvent(
            event_id=uuid4(),
            event_type=event_type,
            timestamp=datetime.now(timezone.utc),
            actor_id=actor_id,
            org_id=org_id,
            project_id=project_id,
            details=details
        )
        
        self._events.append(event)
        return event
    
    def get_events(
        self,
        org_id: Optional[str] = None,
        event_type: Optional[AuditEventType] = None,
        since: Optional[datetime] = None,
        limit: int = 100
    ) -> List[AuditEvent]:
        """Query events (read-only)."""
        events = self._events
        
        if org_id:
            events = [e for e in events if e.org_id == org_id]
        
        if event_type:
            events = [e for e in events if e.event_type == event_type]
        
        if since:
            events = [e for e in events if e.timestamp >= since]
        
        return events[-limit:]
    
    def export(self, org_id: Optional[str] = None) -> List[dict]:
        """Export events for compliance (read-only)."""
        events = self.get_events(org_id=org_id, limit=10000)
        return [e.to_dict() for e in events]


# ============================================================
# Global Instance
# ============================================================

_audit_log: Optional[OpsAuditLog] = None


def get_ops_audit_log() -> OpsAuditLog:
    """Get or create the ops audit log."""
    global _audit_log
    if _audit_log is None:
        _audit_log = OpsAuditLog()
    return _audit_log


# ============================================================
# Convenience Functions
# ============================================================

def log_key_created(actor_id: str, org_id: str, project_id: str, key_name: str) -> None:
    get_ops_audit_log().log(
        AuditEventType.KEY_CREATED,
        actor_id, org_id, project_id,
        key_name=key_name
    )


def log_key_revoked(actor_id: str, org_id: str, project_id: str, key_id: str) -> None:
    get_ops_audit_log().log(
        AuditEventType.KEY_REVOKED,
        actor_id, org_id, project_id,
        key_id=key_id
    )


def log_org_frozen(actor_id: str, org_id: str, reason: str) -> None:
    get_ops_audit_log().log(
        AuditEventType.ORG_FROZEN,
        actor_id, org_id,
        reason=reason
    )


def log_incident_declared(actor_id: str, incident_id: str, severity: str) -> None:
    get_ops_audit_log().log(
        AuditEventType.INCIDENT_DECLARED,
        actor_id,
        incident_id=incident_id,
        severity=severity
    )
