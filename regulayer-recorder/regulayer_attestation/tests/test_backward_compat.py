from app.migration import is_attested_event, parse_incoming_payload
from app.models import AttestationEnvelope

def test_legacy_event_detection(sample_event):
    """Test that legacy events are detected correctly."""
    assert is_attested_event(sample_event) is False
    
    parsed = parse_incoming_payload(sample_event)
    assert isinstance(parsed, dict)
    assert parsed == sample_event

def test_envelope_detection(sample_event, signer, identity):
    """Test that Phase 2 envelopes are detected correctly."""
    from app.attestation import create_attestation_envelope
    envelope = create_attestation_envelope(sample_event, signer, identity)
    envelope_dict = envelope.model_dump(mode='json')
    
    assert is_attested_event(envelope_dict) is True
    
    parsed = parse_incoming_payload(envelope_dict)
    assert isinstance(parsed, AttestationEnvelope)
    assert parsed.event == sample_event
