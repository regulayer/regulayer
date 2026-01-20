from unittest.mock import AsyncMock, patch
from regulayer_attestation.app.attestation import create_attestation_envelope
from regulayer_attestation.app.models import AttestationEnvelope
from app.api import router
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.models import DecisionEvent
from datetime import datetime, timezone

app = FastAPI()
app.include_router(router)

# Mock DB dependency
async def override_get_db_session():
    return AsyncMock()

app.dependency_overrides["app.api.get_db_session"] = override_get_db_session

client = TestClient(app)

@patch("app.api.record_decision")
def test_valid_attested_ingestion(mock_record, signer, identity, sample_event, override_guard, mock_registry):
    # Setup registry to return identity
    mock_registry.get_identity.return_value = identity
    
    # Create valid envelope
    envelope = create_attestation_envelope(sample_event, signer, identity)
    
    # Mock record_decision response
    mock_record.return_value = AsyncMock(
        record_id=1,
        decision_id=sample_event["decision_id"],
            record_hash="hash" * 16, # valid length? No, just string is fine for RecordConfirmation if not validated strictly as hex in api response model?
            # RecordConfirmation: record_hash: str. No length constraint in model?
            # Let's use valid mock values.
            server_timestamp=datetime.now(timezone.utc)
        )

    request_payload = {
        "ingestion_type": "attested",
        "payload": envelope.model_dump(mode='json')
    }
    
    response = client.post("/v1/decisions", json=request_payload)
    
    assert response.status_code == 201
    assert mock_record.called
    # check that attestation metadata was passed
    args, kwargs = mock_record.call_args
    assert kwargs.get('attestation') is not None
    assert kwargs['attestation'].identity_id == str(identity.id)

@patch("app.api.record_decision")
def test_invalid_signature_rejection(mock_record, signer, identity, sample_event, override_guard, mock_registry):
    mock_registry.get_identity.return_value = identity
    
    # Tamper with signature
    envelope = create_attestation_envelope(sample_event, signer, identity)
    envelope.attestation.signature = "invalid_base64"
    
    request_payload = {
        "ingestion_type": "attested",
        "payload": envelope.model_dump(mode='json')
    }
    
    response = client.post("/v1/decisions", json=request_payload)
    
    assert response.status_code == 401
    assert "InvalidAttestationError" in response.json()["detail"]["error"]
    assert not mock_record.called

@patch("app.api.record_decision")
def test_unknown_identity_rejection(mock_record, signer, identity, sample_event, override_guard, mock_registry):
    # Registry returns None
    mock_registry.get_identity.return_value = None
    
    envelope = create_attestation_envelope(sample_event, signer, identity)
    
    request_payload = {
        "ingestion_type": "attested",
        "payload": envelope.model_dump(mode='json')
    }
    
    response = client.post("/v1/decisions", json=request_payload)
    
    assert response.status_code == 401
    assert "Unknown identity" in response.json()["detail"]["message"] or "InvalidAttestationError" in response.json()["detail"]["error"]
