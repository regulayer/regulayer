import asyncio
import asyncpg
import os
import json
import urllib.request

async def main():
    # Step 1: Create a "require_approval" rule that checks output for "love"
    gov_url = "http://governance:8002"
    policy_url = "http://policy-engine:8000"
    
    rule = {
        "name": "Flag Love Content for Review",
        "description": "Flags any decision whose output contains the word 'love' for manual approval.",
        "applies_to": ["all"],
        "conditions": [
            {"field": "output", "operator": "contains", "value": "love"}
        ],
        "actions": [
            {"type": "require_approval"}
        ]
    }
    
    secret = os.environ.get("INTERNAL_SECRET", "dev_internal_secret")
    # Create the rule via the Governance API
    req = urllib.request.Request(
        f"{gov_url}/v1/governance/rules",
        data=json.dumps(rule).encode(),
        headers={
            "Content-Type": "application/json",
            "X-Internal-Auth": secret
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            created = json.loads(resp.read().decode())
            print(f"✅ Rule created: {created.get('name')} (ID: {created.get('policy_id')})")
    except Exception as e:
        print(f"❌ Failed to create rule: {e}")
        # Try to read error body
        if hasattr(e, 'read'):
            print(f"   Error body: {e.read().decode()}")
        return
    
    # Step 2: Now send the "what is love?" decision through intake
    intake_payload = {
        "event": "DECISION_RECORDED",
        "decision_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0001",
        "org_id": "test-org",
        "project_id": "test",
        "environment": "production",
        "payload": {
            "decision_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0001",
            "input": {"prompt": "what is love?", "temperature": 0.7},
            "output": {
                "model": "llama-3.1-8b-instant",
                "response": "What a profound and complex question. Love is a multifaceted and deeply personal concept."
            }
        }
    }
    
    req2 = urllib.request.Request(
        f"{policy_url}/v1/intake",
        data=json.dumps(intake_payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req2) as resp:
            result = json.loads(resp.read().decode())
            print(f"\n📋 Intake result: {json.dumps(result, indent=2)}")
    except Exception as e:
        print(f"❌ Intake failed: {e}")
        if hasattr(e, 'read'):
            print(f"   Error body: {e.read().decode()}")
        return
    
    # Step 3: Wait a moment then check the governance DB for the new decision
    import time
    print("\n⏳ Waiting 3 seconds for actions to dispatch...")
    time.sleep(3)
    
    db_url = os.environ.get("DATABASE_URL")
    conn = await asyncpg.connect(db_url)
    try:
        query = """
        SELECT review_state, timestamp, action_reason 
        FROM governance_review_history 
        WHERE decision_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0001' 
        ORDER BY timestamp DESC, id DESC LIMIT 10
        """
        rows = await conn.fetch(query)
        print(f"\n=== Governance Review History for test decision: {len(rows)} entries ===")
        for row in rows:
            print(f"  state={row['review_state']}, time={row['timestamp']}, reason={row['action_reason']}")
        
        if len(rows) == 0:
            print("\n⚠️  No governance entries found! Actions may not have dispatched.")
        else:
            states = [r['review_state'] for r in rows]
            if 'pending' in states:
                print("\n✅ SUCCESS! Decision was flagged with 'pending' state (require_approval worked!)")
            elif any(s != 'unreviewed' for s in states):
                print(f"\n✅ Actions were dispatched. States: {states}")
            else:
                print("\n⚠️  Only 'unreviewed' states found.")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
