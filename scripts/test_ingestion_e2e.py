import urllib.request
import urllib.error
import json
import uuid
import time
import sys

# Configuration
CONTROL_URL = "http://localhost:8100"
GATEWAY_URL = "http://localhost:8080"
RECORDER_URL = "http://localhost:8300" # Accessing Recorder directly for verification state check

def request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    jsondata = None
    if data is not None:
        jsondata = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
        
    req = urllib.request.Request(url, data=jsondata, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as f:
            resp_data = f.read().decode('utf-8')
            try:
                return f.status, json.loads(resp_data), dict(f.getheaders())
            except:
                return f.status, resp_data, dict(f.getheaders())
    except urllib.error.HTTPError as e:
        err_data = e.read().decode('utf-8')
        try:
             return e.code, json.loads(err_data), dict(e.headers)
        except:
             return e.code, err_data, dict(e.headers)
    except Exception as e:
        return 0, str(e), {}

def test_e2e_ingestion():
    print("=== Phase I.2: End-to-End Ingestion Verification ===")
    
    # 1. Setup Org & Project
    print("\n[1] Setting up Test Organization...")
    ts = int(time.time())
    email = f"e2e_test_{ts}@example.com"
    signup_payload = {
        "email": email,
        "password": "password123",
        "orgName": f"E2E Corp {ts}"
    }
    
    # We use normal signup (Real Org) involves is_demo=False
    status, data, _ = request(f"{CONTROL_URL}/v1/auth/signup", "POST", signup_payload)
    if status != 200:
        print(f"FAIL: Signup failed {status} {data}")
        return
        
    token = data["token"]
    org_id = data["user"]["org"]["id"]
    print(f"SUCCESS: Created Org {org_id}")
    
    # Create Project
    headers = {"Authorization": f"Bearer {token}"}
    status, projects, _ = request(f"{CONTROL_URL}/v1/orgs/{org_id}/projects", "GET", None, headers)
    project_id = projects[0]["id"]
    print(f"SUCCESS: Found Project {project_id}")
    
    with open("latest_project_id.txt", "w") as f:
        f.write(project_id)
    
    # Create API Key
    key_payload = {"name": "Prod Key", "scopes": ["ingest"]}
    status, key_data, _ = request(f"{CONTROL_URL}/v1/projects/{project_id}/keys", "POST", key_payload, headers)
    api_key = key_data["key_secret"]
    print(f"SUCCESS: Created API Key {api_key[:10]}...")

    # 2. Ingest Decision (Simulating SDK)
    print("\n[2] Ingesting Decision via Gateway...")
    decision_id = str(uuid.uuid4())
    print(f"Generated Canonical-ID: {decision_id}")
    
    payload = {
        "decision_id": decision_id,
        "system_name": "e2e_verifier",
        "decision_type": "test_ingest",
        "input": {"case": "test_e2e"},
        "output": {"result": "success"},
        "metadata": {"test": True},
        "risk_level": "standard",
        "event_version": "1.0",
        "event_state": "completed",
        "model_name": "test-model",
        "model_version": "1.0",
        "start_timestamp": datetime_iso(),
        "end_timestamp": datetime_iso(),
        "execution_duration_ms": 100,
        "runtime_fingerprint": {
            "python_version": "3.10",
            "os": "linux",
            "sdk_version": "1.0.0",
            "sdk_instance_id": str(uuid.uuid4())
        }
    }
    
    headers = {
        "X-Regulayer-Api-Key": api_key,
        "X-Request-ID": decision_id, # Canonical ID Header
        "Content-Type": "application/json"
    }
    
    # DEBUG: Try Direct Ingestion to Recorder to see 422 details
    print("\n[DEBUG] Direct Ingestion to Recorder...")
    direct_headers = headers.copy()
    # Recorder expects Project ID header if not inferred
    direct_headers["X-Regulayer-Project-Id"] = project_id
    
    d_status, d_resp, _ = request(f"{RECORDER_URL}/v1/decisions", "POST", payload, direct_headers)
    print(f"Direct Recorder Status: {d_status}")
    if d_status != 201:
        print(f"Direct Recorder Response: {d_resp}")

    # Send to Gateway
    status, resp_data, resp_headers = request(f"{GATEWAY_URL}/v1/ingest/decision", "POST", payload, headers)
    
    # 3. Verify 202 strictness
    print(f"Gateway Response: {status}")
    if status != 202:
        print(f"FAIL: Expected 202 Accepted, got {status}")
        return
    else:
        print("PASS: Gateway returned 202 Accepted")
        
    # Verify ID Match
    if resp_data.get("decision_id") != decision_id:
        print(f"FAIL: ID mismatch! Sent {decision_id}, got {resp_data.get('decision_id')}")
    else:
        print("PASS: Gateway returned correct Canonical ID")

    # 4. Check Pending State (Immediate)
    print("\n[3] Verifying Pending State (Immediate)...")
    status, _, _ = request(f"{RECORDER_URL}/v1/decisions/{decision_id}", "GET")
    if status == 404:
        print("PASS: Record not yet exists (Correct Pending State)")
    elif status == 200:
        print("WARNING: Record appeared instantly? (Too fast or previous run?)")
    else:
        print(f"FAIL: Unexpected status {status} from Recorder")

    # 5. Wait for Worker
    print("\n[4] Waiting for Queue Processing (5s)...")
    time.sleep(5)
    
    # 6. Check Recorded State
    print("\n[5] Verifying Final Recorded State...")
    status, rec_data, _ = request(f"{RECORDER_URL}/v1/decisions/{decision_id}", "GET")
    
    if status == 200:
        print("PASS: Record successfully ingested and retrieved from Recorder")
        if rec_data.get("decision_id") == decision_id:
             print("PASS: ID matches exactly")
        else:
             print("FAIL: ID mismatch in DB")
    else:
        print(f"FAIL: Record not found after 5s. Status: {status}")
        # Check logs manual step here usually, but script stops.

def datetime_iso():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()

if __name__ == "__main__":
    test_e2e_ingestion()
