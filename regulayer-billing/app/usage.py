"""
Regulayer Billing - Usage Metering

Track billable usage metrics.

WHAT GETS METERED:
- Decisions ingested (primary value metric)
- Attested decisions (premium feature)
- Proof exports (compliance-heavy)
- Governance actions (enterprise add-on)

NEVER METER:
- Hash verification
- Offline proof verification
- Internal audits
"""

from datetime import datetime, timezone, date
from typing import Dict, List, Optional
from uuid import UUID
from dataclasses import dataclass, field


@dataclass
class UsageRecord:
    """Single usage record."""
    org_id: UUID
    project_id: UUID
    metric: str
    count: int
    recorded_at: datetime


@dataclass
class UsageSummary:
    """Usage summary for billing period."""
    org_id: UUID
    period_start: date
    period_end: date
    decisions_ingested: int = 0
    attested_decisions: int = 0
    proof_exports: int = 0
    governance_actions: int = 0
    queue_peak_backlog: int = 0


class UsageMeter:
    """
    Tracks usage for billing purposes.
    
    This is a read-only observer from the perspective of the recorder.
    """
    
    def __init__(self):
        self._records: List[UsageRecord] = []
        self._daily_totals: Dict[str, Dict[str, int]] = {}
        self._monthly_totals: Dict[str, Dict[str, int]] = {}
    
    def _daily_key(self, org_id: UUID) -> str:
        """Get daily key for org."""
        return f"{org_id}:{date.today().isoformat()}"
    
    def _monthly_key(self, org_id: UUID) -> str:
        """Get monthly key for org."""
        today = date.today()
        return f"{org_id}:{today.year}-{today.month:02d}"
    
    def record(
        self,
        org_id: UUID,
        project_id: UUID,
        metric: str,
        count: int = 1
    ) -> None:
        """Record a usage event."""
        record = UsageRecord(
            org_id=org_id,
            project_id=project_id,
            metric=metric,
            count=count,
            recorded_at=datetime.now(timezone.utc)
        )
        
        self._records.append(record)
        
        # Update daily total
        daily_key = self._daily_key(org_id)
        if daily_key not in self._daily_totals:
            self._daily_totals[daily_key] = {}
        self._daily_totals[daily_key][metric] = \
            self._daily_totals[daily_key].get(metric, 0) + count
        
        # Update monthly total
        monthly_key = self._monthly_key(org_id)
        if monthly_key not in self._monthly_totals:
            self._monthly_totals[monthly_key] = {}
        self._monthly_totals[monthly_key][metric] = \
            self._monthly_totals[monthly_key].get(metric, 0) + count
    
    def get_daily_usage(self, org_id: UUID, metric: str) -> int:
        """Get daily usage for a metric."""
        daily_key = self._daily_key(org_id)
        return self._daily_totals.get(daily_key, {}).get(metric, 0)
    
    def get_monthly_usage(self, org_id: UUID, metric: str) -> int:
        """Get monthly usage for a metric."""
        monthly_key = self._monthly_key(org_id)
        return self._monthly_totals.get(monthly_key, {}).get(metric, 0)
    
    def get_summary(self, org_id: UUID) -> UsageSummary:
        """Get usage summary for current billing period."""
        today = date.today()
        period_start = today.replace(day=1)
        
        return UsageSummary(
            org_id=org_id,
            period_start=period_start,
            period_end=today,
            decisions_ingested=self.get_monthly_usage(org_id, "decision_ingested"),
            attested_decisions=self.get_monthly_usage(org_id, "decision_attested"),
            proof_exports=self.get_monthly_usage(org_id, "proof_exported"),
            governance_actions=self.get_monthly_usage(org_id, "governance_action"),
            queue_peak_backlog=self.get_monthly_usage(org_id, "queue_peak"),
        )
    
    def reset_daily(self) -> None:
        """Reset daily totals (call at midnight UTC)."""
        today = date.today().isoformat()
        
        keys_to_remove = [
            k for k in self._daily_totals.keys()
            if not k.endswith(today)
        ]
        
        for key in keys_to_remove:
            del self._daily_totals[key]


# ============================================================
# Global Instance
# ============================================================

_meter: Optional[UsageMeter] = None


def get_usage_meter() -> UsageMeter:
    """Get or create the global usage meter."""
    global _meter
    
    if _meter is None:
        _meter = UsageMeter()
    
    return _meter


# ============================================================
# Convenience Functions
# ============================================================

def record_decision_ingested(org_id: UUID, project_id: UUID) -> None:
    """Record a decision ingestion."""
    get_usage_meter().record(org_id, project_id, "decision_ingested")


def record_decision_attested(org_id: UUID, project_id: UUID) -> None:
    """Record an attested decision."""
    get_usage_meter().record(org_id, project_id, "decision_attested")


def record_proof_exported(org_id: UUID, project_id: UUID) -> None:
    """Record a proof export."""
    get_usage_meter().record(org_id, project_id, "proof_exported")


def record_governance_action(org_id: UUID, project_id: UUID) -> None:
    """Record a governance action."""
    get_usage_meter().record(org_id, project_id, "governance_action")
