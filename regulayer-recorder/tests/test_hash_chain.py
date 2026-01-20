"""
Tests for Hash Chain Logic

Proves that hash chaining works correctly and tampering is detectable.
"""

import pytest
from app.hasher import (
    hash_canonical_event,
    compute_record_hash,
    verify_chain_link,
    verify_record_hash
)
from app.canonicalizer import canonicalize_event
from app.models import DecisionEvent, RuntimeFingerprint
from datetime import datetime, timezone
from uuid import uuid4


@pytest.fixture
def sample_canonical_payload():
    """Sample canonical JSON payload."""
    return '{"decision_id":"123e4567-e89b-12d3-a456-426614174000","event_state":"completed","system_name":"test"}'


class TestHashing:
    """Test SHA-256 hashing."""
    
    def test_hash_determinism(self, sample_canonical_payload):
        """Same payload produces same hash."""
        hash1 = hash_canonical_event(sample_canonical_payload)
        hash2 = hash_canonical_event(sample_canonical_payload)
        
        assert hash1 == hash2
        assert len(hash1) == 64  # SHA-256 hex length
    
    def test_different_payload_different_hash(self):
        """Different payloads produce different hashes."""
        payload1 = '{"data":"test1"}'
        payload2 = '{"data":"test2"}'
        
        hash1 = hash_canonical_event(payload1)
        hash2 = hash_canonical_event(payload2)
        
        assert hash1 != hash2
    
    def test_record_hash_matches_canonical_hash(self, sample_canonical_payload):
        """record_hash should equal canonical_payload_hash."""
        hash1 = compute_record_hash(sample_canonical_payload)
        hash2 = hash_canonical_event(sample_canonical_payload)
        
        assert hash1 == hash2


class TestChainLinking:
    """Test chain link verification."""
    
    def test_first_record_valid(self):
        """First record (previous_hash=None) should be valid."""
        record_hash = "a" * 64
        previous_hash_claimed = None
        previous_hash_stored = None
        
        assert verify_chain_link(record_hash, previous_hash_claimed, previous_hash_stored) is True
    
    def test_subsequent_record_valid(self):
        """Subsequent record with correct link should be valid."""
        record_hash = "b" * 64
        previous_hash = "a" * 64
        
        assert verify_chain_link(record_hash, previous_hash, previous_hash) is True
    
    def test_broken_chain_detected(self):
        """Broken chain link should be detected."""
        record_hash = "c" * 64
        claimed_previous = "a" * 64
        actual_previous = "b" * 64  # Different!
        
        assert verify_chain_link(record_hash, claimed_previous, actual_previous) is False
    
    def test_first_record_with_previous_invalid(self):
        """First record claiming a previous_hash is invalid."""
        record_hash = "a" * 64
        claimed_previous = "b" * 64  # First should be None!
        stored_previous = None
        
        assert verify_chain_link(record_hash, claimed_previous, stored_previous) is False


class TestTamperDetection:
    """Test payload tampering detection."""
    
    def test_untampered_payload_verified(self, sample_canonical_payload):
        """Untampered payload should verify successfully."""
        correct_hash = hash_canonical_event(sample_canonical_payload)
        
        assert verify_record_hash(sample_canonical_payload, correct_hash) is True
    
    def test_tampered_payload_detected(self, sample_canonical_payload):
        """Tampered payload should fail verification."""
        # Get correct hash
        correct_hash = hash_canonical_event(sample_canonical_payload)
        
        # Tamper with payload
        tampered_payload = sample_canonical_payload.replace('"test"', '"hacked"')
        
        # Should detect tampering
        assert verify_record_hash(tampered_payload, correct_hash) is False
    
    def test_wrong_hash_detected(self, sample_canonical_payload):
        """Wrong hash should be detected."""
        wrong_hash = "0" * 64
        
        assert verify_record_hash(sample_canonical_payload, wrong_hash) is False


class TestChainIntegrity:
    """Test end-to-end chain integrity."""
    
    def test_valid_chain_of_three(self):
        """Valid 3-record chain should verify."""
        # Record 1 (first)
        payload1 = '{"id":"1","data":"first"}'
        hash1 = compute_record_hash(payload1)
        
        # Verify first record
        assert verify_chain_link(hash1, None, None) is True
        assert verify_record_hash(payload1, hash1) is True
        
        # Record 2
        payload2 = '{"id":"2","data":"second"}'
        hash2 = compute_record_hash(payload2)
        
        # Verify link to record 1
        assert verify_chain_link(hash2, hash1, hash1) is True
        assert verify_record_hash(payload2, hash2) is True
        
        # Record 3
        payload3 = '{"id":"3","data":"third"}'
        hash3 = compute_record_hash(payload3)
        
        # Verify link to record 2
        assert verify_chain_link(hash3, hash2, hash2) is True
        assert verify_record_hash(payload3, hash3) is True
    
    def test_chain_break_detected_in_middle(self):
        """Chain break in middle should be detected."""
        # Record 1
        payload1 = '{"id":"1"}'
        hash1 = compute_record_hash(payload1)
        
        # Record 2
        payload2 = '{"id":"2"}'
        hash2 = compute_record_hash(payload2)
        
        # Record 3 claims to link to record 1 (skipping 2!) - BROKEN
        payload3 = '{"id":"3"}'
        hash3 = compute_record_hash(payload3)
        
        # This should detect the skip
        assert verify_chain_link(hash3, hash1, hash2) is False  # Claimed hash1, but actual previous is hash2


class TestHashFormat:
    """Test hash output format."""
    
    def test_hash_is_64_char_hex(self, sample_canonical_payload):
        """Hash should be 64-character hexadecimal."""
        hash_value = hash_canonical_event(sample_canonical_payload)
        
        assert len(hash_value) == 64
        assert all(c in '0123456789abcdef' for c in hash_value.lower())
    
    def test_hash_is_lowercase(self, sample_canonical_payload):
        """Hash should be lowercase hex."""
        hash_value = hash_canonical_event(sample_canonical_payload)
        
        assert hash_value == hash_value.lower()
