import pytest
import json
import tempfile
import os

# We need to add the parent dir to path for imports to work
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from cli.verify import verify_proof_command
from cli.errors import ErrorCode, VerificationError
from crypto.canonicalizer import canonicalize
from crypto.hasher import compute_hash

def create_valid_bundle(record_id=1, prev_hash=None):
    """Create a valid proof bundle for testing."""
    canonical_event = {
        "decision_id": "test-decision-001",
        "timestamp": "2026-01-21T00:00:00+00:00",
        "system": "test-system"
    }
    
    canonical_bytes = canonicalize(canonical_event)
    record_hash = compute_hash(canonical_bytes)
    
    return {
        "proof_bundle_version": "1.0.0",
        "record_id": record_id,
        "canonical_event": canonical_event,
        "record_hash": record_hash,
        "previous_record_hash": prev_hash,
        "chain_id": "test-chain",
        "server_timestamp": "2026-01-21T00:00:00+00:00",
        "attestation": None,  # Legacy bundle
        "verification_metadata": {
            "verified_at": "2026-01-21T00:00:00+00:00",
            "verifier_version": "1.0.0",
            "recorder_version": "1.0.0",
            "verification_result": "VALID"
        }
    }

def test_valid_legacy_bundle():
    """Test verification of a valid legacy (unsigned) bundle."""
    bundle = create_valid_bundle()
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(bundle, f)
        temp_path = f.name
    
    try:
        result = verify_proof_command(temp_path)
        assert result["status"] == "PASS"
        assert result["hash_valid"] == True
        assert result["signature_valid"] == False  # No attestation
    finally:
        os.unlink(temp_path)

def test_tampered_payload():
    """Test that tampering with the payload is detected."""
    bundle = create_valid_bundle()
    # Tamper with payload AFTER hash was computed
    bundle["canonical_event"]["decision_id"] = "TAMPERED"
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(bundle, f)
        temp_path = f.name
    
    try:
        with pytest.raises(VerificationError) as exc_info:
            verify_proof_command(temp_path)
        assert exc_info.value.code == ErrorCode.INVALID_HASH
    finally:
        os.unlink(temp_path)

def test_unsupported_version():
    """Test that unsupported versions are rejected."""
    bundle = create_valid_bundle()
    bundle["proof_bundle_version"] = "99.0.0"
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(bundle, f)
        temp_path = f.name
    
    try:
        with pytest.raises(VerificationError) as exc_info:
            verify_proof_command(temp_path)
        assert exc_info.value.code == ErrorCode.UNSUPPORTED_VERSION
    finally:
        os.unlink(temp_path)
