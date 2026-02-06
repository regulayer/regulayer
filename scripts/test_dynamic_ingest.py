#!/usr/bin/env python3
"""
Test script to send a properly timestamped decision event to the Recorder.
Uses dynamic timestamps to avoid clock skew issues.
"""
import json
import requests
import uuid
from datetime import datetime, timezone, timedelta

RECORDER_URL = "http://localhost:8300/v1/decisions"

def main():
    # Use a timestamp slightly in the past to avoid clock skew
    now = datetime.now(timezone.utc)
    start = now - timedelta(minutes=5)
    end = now - timedelta(minutes=4)
    
    # Generate unique decision_id for each test
    decision_id = str(uuid.uuid4())
    
    payload = {
        "decision_id": decision_id,
        "system_name": "e2e_test",
        "decision_type": "test",
        "risk_level": "standard",
        "event_version": "2.0",
        "event_state": "completed",
        "model_name": "test-model",
        "model_version": "1.0",
        "start_timestamp": start.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "end_timestamp": end.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "execution_duration_ms": 60000.0,  # 1 minute
        "runtime_fingerprint": {
            "python_version": "3.10",
            "os": "linux",
            "sdk_version": "1.0.0",
            "sdk_instance_id": str(uuid.uuid4())
        },
        "input": {"test_input": "value"},
        "output": {"test_output": "result"},
        "input_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "output_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "metadata": {"test": True}
    }
    
    print(f"Sending decision: {decision_id}")
    print(f"  Start: {payload['start_timestamp']}")
    print(f"  End: {payload['end_timestamp']}")
    
    headers = {
        "Content-Type": "application/json",
        "X-Regulayer-Project-Id": "global",
        "X-Regulayer-Environment": "prod"
    }
    
    try:
        response = requests.post(RECORDER_URL, json=payload, headers=headers)
        print(f"\nStatus: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("\n✅ SUCCESS! Decision recorded!")
            return True
        else:
            print(f"\n❌ Failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"Request failed: {e}")
        return False

if __name__ == "__main__":
    main()
