"""
Tests for Signature Verification

Proves that signature verification works correctly.
"""

import pytest
from app.signer import create_verifier, HMACVerifier
from app.canonicalizer import canonicalize_event
from app.models import DecisionEvent, RuntimeFingerprint
from datetime import datetime, timezone
from uuid import uuid4


@pytest.fixture
def test_secret():
    """Test HMAC secret key."""
    return "test-secret-key-minimum-32-characters-long"


@pytest.fixture
def sample_event():
    """Create a sample decision event."""
    return DecisionEvent(
        event_version="1.0",
        event_state="completed",
        decision_id=uuid4(),
        system_name="test_system",
        risk_level="high",
        model_name="test_model",
        model_version="v1.0.0",
        input_hash="a" * 64,
        output_hash="b" * 64,
        prompt_hash=None,
        tool_calls_hashes=None,
        start_timestamp=datetime.now(timezone.utc),
        end_timestamp=datetime.now(timezone.utc),
        execution_duration_ms=100.0,
        runtime_fingerprint=RuntimeFingerprint(
            python_version="3.10.0",
            os="Linux",
            sdk_version="1.0.0",
            sdk_instance_id=str(uuid4())
        )
    )


class TestHMACVerifier:
    """Test HMAC signature verification."""
    
    def test_verifier_creation(self, test_secret):
        """Verifier should be created successfully."""
        verifier = create_verifier(test_secret)
        
        assert verifier is not None
        assert verifier.get_algorithm() == "HMAC-SHA256"
    
    def test_valid_signature_accepted(self, test_secret, sample_event):
        """Valid signature should be accepted."""
        verifier = create_verifier(test_secret)
        
        # Create canonical payload
        canonical_payload = canonicalize_event(sample_event)
        
        # Generate signature
        import hmac
        import hashlib
        signature = hmac.new(
            test_secret.encode('utf-8'),
            canonical_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Verify
        assert verifier.verify(canonical_payload, signature) is True
    
    def test_invalid_signature_rejected(self, test_secret, sample_event):
        """Invalid signature should be rejected."""
        verifier = create_verifier(test_secret)
        
        canonical_payload = canonicalize_event(sample_event)
        
        # Wrong signature
        wrong_signature = "0" * 64
        
        assert verifier.verify(canonical_payload, wrong_signature) is False
    
    def test_tampered_payload_rejected(self, test_secret, sample_event):
        """Tampered payload should fail verification."""
        verifier = create_verifier(test_secret)
        
        # Original payload
        canonical_payload = canonicalize_event(sample_event)
        
        # Generate valid signature for original
        import hmac
        import hashlib
        signature = hmac.new(
            test_secret.encode('utf-8'),
            canonical_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Tamper with payload
        tampered_payload = canonical_payload.replace('"test_system"', '"hacked_system"')
        
        # Verification should fail
        assert verifier.verify(tampered_payload, signature) is False
    
    def test_wrong_secret_fails(self, sample_event):
        """Using wrong secret should fail verification."""
        correct_secret = "correct-secret-key-minimum-32-characters"
        wrong_secret = "wrong-secret-key-minimum-32-characters-x"
        
        canonical_payload = canonicalize_event(sample_event)
        
        # Sign with correct secret
        import hmac
        import hashlib
        signature = hmac.new(
            correct_secret.encode('utf-8'),
            canonical_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Verify with wrong secret
        wrong_verifier = create_verifier(wrong_secret)
        assert wrong_verifier.verify(canonical_payload, signature) is False


class TestConstantTimeComparison:
    """Test that signature comparison is constant-time (timing attack resistant)."""
    
    def test_uses_hmac_compare_digest(self, test_secret):
        """Verifier should use constant-time comparison."""
        verifier = HMACVerifier(test_secret)
        
        # This is a design test - verifying we use hmac.compare_digest
        # The actual method is used in the implementation
        import inspect
        source = inspect.getsource(verifier.verify)
        
        assert "hmac.compare_digest" in source


class TestSignatureFormat:
    """Test signature format validation."""
    
    def test_invalid_signature_length(self, test_secret, sample_event):
        """Signature must be 64 characters (SHA-256 hex)."""
        verifier = create_verifier(test_secret)
        canonical_payload = canonicalize_event(sample_event)
        
        # Too short
        short_sig = "abc123"
        assert verifier.verify(canonical_payload, short_sig) is False
        
        # Too long
        long_sig = "a" * 128
        assert verifier.verify(canonical_payload, long_sig) is False
    
    def test_non_hex_signature(self, test_secret, sample_event):
        """Non-hex signature should fail."""
        verifier = create_verifier(test_secret)
        canonical_payload = canonicalize_event(sample_event)
        
        # Non-hex characters
        non_hex = "g" * 64
        assert verifier.verify(canonical_payload, non_hex) is False


class TestAlgorithmIdentification:
    """Test algorithm identification."""
    
    def test_algorithm_name(self, test_secret):
        """Algorithm should be identified as HMAC-SHA256."""
        verifier = create_verifier(test_secret)
        
        assert verifier.get_algorithm() == "HMAC-SHA256"
