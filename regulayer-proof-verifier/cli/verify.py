import json
from typing import Dict, Any

from .errors import ErrorCode, VerificationError
from crypto.canonicalizer import canonicalize, assert_canonical_integrity
from crypto.hasher import compute_hash
from crypto.verifier import verify_signature

SUPPORTED_VERSION = "1.0.0"

def verify_proof_command(proof_file: str) -> Dict[str, Any]:
    """
    Verify a single proof bundle from file.
    
    Returns dict with verification results on success.
    Raises VerificationError on failure.
    """
    # 1. Load JSON
    try:
        with open(proof_file, 'r', encoding='utf-8') as f:
            raw_bytes = f.read()
        data = json.loads(raw_bytes)
    except FileNotFoundError:
        raise VerificationError(ErrorCode.FILE_NOT_FOUND, f"File not found: {proof_file}")
    except json.JSONDecodeError as e:
        raise VerificationError(ErrorCode.INVALID_JSON, f"Invalid JSON: {str(e)}")
    
    # 2. Version Check
    version = data.get("proof_bundle_version")
    if version != SUPPORTED_VERSION:
        raise VerificationError(
            ErrorCode.UNSUPPORTED_VERSION, 
            f"Unsupported version: {version}. Expected {SUPPORTED_VERSION}."
        )
    
    # 3. Schema Check (basic)
    required_fields = ["record_id", "canonical_event", "record_hash", "chain_id"]
    for field in required_fields:
        if field not in data:
            raise VerificationError(ErrorCode.SCHEMA_ERROR, f"Missing required field: {field}")
    
    # 4. Canonicalization & Hash Check
    canonical_event = data["canonical_event"]
    canonical_bytes = canonicalize(canonical_event)
    computed_hash = compute_hash(canonical_bytes)
    
    # Note: The recorder stores record_hash which is computed differently (includes metadata).
    # For the proof bundle, we verify canonical_event hash against a stored value.
    # The PROOF_BUNDLE_SPEC says record_hash is SHA256 of the canonical event.
    # Let's verify against record_hash for now.
    
    expected_hash = data["record_hash"]
    if computed_hash != expected_hash:
        raise VerificationError(
            ErrorCode.INVALID_HASH,
            f"Hash mismatch. Computed: {computed_hash[:16]}... Expected: {expected_hash[:16]}..."
        )
    
    # 5. Signature Check (if attestation present)
    attestation = data.get("attestation")
    if attestation:
        public_key = attestation.get("public_key")
        signature = attestation.get("signature")
        
        if not public_key or not signature:
            raise VerificationError(ErrorCode.SCHEMA_ERROR, "Attestation missing public_key or signature")
        
        is_valid = verify_signature(public_key, signature, canonical_bytes)
        if not is_valid:
            raise VerificationError(
                ErrorCode.INVALID_SIGNATURE,
                "Signature does not match canonical payload"
            )
    
    return {
        "status": "PASS",
        "record_id": data.get("record_id"),
        "hash_valid": True,
        "signature_valid": attestation is not None
    }
