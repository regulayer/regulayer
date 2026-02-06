
import requests
import json
import uuid
import sys
import time

BASE_URL = "http://localhost:8080"

def log(msg):
    print(f"[TEST] {msg}")

def fail(msg):
    print(f"❌ {msg}")
    sys.exit(1)

def test_lifecycle():
    # 1. Signup
    unique_id = str(uuid.uuid4())[:8]
    email = f"lifecycle_{unique_id}@example.com"
    password = "password123"
    org_name = f"Lifecycle Org {unique_id}"
    
    log(f"Signing up {email}...")
    r = requests.post(f"{BASE_URL}/v1/auth/signup", json={
        "email": email, "password": password, "orgName": org_name
    })
    if r.status_code != 200:
        fail(f"Signup failed: {r.text}")
    
    data = r.json()
    token = data["token"]
    user = data["user"]
    org_id = user["organization_id"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Check Auth/Me Structure
    log("Checking GET /v1/auth/me structure...")
    r = requests.get(f"{BASE_URL}/v1/auth/me", headers=headers)
    me_data = r.json()
    
    if "org" not in me_data:
        print("⚠️  'org' field missing from /auth/me response (Frontend expects this)")
    else:
        log("✓ 'org' field present in /auth/me")
    
    # 3. Create API Key
    log("Creating API Key...")
    # Need project ID
    r = requests.get(f"{BASE_URL}/v1/orgs/{org_id}/projects", headers=headers)
    project_id = r.json()[0]["id"]
    
    r = requests.post(f"{BASE_URL}/v1/projects/{project_id}/keys", 
                      json={"name": "Lifecycle Key", "scopes": ["ingest"]}, 
                      headers=headers)
    api_key_secret = r.json()["key_secret"]
    
    # 4. Ingest (Should Succeed)
    log("Ingesting (Active State)...")
    ingest_headers = {"X-Regulayer-Api-Key": api_key_secret, "Content-Type": "application/json"}
    r = requests.post(f"{BASE_URL}/v1/ingest/decision", json={"system": "test", "status": "active"}, headers=ingest_headers)
    if r.status_code not in [200, 201, 202]:
        fail(f"Ingest failed in active state: {r.status_code} {r.text}")
    log("✓ Ingest success.")
    
    # 5. Try to Freeze (PATCH)
    log("Attempting to Freeze Org via API...")
    r = requests.patch(f"{BASE_URL}/v1/orgs/{org_id}/status", json={"status": "suspended"}, headers=headers)
    
    if r.status_code == 404:
        log("ℹ️  PATCH status endpoint not implemented yet (Expected)")
    elif r.status_code == 200:
        log("✓ Org frozen via API.")
    else:
        fail(f"Unexpected response from PATCH: {r.status_code} {r.text}")

    # If API didn't work, can't test further automatically without DB access or implementation.
    # Proceeding assuming we will implement the API.

if __name__ == "__main__":
    test_lifecycle()
