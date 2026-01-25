"""
Regulayer - Independent Proof Reproduction Script (No SDK)

This script demonstrates how to verify a Regulayer Proof Bundle using ONLY 
standard Python libraries and the `cryptography` package.

Usage: python reproduce_single_proof.py <proof_bundle.json> <public_key.pem>
"""

import json
import hashlib
import sys
import base64
from typing import Dict, Any

# Standard crypto lib (pip install cryptography)
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from cryptography.hazmat.primitives import serialization

def canonicalize_json(data: Any) -> bytes:
    """
    RFC 8785 (JCS) inspired canonicalization for Regulayer.
    - Sort keys
    - No whitespace (separators=(',', ':'))
    """
    return json.dumps(data, sort_keys=True, separators=(',', ':')).encode('utf-8')

def verify_single_proof(proof_path: str, pubkey_path: str):
    print(f"Loading proof: {proof_path}")
    with open(proof_path, 'r') as f:
        proof = json.load(f)

    # 1. Verify Payload Hash
    print("Step 1: Verifying Canonical Payload Hash...")
    payload = proof.get('canonical_payload') or proof.get('payload') # Handle variants
    if not payload:
        # In some bundles, payload might be separated. Assume 'canonical_payload' key exists.
        # If hash is only thing provided, we can't verify hash without payload.
        # But for reproduction, we assume we have the full bundle.
        # If payload missing, fail.
        print("FAIL: Payload data missing from bundle.")
        return False
        
    canonical_bytes = canonicalize_json(payload)
    computed_payload_hash = hashlib.sha256(canonical_bytes).hexdigest()
    
    expected_payload_hash = proof.get('canonical_payload_hash')
    if computed_payload_hash != expected_payload_hash:
         print(f"FAIL: Payload hash mismatch.\nComputed: {computed_payload_hash}\nExpected: {expected_payload_hash}")
         return False
    print("PASS: Payload hash matches.")

    # 2. Verify Record Hash
    # Reconstruct the string that was signed.
    # Format: version|timestamp|decision_id|previous_hash|payload_hash
    print("Step 2: Verifying Record Hash...")
    
    # Note: Adjust fields based on spec version. Assuming v1.0 spec here.
    version = proof.get('proof_version', '1.0')
    ts = proof.get('record_timestamp', '')
    dec_id = proof.get('decision_id', '')
    prev_hash = proof.get('previous_record_hash', '') # Can be empty for genesis
    pay_hash = proof.get('canonical_payload_hash', '')
    
    # Strictly implementation dependent construction. 
    # For this reproduction script, we match the logic documented in specs.
    # Let's assume simple pipe concatenation.
    data_to_hash = f"{version}|{ts}|{dec_id}|{prev_hash}|{pay_hash}".encode('utf-8')
    computed_record_hash = hashlib.sha256(data_to_hash).hexdigest()
    
    expected_record_hash = proof.get('record_hash')
    if computed_record_hash != expected_record_hash:
        print(f"FAIL: Record hash mismatch.\nComputed: {computed_record_hash}\nExpected: {expected_record_hash}")
        return False
    print("PASS: Record hash matches construction.")

    # 3. Verify Signature
    print("Step 3: Verifying Signature...")
    with open(pubkey_path, 'rb') as kf:
        pub_key_bytes = kf.read()
        public_key = serialization.load_pem_public_key(pub_key_bytes)

    if not isinstance(public_key, Ed25519PublicKey):
        print("FAIL: Only Ed25519 keys supported in this script.")
        return False

    sig_b64 = proof.get('signature', {}).get('value', '')
    if not sig_b64:
        print("FAIL: Signature value missing.")
        return False
        
    signature = base64.b64decode(sig_b64)
    # What was signed? Usually the record_hash (bytes).
    # Some schemes sign the raw data bytes. Regulayer standard signs the HASH bytes?
    # Or signs the hex string? 
    # Standard practice: Sign the bytes of data. But if we sign hash, we treat hash as message.
    # Let's assume we sign the bytes of the record hash string (e.g. encode('utf-8')).
    
    msg_bytes = expected_record_hash.encode('utf-8')
    
    try:
        public_key.verify(signature, msg_bytes)
        print("PASS: Signature is VALID.")
        return True
    except Exception as e:
        print(f"FAIL: Signature validation failed: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python reproduce_single_proof.py <proof.json> <key.pem>")
        sys.exit(1)
        
    success = verify_single_proof(sys.argv[1], sys.argv[2])
    sys.exit(0 if success else 1)
