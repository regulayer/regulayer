
import requests
import json
import sys
import time

BASE_URL = "http://localhost:8080" # Gateway

def log(msg):
    print(f"[TEST] {msg}")

def fail(msg):
    print(f"❌ {msg}")
    sys.exit(1)

def test_governance_api():
    # 1. Login to get token (needed for proxy auth if enforced, but currently proxy is open)
    # Actually proxy is open for now as per my analysis of proxy.py
    
    # 2. Check Governance Health
    # Direct check via Gateway proxy
    try:
        r = requests.get(f"{BASE_URL}/v1/governance/health") # Requires health endpoint in governance service?
        # api.py doesn't have /health mounted on router prefix?
        # docker-compose checks localhost:8002/health. main.py usually mounts api router AND health.
        # Let's try listing the queue directly.
    except Exception as e:
        log(f"Health check skipped: {e}")

    # 3. List Queue (Should be empty initially or have some from previous tests)
    log("Fetching Governance Queue...")
    r = requests.get(f"{BASE_URL}/v1/governance/queue")
    
    if r.status_code == 404:
        fail("Endpoint /v1/governance/queue NOT FOUND. Proxy or Service issue.")
    elif r.status_code != 200:
        fail(f"Queue fetch failed: {r.status_code} {r.text}")
        
    data = r.json()
    log(f"✓ Queue fetched. {len(data)} items pending review.")
    
    # 4. If items exist, try to get details of one
    if len(data) > 0:
        decision_id = data[0]["decision_id"]
        log(f"Fetching details for {decision_id}...")
        r = requests.get(f"{BASE_URL}/v1/governance/{decision_id}")
        if r.status_code != 200:
            fail(f"Details fetch failed: {r.status_code}")
        log("✓ Details fetched successfully.")

if __name__ == "__main__":
    test_governance_api()
