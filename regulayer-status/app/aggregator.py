"""
Regulayer Status - Aggregator

Aggregates health checks into system-wide status.
"""

import asyncio
from datetime import datetime, timezone
from typing import Dict, List

from .models import (
    ComponentHealth,
    ComponentStatus,
    SystemHealth,
    OverallStatus,
    OrgHealth
)
from .checks import get_health_checker


class StatusAggregator:
    """
    Aggregates component health into overall system status.
    """
    
    def __init__(self):
        self._cache: Dict[str, SystemHealth] = {}
        self._cache_ttl_seconds = 30
        self._last_check: datetime = None
    
    def _compute_overall_status(
        self,
        components: Dict[str, ComponentHealth]
    ) -> OverallStatus:
        """Compute overall status from components."""
        statuses = [c.status for c in components.values()]
        
        # Count by severity
        major_outages = sum(1 for s in statuses if s == ComponentStatus.MAJOR_OUTAGE)
        partial_outages = sum(1 for s in statuses if s == ComponentStatus.PARTIAL_OUTAGE)
        degraded = sum(1 for s in statuses if s == ComponentStatus.DEGRADED)
        
        total = len(statuses)
        
        # Critical services
        critical = ["ingestion", "recorder"]
        critical_down = any(
            components.get(c, ComponentHealth(c, ComponentStatus.OPERATIONAL)).status == ComponentStatus.MAJOR_OUTAGE
            for c in critical
        )
        
        if critical_down or major_outages > total / 2:
            return OverallStatus.MAJOR_OUTAGE
        
        if major_outages > 0 or partial_outages > 1:
            return OverallStatus.PARTIAL_OUTAGE
        
        if degraded > 0 or partial_outages > 0:
            return OverallStatus.DEGRADED
        
        return OverallStatus.OPERATIONAL
    
    async def get_system_health(self) -> SystemHealth:
        """Get current system health."""
        checker = get_health_checker()
        
        # Run all checks in parallel
        results = await asyncio.gather(
            checker.check_ingestion_gateway(),
            checker.check_recorder(),
            checker.check_control_plane(),
            checker.check_billing(),
            checker.check_verification(),
            return_exceptions=True
        )
        
        components = {}
        component_names = ["ingestion", "recorder", "control_plane", "billing", "verification"]
        
        for name, result in zip(component_names, results):
            if isinstance(result, Exception):
                components[name] = ComponentHealth(
                    name=name,
                    status=ComponentStatus.MAJOR_OUTAGE,
                    message=str(result)
                )
            else:
                components[name] = result
        
        overall = self._compute_overall_status(components)
        
        return SystemHealth(
            status=overall,
            components=components,
            last_updated=datetime.now(timezone.utc)
        )
    
    async def get_org_health(self, org_id: str) -> OrgHealth:
        """
        Get operational health for a specific organization.
        
        Shows operational metrics, NOT cryptographic internals.
        """
        # In production, this would query actual metrics
        return OrgHealth(
            org_id=org_id,
            ingestion_success_rate=99.8,
            queue_latency_ms=45.2,
            recorder_acceptance_rate=100.0,
            verification_failures=0,
            last_activity=datetime.now(timezone.utc)
        )


# ============================================================
# Global Instance
# ============================================================

_aggregator = None


def get_status_aggregator() -> StatusAggregator:
    """Get or create status aggregator."""
    global _aggregator
    if _aggregator is None:
        _aggregator = StatusAggregator()
    return _aggregator
