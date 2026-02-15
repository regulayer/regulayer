"""
Regulayer Control Plane - Billing Service

Handles Stripe integration for subscriptions and payments.
"""

import stripe
from typing import Optional
from uuid import UUID

from .config import settings
from .models import Organization, OrgStatus
from .storage import OrganizationDB, SessionLocal

# Initialize Stripe
stripe.api_key = settings.stripe_api_key

class BillingService:
    def __init__(self, db):
        self.db = db

    def create_checkout_session(self, org_id: UUID, plan_id: str, success_url: str, cancel_url: str) -> str:
        """
        Create a Stripe Checkout Session for subscription.
        Returns the checkout URL.
        """
        org = self.db.query(OrganizationDB).filter(OrganizationDB.id == org_id).first()
        if not org:
            raise ValueError("Organization not found")

        # Ensure Customer Exists
        if not org.stripe_customer_id and "mock" not in settings.stripe_api_key:
            try:
                # Get usage email (Owner)
                # We need to query UserDB to find owner email
                from .storage import UserDB
                from .enums import UserRole
                owner = self.db.query(UserDB).filter(
                    UserDB.organization_id == org_id,
                    UserDB.role == UserRole.OWNER
                ).first()
                email = owner.email if owner else "billing@example.com"

                customer = stripe.Customer.create(
                    email=email,
                    name=org.name,
                    metadata={"org_id": str(org.id)}
                )
                org.stripe_customer_id = customer.id
                self.db.commit()
            except Exception as e:
                print(f"Failed to create Stripe Customer: {e}")
                raise e

        # Determine Price ID
        price_id = settings.stripe_price_id_pro
        if plan_id != "pro":
            raise ValueError("Only 'pro' plan is currently supported for checkout")

        if "mock" in settings.stripe_api_key:
             return f"{success_url}?session_id=mock_session_{plan_id}"

        try:
             checkout_session = stripe.checkout.Session.create(
                customer=org.stripe_customer_id,
                line_items=[
                    {
                        'price': price_id,
                        'quantity': 1,
                    },
                ],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    "org_id": str(org.id)
                },
                subscription_data={
                    "metadata": {
                        "org_id": str(org.id)
                    }
                }
            )
             return checkout_session.url
        except Exception as e:
            print(f"Stripe Checkout Error: {str(e)}")
            raise e

    def create_portal_session(self, org_id: UUID, return_url: str) -> str:
        """
        Create a Stripe Customer Portal session.
        Returns the portal URL.
        """
        org = self.db.query(OrganizationDB).filter(OrganizationDB.id == org_id).first()
        if not org or not org.stripe_customer_id:
            raise ValueError("Organization has no billing account")

        try:
            portal_session = stripe.billing_portal.Session.create(
                customer=org.stripe_customer_id,
                return_url=return_url,
            )
            return portal_session.url
        except Exception as e:
            # Mock fallback
            if "mock" in settings.stripe_api_key:
                return return_url
            raise e
