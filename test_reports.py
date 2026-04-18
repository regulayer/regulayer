"""
End-to-end test: Control Plane -> Reports Service proxy
Simulates what the frontend does when browsing the Reports page.
"""
import urllib.request
import json

# 1. Login to get a token (simulating what the frontend does)
login_data = json.dumps({"email": "sanch@regulayer.com", "password": "regulayer123"}).encode()
login_req = urllib.request.Request(
    "http://control-plane:8000/v1/auth/login",
    data=login_data,
    headers={"Content-Type": "application/json"}
)

try:
    login_resp = urllib.request.urlopen(login_req)
    token_data = json.loads(login_resp.read())
    token = token_data.get("access_token") or token_data.get("token")
    print(f"Login OK, got token: {token[:20]}...")
except Exception as e:
    print(f"Login failed: {e}")
    # Try without auth - just test the proxy with internal auth
    token = None

# 2. Test governance report through control plane proxy
print("\n=== Testing through Control Plane ===")
if token:
    for endpoint in ["/v1/reports/governance?format=json", "/v1/reports/incidents?format=json", "/v1/reports/usage?format=json", "/v1/reports/sla?format=json"]:
        try:
            req = urllib.request.Request(
                f"http://control-plane:8000{endpoint}",
                headers={"Authorization": f"Bearer {token}"}
            )
            resp = urllib.request.urlopen(req)
            data = json.loads(resp.read())
            # Remove evidence_payload for readability
            data.pop("evidence_payload", None)
            name = endpoint.split("/")[3].split("?")[0].upper()
            print(f"\n{name}: {json.dumps(data, indent=2)}")
        except Exception as e:
            name = endpoint.split("/")[3].split("?")[0].upper()
            print(f"\n{name} FAILED: {e}")
else:
    print("No token, skipping auth'd tests")

# 3. Also test direct reports service (as baseline)
print("\n=== Direct Reports Service (baseline) ===")
for endpoint in ["/v1/reports/governance?format=json"]:
    try:
        req = urllib.request.Request(
            f"http://reports:8003{endpoint}",
            headers={"X-Internal-Auth": "2689c1d4bf5073ea", "X-Org-Id": "test"}
        )
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read())
        data.pop("evidence_payload", None)
        print(f"Direct: {json.dumps(data, indent=2)}")
    except Exception as e:
        print(f"Direct FAILED: {e}")
