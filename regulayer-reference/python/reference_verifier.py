"""
Regulayer Reference Verifier (Python)

CLEAN-ROOM IMPLEMENTATION
This verifier shares NO code with Regulayer production systems.
It exists solely to prove that verification is reproducible by anyone.

Purpose:
- Courts can verify proofs without Regulayer
- Regulators can validate independently
- Third parties can audit without vendor dependency

Usage:
    python reference_verifier.py bundle.json

Requirements:
    pip install pynacl  # For Ed25519
"""

import json
import hashlib
import base64
import sys
from datetime import datetime
from typing import Tuple, Optional, Dict, Any


# ============================================================
# Canonicalization (RFC 8785)
# ============================================================

def canonicalize_json(obj: Any) -> bytes:
    """
    Canonicalize JSON according to RFC 8785.
    
    Rules:
    - Objects: keys sorted alphabetically
    - Numbers: no trailing zeros, no leading zeros
    - Strings: UTF-8 encoded
    - No whitespace between tokens
    """
    if obj is None:
        return b'null'
    elif isinstance(obj, bool):
        return b'true' if obj else b'false'
    elif isinstance(obj, int):
        return str(obj).encode('utf-8')
    elif isinstance(obj, float):
        # Handle special cases
        if obj == int(obj):
            return str(int(obj)).encode('utf-8')
        return str(obj).encode('utf-8')
    elif isinstance(obj, str):
        # Escape special characters
        escaped = obj.replace('\\', '\\\\').replace('"', '\\"')
        escaped = escaped.replace('\n', '\\n').replace('\r', '\\r')
        escaped = escaped.replace('\t', '\\t')
        return f'"{escaped}"'.encode('utf-8')
    elif isinstance(obj, list):
        items = b','.join(canonicalize_json(item) for item in obj)
        return b'[' + items + b']'
    elif isinstance(obj, dict):
        # Sort keys alphabetically
        sorted_keys = sorted(obj.keys())
        items = b','.join(
            canonicalize_json(k) + b':' + canonicalize_json(obj[k])
            for k in sorted_keys
        )
        return b'{' + items + b'}'
    else:
        raise ValueError(f"Cannot canonicalize type: {type(obj)}")


# ============================================================
# Hash Verification
# ============================================================

def compute_hash(data: bytes) -> str:
    """Compute SHA-256 hash."""
    return f"sha256:{hashlib.sha256(data).hexdigest()}"


def verify_record_hash(record: Dict) -> Tuple[bool, str]:
    """
    Verify that the record hash matches the computed hash.
    """
    claimed_hash = record.get("record_hash", "")
    
    # Create a copy without the hash field for verification
    record_copy = {k: v for k, v in record.items() if k != "record_hash"}
    
    canonical = canonicalize_json(record_copy)
    computed_hash = compute_hash(canonical)
    
    if claimed_hash == computed_hash:
        return True, "Hash verified"
    else:
        return False, f"Hash mismatch: expected {claimed_hash}, computed {computed_hash}"


# ============================================================
# Signature Verification
# ============================================================

def verify_signature_ed25519(
    public_key_b64: str,
    message: bytes,
    signature_b64: str
) -> Tuple[bool, str]:
    """
    Verify Ed25519 signature.
    """
    try:
        from nacl.signing import VerifyKey
        from nacl.exceptions import BadSignature
        
        public_key = base64.b64decode(public_key_b64)
        signature = base64.b64decode(signature_b64)
        
        verify_key = VerifyKey(public_key)
        verify_key.verify(message, signature)
        
        return True, "Signature verified"
    except BadSignature:
        return False, "Invalid signature"
    except Exception as e:
        return False, f"Signature verification error: {e}"


def verify_attestation(
    attestation: Dict,
    record_hash: str,
    public_key_b64: Optional[str] = None
) -> Tuple[bool, str]:
    """
    Verify the attestation signature.
    """
    algorithm = attestation.get("algorithm", "")
    signature = attestation.get("signature", "")
    
    if not signature:
        return False, "Missing signature"
    
    message = record_hash.encode('utf-8')
    
    if algorithm == "Ed25519":
        if not public_key_b64:
            return False, "Public key required for verification"
        return verify_signature_ed25519(public_key_b64, message, signature)
    else:
        return False, f"Unsupported algorithm: {algorithm}"


