"""
Regulayer Incident - Append-Only Registry

CRITICAL RULES:
- No updates
- No deletes
- New incidents are added
- Mitigations are new records, not edits
"""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid4

from .models import (
    IncidentRecord,
    IncidentMitigation,
    IncidentSeverity,
    IncidentStatus,
    TrustImpactScope
)


class IncidentRegistry:
    """
    Append-only registry of incidents.
    
    Incidents cannot be modified or deleted once declared.
    This ensures complete audit trail for regulators.
    """
    
    def __init__(self):
        self._incidents: List[IncidentRecord] = []
        self._mitigations: List[IncidentMitigation] = []
    
    def declare_incident(
        self,
        severity: IncidentSeverity,
        affected_scope: List[TrustImpactScope],
        title: str,
        description: str,
        affected_identities: Optional[List[str]] = None,
        affected_time_range: Optional[tuple] = None,
        declared_by: str = "security-team"
    ) -> IncidentRecord:
        """
        Declare a new incident.
        
        This is APPEND-ONLY. Once declared, cannot be modified.
        """
        incident = IncidentRecord(
            incident_id=uuid4(),
            declared_at=datetime.now(timezone.utc),
            severity=severity,
            status=IncidentStatus.ACTIVE,
            affected_scope=affected_scope,
            affected_identities=affected_identities,
            affected_time_range=affected_time_range,
            title=title,
            description=description,
            declared_by=declared_by
        )
        
        self._incidents.append(incident)
        return incident
    
    def record_mitigation(
        self,
        incident_id: UUID,
        new_status: IncidentStatus,
        description: str,
        residual_impact: Optional[str] = None
    ) -> IncidentMitigation:
        """
        Record a mitigation for an incident.
        
        Mitigations are NEW records, not edits to the original incident.
        This preserves the original incident declaration.
        """
        mitigation = IncidentMitigation(
            mitigation_id=uuid4(),
            incident_id=incident_id,
            mitigated_at=datetime.now(timezone.utc),
            new_status=new_status,
            mitigation_description=description,
            residual_impact=residual_impact
        )
        
        self._mitigations.append(mitigation)
        return mitigation
    
    def get_incident(self, incident_id: UUID) -> Optional[IncidentRecord]:
        """Get an incident by ID."""
        for incident in self._incidents:
            if incident.incident_id == incident_id:
                return incident
        return None
    
    def get_all_incidents(self) -> List[IncidentRecord]:
        """Get all incidents in order of declaration."""
        return list(self._incidents)
    
    def get_active_incidents(self) -> List[IncidentRecord]:
        """Get all active (unresolved) incidents."""
        # Check latest mitigation status for each incident
        active = []
        for incident in self._incidents:
            latest_status = self._get_current_status(incident.incident_id)
            if latest_status in [IncidentStatus.ACTIVE, IncidentStatus.MITIGATED]:
                active.append(incident)
        return active
    
    def get_mitigations(self, incident_id: UUID) -> List[IncidentMitigation]:
        """Get all mitigations for an incident."""
        return [m for m in self._mitigations if m.incident_id == incident_id]
    
    def _get_current_status(self, incident_id: UUID) -> IncidentStatus:
        """Get the current status of an incident."""
        mitigations = self.get_mitigations(incident_id)
        if not mitigations:
            incident = self.get_incident(incident_id)
            return incident.status if incident else IncidentStatus.ACTIVE
        
        # Return the latest mitigation status
        mitigations.sort(key=lambda m: m.mitigated_at, reverse=True)
        return mitigations[0].new_status
    
    def get_incidents_affecting_time(
        self,
        at_time: datetime
    ) -> List[IncidentRecord]:
        """Get all incidents that affect a specific time."""
        affecting = []
        for incident in self._incidents:
            if incident.affected_time_range:
                start, end = incident.affected_time_range
                if start <= at_time <= end:
                    affecting.append(incident)
        return affecting
    
    def get_incidents_affecting_identity(
        self,
        identity_id: str
    ) -> List[IncidentRecord]:
        """Get all incidents that affect a specific identity."""
        affecting = []
        for incident in self._incidents:
            if incident.affected_identities:
                if identity_id in incident.affected_identities:
                    affecting.append(incident)
        return affecting


# Global registry instance
incident_registry = IncidentRegistry()
