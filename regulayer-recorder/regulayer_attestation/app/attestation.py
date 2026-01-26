import json
import hashlib
import base64
from datetime import datetime, timezone
from typing import Any, Dict
from .models import AttestationEnvelope, AttestationMetadata
from .signer import Ed25519Signer
from .identities import AttestationIdentity

def _normalize_timestamps(data: Any) -> Any:
    """
    Recursively normalize datetime objects to ISO 8601 UTC strings.
    Matches regulayer-recorder logic exactly.
    """
    if isinstance(data, datetime):
        return data.isoformat()
    elif isinstance(data, dict):
        return {key: _normalize_timestamps(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [_normalize_timestamps(item) for item in data]
    else:
        return data

def canonical_payload_for_signing(event: Dict[str, Any]) -> bytes:
    """
    Convert event dict to canonical bytes for signing.
    Matches regulayer-recorder canonicalization exactly.
    """
    normalized = _normalize_timestamps(event)
    canonical_json = json.dumps(
        normalized,
        sort_keys=True,
        ensure_ascii=False,
        separators=(',', ':')
    )
    return canonical_json.encode('utf-8')

def create_attestation_envelope(
    event: Dict[str, Any],
    signer: Ed25519Signer,
    identity: AttestationIdentity
) -> AttestationEnvelope:
    """
    Wrap an event in an attestation envelope with a signature.
    """
    if identity.status == "revoked":
        raise ValueError("Cannot sign with a revoked identity")

    payload_bytes = canonical_payload_for_signing(event)
    signature = signer.sign(payload_bytes)
    
    # Calculate simple public key fingerprint
    pk_bytes = bytes.fromhex(identity.public_key)
    fingerprint = hashlib.sha256(pk_bytes).hexdigest()

    attestation = AttestationMetadata(
        identity_id=identity.id,
        algorithm="Ed25519",
        signature=signature,
        signed_at=datetime.now(timezone.utc),
        key_fingerprint=fingerprint,
        payload_version="decision-event-v1"
    )

    return AttestationEnvelope(
        event=event,
        attestation=attestation
    )
