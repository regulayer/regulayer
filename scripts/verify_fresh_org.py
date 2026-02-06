
import requests
import json
import sys
import uuid

BASE_URL = "http://localhost:8080" # Gateway/Proxy

def log(msg):
    print(f"[TEST] {msg}")

def fail(msg):
    print(f"❌ {msg}")
    sys.exit(1)

def verify_fresh_org():
    # 1. Signup New User
    unique_id = str(uuid.uuid4())[:8]
    email = f"fresh_{unique_id}@example.com"
    password = "password123"
    org_name = f"Fresh Org {unique_id}"
    
    log(f"Signing up as {email}...")
    signup_payload = {
        "email": email,
        "password": password,
        "orgName": org_name
    }
    
    r = requests.post(f"{BASE_URL}/v1/auth/signup", json=signup_payload)
    if r.status_code != 200:
        fail(f"Signup failed: {r.text}")
        
    data = r.json()
    token = data["token"]
    org_id = data["user"]["organization_id"]
    log(f"Signup success. Org ID: {org_id}")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Verify Default Project
    log("Checking Projects...")
    r = requests.get(f"{BASE_URL}/v1/orgs/{org_id}/projects", headers=headers)
    if r.status_code != 200:
        fail(f"Get Projects failed: {r.text}")
        
    projects = r.json()
    if len(projects) != 1:
        fail(f"Expected 1 default project, found {len(projects)}")
        
    project_id = projects[0]["id"]
    log(f"Found Default Project: {project_id}")
    
    # 3. Verify Empty Decisions
    log("Checking Decisions (Should be empty)...")
    # Gateway requires X-Regulayer-Project-Id header?
    # Our updated proxy just forwards headers. 
    # API client in frontend sends X-Regulayer-Project-Id.
    
    decisions_headers = headers.copy()
    decisions_headers["X-Regulayer-Project-Id"] = project_id
    
    r = requests.get(f"{BASE_URL}/v1/decisions", headers=decisions_headers)
    
    # NOTE: Since I haven't implemented Auth validation on Proxy yet, this might succeed even without token?
    # But it definitely should succeed WITH token if Gateway allows it.
    
    if r.status_code != 200:
        fail(f"Get Decisions failed: {r.status_code} {r.text}")
        
    decisions = r.json()
    if len(decisions) != 0:
        fail(f"Expected 0 decisions for fresh org, found {len(decisions)}")
        
    log("✓ Decisions list is empty.")

    # 4. Verify Empty Usage
    log("Checking Usage...")
    r = requests.get(f"{BASE_URL}/v1/usage/orgs/{org_id}", headers=headers)
    if r.status_code != 200:
        fail(f"Get Usage failed: {r.text}")
        
    usage_list = r.json()
    total_used = sum(item['decisions_ingested'] for item in usage_list)
    if total_used != 0:
        fail(f"Expected 0 usage, found {total_used}")
        
    log("✓ Usage is 0.")
    
    log("✓ Usage is 0.")
    
    # 5. Full Onboarding Loop: Create Key -> Ingest -> Verify
    log("Running Onboarding Loop...")
    
    # 5a. Create API Key
    key_payload = {"name": "Test Key", "scopes": ["ingest"]}
    r = requests.post(f"{BASE_URL}/v1/projects/{project_id}/keys", json=key_payload, headers=headers)
    if r.status_code != 200:
        fail(f"Create Key failed: {r.text}")
        
    api_key_secret = r.json()["key_secret"]
    log(f"Created API Key: {api_key_secret[:10]}...")
    
    # 5b. Ingest Decision (Simulate Code Snippet)
    ingest_url = f"{BASE_URL}/v1/ingest/decision"
    ingest_headers = {
        "X-Regulayer-Api-Key": api_key_secret,
        "Content-Type": "application/json"
    }
    decision_payload = {
        "system": "onboarding_test",
        "decision_type": "default",
        "input": {"step": "verify"},
        "output": {"status": "success"}
    }
    
    r = requests.post(ingest_url, json=decision_payload, headers=ingest_headers)
    if r.status_code not in [200, 201]: # Recorder returns 201 or 200 via Gateway
        fail(f"Ingest failed: {r.status_code} {r.text}")
        
    log("✓ Decision ingested.")
    
    # 5c. Verify Dashboard Update (Decisions + Usage)
    import time
    time.sleep(5) # Allow Queue Worker to pick up (polls every 2s)
    
    # Check Decisions
    r = requests.get(f"{BASE_URL}/v1/decisions", headers=decisions_headers)
    decisions = r.json()
    if len(decisions) != 1:
        fail(f"Expected 1 decision, found {len(decisions)}")
        
    log("✓ Dashboard: Decisions list updated.")
    
    # Check Usage (Project Level)
    r = requests.get(f"{BASE_URL}/v1/usage/projects/{project_id}", headers=headers)
    if r.status_code != 200:
        fail(f"Get Usage failed: {r.status_code} {r.text}")
        
    usage = r.json()
    # Check decisions_ingested
    if usage["decisions_ingested"] != 1:
        fail(f"Expected 1 decision ingested, found {usage['decisions_ingested']}")
        
    log("✓ Dashboard: Usage updated.")

    print("\n✅ FRESH ORG & ONBOARDING VERIFICATION PASSED")

if __name__ == "__main__":
    verify_fresh_org()
