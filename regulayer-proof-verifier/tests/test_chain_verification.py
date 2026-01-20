import pytest
import json
import tempfile
import os
import shutil

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from cli.verify_chain import verify_chain_command
from cli.errors import ErrorCode, VerificationError
from crypto.canonicalizer import canonicalize
from crypto.hasher import compute_hash

def create_valid_bundle(record_id, prev_hash=None):
    """Create a valid proof bundle for testing."""
    canonical_event = {
        "decision_id": f"decision-{record_id}",
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
        "attestation": None,
        "verification_metadata": {
            "verified_at": "2026-01-21T00:00:00+00:00",
            "verifier_version": "1.0.0",
            "recorder_version": "1.0.0",
            "verification_result": "VALID"
        }
    }

def test_valid_chain():
    """Test verification of a valid chain."""
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Create chain of 3 bundles
        bundle1 = create_valid_bundle(1, None)
        bundle2 = create_valid_bundle(2, bundle1["record_hash"])
        bundle3 = create_valid_bundle(3, bundle2["record_hash"])
        
        for i, bundle in enumerate([bundle1, bundle2, bundle3], 1):
            with open(os.path.join(temp_dir, f"proof-{i}.json"), 'w') as f:
                json.dump(bundle, f)
        
        result = verify_chain_command(temp_dir, strict=True)
        assert result["status"] == "PASS"
        assert result["total_records"] == 3
    finally:
        shutil.rmtree(temp_dir)

def test_broken_chain_link():
    """Test that broken hash links are detected."""
    temp_dir = tempfile.mkdtemp()
    
    try:
        bundle1 = create_valid_bundle(1, None)
        bundle2 = create_valid_bundle(2, "WRONG_HASH" + "0" * 48)  # Wrong prev hash
        
        for i, bundle in enumerate([bundle1, bundle2], 1):
            with open(os.path.join(temp_dir, f"proof-{i}.json"), 'w') as f:
                json.dump(bundle, f)
        
        with pytest.raises(VerificationError) as exc_info:
            verify_chain_command(temp_dir)
        assert exc_info.value.code == ErrorCode.BROKEN_CHAIN
    finally:
        shutil.rmtree(temp_dir)

def test_gap_detection_strict():
    """Test that gaps are detected in strict mode."""
    temp_dir = tempfile.mkdtemp()
    
    try:
        bundle1 = create_valid_bundle(1, None)
        bundle3 = create_valid_bundle(3, bundle1["record_hash"])  # Gap: skipped 2
        
        for i, bundle in enumerate([bundle1, bundle3], 1):
            with open(os.path.join(temp_dir, f"proof-{i}.json"), 'w') as f:
                json.dump(bundle, f)
        
        with pytest.raises(VerificationError) as exc_info:
            verify_chain_command(temp_dir, strict=True)
        assert "Gap" in exc_info.value.message or exc_info.value.code == ErrorCode.BROKEN_CHAIN
    finally:
        shutil.rmtree(temp_dir)
