#!/usr/bin/env python3
"""
Test script to send HMAC-signed decision events to the Recorder.
"""
import hashlib
import hmac
import json
import requests
from datetime import datetime, timezone

# Development HMAC key (must match recorder's HMAC_SECRET_KEY)
HMAC_SECRET_KEY = "development-secret-key-change-in-production-minimum-32-chars"
RECORDER_URL = "http://localhost:8300/v1/decisions"

def canonicalize_event(event: dict) -> str:
    """Deterministically serialize event to JSON string."""
    return json.dumps(event, sort_keys=True, separators=(',', ':'))

def sign_payload(payload_str: str, secret_key: str) -> str:
    """Generate HMAC-SHA256 signature for payload."""
    signature = hmac.new(
        secret_key.encode(),
        payload_str.encode(),
        hashlib.sha256
    ).hexdigest()
    return signature

def main():
    # Create decision event payload
    payload = {
        "decision_id": "550e8400-e29b-41d4-a716-446655440000",
        "system_name": "test_system",
        "risk_level": "standard",
        "event_version": "2.0",
        "event_state": "completed",
        "model_name": "test-model",
        "model_version": "1.0",
        "start_timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "end_timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "execution_duration_ms": 100.0,
        "runtime_fingerprint": {
            "python_version": "3.10",
            "os": "linux",
            "sdk_version": "1.0.0",
            "sdk_instance_id": "550e8400-e29b-41d4-a716-446655440001"
        },
        "input_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "output_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
    
    # Canonicalize and sign
    canonical = canonicalize_event(payload)
    signature = sign_payload(canonical, HMAC_SECRET_KEY)
    
    print(f"Payload (canonical): {canonical[:100]}...")
    print(f"Signature: {signature}")
    
    # Send request with signature headers
    headers = {
        "Content-Type": "application/json",
        "X-Regulayer-Project-Id": "global",
        "X-Regulayer-Environment": "prod",
        "X-Regulayer-Signature": signature,
        "X-Regulayer-Algorithm": "HMAC-SHA256"
    }
    
    try:
        response = requests.post(RECORDER_URL, json=payload, headers=headers)
        print(f"\nStatus: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    main()
