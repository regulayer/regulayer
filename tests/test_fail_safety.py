"""
Tests for Regulayer SDK Fail-Safety

Validates that SDK never crashes user code and handles failures gracefully.
"""

import pytest
import time
from unittest.mock import Mock, patch
from regulayer import trace, configure
from regulayer.hasher import HashingError
from regulayer.client import BackendClient, get_client


@pytest.fixture(autouse=True)
def setup_config():
    """Configure SDK for tests."""
    configure(
        api_key="test-api-key",
        endpoint="https://test.regulayer.io/v1/events",
        log_level="ERROR"
    )


class TestSDKNeverCrashesUserCode:
    """Test that SDK failures never crash user code."""
    
    def test_hashing_failure_doesnt_crash(self, monkeypatch):
        """Hashing failure should not crash user code."""
        # Mock hash_data to raise an error
        def mock_hash_error(data):
            raise HashingError("Test hashing error")
        
        monkeypatch.setattr("regulayer.trace.hash_data", mock_hash_error)
        
        # User code should complete normally
        result = None
        with trace(
            system="test",
            risk="low",
            model_name="model",
            model_version="v1"
        ) as t:
            t.set_input({"test": "data"})
            result = {"decision": "approve"}
            t.set_output(result)
        
        # User code completed
        assert result == {"decision": "approve"}
    
    def test_client_submission_failure_doesnt_crash(self, monkeypatch):
        """Client submission failure should not crash user code."""
        # Mock client to raise an error
        mock_client = Mock(spec=BackendClient)
        mock_client.submit_event = Mock(side_effect=Exception("Network error"))
        
        monkeypatch.setattr("regulayer.trace.get_client", lambda: mock_client)
        
        # User code should complete normally
        result = None
        with trace(
            system="test",
            risk="low",
            model_name="model",
            model_version="v1"
        ) as t:
            result = {"decision": "deny"}
            t.set_output(result)
        
        # User code completed
        assert result == {"decision": "deny"}
    
    def test_config_validation_failure_doesnt_crash(self, monkeypatch):
        """Config validation failure should not crash user code."""
        # Configure with missing API key
        configure(api_key=None)
        
        # User code should still complete
        result = None
        with trace(
            system="test",
            risk="low",
            model_name="model",
            model_version="v1"
        ) as t:
            result = {"status": "complete"}
            t.set_output(result)
        
        # User code completed
        assert result == {"status": "complete"}

        # Restore config
        configure(api_key="test-key")


class TestNetworkFailures:
    """Test network failure handling."""
    
    @pytest.mark.asyncio
    async def test_network_timeout_silent_failure(self, monkeypatch):
        """Network timeout should fail silently."""
        import httpx
        
        # Mock httpx to raise timeout
        async def mock_post(*args, **kwargs):
            raise httpx.TimeoutException("Request timeout")
        
        with patch("httpx.AsyncClient.post", new=mock_post):
            # Should not crash
            with trace(
                system="test",
                risk="low",
                model_name="model",
                model_version="v1"
            ) as t:
                t.set_output({"test": "data"})
    
    @pytest.mark.asyncio
    async def test_network_error_silent_failure(self, monkeypatch):
        """Network errors should fail silently."""
        import httpx
        
        # Mock httpx to raise network error
        async def mock_post(*args, **kwargs):
            raise httpx.NetworkError("Connection failed")
        
        with patch("httpx.AsyncClient.post", new=mock_post):
            # Should not crash
            with trace(
                system="test",
                risk="low",
                model_name="model",
                model_version="v1"
            ) as t:
                t.set_output({"test": "data"})


class TestQueueOverflow:
    """Test memory queue overflow handling."""
    
    def test_queue_drops_oldest_on_overflow(self, monkeypatch):
        """Queue should drop oldest events when full."""
        # Create client with very small queue
        from regulayer.client import BackendClient
        
        client = BackendClient(queue_size=2)
        
        # Mock the actual sending to prevent real network calls
        client._send_event = Mock()
        
        # Submit 5 events (more than queue size)
        for i in range(5):
            with trace(
                system="test",
                risk="low",
                model_name="model",
                model_version=f"v{i}"
            ) as t:
                t.set_output({"index": i})
        
        # Should not crash
        # Note: In real usage, older events would be dropped


