
import httpx
import sys

URL = "http://localhost:8080/v1/ingest/decision"
HEADERS = {
    "Content-Type": "application/json",
    "X-Regulayer-Api-Key": "rl_fake"
}

print(f"Connecting to {URL}...")
try:
    with httpx.Client() as client:
        r = client.post(URL, json={"test": "data"}, headers=HEADERS)
        print(f"Status: {r.status_code}")
        print(f"Body: {r.text}")
except Exception as e:
    print(f"Error: {e}")
