import pytest
from app.verifier import AttestationVerifier
from app.attestation import create_attestation_envelope

def test_verify_valid_signature(sample_event, signer, identity, registry):
    """
    Test that a valid signature is verified correctly.
    """
    envelope = create_attestation_envelope(sample_event, signer, identity)
    
    verifier = AttestationVerifier(registry)
    result = verifier.verify(envelope)
    
    assert result.is_valid
    assert result.identity_id == identity.id
    assert result.identity_status_at_signing == "active"
    assert not result.errors

def test_verify_tampered_payload(sample_event, signer, identity, registry):
    """
    Test that tampering with the event content invalidates signature.
    """
    envelope = create_attestation_envelope(sample_event, signer, identity)
    
    # Tamper with the event
    envelope.event["risk_level"] = "high"
    
    verifier = AttestationVerifier(registry)
    result = verifier.verify(envelope)
    
    assert not result.is_valid
    assert "Cryptographic verification failed" in result.errors[0]

def test_verify_invalid_identity(sample_event, signer, registry):
    """
    Test validation with unknown identity.
    """
    # Create an envelope but don't register the identity
    from app.identities import AttestationIdentity
    unknown_identity = AttestationIdentity(
        id="unknown-id",
        public_key=signer.get_public_key_hex(),
        status="active",
        created_at=datetime.utcnow()
    )
    
    envelope = create_attestation_envelope(sample_event, signer, unknown_identity)
    
    verifier = AttestationVerifier(registry)
    result = verifier.verify(envelope)
    
    assert not result.is_valid
    assert result.identity_status_at_signing == "unknown"
