"""
Regulayer - Independent Chain Reproduction Script (No SDK)

Verifies the cryptographic integrity of a chain of records (Mocked as list).
"""

import json
import sys
import hashlib

def verify_chain(chain_path: str):
    print(f"Loading chain: {chain_path}")
    with open(chain_path, 'r') as f:
        records = json.load(f)
        
    # Sort by sequence or id
    # Assuming list is ordered
    
    prev_hash = records[0].get('previous_record_hash')
    if prev_hash and prev_hash != "0" * 64:
        print("Warning: First record has previous hash but is start of this bundle.")
        
    for i, record in enumerate(records):
        print(f"Verifying Record {record.get('record_id')}...")
        
        # 1. Recompute Hash
        # Reuse logic from single proof (simplified here)
        version = record.get('proof_version', '1.0')
        ts = record.get('record_timestamp', '')
        dec_id = record.get('decision_id', '')
        p_hash = record.get('previous_record_hash', '')
        pay_hash = record.get('canonical_payload_hash', '')
        
        data = f"{version}|{ts}|{dec_id}|{p_hash}|{pay_hash}".encode('utf-8')
        computed = hashlib.sha256(data).hexdigest()
        
        if computed != record.get('record_hash'):
             print(f"FAIL: Hash Mismatch at index {i}")
             return False
             
        # 2. Check Chain Link
        if i > 0:
            actual_prev = records[i-1].get('record_hash')
            if p_hash != actual_prev:
                print(f"FAIL: Chain Broken at index {i}. Prev={p_hash}, Actual={actual_prev}")
                return False
                
    print("PASS: Chain integrity verified.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python reproduce_chain.py <chain.json>")
        sys.exit(1)
        
    success = verify_chain(sys.argv[1])
    sys.exit(0 if success else 1)
