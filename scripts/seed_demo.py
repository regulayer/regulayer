#!/usr/bin/env python3
"""
Regulayer Demo Seeder

Boots a demo environment by:
1. Creating a 'Demo Corp' organization
2. Creating a 'Development' project
3. Generatng an API Key
4. Recording 10 sample decisions
"""

import sys
import requests
import time
import os
import json

BASE_URL_CONTROL = os.getenv("CONTROL_PLANE_URL", "http://localhost:8000")
BASE_URL_GATEWAY = os.getenv("GATEWAY_URL", "http://localhost:8080")

def log(msg):
    print(f"[SEED] {msg}")

def check_health():
    try:
        r = requests.get(f"{BASE_URL_CONTROL}/health")
        if r.status_code == 200:
            return True
    except:
        return False
    return False

def main():
    log("Waiting for services...")
    retries = 30
    while retries > 0:
        if check_health():
            break
        time.sleep(1)
        retries -= 1
        sys.stdout.write(".")
        sys.stdout.flush()
    print("")

    if retries == 0:
        log("CRITICAL: Control Plane not reachable.")
        sys.exit(1)

    # 1. Create Org
    log("Creating Demo Org...")
    r = requests.post(f"{BASE_URL_CONTROL}/v1/orgs", json={"name": "Demo Corp"})
    if r.status_code not in [200, 201]:
        log(f"Failed to create org: {r.text}")
        sys.exit(1)
    org = r.json()
    org_id = org["id"]
    log(f"Org Created: {org_id}")

    # 2. Create Project
    log("Creating Project...")
    r = requests.post(f"{BASE_URL_CONTROL}/v1/orgs/{org_id}/projects", json={
        "name": "Demo App",
        "environment": "development"
    })
    project = r.json()
    project_id = project["id"]
    log(f"Project Created: {project_id}")

    # 3. Create API Key
    log("Generating API Key...")
    r = requests.post(f"{BASE_URL_CONTROL}/v1/projects/{project_id}/keys", json={
        "name": "seed-key",
        "scopes": ["ingest:write", "decisions:read"]
    })
    key_data = r.json()
    api_key = key_data["secret_key"]
    log(f"API Key: {api_key}")

    # 4. Record Decisions
    log("Recording 10 Decisions...")
    headers = {
        "X-Regulayer-Api-Key": api_key,
        "Content-Type": "application/json"
    }
    
    for i in range(10):
        payload = {
            "decision": "approve_loan",
            "subject": f"user_{i}",
            "amount": 1000 + i,
            "model": "risk_v1"
        }
        r = requests.post(
            f"{BASE_URL_GATEWAY}/v1/ingest/decision",
            json=payload,
            headers=headers
        )
        if r.status_code == 200 or r.status_code == 202:
            sys.stdout.write("✓")
        else:
            sys.stdout.write("X")
            log(f"Error: {r.text}")
        sys.stdout.flush()
    
    print("")
    log("Seeding Complete.")
    log(f"Demo credentials written to demo_creds.json")
    
    with open("demo_creds.json", "w") as f:
        json.dump({
            "org_id": org_id,
            "project_id": project_id,
            "api_key": api_key
        }, f, indent=2)

if __name__ == "__main__":
    main()
