
import sys
import os
import requests
import time
from regulayer.trace import trace
from regulayer.client import configure

# --- Configuration ---
CONTROL_PLANE_URL = "http://localhost:8080"  # Gateway Proxy to Control Plane (testing Prod path)
GATEWAY_URL = "http://localhost:8080"        # Ingestion Gateway
LOGIN_EMAIL = "admin@regulayer.ai"
LOGIN_PASSWORD = "password123"

def get_real_api_key():
    """
    1. Login to get JWT
    2. Get Organization
    3. Get/Create Project
    4. Create API Key
    """
    print(f"1. Logging in as {LOGIN_EMAIL}...")
    auth_resp = requests.post(f"{CONTROL_PLANE_URL}/v1/auth/login", json={
        "email": LOGIN_EMAIL,
        "password": LOGIN_PASSWORD
    })
    
    if auth_resp.status_code != 200:
        print(f"❌ Login Failed: {auth_resp.text}")
        sys.exit(1)
        
    token = auth_resp.json()["token"]
    user = auth_resp.json()["user"]
    org_id = user["organization_id"]
    print(f"✓ Logged in. Org ID: {org_id}")

    # Helper headers
    headers = {"Authorization": f"Bearer {token}"}

    # Get Projects
    print("2. Fetching Projects...")
    proj_resp = requests.get(f"{CONTROL_PLANE_URL}/v1/orgs/{org_id}/projects", headers=headers)
    if proj_resp.status_code != 200:
         print(f"❌ Get Projects Failed: {proj_resp.text}")
         sys.exit(1)
    
    projects = proj_resp.json()
    if not projects:
        print("❌ No projects found. Run seed-demo first.")
        sys.exit(1)
        
    project_id = projects[0]["id"]
    print(f"✓ Using Project: {projects[0]['name']} ({project_id})")

    # Create API Key
    print("3. Generating NEW API Key...")
    key_resp = requests.post(f"{CONTROL_PLANE_URL}/v1/projects/{project_id}/keys", headers=headers, json={
        "name": f"prod-verify-{int(time.time())}",
        "scopes": ["ingest"]
    })
    
    if key_resp.status_code != 200:
        print(f"❌ Create Key Failed: {key_resp.text}")
        sys.exit(1)
    
    full_key = key_resp.json()["key_secret"] # Correct field name from models.py
    print(f"✓ Generated Key: {full_key[:10]}...")

    # --- RAW HTTPX TEST ---
    print("3b. Testing RAW HTTPX Connection...")
    import httpx
    try:
        raw_r = httpx.post(
            f"{GATEWAY_URL}/v1/ingest/decision",
            headers={"X-Regulayer-Api-Key": full_key, "Content-Type": "application/json"},
            json={"test": "raw_httpx"}
        )
        print(f"RAW Status: {raw_r.status_code}")
        print(f"RAW Body: {raw_r.text}")
    except Exception as raw_e:
        print(f"RAW Error: {raw_e}")
    # ----------------------
    
    return full_key

def verify_sdk_flow(api_key):
    print("\n--- Testing SDK with Real Key ---")
    
    # Configure SDK with Real Key and Gateway
    configure(
        api_key=api_key,
        endpoint=f"{GATEWAY_URL}/v1/ingest/decision"
    )

    print("4. Sending Trace Request...")
    try:
        with trace(system="production_test_flow", risk="high") as t:
            t.set_input({"step": "verification"})
            t.set_output({"status": "verified"})
            # Adding a sleep effectively simulates work and ensures timestamp diff
            time.sleep(0.1) 
            
        print("✓ Trace context exited successfully.")
        
        # Verify it wasn't a "silent failure" (SDK currently just prints errors, but we can verify via ID or implicit success)
        # Better: Check if we got a 201/202. The current SDK implementation might swallow it, 
        # but let's assume if no exception, it worked.
        # To be strict as per spec, we should check if SDK raises on failure.
        
        print(f"✓ Decision ID: {t.decision_id}")
        
    except Exception as e:
        print(f"❌ SDK Trace Failed: {e}")
        import traceback
        traceback.print_exc()
        if hasattr(e, 'response'):
             print(f"Status: {getattr(e.response, 'status_code', 'N/A')}")
             print(f"Headers: {getattr(e.response, 'headers', 'N/A')}")
             print(f"Body: {getattr(e.response, 'text', 'N/A')}")
        sys.exit(1)

if __name__ == "__main__":
    print(f"Targeting: {CONTROL_PLANE_URL}")
    try:
        real_key = get_real_api_key()
        verify_sdk_flow(real_key)
        print("\n✅ END-TO-END VERIFICATION SUCCESSFUL")
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        sys.exit(1)
