import urllib.request
import urllib.error
import json
import sys
import time

# Allow time for DNS resolution if just started
time.sleep(1)

CONTROL_URL = "http://localhost:8000"
GATEWAY_URL = "http://gateway:8080"

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
                return f.status, json.loads(resp_data)
            except:
                return f.status, resp_data
    except urllib.error.HTTPError as e:
        err_data = e.read().decode('utf-8')
        try:
             return e.code, json.loads(err_data)
        except:
             return e.code, err_data
    except Exception as e:
        return 0, str(e)

def test_demo_isolation():
    print("--- 1. Testing Demo Signup ---")
    ts = int(time.time())
    email = f"demo_test_{ts}@example.com"
    payload = {
        "email": email,
        "password": "password123",
        "orgName": f"Demo Corp {ts}"
    }
    
    status, data = request(f"{CONTROL_URL}/demo/signup", "POST", payload)
    
    if status != 200:
        print(f"FAIL: Signup failed {status} {data}")
        return
        
    token = data["token"]
    org = data["user"]["org"]
    print(f"SUCCESS: Signed up demo org {org['id']}")
    print(f"  is_demo: {org.get('is_demo')}")
    print(f"  environment: {org.get('environment')}")
    
    if not org.get('is_demo'):
        print("FAIL: Org is not marked as demo!")
        
    # 2. Get Project ID
    headers = {"Authorization": f"Bearer {token}"}
    status, projects = request(f"{CONTROL_URL}/v1/orgs/{org['id']}/projects", "GET", None, headers)
    
    if status != 200:
        print(f"FAIL: List projects failed {status} {projects}")
        return
        
    project_id = projects[0]["id"]
    print(f"SUCCESS: Found project {project_id}")
    
    # 3. Create API Key
    print("\n--- 2. Testing API Key Generation ---")
    key_payload = {"name": "Demo Key", "scopes": ["ingest"]}
    status, key_data = request(f"{CONTROL_URL}/v1/projects/{project_id}/keys", "POST", key_payload, headers)
    
    if status != 200:
        print(f"FAIL: Key creation failed {status} {key_data}")
        return

    api_key = key_data["key_secret"]
    is_demo_key = key_data.get("is_demo_key")
    
    print(f"SUCCESS: Created key {api_key[:12]}...")
    print(f"  is_demo_key: {is_demo_key}")
    
    if not is_demo_key:
        print("FAIL: Key is not marked as demo key!")
        
    if not api_key.startswith("rl_demo_"):
        print(f"FAIL: Key prefix is wrong: {api_key}")

    # DEBUG: Check Validation Response directly
    print("\n--- 2.5 Debug: Direct Validation Check ---")
    # Gateway calls POST /v1/auth/validate?api_key=...
    status, val_data = request(f"{CONTROL_URL}/v1/auth/validate?api_key={api_key}", "POST", None)
    print(f"Validation Status: {status}")
    print(f"Validation Body: {val_data}")

    # 4. Test Gateway Rejection
    print("\n--- 3. Testing Gateway Enforcement ---")
    
    # Use the SaaS entry point which enforces Gateway Mode
    target_url = f"{GATEWAY_URL}/v1/ingest/decision"
    print(f"POSTing to {target_url} with demo key...")
    
    status, resp_data = request(
        target_url, 
        "POST", 
        {"fake": "event"}, 
        {"X-Regulayer-Api-Key": api_key, "X-Regulayer-Project-Id": project_id}
    )
    
    print(f"Gateway Response: {status} {str(resp_data)[:200]}")
    
    if status == 403:
        resp_str = str(resp_data)
        if "DEMO_KEY_FORBIDDEN" in resp_str:
            print("PASS: Gateway correctly rejected demo key on PROD gateway.")
        elif "PROD_KEY_FORBIDDEN" in resp_str:
             print("FAIL: Gateway thinks it is in Demo Mode?")
        else:
            print("FAIL: Gateway returned 403 but wrong reason?")
    else:
        print(f"FAIL: Gateway did not reject key (Status: {status})")

if __name__ == "__main__":
    test_demo_isolation()
