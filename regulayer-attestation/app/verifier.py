import base64
from typing import Dict, Any, Literal
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature

from .models import AttestationEnvelope, VerificationResult
from .identities import IdentityRegistry
from .attestation import canonical_payload_for_signing
from .errors import IdentityNotFoundError

class AttestationVerifier:
    """
    Verifies attestation envelopes against the identity registry.
    """
    def __init__(self, registry: IdentityRegistry):
        self.registry = registry

    def verify(self, envelope: AttestationEnvelope) -> VerificationResult:
        """
        Verify the signature and identity status of an envelope.
        """
        attestation = envelope.attestation
        event = envelope.event
        identity_id = attestation.identity_id
        errors = []
        is_valid = False
        identity_status: Literal["active", "revoked_after", "revoked_before", "unknown"] = "unknown"

        try:
            identity = self.registry.get_identity(identity_id)
        except IdentityNotFoundError:
            errors.append(f"Identity {identity_id} not found locally")
            return VerificationResult(
                is_valid=False,
                identity_id=identity_id,
                identity_status_at_signing="unknown",
                errors=errors
            )

        # Check revocation status relative to signing time
        if identity.status == "revoked" and identity.revoked_at:
            if attestation.signed_at > identity.revoked_at:
                identity_status = "revoked_before"
                errors.append(f"Identity {identity_id} was already revoked at signing time")
            else:
                identity_status = "revoked_after"
        else:
            identity_status = "active"

        # If strictly revoked before signing, we can stop or continue to check signature.
        # But logically the signature is invalid for trust purposes.
        # However, cryptographically it might be valid.
        # We will proceed to check signature but mark result as invalid if status is bad.

        # Verify Signature
        try:
            # Reconstruct public key object
            public_bytes = bytes.fromhex(identity.public_key)
            public_key = ed25519.Ed25519PublicKey.from_public_bytes(public_bytes)

            # Reconstruct canonical payload
            payload_bytes = canonical_payload_for_signing(event)

            # Decode signature
            signature_bytes = base64.b64decode(attestation.signature)

            # Verify
            public_key.verify(signature_bytes, payload_bytes)
            
            # If we get here, signature is cryptographically valid
            if identity_status == "revoked_before":
                is_valid = False # Policy failure
            else:
                 is_valid = True

        except (ValueError, InvalidSignature) as e:
            errors.append(f"Cryptographic verification failed: {str(e)}")
            is_valid = False
        except Exception as e:
            errors.append(f"Verification error: {str(e)}")
            is_valid = False

        return VerificationResult(
            is_valid=is_valid,
            identity_id=identity_id,
            identity_status_at_signing=identity_status, # type: ignore
            errors=errors
        )
