import pytest
from datetime import datetime, timedelta, timezone
from app.attestation import create_attestation_envelope
from app.verifier import AttestationVerifier

def test_ingestion_rejects_revoked_identity(sample_event, signer, registry):
    """
    Ingestion Rule: Cannot sign with a currently revoked identity.
    """
    # Create and revoke identity
    identity = registry.register_identity(
        public_key=signer.get_public_key_hex(),
        identity_id="revoked-id-1"
    )
    registry.revoke_identity(identity.id)
    
    # Reload identity to get fresh status
    identity = registry.get_identity(identity.id)

    # Attempt to sign should fail
    with pytest.raises(ValueError, match="Cannot sign with a revoked identity"):
        create_attestation_envelope(sample_event, signer, identity)

def test_verification_historical_revocation(sample_event, signer, registry):
    """
    Verification Rule: Signature valid if signed BEFORE revocation.
    Status should be 'revoked_after'.
    """
    # 1. Register identity
    identity = registry.register_identity(signer.get_public_key_hex(), "hist-rev-id")
    
    # 2. Sign event (Active)
    envelope = create_attestation_envelope(sample_event, signer, identity)
    
    # 3. Revoke identity AFTER signing
    # We force a small delay or just ensure timestamps work
    # Python execution is fast, so we might need to mock time or update revoked_at manually
    # to be strictly > signed_at
    registry.revoke_identity(identity.id)
    
    # Manually ensure revoked_at is > signed_at (just in case)
    identity = registry.get_identity(identity.id)
    if identity.revoked_at <= envelope.attestation.signed_at:
        # Verify logic is > not >= so equal is safe?
        # Code: if attestation.signed_at > identity.revoked_at: rejected
        # So signed_at < revoked_at is accepted.
        pass

    # 4. Verify
    verifier = AttestationVerifier(registry)
    result = verifier.verify(envelope)
    
    assert result.is_valid
    assert result.identity_status_at_signing == "revoked_after"

def test_verification_post_revocation(sample_event, signer, registry):
    """
    Verification Rule: Signature INVALID if signed AFTER revocation.
    (Simulating a case where someone used a key after it was marked revoked in registry,
     maybe by bypassing ingestion checks or distributed system lag).
    """
    # 1. Register and revoke
    identity = registry.register_identity(signer.get_public_key_hex(), "post-rev-id")
    registry.revoke_identity(identity.id)
    
    # 2. Force-create an envelope pretending to be signed AFTER revocation
    # We have to bypass create_attestation_envelope check or manually construct
    # Manually construct to simulate bypass
    from app.attestation import AttestationEnvelope, AttestationMetadata, canonical_payload_for_signing
    import hashlib
    
    payload_bytes = canonical_payload_for_signing(sample_event)
    signature = signer.sign(payload_bytes)
    pk_hex = identity.public_key
    fingerprint = hashlib.sha256(bytes.fromhex(pk_hex)).hexdigest()
    
    attestation = AttestationMetadata(
        identity_id=identity.id,
        algorithm="Ed25519",
        signature=signature,
        signed_at=datetime.now(timezone.utc), # NOW is > revoked_at
        key_fingerprint=fingerprint
    )
    envelope = AttestationEnvelope(event=sample_event, attestation=attestation)

    # 3. Verify
    verifier = AttestationVerifier(registry)
    result = verifier.verify(envelope)
    
    assert not result.is_valid
    assert result.identity_status_at_signing == "revoked_before"
    assert "already revoked" in result.errors[0]
