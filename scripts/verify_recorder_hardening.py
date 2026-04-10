
import requests
import json
import hashlib
import sys
import time
import uuid
from datetime import datetime

# Configuration
GATEWAY_URL = "http://localhost:8000"
HEADERS = {
    "Content-Type": "application/json",
    "X-Regulayer-Environment": "prod" # As we are hardening for prod
}

def print_pass(msg):
    print(f" PASS: {msg}")

def print_fail(msg):
    print(f"❌ FAIL: {msg}")
    sys.exit(1)

def print_info(msg):
    print(f"ℹ️  INFO: {msg}")

def main():
    print("🔒 REGULAYER RECORDER HARDENING VERIFICATION")
    print("===========================================")
    
    # 1. Check Trust Anchors (Keys)
    # -----------------------------
    print("\n[Test 1] Verifying Trust Anchors (Public Keys)...")
    try:
        resp = requests.get(f"{GATEWAY_URL}/v1/recorder/keys")
        if resp.status_code != 200:
            print_fail(f"Failed to fetch keys: {resp.status_code}")
        
        data = resp.json()
        print_info(f"Keys Response: {json.dumps(data, indent=2)}")
        
        if "fingerprint" not in data:
            print_fail("Key response missing 'fingerprint'")
        if "algorithm" not in data or data["algorithm"] != "Ed25519":
            print_fail("Key response algorithm mismatch (Expected Ed25519)")
            
        print_pass("Trust Anchors Valid & Exposed")
    except Exception as e:
        print_fail(f"Key check exception: {e}")

    # 2. Ingest or Fetch Decision
    # ---------------------------
    print("\n[Test 2] Acquiring Decision for Export Test...")
    decision_id = str(uuid.uuid4())
    payload = {
        "event_version": "1.0",
        "event_state": "completed",
        "decision_id": decision_id,
        "system_name": "HARDENING_TESTNER",
        "risk_level": "low",
        "model_name": "gpt-4",
        "model_version": "1.0",
        "start_timestamp": datetime.utcnow().isoformat() + "Z",
        "end_timestamp": datetime.utcnow().isoformat() + "Z",
        "execution_duration_ms": 100,
        "runtime_fingerprint": {
            "python_version": "3.9",
            "os": "linux",
            "sdk_version": "1.0.0",
            "sdk_instance_id": str(uuid.uuid4())
        },
        "input": {"prompt": "verify hardening"},
        "output": {"response": "verified"}
    }
    

    # Try Ingest
    ingest_headers = HEADERS.copy()
    # Ensure we use an API key if Gateway requires it (it does now for /v1/decisions)
    # Using a dummy or demo key might fail if not set up, but let's assume standard dev env has one or "demo" mode.
    # Actually, verify_recorder_hardening.py is for Recorder hardening, but touches Gateway.
    # The ingestion might fail 403 if no key.
    # But if we get 201, it's a semantic fail.
    
    try:
        resp = requests.post(f"{GATEWAY_URL}/v1/decisions", json=payload, headers=ingest_headers)
        
        if resp.status_code == 201:
            print_fail("Semantic Violation: Gateway returned 201 Created! Must be 202 Accepted.")
            
        if resp.status_code == 202:
            print_pass(f"Ingested new decision {decision_id} (Strict 202)")
            time.sleep(2) # Wait for async write
        elif resp.status_code == 403:
             print_info("Ingestion returned 403 (Auth required). Skipping ingest check, using existing if possible.")
             # This is acceptable if we are just testing Recorder hardening and don't have a valid key handy
        else:
            print_info(f"Ingest failed ({resp.status_code}), falling back to existing decisions.")
            
        # Fetch existing
        resp_get = requests.get(f"{GATEWAY_URL}/v1/decisions", headers=HEADERS)
        if resp_get.status_code != 200 or not resp_get.json():
            print_fail("Could not ingest AND could not find existing decisions.")
        
        # If we ingested, use that ID. If valid ingestion, resp is 202.
        if resp.status_code == 202:
             # Response body from ingest_decision has 'id' or 'decision_id'
             # ingest_decision returns {..., "id": ...}
             ingested_data = resp.json()
             if 'decision_id' in ingested_data:
                 decision_id = ingested_data['decision_id']
             elif 'id' in ingested_data:
                 decision_id = ingested_data['id']
        else:
             decision_id = resp_get.json()[0]['decision_id']
             print_pass(f"Using existing decision {decision_id}")

    except Exception as e:
        print_fail(f"Ingest/Fetch exception: {e}")

    # 3. Deterministic Export Check
    # -----------------------------
    print("\n[Test 3] Verifying Deterministic Export (Byte-for-Byte)...")
    url = f"{GATEWAY_URL}/v1/decisions/{decision_id}/export"
    
    resp1 = requests.get(url)
    if resp1.status_code != 200:
        print_fail(f"Export 1 failed: {resp1.status_code}")
    data1 = resp1.content # Bytes
    
    time.sleep(1) # Ensure time passes to catch dynamic timestamp bugs
    
    resp2 = requests.get(url)
    if resp2.status_code != 200:
        print_fail(f"Export 2 failed: {resp2.status_code}")
    data2 = resp2.content # Bytes
    
    if data1 != data2:
        print("Diff Analysis:")
        print(f"Export 1 len: {len(data1)}")
        print(f"Export 2 len: {len(data2)}")
        try:
             # Try to show diff of JSON keys?
             j1 = json.loads(data1)
             j2 = json.loads(data2)
             # compare keys
             if j1 != j2:
                 print("JSON Content Mismatch!")
        except:
             print("Binary mismatch")
        print_fail("Exports are NOT identical. Determinism check failed.")
    
    print_pass("Exports are byte-identical (Deterministic success)")

    # 4. Chain Integrity Report
    # -------------------------
    print("\n[Test 4] Verifying Chain Integrity Report Endpoint...")
    resp = requests.get(f"{GATEWAY_URL}/v1/reports/chain-integrity")
    if resp.status_code != 200:
        print_fail(f"Report endpoint failed: {resp.status_code}")
    
    report = resp.json()
    print_info(f"Report: {json.dumps(report, indent=2)}")
    
    if report["chain_status"] != "VALID":
        print_fail(f"Chain status is {report['chain_status']}")
    
    print_pass("Chain Integrity Report is VALID")

    # 5. Full Forensic Verification
    # -----------------------------
    print("\n[Test 5] Running Full Forensic Verification (POST)...")
    resp = requests.post(f"{GATEWAY_URL}/v1/recorder/verify-integrity")
    if resp.status_code != 200:
        print_fail(f"Integrity check failed: {resp.status_code}")
        
    audit = resp.json()
    print_info(f"Audit Result: {json.dumps(audit, indent=2)}")
    
    if audit["status"] != "VALID":
        print_fail(f"Forensic check failed: {audit['first_error']}")
        
    print_pass("Forensic Integrity Check PASSED")

    print("\n[SUCCESS] Automated Hardening Verification Complete.")
    print("----------------------------------------------------")
    print("MANUAL STEPS REQUIRED:")
    print("1. Restart Gateway and Recorder to apply all changes.")
    print("   `docker-compose restart gateway recorder`")
    print("2. Run this script again.")
    print("3. Try to manually tamper with DB (if possible) and rerun test to confirm 'CORRUPTED'.")

if __name__ == "__main__":
    main()
