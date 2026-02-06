
import requests
import sys
import time
from uuid import uuid4

BASE_URL = "http://localhost:8080" # Gateway
CONTROL_URL = "http://localhost:8000" # Control Plane Direct (for admin tasks)

def log(msg):
    print(f"[TEST] {msg}")

def fail(msg):
    print(f"❌ {msg}")
    sys.exit(1)

def test_frozen_export():
    # 1. Signup to get a fresh org
    email = f"test_frozen_{int(time.time())}@example.com"
    password = "password123"
    
    log(f"Signing up {email}...")
    r = requests.post(f"{BASE_URL}/v1/auth/signup", json={
        "email": email,
        "password": password,
        "orgName": "Frozen Corp"
    })
    if r.status_code != 200:
        fail(f"Signup failed: {r.text}")
    
    data = r.json()
    token = data["token"]
    # Provide fallback for nested user.org if API structure differs
    if "org" in data:
        org_id = data["org"]["id"]
    elif "user" in data and "org" in data["user"]:
        org_id = data["user"]["org"]["id"]
    else:
        fail(f"Could not find org_id in response: {data.keys()}")

    # 1b. Get Project ID (since it's not in signup response)
    log(f"Fetching projects for Org {org_id}...")
    r = requests.get(f"{BASE_URL}/v1/orgs/{org_id}/projects", headers={"Authorization": f"Bearer {token}"})
    if r.status_code != 200:
        fail(f"Could not fetch projects: {r.text}")
    
    projects = r.json()
    if not projects:
        fail("No projects found for new org!")
    project_id = projects[0]["id"]

    
    # 2. Create API Key
    log("Creating API Key...")
    r = requests.post(f"{BASE_URL}/v1/projects/{project_id}/keys", 
        json={"name": "ingest-key", "scopes": ["ingest"]},
        headers={"Authorization": f"Bearer {token}"}
    )
    if r.status_code != 200:
        fail(f"Key creation failed: {r.text}")
    
    # Check api.py implementation... actually it returns the key object.
    resp = r.json()
    if "key_secret" in resp:
        api_key = resp["key_secret"]
    elif "secret_key" in resp:
        api_key = resp["secret_key"]
    elif "key" in resp:
        api_key = resp["key"]
    else:
        # Fallback to key prefix if secret not returned (though for ingest we need secret usually?)
        # Actually gateway auth checks strictly.
        fail(f"No secret returned for key: {resp.keys()}")
    
    # 3. Ingest a Decision (Should Succeed)
    log("Ingesting decision (Active State)...")
    decision_payload = {
        "decision_id": str(uuid4()),
        "system_name": "frozen-test-sys",
        "risk_level": "low",
        "event_state": "recorded",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    # Need correct schema for ingestion
    # Using legacy format for simplicity if supported, or full format
    ingest_body = {
        "system_name": "frozen-test-sys", 
        "decision_id": str(uuid4()),
        "payload": {"foo": "bar"}
    }
    
    headers = {"X-Regulayer-Api-Key": api_key}
    r = requests.post(f"{BASE_URL}/v1/ingest/decision", json=ingest_body, headers=headers)
    if r.status_code not in [200, 201]:
        fail(f"Active ingestion failed: {r.status_code} {r.text}")
    
    decision_id = r.json().get("decision_id")
    log(f"✓ Ingestion accepted. Decision ID: {decision_id}")
    
    # 3b. Wait for Async Processing
    log("Waiting for async processing...")
    for _ in range(60):
        time.sleep(1)
        # Check if visible in Recorder (via Proxy)
        # We need authentication for READ APIs?
        # Proxy is open as per previous investigation, but let's send token just in case
        check_url = f"{BASE_URL}/v1/decisions/{decision_id}"
        chk = requests.get(check_url, headers={"Authorization": f"Bearer {token}"})
        if chk.status_code == 200:
            log("✓ Decision processed and visible.")
            break
    else:
        fail(f"Decision processing timed out. Last status: {chk.status_code}")

    # 4. Freeze the Org
    log(f"Freezing Org {org_id}...")
    # Need to call PATCH /v1/orgs/{id}/status
    # This requires Admin/Owner token. `token` form signup should work.
    r = requests.patch(f"{BASE_URL}/v1/orgs/{org_id}/status", 
        json={"status": "suspended"},
        headers={"Authorization": f"Bearer {token}"}
    )
    if r.status_code != 200:
        fail(f"Freeze failed: {r.status_code} {r.text}")
    log("✓ Org frozen (suspended).")

    # 5. Try to Ingest (Should Fail)
    log("Attempting Ingestion (Frozen State)...")
    r = requests.post(f"{BASE_URL}/v1/ingest/decision", json=ingest_body, headers=headers)
    if r.status_code == 403 or r.status_code == 401 or r.status_code == 402: # "Payment Required" or Forbidden
        log(f"✓ Ingestion blocked as expected: {r.status_code}")
    else:
        fail(f"Ingestion NOT blocked in frozen state! Code: {r.status_code}")

    # 6. Try to Export (Should Succeed)
    log(f"Attempting Export for {decision_id} (Frozen State)...")
    # Export endpoint: /v1/decisions/{decision_id}/export
    # This goes via Proxy.
    r = requests.get(f"{BASE_URL}/v1/decisions/{decision_id}/export", headers={"Authorization": f"Bearer {token}"})
    
    if r.status_code == 200:
        log("✓ Export successful.")
    else:
        fail(f"Export failed in frozen state! Code: {r.status_code} {r.text}")

if __name__ == "__main__":
    from datetime import datetime, timezone
    test_frozen_export()
