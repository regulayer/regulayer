
import requests
import sys
import time
from uuid import uuid4

BASE_URL = "http://localhost:8080"

def log(msg):
    print(f"[TEST] {msg}")

def fail(msg):
    print(f"❌ {msg}")
    sys.exit(1)

def test_quota():
    # 1. Signup
    email = f"quota_test_{int(time.time())}@example.com"
    log(f"Signing up {email}...")
    r = requests.post(f"{BASE_URL}/v1/auth/signup", json={
        "email": email,
        "password": "password123",
        "orgName": "Quota Limited Corp"
    })
    if r.status_code != 200:
        fail(f"Signup failed: {r.text}")
    
    token = r.json()["token"]
    
    # 2. Get Project
    if "org" in r.json():
        org_id = r.json()["org"]["id"]
    elif "user" in r.json(): # user.org.id
        org_id = r.json()["user"]["org"]["id"]
    else:
        fail("Org ID not found")

    r = requests.get(f"{BASE_URL}/v1/orgs/{org_id}/projects", headers={"Authorization": f"Bearer {token}"})
    project_id = r.json()[0]["id"]
    
    # 3. Create Key
    r = requests.post(f"{BASE_URL}/v1/projects/{project_id}/keys", 
        json={"name": "ingest-key", "scopes": ["ingest"]},
        headers={"Authorization": f"Bearer {token}"}
    )
    data = r.json()
    api_key = data.get("key_secret") or data.get("secret_key") or data.get("key")
    
    # 4. Ingest 5 times (Quota is 5)
    log("Ingesting 5 decisions (Allowed)...")
    headers = {"X-Regulayer-Api-Key": api_key}
    
    for i in range(5):
        body = {
            "system_name": "quota-sys",
            "decision_id": str(uuid4()),
            "payload": {"i": i}
        }
        r = requests.post(f"{BASE_URL}/v1/ingest/decision", json=body, headers=headers)
        if r.status_code not in [200, 201]:
            fail(f"Ingest {i+1} failed: {r.status_code} {r.text}")
        
        remaining = r.json().get("_gateway", {}).get("quota_remaining")
        log(f"  Ingest {i+1}: OK. Remaining: {remaining}")
        
        if remaining != (4 - i):
            log(f"  WARNING: Expected remaining {4-i}, got {remaining}")

    # 5. Ingest 6th time (Blocked)
    log("Ingesting 6th decision (Should fail)...")
    body = {
        "system_name": "quota-sys",
        "decision_id": str(uuid4()),
        "payload": {"i": 6}
    }
    r = requests.post(f"{BASE_URL}/v1/ingest/decision", json=body, headers=headers)
    
    if r.status_code == 429:
        log("✓ Blocked with 429 as expected.")
        log(f"  Response: {r.text}")
    else:
        fail(f"Ingest 6 was NOT blocked! Status: {r.status_code}")

if __name__ == "__main__":
    test_quota()
