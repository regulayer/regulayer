from unittest.mock import AsyncMock, patch
from regulayer_attestation.app.attestation import create_attestation_envelope
from fastapi.testclient import TestClient
from app.api import router
from fastapi import FastAPI

from app.api import get_db_session
import pytest

@pytest.fixture(autouse=True)
def mock_db_session(client):
    async def override_get_db_session():
        yield AsyncMock()
    
    client.app.dependency_overrides[get_db_session] = override_get_db_session
    yield
    client.app.dependency_overrides = {}

@patch("app.api.record_decision")
def test_tampered_payload_rejected_before_storage(mock_record, signer, identity, sample_event, override_guard, mock_registry, client):
    mock_registry.get_identity.return_value = identity
    
    # 1. Create valid envelope
    envelope = create_attestation_envelope(sample_event, signer, identity)
    
    # 2. Tamper with the event payload inside the envelope
    # e.g. change risk level
    envelope.event["risk_level"] = "critical" 
    
    # The signature matches the OLD payload. Verification should fail.
    
    request_payload = {
        "ingestion_type": "attested",
        "payload": envelope.model_dump(mode='json')
    }
    
    response = client.post("/v1/decisions", json=request_payload)
    
    # Expect 401 Unauthorized (Signature mismatch)
    assert response.status_code == 401
    
    # CRITICAL: Verify record_decision was NEVER called
    # This proves the chain is untouched
    assert not mock_record.called
