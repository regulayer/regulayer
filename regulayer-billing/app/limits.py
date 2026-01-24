"""
Regulayer Billing - Limit Enforcement

Enforce plan limits without touching cryptographic truth.

CORE PRINCIPLE:
- Billing limits access, never facts
- Recorder NEVER sees billing state
"""

from enum import Enum
from typing import Optional
from dataclasses import dataclass
from uuid import UUID

from .plans import PlanTier, get_plan_limits, is_unlimited


class LimitResult(str, Enum):
    """Result of a limit check."""
    ALLOWED = "allowed"
    SOFT_LIMIT = "soft_limit"   # Warn but allow
    HARD_LIMIT = "hard_limit"   # Block
    FROZEN = "frozen"           # Org frozen for non-payment


@dataclass
class LimitCheckResult:
    """Result of checking a limit."""
    result: LimitResult
    limit_value: int
    current_value: int
    message: str


class LimitEnforcer:
    """
    Enforces plan limits.
    
    Called by gateway before ingestion.
    NEVER called by recorder.
    """
    
    def __init__(self):
        # In production, this would query org state
        self._org_plans: dict[str, PlanTier] = {}
        self._org_frozen: set[str] = set()
        self._org_usage: dict[str, dict] = {}
    
    def set_org_plan(self, org_id: UUID, plan: PlanTier) -> None:
        """Set plan for an organization."""
        self._org_plans[str(org_id)] = plan
    
    def get_org_plan(self, org_id: UUID) -> PlanTier:
        """Get plan for an organization."""
        return self._org_plans.get(str(org_id), PlanTier.FREE)
    
    def freeze_org(self, org_id: UUID) -> None:
        """Freeze an organization for non-payment."""
        self._org_frozen.add(str(org_id))
    
    def unfreeze_org(self, org_id: UUID) -> None:
        """Unfreeze an organization after payment."""
        self._org_frozen.discard(str(org_id))
    
    def is_frozen(self, org_id: UUID) -> bool:
        """Check if org is frozen."""
        return str(org_id) in self._org_frozen
    
    def record_usage(
        self,
        org_id: UUID,
        project_id: UUID,
        metric: str,
        count: int = 1
    ) -> None:
        """Record usage for a project."""
        key = str(org_id)
        if key not in self._org_usage:
            self._org_usage[key] = {}
        
        if metric not in self._org_usage[key]:
            self._org_usage[key][metric] = 0
        
        self._org_usage[key][metric] += count
    
    def get_usage(self, org_id: UUID, metric: str) -> int:
        """Get current usage for a metric."""
        key = str(org_id)
        return self._org_usage.get(key, {}).get(metric, 0)
    
    def check_decision_limit(
        self,
        org_id: UUID,
        project_id: UUID
    ) -> LimitCheckResult:
        """
        Check if a decision can be ingested.
        
        Called by gateway before forwarding.
        """
        # Check frozen first
        if self.is_frozen(org_id):
            return LimitCheckResult(
                result=LimitResult.FROZEN,
                limit_value=0,
                current_value=0,
                message="Organization is frozen. Please update payment method."
            )
        
        # Get plan limits
        plan = self.get_org_plan(org_id)
        limits = get_plan_limits(plan)
        
        # Check daily limit
        current_daily = self.get_usage(org_id, "decisions_daily")
        
        if not is_unlimited(limits.decisions_per_day):
            # Soft limit at 80%
            soft_threshold = int(limits.decisions_per_day * 0.8)
            
            if current_daily >= limits.decisions_per_day:
                return LimitCheckResult(
                    result=LimitResult.HARD_LIMIT,
                    limit_value=limits.decisions_per_day,
                    current_value=current_daily,
                    message=f"Daily limit of {limits.decisions_per_day} decisions reached."
                )
            
            if current_daily >= soft_threshold:
                return LimitCheckResult(
                    result=LimitResult.SOFT_LIMIT,
                    limit_value=limits.decisions_per_day,
                    current_value=current_daily,
                    message=f"Approaching daily limit ({current_daily}/{limits.decisions_per_day})."
                )
        
        return LimitCheckResult(
            result=LimitResult.ALLOWED,
            limit_value=limits.decisions_per_day,
            current_value=current_daily,
            message="OK"
        )
    
    def check_project_limit(self, org_id: UUID) -> LimitCheckResult:
        """Check if a new project can be created."""
        if self.is_frozen(org_id):
            return LimitCheckResult(
                result=LimitResult.FROZEN,
                limit_value=0,
                current_value=0,
                message="Organization is frozen."
            )
        
        plan = self.get_org_plan(org_id)
        limits = get_plan_limits(plan)
        
        current_projects = self.get_usage(org_id, "projects")
        
        if not is_unlimited(limits.max_projects):
            if current_projects >= limits.max_projects:
                return LimitCheckResult(
                    result=LimitResult.HARD_LIMIT,
                    limit_value=limits.max_projects,
                    current_value=current_projects,
                    message=f"Project limit ({limits.max_projects}) reached. Upgrade to create more."
                )
        
        return LimitCheckResult(
            result=LimitResult.ALLOWED,
            limit_value=limits.max_projects,
            current_value=current_projects,
            message="OK"
        )
    
    def check_feature_access(
        self,
        org_id: UUID,
        feature: str
    ) -> bool:
        """Check if org has access to a feature."""
        plan = self.get_org_plan(org_id)
        limits = get_plan_limits(plan)
        
        feature_map = {
            "attestation": limits.attestation_enabled,
            "async_ingestion": limits.async_ingestion,
            "governance": limits.governance_enabled,
            "custom_sla": limits.custom_sla,
            "dedicated_queue": limits.dedicated_queue,
        }
        
        return feature_map.get(feature, False)


# ============================================================
# Global Instance
# ============================================================

_enforcer: Optional[LimitEnforcer] = None


def get_limit_enforcer() -> LimitEnforcer:
    """Get or create the global limit enforcer."""
    global _enforcer
    
    if _enforcer is None:
        _enforcer = LimitEnforcer()
    
    return _enforcer
