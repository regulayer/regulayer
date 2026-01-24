"""
Regulayer Billing - Stripe Webhooks

Handle Stripe webhook events.

STRIPE FAILURES:
- Do NOT affect existing proofs
- Only affect future ingestion
"""

import hmac
import hashlib
from typing import Optional, Dict, Any
from datetime import datetime, timezone

from fastapi import Request, HTTPException

from .config import settings
from .limits import get_limit_enforcer
from .plans import PlanTier


class WebhookHandler:
    """
    Handle Stripe webhook events.
    
    Events trigger billing state changes but NEVER affect crypto.
    """
    
    async def verify_signature(
        self,
        payload: bytes,
        signature: str
    ) -> bool:
        """Verify Stripe webhook signature."""
        if not settings.stripe_webhook_secret:
            return True  # Skip in stub mode
        
        try:
            import stripe
            stripe.Webhook.construct_event(
                payload,
                signature,
                settings.stripe_webhook_secret
            )
            return True
        except Exception:
            return False
    
    async def handle_event(self, event_type: str, data: Dict[str, Any]) -> dict:
        """
        Handle a Stripe webhook event.
        
        Returns result of handling.
        """
        handlers = {
            "customer.subscription.created": self._handle_subscription_created,
            "customer.subscription.updated": self._handle_subscription_updated,
            "customer.subscription.deleted": self._handle_subscription_deleted,
            "invoice.paid": self._handle_invoice_paid,
            "invoice.payment_failed": self._handle_payment_failed,
        }
        
        handler = handlers.get(event_type)
        if handler:
            return await handler(data)
        
        return {"handled": False, "event_type": event_type}
    
    async def _handle_subscription_created(self, data: Dict[str, Any]) -> dict:
        """Handle new subscription."""
        org_id = data.get("metadata", {}).get("org_id")
        
        if org_id:
            enforcer = get_limit_enforcer()
            # Determine plan from price ID
            plan = PlanTier.PRO  # Default to Pro
            enforcer.set_org_plan(org_id, plan)
            enforcer.unfreeze_org(org_id)
        
        return {"handled": True, "action": "subscription_activated"}
    
    async def _handle_subscription_updated(self, data: Dict[str, Any]) -> dict:
        """Handle subscription update."""
        org_id = data.get("metadata", {}).get("org_id")
        status = data.get("status")
        
        if org_id:
            enforcer = get_limit_enforcer()
            
            if status in ["active", "trialing"]:
                enforcer.unfreeze_org(org_id)
            elif status in ["past_due", "canceled", "unpaid"]:
                enforcer.freeze_org(org_id)
        
        return {"handled": True, "action": f"subscription_{status}"}
    
    async def _handle_subscription_deleted(self, data: Dict[str, Any]) -> dict:
        """Handle subscription cancellation."""
        org_id = data.get("metadata", {}).get("org_id")
        
        if org_id:
            enforcer = get_limit_enforcer()
            enforcer.set_org_plan(org_id, PlanTier.FREE)
            # Don't freeze - just downgrade
        
        return {"handled": True, "action": "subscription_canceled"}
    
    async def _handle_invoice_paid(self, data: Dict[str, Any]) -> dict:
        """Handle successful payment."""
        org_id = data.get("subscription_details", {}).get("metadata", {}).get("org_id")
        
        if org_id:
            enforcer = get_limit_enforcer()
            enforcer.unfreeze_org(org_id)
        
        return {"handled": True, "action": "payment_received"}
    
    async def _handle_payment_failed(self, data: Dict[str, Any]) -> dict:
        """
        Handle failed payment.
        
        CRITICAL: This does NOT affect existing proofs.
        Only prevents future ingestion.
        """
        org_id = data.get("subscription_details", {}).get("metadata", {}).get("org_id")
        
        if org_id:
            enforcer = get_limit_enforcer()
            enforcer.freeze_org(org_id)
            # Org is frozen - ingestion blocked
            # But proof verification, export still work
        
        return {"handled": True, "action": "org_frozen"}


# ============================================================
# Global Instance
# ============================================================

_webhook_handler: Optional[WebhookHandler] = None


def get_webhook_handler() -> WebhookHandler:
    """Get or create the global webhook handler."""
    global _webhook_handler
    
    if _webhook_handler is None:
        _webhook_handler = WebhookHandler()
    
    return _webhook_handler
