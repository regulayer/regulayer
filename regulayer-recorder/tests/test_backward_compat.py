from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from app.api import router
from app.config import settings
from fastapi import FastAPI
from datetime import datetime, timezone

app = FastAPI()
app.include_router(router)

async def override_get_db_session():
    return AsyncMock()

app.dependency_overrides["app.api.get_db_session"] = override_get_db_session

client = TestClient(app)

@patch("app.api.record_decision")
def test_legacy_ingestion_allowed(mock_record, sample_event, override_guard):
    # settings.allow_legacy_ingestion is True by default in config
    # We also need to patch the legacy verification in AttestationGuard
    # But since we use override_guard with mocks, we might need to be careful
    # verifying actual crypto logic.
    # The guard implementation calls: create_verifier...
    # We should mock create_verifier to avoid needing actual keys for "legacy" test 
    # OR we use real keys if we have them. 
    # But sample_event+headers requires generating a valid HMAC signature.
    
    # Let's mock the legacy verification part of Guard to focus on "Allowed/Disabled" check logic.
    with patch("app.attestation_guard.create_verifier") as mock_create_verifier:
        mock_verifier = mock_create_verifier.return_value
        mock_verifier.get_algorithm.return_value = "HS256"
        mock_verifier.verify.return_value = True
        
        # Use MagicMock for the result of await record_decision
        mock_record.return_value = MagicMock(
            record_id=1, 
            decision_id=sample_event["decision_id"],
            record_hash="hash",
            server_timestamp=datetime.now(timezone.utc)
        )
        
        headers = {
            "X-Regulayer-Signature": "valid_sig",
            "X-Regulayer-Algorithm": "HS256",
            "X-Regulayer-SDK-Version": "1.0.0"
        }
        
        # Determine strict legacy mode
        settings.allow_legacy_ingestion = True
        
        # Send raw event (Legacy)
        response = client.post("/v1/decisions", json=sample_event, headers=headers)
        
        assert response.status_code == 201
        assert mock_record.called

@patch("app.api.record_decision")
def test_legacy_ingestion_disabled(mock_record, sample_event, override_guard):
    # Disable legacy
    settings.allow_legacy_ingestion = False
    
    headers = {
        "X-Regulayer-Signature": "valid_sig",
        "X-Regulayer-Algorithm": "HS256",
        "X-Regulayer-SDK-Version": "1.0.0"
    }
    
    # Send raw event (Legacy)
    response = client.post("/v1/decisions", json=sample_event, headers=headers)
    
    # Should be rejected
    assert response.status_code == 401
    assert "Legacy ingestion is disabled" in response.json()["detail"]["message"]
    assert not mock_record.called
    
    # Reset config
    settings.allow_legacy_ingestion = True
