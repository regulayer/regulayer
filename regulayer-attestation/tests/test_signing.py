from datetime import datetime
from app.attestation import canonical_payload_for_signing, create_attestation_envelope
from app.models import AttestationEnvelope

def test_deterministic_canonicalization(sample_event):
    """Test that event canonicalization is deterministic."""
    # Create two events with same content but different key order in potential creation (dicts are ordered in py3.7+ but still good to test)
    # Actually canonicalizer sorts keys explicitly.
    
    payload1 = canonical_payload_for_signing(sample_event)
    
    # Event with different key insertion order but same content
    event2 = {
        "risk_level": "low",
        "decision_id": "test-decision-123",
        "record_id": 1,
        "event_state": "ALLOW",
        "system_name": "test-system",
        "server_timestamp": "2023-01-01T00:00:00Z",
    }
    payload2 = canonical_payload_for_signing(event2)
    
    assert payload1 == payload2

def test_signing_produces_envelope(sample_event, signer, identity):
    """Test full envelope creation flow."""
    envelope = create_attestation_envelope(sample_event, signer, identity)
    
    assert isinstance(envelope, AttestationEnvelope)
    assert envelope.event == sample_event
    assert envelope.attestation.identity_id == identity.id
    assert envelope.attestation.key_fingerprint
    assert envelope.attestation.signature 
    assert envelope.attestation.payload_version == "decision-event-v1"
