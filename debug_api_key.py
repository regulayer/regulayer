"""Debug script to test API key creation endpoint directly."""
import requests
import json

API_URL = "http://localhost:8100"  # Direct to control-plane
GATEWAY_URL = "http://localhost:8080"  # Via gateway

# 1. Try to list orgs by querying all users
print("=" * 60)
print("STEP 1: List all orgs via control-plane")
print("=" * 60)
r = requests.get(f"{API_URL}/v1/orgs")
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:500]}")
print()

# 2. Try querying the database directly via control-plane health or status
print("=" * 60)
print("STEP 2: Try /v1/auth/signup to see what validation looks like")
print("=" * 60)
r = requests.post(f"{API_URL}/v1/auth/signup/complete", json={
    "email": "debug@test.com",
    "otp_code": "000000",
    "full_name": "Debug User",
    "organization_name": "Debug Org",
    "password": "debugpass123"
})
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:500]}")
print()

# 3. Try signup/init to get an OTP
print("=" * 60)
print("STEP 3: Try /v1/auth/signup/init")
print("=" * 60)
r = requests.post(f"{API_URL}/v1/auth/signup/init", json={
    "email": "debug_test_12345@test.com"
})
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:500]}")
print()

# 4. Login to get a token (try common test accounts)
print("=" * 60)
print("STEP 4: Try login")
print("=" * 60)
for email, password in [("admin@regulayer.com", "admin"), ("test@test.com", "test123"), ("admin@admin.com", "admin123")]:
    r = requests.post(f"{API_URL}/v1/auth/login", json={"email": email, "password": password})
    print(f"  {email}: Status={r.status_code}, Response={r.text[:200]}")
print()

# 5. If we have a project ID, try creating a key directly
# First, let's see if there's a projects list endpoint that works without auth
print("=" * 60)
print("STEP 5: Try GET /v1/projects/test with a fake UUID")
print("=" * 60)
fake_project_id = "00000000-0000-0000-0000-000000000001"
r = requests.get(f"{API_URL}/v1/projects/{fake_project_id}")
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:500]}")
print()

# 6. Try creating an API key for the fake project
print("=" * 60)
print("STEP 6: Try POST /v1/projects/{fake}/keys")
print("=" * 60)
r = requests.post(
    f"{API_URL}/v1/projects/{fake_project_id}/keys",
    json={"name": "Test Key", "scopes": ["ingest"]}
)
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:500]}")
print()

# 7. Check if request goes through gateway
print("=" * 60)
print("STEP 7: Try same via GATEWAY (localhost:8080)")
print("=" * 60)
r = requests.post(
    f"{GATEWAY_URL}/v1/projects/{fake_project_id}/keys",
    json={"name": "Test Key", "scopes": ["ingest"]}
)
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:500]}")
print()

print("DONE")
