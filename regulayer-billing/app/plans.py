"""
Regulayer Billing - Plan Definitions

Plans are DATA, not code.

CORE PRINCIPLE:
Money controls access, never facts.
"""

from enum import Enum
from typing import Dict, Optional
from dataclasses import dataclass


class PlanTier(str, Enum):
    """Available plan tiers."""
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


@dataclass
class PlanLimits:
    """Limits for a plan tier."""
    max_projects: int
    decisions_per_day: int
    decisions_per_month: int
    attestation_enabled: bool
    async_ingestion: bool
    governance_enabled: bool
    custom_sla: bool
    dedicated_queue: bool
    support_level: str  # "community", "email", "priority", "dedicated"


@dataclass
class Plan:
    """Complete plan definition."""
    tier: PlanTier
    name: str
    description: str
    limits: PlanLimits
    price_monthly_cents: int  # 0 for free, in cents
    stripe_price_id: Optional[str] = None


# ============================================================
# Plan Definitions
# ============================================================

PLANS: Dict[PlanTier, Plan] = {
    
    PlanTier.FREE: Plan(
        tier=PlanTier.FREE,
        name="Free",
        description="For evaluation and small projects",
        limits=PlanLimits(
            max_projects=1,
            decisions_per_day=1000,
            decisions_per_month=1000,
            attestation_enabled=False,
            async_ingestion=False,
            governance_enabled=False,
            custom_sla=False,
            dedicated_queue=False,
            support_level="community",
        ),
        price_monthly_cents=0,
    ),
    
    PlanTier.PRO: Plan(
        tier=PlanTier.PRO,
        name="Pro",
        description="For production workloads",
        limits=PlanLimits(
            max_projects=5,
            decisions_per_day=100000,
            decisions_per_month=1000000,
            attestation_enabled=True,
            async_ingestion=True,
            governance_enabled=True,
            custom_sla=False,
            dedicated_queue=False,
            support_level="email",
        ),
        price_monthly_cents=29900,  # $299/mo
    ),
    
    PlanTier.ENTERPRISE: Plan(
        tier=PlanTier.ENTERPRISE,
        name="Enterprise",
        description="For large organizations with custom needs",
        limits=PlanLimits(
            max_projects=-1,  # Unlimited
            decisions_per_day=-1,  # Unlimited
            decisions_per_month=-1,  # Unlimited
            attestation_enabled=True,
            async_ingestion=True,
            governance_enabled=True,
            custom_sla=True,
            dedicated_queue=True,
            support_level="dedicated",
        ),
        price_monthly_cents=0,  # Custom pricing
    ),
}


# ============================================================
# Plan Access
# ============================================================

def get_plan(tier: PlanTier) -> Plan:
    """Get plan by tier."""
    return PLANS[tier]


def get_plan_limits(tier: PlanTier) -> PlanLimits:
    """Get limits for a plan tier."""
    return PLANS[tier].limits


def is_unlimited(value: int) -> bool:
    """Check if a limit value means unlimited."""
    return value < 0


def get_all_plans() -> list[Plan]:
    """Get all available plans."""
    return list(PLANS.values())
