from unittest.mock import AsyncMock, MagicMock
from app.errors import UnauthorizedError, ForbiddenError, QuotaExceededError, RateLimitError
from fastapi import status
from app.auth import TenantContext
from uuid import uuid4

def test_valid_ingestion(client, mock_auth, mock_rate_limit, mock_quota, mock_forwarder):
    # Setup
    valid_payload = {"key": "value"}
    headers = {
        "X-Regulayer-Api-Key": "valid_key",
        "X-Regulayer-Project-Id": "proj_123"
    }
    mock_forwarder.return_value = {"status": "recorded", "decision_id": "123"}
    
    # Act
    response = client.post("/v1/ingest/decision", json=valid_payload, headers=headers)
    
    # Assert
    assert response.status_code == status.HTTP_202_ACCEPTED
    assert response.json()["status"] == "recorded"
    assert response.json()["decision_id"] == "123"
    assert response.json()["_gateway"]["quota_remaining"] == 1000
    
    # Verify processing pipeline
    mock_auth.assert_called_once()
    mock_rate_limit.assert_called_once()
    mock_quota.assert_called_once()
    mock_forwarder.assert_called_once()

def test_unauthorized_missing_key(client, mock_auth):
    # Setup: mock_auth raises UnauthorizedError
    mock_auth.side_effect = UnauthorizedError("Invalid Key")
    
    headers = {} # No key
    
    # Act
    response = client.post("/v1/ingest/decision", json={}, headers=headers)
    
    # Assert 
    # extract_api_key might fail first with 401 or mock_auth fails
    # actually extract_api_key raises HTTPException(401) if missing
    assert response.status_code == 401
    
def test_unauthorized_invalid_key(client, mock_auth):
    mock_auth.side_effect = UnauthorizedError("Invalid Key")
    headers = {"X-Regulayer-Api-Key": "invalid"}
    
    response = client.post("/v1/ingest/decision", json={}, headers=headers)
    
    assert response.status_code == 401
    assert "Invalid Key" in response.json()["message"]

def test_forbidden_org_status(client, mock_auth):
    # Setup: Return a Frozen org context
    frozen_context = TenantContext(
        key_id=uuid4(),
        project_id=uuid4(),
        org_id=uuid4(),
        org_status="frozen",  # Not allowed
        scopes=["ingest"],
        environment="production"
    )
    mock_auth.return_value = frozen_context
    mock_auth.side_effect = None # Clear previous side effects if any fixture setup issues
    
    headers = {"X-Regulayer-Api-Key": "valid_key"}
    
    response = client.post("/v1/ingest/decision", json={}, headers=headers)
    
    assert response.status_code == 403
    assert "Billing required" in response.json()["message"]

def test_quota_exceeded(client, mock_auth, mock_quota):
    # Setup: Quota checks fail
    mock_quota.side_effect = QuotaExceededError("Quota exceeded")
    
    headers = {"X-Regulayer-Api-Key": "valid_key"}
    
    response = client.post("/v1/ingest/decision", json={}, headers=headers)
    
    assert response.status_code == 429
    assert "Quota exceeded" in response.json()["message"]

def test_rate_limit_exceeded(client, mock_auth, mock_rate_limit):
    # Setup
    mock_rate_limit.side_effect = RateLimitError("Rate limit exceeded")
    
    headers = {"X-Regulayer-Api-Key": "valid_key"}
    
    response = client.post("/v1/ingest/decision", json={}, headers=headers)
    
    assert response.status_code == 429
    assert "Rate limit exceeded" in response.json()["message"]
