"""
Regulayer Incident - Disclosure Generator

Produces immutable disclosure documents for regulators.

No opinions. No marketing. No remediation promises.
Just facts about what is and isn't affected.
"""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid4

from .models import (
    DisclosureDocument,
    IncidentRecord,
    TrustStatus
)
from .registry import incident_registry
from .impact import trust_resolver


class DisclosureGenerator:
    """
    Generates regulator-facing disclosure documents.
    
    These documents are designed to be:
    - Factual (no opinions)
    - Complete (all affected evidence listed)
    - Precise (clear trust status)
    - Legal-ready (established boundaries)
    """
    
    def generate_disclosure(
        self,
        incident_id: UUID,
        affected_decision_ids: Optional[List[UUID]] = None,
        affected_decision_times: Optional[List[datetime]] = None
    ) -> DisclosureDocument:
        """
        Generate a disclosure document for an incident.
        
        If affected decisions are provided, includes specific impact analysis.
        """
        incident = incident_registry.get_incident(incident_id)
        if not incident:
            raise ValueError(f"Incident {incident_id} not found")
        
        # Analyze affected decisions if provided
        trust_summary = {
            "trusted": 0,
            "degraded": 0,
            "untrusted": 0,
            "out_of_scope": 0
        }
        
        what_remains_valid = []
        what_is_caveated = []
        what_is_invalid = []
        
        if affected_decision_ids and affected_decision_times:
            for decision_id, decision_time in zip(
                affected_decision_ids, affected_decision_times
            ):
                evaluation = trust_resolver.resolve_trust_status(
                    decision_id, decision_time
                )
                trust_summary[evaluation.trust_status.value] += 1
                
                if evaluation.trust_status == TrustStatus.TRUSTED:
                    what_remains_valid.append(str(decision_id))
                elif evaluation.trust_status == TrustStatus.DEGRADED:
                    what_is_caveated.append(str(decision_id))
                elif evaluation.trust_status == TrustStatus.UNTRUSTED:
                    what_is_invalid.append(str(decision_id))
        
        # Build disclosure
        return DisclosureDocument(
            disclosure_version="1.0.0",
            disclosure_id=uuid4(),
            generated_at=datetime.now(timezone.utc),
            incident_id=incident_id,
            incident_severity=incident.severity,
            incident_title=incident.title,
            affected_evidence_count=len(affected_decision_ids or []),
            affected_time_range=incident.affected_time_range,
            trust_status_summary=trust_summary,
            what_remains_valid=what_remains_valid,
            what_is_caveated=what_is_caveated,
            what_is_invalid=what_is_invalid,
            statement=self._generate_statement(incident)
        )
    
    def _generate_statement(self, incident: IncidentRecord) -> str:
        """Generate the legal statement for the disclosure."""
        base_statement = (
            "This disclosure does not invalidate unaffected records. "
            "Affected records retain cryptographic integrity but trust context is caveated. "
        )
        
        if incident.severity.value == "critical":
            return base_statement + (
                "Due to the critical severity of this incident, independent verification "
                "is strongly recommended for all affected evidence."
            )
        elif incident.severity.value == "high":
            return base_statement + (
                "Review affected evidence with additional scrutiny. "
                "Cryptographic proofs remain mathematically valid."
            )
        else:
            return base_statement + (
                "This incident has limited impact. "
                "Unaffected evidence remains fully trusted."
            )
    
    def generate_summary_disclosure(
        self,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None
    ) -> dict:
        """
        Generate a summary of all incidents in a time period.
        
        Useful for periodic regulatory reporting.
        """
        incidents = incident_registry.get_all_incidents()
        
        # Filter by date if specified
        if from_date or to_date:
            filtered = []
            for incident in incidents:
                if from_date and incident.declared_at < from_date:
                    continue
                if to_date and incident.declared_at > to_date:
                    continue
                filtered.append(incident)
            incidents = filtered
        
        return {
            "summary_version": "1.0.0",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "period": {
                "from": from_date.isoformat() if from_date else None,
                "to": to_date.isoformat() if to_date else None
            },
            "incident_count": len(incidents),
            "by_severity": {
                "critical": sum(1 for i in incidents if i.severity.value == "critical"),
                "high": sum(1 for i in incidents if i.severity.value == "high"),
                "medium": sum(1 for i in incidents if i.severity.value == "medium"),
                "low": sum(1 for i in incidents if i.severity.value == "low"),
            },
            "active_incidents": len([i for i in incidents if i.status.value == "active"]),
            "statement": (
                "This summary is for informational purposes. "
                "For detailed impact analysis, request individual disclosure documents."
            )
        }


# Global generator instance
disclosure_generator = DisclosureGenerator()
