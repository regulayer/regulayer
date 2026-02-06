
import requests
import sys
import time

BASE_URL = "http://localhost:8080"

def log(msg):
    print(f"[TEST] {msg}")

def fail(msg):
    print(f"❌ {msg}")
    sys.exit(1)

def test_billing():
    # 1. Signup
    email = f"billing_test_{int(time.time())}@example.com"
    log(f"Signing up {email}...")
    r = requests.post(f"{BASE_URL}/v1/auth/signup", json={
        "email": email,
        "password": "password123",
        "orgName": "Billing Corp"
    })
    if r.status_code != 200:
        fail(f"Signup failed: {r.text}")
    
    data = r.json()
    token = data["token"]
    if "org" in data:
        org_id = data["org"]["id"]
    elif "user" in data and "org" in data["user"]:
        org_id = data["user"]["org"]["id"]
    else:
        fail("Org ID not found")

    auth_headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Plans
    log("Fetching plans...")
    r = requests.get(f"{BASE_URL}/v1/plans", headers=auth_headers)
    if r.status_code != 200:
        fail(f"Get plans failed: {r.text}")
    plans = r.json()
    if len(plans) < 2:
        fail("Expected at least 2 plans")
    log(f"✓ Found {len(plans)} plans.")

    # 3. Get Current Billing
    log("Fetching current billing status...")
    r = requests.get(f"{BASE_URL}/v1/orgs/{org_id}/billing", headers=auth_headers)
    if r.status_code != 200:
        fail(f"Get billing failed: {r.text}")
    status = r.json()
    current_plan = status["plan"]["id"]
    log(f"✓ Current plan: {current_plan}")
    if current_plan != "free":
        fail(f"Expected free plan, got usage {current_plan}")

    # 4. Upgrade Subscription
    log("Upgrading to Pro...")
    r = requests.post(f"{BASE_URL}/v1/orgs/{org_id}/billing/subscription", 
        json={"plan_id": "pro"},
        headers=auth_headers
    )
    if r.status_code != 200:
        fail(f"Upgrade failed: {r.text}")
    
    new_status = r.json()
    new_plan = new_status["plan"]["id"]
    log(f"✓ New plan: {new_plan}")
    
    if new_plan != "pro":
        fail("Upgrade did not reflect new plan")

if __name__ == "__main__":
    test_billing()
