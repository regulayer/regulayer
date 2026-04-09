import pytest
from unittest.mock import MagicMock, AsyncMock
try:
    from regulayer_attestation.app.signer import Ed25519Signer
    from regulayer_attestation.app.models import AttestationIdentity, AttestationEnvelope
except ImportError:
    # Mock for isolated testing
    Ed25519Signer = MagicMock
    AttestationIdentity = MagicMock
    AttestationEnvelope = MagicMock
from fastapi.testclient import TestClient
from datetime import datetime
import uuid

@pytest.fixture
def signer():
    return Ed25519Signer()

@pytest.fixture
def identity(signer):
    return AttestationIdentity(
        id=str(uuid.uuid4()),
        public_key=signer.get_public_key_hex(),
        algorithm="Ed25519",
        status="active",
        created_at=datetime.utcnow()
    )

@pytest.fixture
def mock_registry():
    registry = MagicMock()
    return registry

@pytest.fixture
def override_guard(mock_registry):
    # Patch the guard's registry
    from app.attestation_guard import guard
    # We need to replace the verifier's registry too since verifier is instantiated in __init__
    guard.registry = mock_registry
    guard.verifier.registry = mock_registry
    return guard

@pytest.fixture
def client():
    # We need to import app from main or just use router.
    # Check if app/main.py exists or construct app
    from fastapi import FastAPI
    from app.api import router
    app = FastAPI()
    app.include_router(router, prefix="/v1")
    return TestClient(app)

@pytest.fixture
def sample_event():
    return {
        "event_version": "1.0.0",
        "event_state": "completed",
        "decision_id": str(uuid.uuid4()),
        "system_name": "test_system",
        "risk_level": "low",
        "model_name": "gpt-4",
        "model_version": "1.0.0",
        "input_hash": "a" * 64,
        "output_hash": "b" * 64,
        "prompt_hash": None,
        "tool_calls_hashes": None,
        "start_timestamp": "2026-01-01T00:00:00Z",
        "end_timestamp": "2026-01-01T00:00:01Z",
        "execution_duration_ms": 1000.0,
        "runtime_fingerprint": {
            "python_version": "3.10.0",
            "os": "linux",
            "sdk_version": "1.0.0",
            "sdk_instance_id": str(uuid.uuid4())
        }
    }
