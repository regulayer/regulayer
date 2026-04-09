import pytest
from unittest.mock import patch, MagicMock
from app.api import app, BillingStatus
from app.config import settings

def test_list_plans(client):
    response = client.get("/v1/plans")
    assert response.status_code == 200
    plans = response.json()
    assert len(plans) == 3
    assert plans[0]["id"] == "free"
    assert plans[1]["id"] == "pro"
    assert plans[2]["id"] == "enterprise"

def test_get_billing_status_default_mock(client):
    # Setup: Create Org and User (from conftest or manually)
    # Assuming client fixture creates a default user/org and authenticates
    # We need to fetch the org_id from the client (if available) or login response
    
    # 1. Signup to get a fresh org
    signup_resp = client.post("/v1/auth/signup", json={
        "email": "billing_test@example.com",
        "password": "password123",
        "orgName": "Billing Test Org"
    })
    token = signup_resp.json()["token"]
    org_id = signup_resp.json()["user"]["org"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Billing Status (Mock Key)
    # Ensure config treats it as mock
    with patch("app.billing.settings.stripe_api_key", "mock_key"):
        response = client.get(f"/v1/orgs/{org_id}/billing", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["plan"]["id"] == "free"
        assert data["status"] == "active"
        assert data["invoices"] == []

# Patch order: Bottom-up application.
# @patch("Invoice") -> Applied first (inner). passed as 1st arg.
# @patch("Subscription") -> Applied second (outer). passed as 2nd arg.
@patch("app.billing.stripe.Subscription.list")
@patch("app.billing.stripe.Invoice.list")
def test_get_billing_status_real_stripe_mocked(mock_invoices_list, mock_subs_list, client, db_session):
    # 1. Signup
    signup_resp = client.post("/v1/auth/signup", json={
        "email": "stripe_test@example.com",
        "password": "password123",
        "orgName": "Stripe Test Org"
    })
    token = signup_resp.json()["token"]
    org_id = signup_resp.json()["user"]["org"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Manually Set Stripe Customer ID in DB
    from app.storage import OrganizationDB
    from uuid import UUID
    # db_session is the same session used by client due to dependency override in conftest
    # However, client requests run in their own thread/context, but sqlite in-memory usually shares if designed right.
    # conftest.py uses check_same_thread=False, so sharing is possible.
    
    org = db_session.query(OrganizationDB).filter(OrganizationDB.id == UUID(org_id)).first()
    assert org is not None
    org.stripe_customer_id = "cus_test_123"
    db_session.commit()
    
    # 3. Mock Stripe Responses
    # Mock Subscription
    mock_sub = MagicMock()
    mock_sub.status = "active"
    mock_sub.current_period_end = 1735689600 # 2025-01-01
    mock_sub.items.data = [MagicMock(price=MagicMock(id="price_mock_pro"))]
    
    # Mock List Response
    mock_subs_list.return_value = MagicMock(data=[mock_sub])
    
    # Mock Invoices
    mock_inv = MagicMock()
    mock_inv.id = "inv_123"
    mock_inv.created = 1704067200 # 2024-01-01
    mock_inv.amount_paid = 9900
    mock_inv.status = "paid"
    mock_inv.invoice_pdf = "http://pdf"
    
    mock_invoices_list.return_value = MagicMock(data=[mock_inv])
    
    # 4. Verify API Response
    # Force settings to NOT be mock for this test
    with patch("app.billing.settings.stripe_api_key", "sk_test_real"):
        with patch("app.billing.settings.stripe_price_id_pro", "price_mock_pro"):
             response = client.get(f"/v1/orgs/{org_id}/billing", headers=headers)
             
             assert response.status_code == 200
             data = response.json()
             assert data["status"] == "active"
             assert data["plan"]["id"] == "pro"
             assert data["invoices"][0]["id"] == "inv_123"
