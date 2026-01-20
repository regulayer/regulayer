import pytest
import os
import json
from app.identities import IdentityRegistry
from app.signer import Ed25519Signer
from app.models import AttestationIdentity

@pytest.fixture
def temp_identity_file(tmp_path):
    """Create a temporary identity file."""
    f = tmp_path / "identities.json"
    f.write_text("[]")
    return str(f)

@pytest.fixture
def registry(temp_identity_file):
    """Identity registry backed by temp file."""
    return IdentityRegistry(storage_path=temp_identity_file)

@pytest.fixture
def signer():
    """Ed25519 signer instance."""
    return Ed25519Signer()

@pytest.fixture
def identity(registry, signer):
    """
    A registered active identity corresponding to the signer.
    """
    pub_key_hex = signer.get_public_key_hex()
    return registry.register_identity(public_key=pub_key_hex, identity_id="test-identity-1")

@pytest.fixture
def sample_event():
    """A minimal valid canonical event."""
    return {
        "decision_id": "test-decision-123",
        "record_id": 1,
        "server_timestamp": "2023-01-01T00:00:00Z",
        "system_name": "test-system",
        "event_state": "ALLOW",
        "risk_level": "low"
    }
