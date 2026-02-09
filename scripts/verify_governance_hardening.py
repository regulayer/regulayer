
import requests
import time
import sys
import json

BASE_URL = "http://localhost:8080" # Gateway
GOV_URL = "http://localhost:8002"  # Direct (should be blocked from outside, but we test logic via Gateway)

# Colors
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"

def log(msg, status="INFO"):
    color = GREEN if status == "PASS" else RED if status == "FAIL" else RESET
    print(f"{color}[{status}] {msg}{RESET}")

def run_test():
    session = requests.Session()
    
    # 1. Signup / Login (Active Org)
    email = f"test_{int(time.time())}@example.com"
    password = "password123"
    org_name = f"TestOrg_{int(time.time())}"
    
    log(f"Registering User: {email}...")
    res = session.post(f"{BASE_URL}/v1/auth/signup", json={
        "email": email,
        "password": password,
        "orgName": org_name
    })
    
    if res.status_code != 200:
        log(f"Signup Failed: {res.text}", "FAIL")
        return
        
    data = res.json()
    token = data["token"]
    user_id = data["user"]["id"]
    org_id = data["user"]["org"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    
    log("Signup Successful", "PASS")
    
    # 2. Ingest Decision (simulate)
    # We need an API Key first? Or usage of Recorder directly via internal for test?
    # Or just use the 'ingest_decision' endpoint if we can get a key.
    # Getting Key...
    # Need project ID.
    projects_res = session.get(f"{BASE_URL}/v1/orgs/{org_id}/projects", headers=headers)
    project_id = projects_res.json()[0]["id"]
    
    # Create Key
    key_res = session.post(f"{BASE_URL}/v1/projects/{project_id}/keys", json={
        "name": "Test Key",
        "scopes": ["ingest", "read"]
    }, headers=headers)
    api_key_secret = key_res.json()["secret_key"]
    
    log("API Key Created", "PASS")
    
    # Ingest
    decision_payload = {
        "decision_id": f"dec_{int(time.time())}",
        "system_name": "TestSystem",
        "risk_level": "low",
        "decision": "approved",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    from datetime import datetime
    
    # Ingest via Gateway
    ingest_headers = {
        "X-Regulayer-Api-Key": api_key_secret
    }
    log("Ingesting Decision...")
    res = requests.post(f"{BASE_URL}/v1/ingest/decision", json=decision_payload, headers=ingest_headers)
    if res.status_code != 202:
        log(f"Ingest Failed: {res.text}", "FAIL")
        return
    log("Decision Ingested (202)", "PASS")
    
    decision_id = decision_payload["decision_id"]
    
    # Wait for processing
    time.sleep(2)
    
    # 3. Test Governance Write (Active)
    log("Testing Governance Write (Active Org)...")
    note_payload = {"note": "Test Note 1", "author_role": "admin"}
    res = session.post(
        f"{BASE_URL}/v1/governance/{decision_id}/annotations", 
        json=note_payload, 
        headers=headers
    )
    
    if res.status_code == 201:
        log("Write Allowed (Expected)", "PASS")
    else:
        log(f"Write Failed Unexpectedly: {res.status_code} {res.text}", "FAIL")
        
    # 4. Freeze Org
    log("Freezing Organization...")
    # Does the user have permission to freeze? Usually only Superadmin?
    # Or can Owner update status? `patch_organization_status` requires auth?
    # Let's try as Owner.
    res = session.patch(f"{BASE_URL}/v1/orgs/{org_id}/status", json={"status": "frozen"}, headers=headers)
    if res.status_code == 200:
        log("Org Frozen Successfully", "PASS")
    else:
        log(f"Failed to Freeze Org: {res.status_code} {res.text}", "FAIL")
        # Proceeding assuming it might fail if Owner can't freeze, but let's see.
        return 

    # 5. Test Governance Write (Frozen)
    log("Testing Governance Write (Frozen Org)...")
    res = session.post(
        f"{BASE_URL}/v1/governance/{decision_id}/annotations", 
        json={"note": "Should Fail", "author_role": "admin"}, 
        headers=headers
    )
    
    if res.status_code == 403:
        log("Write Blocked (Expected 403)", "PASS")
        if "Organization is Frozen" in res.text:
             log("Error Message Correct", "PASS")
        else:
             log(f"Error Message Mismatch: {res.text}", "FAIL")
    else:
        log(f"Write NOT Blocked! Status: {res.status_code}", "FAIL")
        
    # 6. Test Unauthenticated Access (Proxy Handling)
    log("Testing Unauthenticated Gateway Proxy Access...")
    res = requests.post(
        f"{BASE_URL}/v1/governance/{decision_id}/annotations",
        json={"note": "Hacker Note", "author_role": "admin"}
        # No Authorization Header
    )
    
    if res.status_code == 401:
        log("Unauthenticated Request Blocked (Expected 401)", "PASS")
    else:
        log(f"Unauthenticated Request Leaked! Status: {res.status_code}", "FAIL")

    log("--- Verification Complete ---")

if __name__ == "__main__":
    run_test()
