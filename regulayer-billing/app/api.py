"""
Regulayer Billing - API

Billing endpoints for plan management and usage.
"""

from typing import List, Optional
from uuid import UUID
from datetime import date

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel

from .config import settings
from .plans import PlanTier, Plan, get_plan, get_all_plans
from .limits import get_limit_enforcer, LimitResult
from .usage import get_usage_meter, UsageSummary
from .invoices import get_stripe_service
from .webhooks import get_webhook_handler


app = FastAPI(
    title="Regulayer Billing",
    description="Billing, usage, and plan management",
    version="1.0.0"
)


# ============================================================
# Response Models
# ============================================================

class PlanResponse(BaseModel):
    tier: str
    name: str
    description: str
    max_projects: int
    decisions_per_day: int
    price_monthly_cents: int
    features: List[str]


class UsageResponse(BaseModel):
    org_id: str
    period_start: date
    period_end: date
    decisions_ingested: int
    attested_decisions: int
    proof_exports: int
    governance_actions: int


class LimitCheckResponse(BaseModel):
    allowed: bool
    result: str
    limit_value: int
    current_value: int
    message: str


# ============================================================
# Plan Endpoints
# ============================================================

@app.get("/v1/plans", response_model=List[PlanResponse], tags=["plans"])
async def list_plans() -> List[PlanResponse]:
    """List all available plans."""
    plans = get_all_plans()
    
    return [
        PlanResponse(
            tier=p.tier.value,
            name=p.name,
            description=p.description,
            max_projects=p.limits.max_projects,
            decisions_per_day=p.limits.decisions_per_day,
            price_monthly_cents=p.price_monthly_cents,
            features=[
                f for f, v in [
                    ("attestation", p.limits.attestation_enabled),
                    ("async_ingestion", p.limits.async_ingestion),
                    ("governance", p.limits.governance_enabled),
                    ("custom_sla", p.limits.custom_sla),
                    ("dedicated_queue", p.limits.dedicated_queue),
                ]
                if v
            ]
        )
        for p in plans
    ]


@app.get("/v1/plans/{tier}", response_model=PlanResponse, tags=["plans"])
async def get_plan_details(tier: PlanTier) -> PlanResponse:
    """Get details for a specific plan."""
    p = get_plan(tier)
    
    return PlanResponse(
        tier=p.tier.value,
        name=p.name,
        description=p.description,
        max_projects=p.limits.max_projects,
        decisions_per_day=p.limits.decisions_per_day,
        price_monthly_cents=p.price_monthly_cents,
        features=[
            f for f, v in [
                ("attestation", p.limits.attestation_enabled),
                ("async_ingestion", p.limits.async_ingestion),
                ("governance", p.limits.governance_enabled),
            ]
            if v
        ]
    )


# ============================================================
# Usage Endpoints
# ============================================================

@app.get("/v1/usage/{org_id}", response_model=UsageResponse, tags=["usage"])
async def get_usage(org_id: UUID) -> UsageResponse:
    """Get usage summary for an organization."""
    meter = get_usage_meter()
    summary = meter.get_summary(org_id)
    
    return UsageResponse(
        org_id=str(summary.org_id),
        period_start=summary.period_start,
        period_end=summary.period_end,
        decisions_ingested=summary.decisions_ingested,
        attested_decisions=summary.attested_decisions,
        proof_exports=summary.proof_exports,
        governance_actions=summary.governance_actions
    )


# ============================================================
# Limit Check Endpoints
# ============================================================

@app.get("/v1/limits/check/decision", response_model=LimitCheckResponse, tags=["limits"])
async def check_decision_limit(org_id: UUID, project_id: UUID) -> LimitCheckResponse:
    """
    Check if a decision can be ingested.
    
    Called by gateway before forwarding.
    """
    enforcer = get_limit_enforcer()
    result = enforcer.check_decision_limit(org_id, project_id)
    
    return LimitCheckResponse(
        allowed=result.result == LimitResult.ALLOWED,
        result=result.result.value,
        limit_value=result.limit_value,
        current_value=result.current_value,
        message=result.message
    )


@app.get("/v1/limits/check/project", response_model=LimitCheckResponse, tags=["limits"])
async def check_project_limit(org_id: UUID) -> LimitCheckResponse:
    """Check if a new project can be created."""
    enforcer = get_limit_enforcer()
    result = enforcer.check_project_limit(org_id)
    
    return LimitCheckResponse(
        allowed=result.result == LimitResult.ALLOWED,
        result=result.result.value,
        limit_value=result.limit_value,
        current_value=result.current_value,
        message=result.message
    )


# ============================================================
# Subscription Endpoints
# ============================================================

class SubscribeRequest(BaseModel):
    org_id: UUID
    plan: PlanTier
    email: str
    name: str


@app.post("/v1/subscriptions", tags=["subscriptions"])
async def create_subscription(request: SubscribeRequest) -> dict:
    """Create a subscription for an organization."""
    stripe = get_stripe_service()
    
    # Create customer
    customer_id = await stripe.create_customer(
        request.org_id,
        request.email,
        request.name
    )
    
    if not customer_id:
        raise HTTPException(status_code=400, detail="Failed to create customer")
    
    # Create subscription
    sub_id = await stripe.create_subscription(request.org_id, request.plan)
    
    if not sub_id:
        raise HTTPException(status_code=400, detail="Failed to create subscription")
    
    # Update limits
    enforcer = get_limit_enforcer()
    enforcer.set_org_plan(request.org_id, request.plan)
    
    return {
        "status": "subscription_created",
        "subscription_id": sub_id,
        "plan": request.plan.value
    }


@app.delete("/v1/subscriptions/{org_id}", tags=["subscriptions"])
async def cancel_subscription(org_id: UUID) -> dict:
    """Cancel a subscription."""
    stripe = get_stripe_service()
    success = await stripe.cancel_subscription(org_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Downgrade to free
    enforcer = get_limit_enforcer()
    enforcer.set_org_plan(org_id, PlanTier.FREE)
    
    return {"status": "subscription_canceled"}


# ============================================================
# Webhook Endpoint
# ============================================================

@app.post("/v1/webhooks/stripe", tags=["webhooks"])
async def stripe_webhook(request: Request) -> dict:
    """
    Handle Stripe webhook events.
    
    Stripe failures NEVER affect existing proofs.
    """
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    
    handler = get_webhook_handler()
    
    if not await handler.verify_signature(body, signature):
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    import json
    event = json.loads(body)
    
    result = await handler.handle_event(
        event.get("type"),
        event.get("data", {}).get("object", {})
    )
    
    return result


# ============================================================
# Health Check
# ============================================================

@app.get("/health", tags=["system"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "billing"}
