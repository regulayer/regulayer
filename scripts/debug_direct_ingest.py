import urllib.request
import urllib.error
import json
import uuid
from datetime import datetime, timezone

RECORDER_URL = "http://localhost:8300"

def request(url, method="GET", data=None, headers=None):
    if headers is None: headers = {}
    jsondata = None
    if data is not None:
        jsondata = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    
    req = urllib.request.Request(url, data=jsondata, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as f:
            resp_data = f.read().decode('utf-8')
            return f.status, resp_data
    except urllib.error.HTTPError as e:
        err_data = e.read().decode('utf-8')
        return e.code, err_data
    except Exception as e:
        return 0, str(e)

import hashlib

def compute_hash(data):
    if data is None: return None
    canonical = json.dumps(data, sort_keys=True, separators=(',', ':')).encode('utf-8')
    return hashlib.sha256(canonical).hexdigest()

def test_direct():
    print("DEBUG: Testing Direct Recorder Ingestion")
    decision_id = str(uuid.uuid4())
    input_data = {"debug": True}
    output_data = {"debug": True}
    
    payload = {
        "decision_id": decision_id,
        "system_name": "debug_script",
        "decision_type": "debug",
        "risk_level": "standard",
        "event_version": "2.0",
        "event_state": "completed",
        "model_name": "debug-model",
        "model_version": "1.0",
        "start_timestamp": datetime.now(timezone.utc).isoformat(),
        "end_timestamp": datetime.now(timezone.utc).isoformat(),
        "execution_duration_ms": 10.0,
        "runtime_fingerprint": {
            "python_version": "3.10",
            "os": "linux",
            "sdk_version": "1.0.0", # Changed to 1.0.0
            "sdk_instance_id": str(uuid.uuid4())
        },
        "input": input_data,
        "output": output_data,
        "input_hash": compute_hash(input_data),
        "output_hash": compute_hash(output_data),
        "metadata": {}
    }
    
    headers = {
        "X-Regulayer-Project-Id": "global",
        "X-Regulayer-Environment": "prod"
    }
    
    status, body = request(f"{RECORDER_URL}/v1/decisions", "POST", payload, headers)
    print(f"Status: {status}")
    print(f"Body: {body}")

if __name__ == "__main__":
    test_direct()
