"""
Regulayer Billing - Stripe Integration

Stripe invoice and subscription management.

STRIPE ISOLATION RULES:
- Stripe NEVER talks to Recorder
- Stripe NEVER talks to Gateway
- Only Control Plane & Billing service interact with Stripe
- Stripe failures do NOT affect existing proofs
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any
from uuid import UUID
from dataclasses import dataclass

from .plans import PlanTier
from .config import settings


@dataclass
class StripeCustomer:
    """Stripe customer reference."""
    org_id: UUID
    stripe_customer_id: str
    email: str
    created_at: datetime


@dataclass
class Subscription:
    """Subscription information."""
    org_id: UUID
    stripe_subscription_id: str
    plan: PlanTier
    status: str  # active, past_due, canceled, etc.
    current_period_start: datetime
    current_period_end: datetime


@dataclass
class Invoice:
    """Invoice information."""
    invoice_id: str
    org_id: UUID
    amount_cents: int
    currency: str
    status: str  # draft, open, paid, void
    created_at: datetime
    paid_at: Optional[datetime] = None


class StripeService:
    """
    Stripe integration service.
    
    Handles customer, subscription, and invoice management.
    """
    
    def __init__(self):
        self._customers: Dict[str, StripeCustomer] = {}
        self._subscriptions: Dict[str, Subscription] = {}
        self._invoices: list[Invoice] = []
        self._stripe_initialized = False
    
    def _init_stripe(self) -> None:
        """Initialize Stripe client."""
        if not self._stripe_initialized and settings.stripe_secret_key:
            try:
                import stripe
                stripe.api_key = settings.stripe_secret_key
                self._stripe_initialized = True
            except ImportError:
                pass  # Stripe not installed
    
    async def create_customer(
        self,
        org_id: UUID,
        email: str,
        name: str
    ) -> Optional[str]:
        """Create a Stripe customer."""
        self._init_stripe()
        
        if not self._stripe_initialized:
            # Stub mode
            customer_id = f"cus_stub_{org_id}"
            self._customers[str(org_id)] = StripeCustomer(
                org_id=org_id,
                stripe_customer_id=customer_id,
                email=email,
                created_at=datetime.now(timezone.utc)
            )
            return customer_id
        
        try:
            import stripe
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata={"org_id": str(org_id)}
            )
            
            self._customers[str(org_id)] = StripeCustomer(
                org_id=org_id,
                stripe_customer_id=customer.id,
                email=email,
                created_at=datetime.now(timezone.utc)
            )
            
            return customer.id
            
        except Exception as e:
            return None
    
    async def create_subscription(
        self,
        org_id: UUID,
        plan: PlanTier
    ) -> Optional[str]:
        """Create a subscription for an org."""
        self._init_stripe()
        
        customer = self._customers.get(str(org_id))
        if not customer:
            return None
        
        if not self._stripe_initialized:
            # Stub mode
            sub_id = f"sub_stub_{org_id}"
            now = datetime.now(timezone.utc)
            self._subscriptions[str(org_id)] = Subscription(
                org_id=org_id,
                stripe_subscription_id=sub_id,
                plan=plan,
                status="active",
                current_period_start=now,
                current_period_end=now
            )
            return sub_id
        
        try:
            import stripe
            
            price_id = (
                settings.stripe_price_id_pro if plan == PlanTier.PRO
                else settings.stripe_price_id_enterprise
            )
            
            subscription = stripe.Subscription.create(
                customer=customer.stripe_customer_id,
                items=[{"price": price_id}],
                metadata={"org_id": str(org_id)}
            )
            
            return subscription.id
            
        except Exception as e:
            return None
    
    async def cancel_subscription(self, org_id: UUID) -> bool:
        """Cancel an org's subscription."""
        sub = self._subscriptions.get(str(org_id))
        if sub:
            sub.status = "canceled"
            return True
        return False
    
    async def get_subscription_status(self, org_id: UUID) -> Optional[str]:
        """Get current subscription status."""
        sub = self._subscriptions.get(str(org_id))
        return sub.status if sub else None
    
    def is_subscription_active(self, org_id: UUID) -> bool:
        """Check if subscription is active."""
        status = self._subscriptions.get(str(org_id))
        if status:
            return status.status in ["active", "trialing"]
        return False


# ============================================================
# Global Instance
# ============================================================

_stripe_service: Optional[StripeService] = None


def get_stripe_service() -> StripeService:
    """Get or create the global Stripe service."""
    global _stripe_service
    
    if _stripe_service is None:
        _stripe_service = StripeService()
    
    return _stripe_service
