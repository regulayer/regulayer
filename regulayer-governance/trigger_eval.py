import urllib.request
import json
import sys

url = "http://policy-engine:8000/v1/workflows/9c8ee30e-1e34-4080-a33d-51bc25fe7412/re-evaluate"
headers = {
    "Content-Type": "application/json",
    "X-Internal-Auth": "regulayer_internal_secret_value_change_in_prod"
}

req = urllib.request.Request(url, headers=headers, method="POST", data=b"{}")
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode())
except urllib.error.URLError as e:
    print(f"Error: {e}")
except Exception as e:
    print(f"Error: {e}")
