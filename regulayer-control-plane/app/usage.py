"""
Regulayer Control Plane - Usage Metering

Track usage for billing purposes.
Read-only metrics - no billing logic yet.
"""

from datetime import datetime, timezone, date
from typing import Optional, List
from uuid import UUID, uuid4
from dataclasses import dataclass

from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func

from .storage import UsageMeterDB, UsageEventDB


@dataclass
class UsageSummary:
    """Usage summary for a project."""
    project_id: UUID
    period_start: date
    period_end: date
    decisions_ingested: int
    proofs_exported: int
    reports_generated: int
    api_calls: int


class UsageMeteringService:
    """
    Track and report usage metrics.
    
    This provides the foundation for billing without implementing pricing.
    """
    
    def __init__(self, db: DBSession):
        self.db = db
    
    def record_event(
        self,
        project_id: UUID,
        event_type: str,
        count: int = 1,
        metadata: Optional[dict] = None
    ) -> None:
        """
        Record a usage event.
        
        Event types:
        - decision_ingested
        - proof_exported
        - report_generated
        - api_call
        """
        event = UsageEventDB(
            id=uuid4(),
            project_id=project_id,
            event_type=event_type,
            count=count,
            recorded_at=datetime.now(timezone.utc),
            metadata=metadata or {}
        )
        
        self.db.add(event)
        self.db.commit()
    
    def get_usage_summary(
        self,
        project_id: UUID,
        period_start: date,
        period_end: date
    ) -> UsageSummary:
        """Get usage summary for a project in a date range."""
        
        # Query events in range
        events = self.db.query(
            UsageEventDB.event_type,
            func.sum(UsageEventDB.count).label("total")
        ).filter(
            UsageEventDB.project_id == project_id,
            func.date(UsageEventDB.recorded_at) >= period_start,
            func.date(UsageEventDB.recorded_at) <= period_end
        ).group_by(UsageEventDB.event_type).all()
        
        # Build summary
        totals = {e.event_type: e.total for e in events}
        
        return UsageSummary(
            project_id=project_id,
            period_start=period_start,
            period_end=period_end,
            decisions_ingested=totals.get("decision_ingested", 0),
            proofs_exported=totals.get("proof_exported", 0),
            reports_generated=totals.get("report_generated", 0),
            api_calls=totals.get("api_call", 0)
        )
    
    def get_current_month_usage(self, project_id: UUID) -> UsageSummary:
        """Get usage for the current billing month."""
        today = date.today()
        period_start = today.replace(day=1)
        
        # Last day of month
        if today.month == 12:
            period_end = today.replace(year=today.year + 1, month=1, day=1)
        else:
            period_end = today.replace(month=today.month + 1, day=1)
        
        return self.get_usage_summary(project_id, period_start, period_end)
    
    def get_org_usage(
        self,
        organization_id: UUID,
        period_start: date,
        period_end: date
    ) -> List[UsageSummary]:
        """Get usage for all projects in an organization."""
        from .storage import ProjectDB
        
        projects = self.db.query(ProjectDB).filter(
            ProjectDB.organization_id == organization_id
        ).all()
        
        return [
            self.get_usage_summary(p.id, period_start, period_end)
            for p in projects
        ]


# ============================================================
# Usage Recording Helpers
# ============================================================

def record_decision_ingested(db: DBSession, project_id: UUID) -> None:
    """Record a decision ingestion event."""
    UsageMeteringService(db).record_event(project_id, "decision_ingested")


def record_proof_exported(db: DBSession, project_id: UUID) -> None:
    """Record a proof export event."""
    UsageMeteringService(db).record_event(project_id, "proof_exported")


def record_report_generated(db: DBSession, project_id: UUID) -> None:
    """Record a report generation event."""
    UsageMeteringService(db).record_event(project_id, "report_generated")


def record_api_call(db: DBSession, project_id: UUID) -> None:
    """Record an API call event."""
    UsageMeteringService(db).record_event(project_id, "api_call")
