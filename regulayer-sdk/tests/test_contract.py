"""
Contract Tests for Regulayer SDK
"""
import pytest
import httpx
from unittest.mock import Mock, patch
from regulayer import configure, get_client
from regulayer.errors import (
    DuplicateDecisionError, 
    OrgFrozenError, 
    RateLimitError, 
    AuthenticationError,
    ServiceUnavailableError,
    DemoKeyError,
    ProdKeyError
)

@pytest.fixture
def mock_client():
    configure(api_key="rl_live_test", endpoint="http://test.loc")
    client = get_client()
    with patch.object(client, '_http', autospec=True) as mock_http:
        yield client, mock_http
    configure(api_key="rl_live_reset") # Reset

def test_success_202(mock_client):
    client, mock_http = mock_client
    mock_response = Mock()
    mock_response.status_code = 202
    mock_response.json.return_value = {"decision_id": "test-id", "status": "pending"}
    mock_http.post.return_value = mock_response
    
    result = client.record_decision("test", "test", {}, {})
    assert result["decision_id"] == "test-id"

def test_duplicate_409(mock_client):
    client, mock_http = mock_client
    mock_response = Mock()
    mock_response.status_code = 409
    mock_http.post.return_value = mock_response
    
    with pytest.raises(DuplicateDecisionError):
        client.record_decision("test", "test", {}, {}, decision_id="dup-id")

def test_frozen_403(mock_client):
    client, mock_http = mock_client
    mock_response = Mock()
    mock_response.status_code = 403
    mock_response.text = "Organization is frozen"
    mock_http.post.return_value = mock_response
    
    with pytest.raises(OrgFrozenError):
        client.record_decision("test", "test", {}, {})

def test_demo_wall():
    # Demo key without demo=True
    with pytest.raises(DemoKeyError):
        configure(api_key="rl_demo_123")
        
    # Prod key with demo=True
    with pytest.raises(ProdKeyError):
        configure(api_key="rl_live_123", demo=True)

def test_rate_limit_retry(mock_client):
    client, mock_http = mock_client
    
    # 2 failures then success
    fail_response = Mock()
    fail_response.status_code = 429
    fail_response.headers = {"Retry-After": "0"} 
    
    success_response = Mock()
    success_response.status_code = 202
    success_response.json.return_value = {"status": "ok"}
    
    # Mock side_effect for 3 calls: fail, fail, success
    mock_http.post.side_effect = [fail_response, fail_response, success_response]
    
    # Configure fast retry for test
    client.config.max_retries = 3
    
    # Needs to patch time.sleep to speed up test
    with patch("time.sleep"):
        client.record_decision("test", "test", {}, {})
    
    assert mock_http.post.call_count == 3
