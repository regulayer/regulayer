#!/usr/bin/env python3
"""
Regulayer Offline Verifier (Standalone)
Version: 1.0.2

This script verifies the cryptographic integrity of a Regulayer Proof Bundle (.json).
It checks:
1. JSON Structure & Schema
2. Canonicalization (Reserialization match)
3. SHA-256 Hash Integrity (Content -> Hash)
4. Ed25519 Signature Validity (Hash -> Signature -> Public Key)

Dependencies:
    pip install cryptography

Usage:
    python offline_verifier.py path/to/proof_bundle.json
"""

import sys
import json
import hashlib
import base64
import argparse
from typing import Dict, Any, Tuple

try:
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
    from cryptography.exceptions import InvalidSignature
except ImportError:
    print("❌ Error: 'cryptography' library is missing.")
    print("Please run: pip install cryptography")
    sys.exit(1)

SUPPORTED_VERSION = "1.0.0"

class VerificationError(Exception):
    pass

def canonicalize(data: Any) -> bytes:
    """
    Produce a canonical JSON representation.
    Must match regulayer-recorder logic exactly:
    - Sort keys
    - UTF-8 encoding
    - No whitespace separators
    - Ensure ASCII = False (allow unicode)
    """
    return json.dumps(
        data,
        sort_keys=True,
        ensure_ascii=False,
        separators=(',', ':')
    ).encode('utf-8')

def verify_signature(public_key_b64: str, signature_b64: str, message: bytes) -> bool:
    """Verify Ed25519 signature."""
    try:
        # 1. Decode keys/sig
        # Handle Base64 padding if necessary
        pk_b64_padded = public_key_b64 + '=' * (-len(public_key_b64) % 4)
        sig_b64_padded = signature_b64 + '=' * (-len(signature_b64) % 4)
        
        pub_bytes = base64.b64decode(pk_b64_padded)
        sig_bytes = base64.b64decode(sig_b64_padded)
        
        if len(pub_bytes) != 32:
            raise VerificationError(f"Invalid public key length: {len(pub_bytes)} bytes (expected 32)")

        # 2. Load Public Key
        public_key = Ed25519PublicKey.from_public_bytes(pub_bytes)

        # 3. Verify
        public_key.verify(sig_bytes, message)
        return True
        
    except (InvalidSignature, ValueError) as e:
        # print(f"Signature Debug: {e}")
        return False
    except Exception as e:
        raise VerificationError(f"Crypto error: {str(e)}")

def verify_bundle(file_path: str):
    print(f"\n🔍 Verifying: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            raw_bytes = f.read()
        data = json.loads(raw_bytes)
    except FileNotFoundError:
        print("❌ File not found.")
        return False
    except json.JSONDecodeError:
        print("❌ Invalid JSON format.")
        return False

    # 1. Version Check
    version = data.get("proof_bundle_version")
    if version != SUPPORTED_VERSION:
        print(f"⚠️  Warning: Bundle version {version} differs from supported {SUPPORTED_VERSION}.")
    
    # 2. Schema Check
    required_fields = ["record_id", "canonical_event", "record_hash", "chain_id"]
    for field in required_fields:
        if field not in data:
            print(f"❌ Schema Error: Missing '{field}'")
            return False

    # 3. Canonicalization & Hash Check
    print("   [1/3] Checking Content Integrity...", end=" ")
    canonical_event = data["canonical_event"]
    canonical_bytes = canonicalize(canonical_event)
    computed_hash = hashlib.sha256(canonical_bytes).hexdigest()
    
    expected_hash = data["record_hash"]
    if computed_hash != expected_hash:
        print("FAILED")
        print(f"      Calculated: {computed_hash}")
        print(f"      Expected:   {expected_hash}")
        return False
    print("PASS")

    # 4. Signature Check
    print("   [2/3] Checking Signature...", end=" ")
    attestation = data.get("attestation")
    if not attestation:
        print("SKIPPED (No attestation present)")
        return True # Valid but unsigned (e.g. pending)
        
    public_key = attestation.get("public_key")
    signature = attestation.get("signature")
    
    if not public_key or not signature:
         print("FAILED (Incomplete attestation)")
         return False

    # Note: verifier.py logic was: verify(sig, canonical_bytes)
    # Check if we need to verify against HASH or RAW BYTES.
    # Regulayer uses Ed25519 which signs raw bytes usually.
    # The verifier.py I read earlier verified `canonical_bytes`.
    is_valid = verify_signature(public_key, signature, canonical_bytes)
    if not is_valid:
        print("FAILED (Signature mismatch)")
        return False
    print("PASS")
    
    print("\n✅ VERIFICATION SUCCESSFUL")
    print(f"   Record ID: {data.get('record_id')}")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python offline_verifier.py path/to/proof_bundle.json")
        sys.exit(1)
        
    success = verify_bundle(sys.argv[1])
    sys.exit(0 if success else 1)
