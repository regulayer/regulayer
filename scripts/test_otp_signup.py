
import asyncio
import httpx
import sys
import subprocess
import time
import re

async def main():
    base_url = "http://localhost:8100"
    email = f"test_user_{int(time.time())}@example.com"
    org_name = f"Test Org OTP {int(time.time())}"
    password = "secure_password_123"
    
    print(f"--- Step 1: Request OTP for {email} ---")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(f"{base_url}/v1/auth/signup/otp-request", json={"email": email})
            print(f"Status: {resp.status_code}")
            print(f"Response: {resp.text}")
            resp.raise_for_status()
        except httpx.RequestError as e:
            print(f"Error connecting to {base_url}: {e}")
            return

    print("\n--- Step 2: Extract OTP from Docker Logs ---")
    # Find container
    try:
        # Try to find container with 'control' in name
        container_id = subprocess.check_output("docker ps -qf name=control", shell=True).decode().strip().split('\n')[0]
        if not container_id:
             # Try 'server' or 'api'
             container_id = subprocess.check_output("docker ps -qf name=api", shell=True).decode().strip().split('\n')[0]
        
        if not container_id:
            print("Could not find control plane container. Cannot extract OTP.")
            return

        print(f"Found container ID: {container_id}")
        
        # Get logs
        logs = subprocess.check_output(f"docker logs {container_id}", shell=True).decode()
        
        # Parse OTP: "OTP FOR <email>: <code_digits>"
        # Using regex
        pattern = re.compile(f"OTP FOR {re.escape(email)}: (\\d{{6}})")
        match = pattern.search(logs)
        
        if not match:
            print("OTP not found in logs. Logs snippet:")
            print(logs[-500:])
            return
            
        code = match.group(1)
        print(f"Extracted OTP: {code}")

    except Exception as e:
        print(f"Error extracting logs: {e}")
        return

    print("\n--- Step 3: Verify OTP ---")
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{base_url}/v1/auth/signup/otp-verify", json={"email": email, "code": code})
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
        if resp.status_code != 200:
            return
        
        data = resp.json()
        signup_token = data["signup_token"]
        print(f"Got Signup Token: {signup_token}")

    print("\n--- Step 4: Complete Signup ---")
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{base_url}/v1/auth/signup/complete", json={
            "signup_token": signup_token,
            "orgName": org_name,
            "password": password
        })
        print(f"Status: {resp.status_code}")
        # print(f"Response: {resp.text}") # Might be large
        
        if resp.status_code == 200:
            print("SUCCESS: Signup completed!")
            data = resp.json()
            print(f"User ID: {data['user']['id']}")
            print(f"Org ID: {data['user']['org']['id']}")
            print(f"Token: {data['token'][:20]}...")
        else:
            print("FAILED: Signup incomplete")
            print(resp.text)

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
