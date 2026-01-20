from datetime import datetime
from typing import Optional, Literal, Dict, Any, List
from pydantic import BaseModel, Field

class AttestationIdentity(BaseModel):
    """
    Represents a trusted signing identity in the registry.
    """
    id: str = Field(..., description="Unique identifier for the signing identity")
    public_key: str = Field(..., description="Hex-encoded Ed25519 public key")
    algorithm: Literal["Ed25519"] = "Ed25519"
    status: Literal["active", "revoked"] = "active"
    created_at: datetime
    revoked_at: Optional[datetime] = None

class AttestationMetadata(BaseModel):
    """
    The cryptographic proof attached to an event.
    """
    identity_id: str
    algorithm: Literal["Ed25519"] = "Ed25519"
    signature: str = Field(..., description="Base64 encoded signature")
    signed_at: datetime
    key_fingerprint: str = Field(..., description="SHA256 fingerprint of the simple public key")
    payload_version: Literal["decision-event-v1"] = "decision-event-v1"

class AttestationEnvelope(BaseModel):
    """
    The final object that wraps the decision event validation.
    """
    event: Dict[str, Any] # Canonical decision event
    attestation: AttestationMetadata

class VerificationResult(BaseModel):
    """
    Result of an offline verification check.
    """
    is_valid: bool
    identity_id: str
    identity_status_at_signing: Literal["active", "revoked_after", "revoked_before", "unknown"]
    errors: List[str] = []
