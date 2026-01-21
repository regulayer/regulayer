"""
Regulayer Incident - Trust Impact Resolution

Deterministically answers: "Is this decision affected by that incident?"

Rules:
- Time-bounded
- Scope-bounded
- Identity-bounded
"""

from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID

from .models import (
    TrustStatus,
    TrustEvaluation,
    IncidentRecord,
    TrustImpactScope
)
from .registry import incident_registry


class TrustImpactResolver:
    """
    Resolves trust status for decisions based on incidents.
    
    Determines if a decision's trust is affected by any declared incidents.
    """
    
    def resolve_trust_status(
        self,
        decision_id: UUID,
        decision_time: datetime,
        decision_identity: Optional[str] = None,
        decision_scope: Optional[List[TrustImpactScope]] = None
    ) -> TrustEvaluation:
        """
        Resolve the trust status for a decision.
        
        Returns:
            TrustEvaluation with status and affected incidents
        """
        affecting_incidents: List[UUID] = []
        
        # Check all active incidents
        for incident in incident_registry.get_all_incidents():
            if self._incident_affects_decision(
                incident,
                decision_time,
                decision_identity,
                decision_scope
            ):
                affecting_incidents.append(incident.incident_id)
        
        # Determine trust status
        if not affecting_incidents:
            trust_status = TrustStatus.TRUSTED
            impact_summary = None
        else:
            # Analyze severity of affecting incidents
            severities = [
                incident_registry.get_incident(iid).severity
                for iid in affecting_incidents
            ]
            
            if any(s.value == "critical" for s in severities):
                trust_status = TrustStatus.UNTRUSTED
                impact_summary = "Decision affected by critical incident. Evidence integrity may be compromised."
            elif any(s.value == "high" for s in severities):
                trust_status = TrustStatus.DEGRADED
                impact_summary = "Decision affected by high-severity incident. Trust context is caveated."
            else:
                trust_status = TrustStatus.DEGRADED
                impact_summary = "Decision affected by incident. Review disclosure for details."
        
        return TrustEvaluation(
            decision_id=decision_id,
            evaluated_at=datetime.now(timezone.utc),
            trust_status=trust_status,
            affecting_incidents=affecting_incidents,
            impact_summary=impact_summary,
            cryptographic_integrity=True,  # Incidents don't change crypto facts
            chain_integrity=True,
            attestation_valid=trust_status != TrustStatus.UNTRUSTED,
            governance_valid=True
        )
    
    def _incident_affects_decision(
        self,
        incident: IncidentRecord,
        decision_time: datetime,
        decision_identity: Optional[str],
        decision_scope: Optional[List[TrustImpactScope]]
    ) -> bool:
        """Check if an incident affects a specific decision."""
        
        # Check time range
        if incident.affected_time_range:
            start, end = incident.affected_time_range
            if not (start <= decision_time <= end):
                return False
        
        # Check identity
        if incident.affected_identities:
            if decision_identity and decision_identity not in incident.affected_identities:
                return False
        
        # Check scope overlap
        if decision_scope:
            if not any(s in incident.affected_scope for s in decision_scope):
                return False
        
        return True
    
    def get_trust_summary(
        self,
        decision_ids: List[UUID],
        decision_times: List[datetime]
    ) -> dict:
        """
        Get summary of trust status for multiple decisions.
        
        Returns counts by trust status.
        """
        summary = {
            TrustStatus.TRUSTED: 0,
            TrustStatus.DEGRADED: 0,
            TrustStatus.UNTRUSTED: 0,
            TrustStatus.OUT_OF_SCOPE: 0
        }
        
        for decision_id, decision_time in zip(decision_ids, decision_times):
            evaluation = self.resolve_trust_status(decision_id, decision_time)
            summary[evaluation.trust_status] += 1
        
        return {k.value: v for k, v in summary.items()}


# Global resolver instance
trust_resolver = TrustImpactResolver()