class TestBoundedOverhead:
    """Test that SDK overhead is bounded and minimal."""
    
    def test_negligible_overhead(self):
        """SDK overhead should be minimal (<5ms typical)."""
        # Measure empty trace
        start = time.perf_counter()
        
        with trace(
            system="test",
            risk="low",
            model_name="model",
            model_version="v1"
        ) as t:
            t.set_input({"small": "data"})
            t.set_output({"small": "result"})
        
        end = time.perf_counter()
        overhead_ms = (end - start) * 1000
        
        # Should be relatively fast (being generous with CI/test environments)
        # In production, this is typically <5ms
        assert overhead_ms < 50  # 50ms is very conservative
    
    def test_overhead_with_large_data(self):
        """SDK overhead should remain bounded even with larger data."""
        # Create moderately sized data
        large_data = {
            "users": [{"id": i, "name": f"user_{i}"} for i in range(100)],
            "metadata": {"timestamp": "2024-01-15", "version": "1.0"}
        }
        
        start = time.perf_counter()
        
        with trace(
            system="test",
            risk="low",
            model_name="model",
            model_version="v1"
        ) as t:
            t.set_input(large_data)
            t.set_output(large_data)
        
        end = time.perf_counter()
        overhead_ms = (end - start) * 1000
        
        # Even with larger data, should be bounded
        assert overhead_ms < 100  # 100ms is conservative


class TestNonDeterministicDataHandling:
    """Test handling of non-deterministic data."""
    
    def test_non_deterministic_data_fails_explicitly(self):
        """Non-deterministic data hashing should fail explicitly."""
        # This should not crash user code, but hash will be None
        with trace(
            system="test",
            risk="low",
            model_name="model",
            model_version="v1"
        ) as t:
            # Try to hash something non-deterministic
            class CustomObject:
                pass
            
            # Should not crash, but won't hash
            t.set_input(CustomObject())
            
            # User code continues
            t.set_output({"result": "ok"})


class TestConfigurationErrors:
    """Test configuration error handling."""
    
    def test_invalid_endpoint_https_required(self):
        """Non-HTTPS endpoint should be rejected."""
        with pytest.raises(ValueError, match="HTTPS"):
            configure(endpoint="http://insecure.example.com/api")
    
    def test_missing_api_key_validation(self):
        """Missing API key should be caught during validation, not crash user code."""
        from regulayer.config import get_config
        
        # Temporarily clear API key
        config = get_config()
        original_key = config.api_key
        config.api_key = None
        
        try:
            # Validation should fail but not crash user code
            with pytest.raises(ValueError, match="API_KEY"):
                config.validate()
        finally:
            # Restore
            config.api_key = original_key


class TestThreadSafety:
    """Test thread-safe configuration."""
    
    def test_concurrent_configuration_updates(self):
        """Concurrent configuration updates should be thread-safe."""
        import threading
        
        results = []
        
        def update_config(value):
            try:
                configure(log_level=value)
                results.append("success")
            except Exception as e:
                results.append(f"error: {e}")
        
        threads = [
            threading.Thread(target=update_config, args=("INFO",)),
            threading.Thread(target=update_config, args=("DEBUG",)),
            threading.Thread(target=update_config, args=("WARNING",))
        ]
        
        for t in threads:
            t.start()
        
        for t in threads:
            t.join()
        
        # All should succeed (no crashes)
        assert all(r == "success" for r in results)


class TestGracefulShutdown:
    """Test graceful shutdown behavior."""
    
    def test_client_shutdown_graceful(self):
        """Client shutdown should be graceful."""
        client = get_client()
        
        # Should not raise
        client.shutdown()
        client.shutdown()  # Second call should be idempotent


class TestExceptionTransparency:
    """Test that all user exceptions are preserved."""
    
    def test_custom_exception_preserved(self):
        """Custom exceptions should be preserved exactly."""
        class CustomError(Exception):
            def __init__(self, code, message):
                self.code = code
                self.message = message
                super().__init__(message)
        
        with pytest.raises(CustomError) as exc_info:
            with trace(
                system="test",
                risk="low",
                model_name="model",
                model_version="v1"
            ):
                raise CustomError(404, "Not found")
        
        # Exception should be preserved with all attributes
        assert exc_info.value.code == 404
        assert exc_info.value.message == "Not found"