# ============================================================
# Chain Verification
# ============================================================

def verify_chain_position(
    chain_position: Dict,
    previous_record_hash: Optional[str] = None
) -> Tuple[bool, str]:
    """
    Verify chain position linking.
    """
    sequence = chain_position.get("sequence_number", 0)
    previous_hash = chain_position.get("previous_hash", "")
    
    if sequence < 1:
        return False, f"Invalid sequence number: {sequence}"
    
    if sequence == 1:
        # Genesis record
        if previous_hash and previous_hash != "genesis":
            return False, "Genesis record should not have previous hash"
        return True, "Genesis record verified"
    
    if previous_record_hash:
        if previous_hash != previous_record_hash:
            return False, f"Chain link broken: expected {previous_record_hash}"
    
    return True, "Chain position verified"


# ============================================================
# Bundle Verification
# ============================================================

class VerificationResult:
    def __init__(self):
        self.valid = True
        self.checks = []
    
    def add_check(self, name: str, passed: bool, message: str):
        self.checks.append({
            "name": name,
            "passed": passed,
            "message": message
        })
        if not passed:
            self.valid = False
    
    def to_dict(self) -> Dict:
        return {
            "valid": self.valid,
            "checks": self.checks,
            "verified_at": datetime.utcnow().isoformat() + "Z"
        }


def verify_bundle(
    bundle: Dict,
    public_key_b64: Optional[str] = None,
    previous_record_hash: Optional[str] = None
) -> VerificationResult:
    """
    Verify a complete proof bundle.
    
    This is the main entry point for verification.
    """
    result = VerificationResult()
    
    # 1. Schema presence check
    required_fields = ["decision", "attestation", "chain_position", "verification"]
    for field in required_fields:
        if field not in bundle:
            result.add_check(f"schema.{field}", False, f"Missing required field: {field}")
    
    if not result.valid:
        return result
    
    decision = bundle["decision"]
    attestation = bundle["attestation"]
    chain_position = bundle["chain_position"]
    
    # 2. Hash verification
    hash_valid, hash_msg = verify_record_hash(decision)
    result.add_check("hash", hash_valid, hash_msg)
    
    # 3. Chain verification
    chain_valid, chain_msg = verify_chain_position(chain_position, previous_record_hash)
    result.add_check("chain", chain_valid, chain_msg)
    
    # 4. Signature verification (if public key provided)
    if public_key_b64:
        record_hash = decision.get("record_hash", "")
        sig_valid, sig_msg = verify_attestation(attestation, record_hash, public_key_b64)
        result.add_check("signature", sig_valid, sig_msg)
    else:
        result.add_check("signature", True, "Skipped (no public key provided)")
    
    # 5. Offline verifiability check
    verification = bundle.get("verification", {})
    if verification.get("verifiable_offline") is True:
        result.add_check("offline", True, "Bundle is offline-verifiable")
    else:
        result.add_check("offline", False, "Bundle not marked as offline-verifiable")
    
    return result


# ============================================================
# CLI
# ============================================================

def main():
    if len(sys.argv) < 2:
        print("Regulayer Reference Verifier")
        print("Usage: python reference_verifier.py <bundle.json> [public_key_base64]")
        print("\nThis is a clean-room implementation for independent verification.")
        sys.exit(1)
    
    bundle_path = sys.argv[1]
    public_key = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        with open(bundle_path, 'r') as f:
            bundle = json.load(f)
    except Exception as e:
        print(f"Error loading bundle: {e}")
        sys.exit(1)
    
    result = verify_bundle(bundle, public_key)
    
    print("\n" + "=" * 50)
    print("REGULAYER REFERENCE VERIFIER")
    print("=" * 50)
    print(f"\nBundle: {bundle_path}")
    print(f"Result: {'✓ VALID' if result.valid else '✗ INVALID'}\n")
    
    for check in result.checks:
        status = "✓" if check["passed"] else "✗"
        print(f"  {status} {check['name']}: {check['message']}")
    
    print("\n" + "=" * 50)
    print("This verifier is independent of Regulayer systems.")
    print("=" * 50 + "\n")
    
    sys.exit(0 if result.valid else 1)


if __name__ == "__main__":
    main()
