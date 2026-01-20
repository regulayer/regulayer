"""
Tests for Regulayer SDK Deterministic Hashing

Validates strict canonicalization and determinism guarantees.
"""

import pytest
from datetime import datetime, timezone, timedelta
from regulayer.hasher import hash_data, hash_list, verify_hash, HashingError


class TestDeterministicHashing:
    """Test that hashing is deterministic."""
    
    def test_same_input_same_hash(self):
        """Same input must produce same hash."""
        data = {"user": "john", "amount": 1000, "action": "approve"}
        
        hash1 = hash_data(data)
        hash2 = hash_data(data)
        
        assert hash1 == hash2
        assert len(hash1) == 64  # SHA-256 hex length
    
    def test_different_input_different_hash(self):
        """Different input must produce different hash."""
        data1 = {"user": "john", "amount": 1000}
        data2 = {"user": "jane", "amount": 1000}
        
        hash1 = hash_data(data1)
        hash2 = hash_data(data2)
        
        assert hash1 != hash2
    
    def test_dict_order_independence(self):
        """Dictionary key order should not affect hash."""
        data1 = {"a": 1, "b": 2, "c": 3}
        data2 = {"c": 3, "a": 1, "b": 2}
        data3 = {"b": 2, "c": 3, "a": 1}
        
        hash1 = hash_data(data1)
        hash2 = hash_data(data2)
        hash3 = hash_data(data3)
        
        assert hash1 == hash2 == hash3


class TestCanonicalFormatting:
    """Test canonical formatting requirements."""
    
    def test_float_canonical_formatting(self):
        """Floats must be formatted canonically."""
        # Same float value should produce same hash
        data1 = {"value": 3.14159}
        data2 = {"value": 3.14159}
        
        hash1 = hash_data(data1)
        hash2 = hash_data(data2)
        
        assert hash1 == hash2
    
    def test_nan_rejection(self):
        """NaN must be rejected (non-deterministic)."""
        data = {"value": float('nan')}
        
        with pytest.raises(HashingError, match="NaN"):
            hash_data(data)
    
    def test_infinity_rejection(self):
        """Infinity must be rejected (non-deterministic)."""
        data_pos_inf = {"value": float('inf')}
        data_neg_inf = {"value": float('-inf')}
        
        with pytest.raises(HashingError, match="infinity"):
            hash_data(data_pos_inf)
        
        with pytest.raises(HashingError, match="infinity"):
            hash_data(data_neg_inf)
    
    def test_datetime_normalization(self):
        """Datetimes must be normalized to ISO 8601 UTC."""
        # Same moment in time, different representations
        dt_utc = datetime(2024, 1, 15, 10, 30, 0, tzinfo=timezone.utc)
        dt_offset = datetime(2024, 1, 15, 15, 30, 0, tzinfo=timezone(timedelta(hours=5)))
        
        hash1 = hash_data({"time": dt_utc})
        hash2 = hash_data({"time": dt_offset})
        
        # Should be same (both represent same UTC moment)
        assert hash1 == hash2
    
    def test_naive_datetime_rejection(self):
        """Naive datetime (no timezone) must be rejected."""
        dt_naive = datetime(2024, 1, 15, 10, 30, 0)
        
        with pytest.raises(HashingError, match="timezone required"):
            hash_data({"time": dt_naive})


class TestDataTypes:
    """Test handling of various data types."""
    
    def test_none(self):
        """None should hash deterministically."""
        hash1 = hash_data(None)
        hash2 = hash_data(None)
        
        assert hash1 == hash2
    
    def test_boolean(self):
        """Booleans should hash deterministically."""
        hash_true1 = hash_data(True)
        hash_true2 = hash_data(True)
        hash_false1 = hash_data(False)
        hash_false2 = hash_data(False)
        
        assert hash_true1 == hash_true2
        assert hash_false1 == hash_false2
        assert hash_true1 != hash_false1
    
    def test_string(self):
        """Strings should hash deterministically."""
        hash1 = hash_data("hello world")
        hash2 = hash_data("hello world")
        
        assert hash1 == hash2
    
    def test_integer(self):
        """Integers should hash deterministically."""
        hash1 = hash_data(42)
        hash2 = hash_data(42)
        
        assert hash1 == hash2
    
    def test_list(self):
        """Lists should hash deterministically."""
        data = [1, 2, 3, "test", {"key": "value"}]
        
        hash1 = hash_data(data)
        hash2 = hash_data(data)
        
        assert hash1 == hash2
    
    def test_nested_structures(self):
        """Nested structures should hash deterministically."""
        data = {
            "user": {
                "id": "12345",
                "name": "John",
                "metadata": {
                    "age": 30,
                    "verified": True
                }
            },
            "actions": [
                {"type": "login", "time": "2024-01-15T10:30:00Z"},
                {"type": "purchase", "amount": 100.50}
            ]
        }
        
        hash1 = hash_data(data)
        hash2 = hash_data(data)
        
        assert hash1 == hash2


class TestUnsupportedTypes:
    """Test rejection of unsupported types."""
    
    def test_custom_object_rejection(self):
        """Custom objects should be rejected."""
        class CustomClass:
            def __init__(self):
                self.value = 42
        
        obj = CustomClass()
        
        with pytest.raises(HashingError):
            hash_data(obj)
    
    def test_bytes_rejection(self):
        """Bytes should be rejected (use string instead)."""
        data = b"binary data"
        
        with pytest.raises(HashingError):
            hash_data(data)


class TestHashList:
    """Test hash_list utility."""
    
    def test_hash_multiple_items(self):
        """hash_list should hash multiple items."""
        items = [
            {"id": 1, "name": "Alice"},
            {"id": 2, "name": "Bob"},
            {"id": 3, "name": "Charlie"}
        ]
        
        hashes = hash_list(items)
        
        assert len(hashes) == 3
        assert all(len(h) == 64 for h in hashes)
        
        # Each should be deterministic
        assert hashes[0] == hash_data(items[0])
        assert hashes[1] == hash_data(items[1])
        assert hashes[2] == hash_data(items[2])


class TestVerifyHash:
    """Test hash verification."""
    
    def test_verify_correct_hash(self):
        """Verification should pass for correct hash."""
        data = {"test": "data", "value": 123}
        hash_value = hash_data(data)
        
        assert verify_hash(data, hash_value) is True
    
    def test_verify_incorrect_hash(self):
        """Verification should fail for incorrect hash."""
        data = {"test": "data", "value": 123}
        wrong_hash = "0" * 64
        
        assert verify_hash(data, wrong_hash) is False
    
    def test_verify_tampered_data(self):
        """Verification should detect data tampering."""
        original_data = {"test": "data", "value": 123}
        tampered_data = {"test": "data", "value": 999}
        
        hash_value = hash_data(original_data)
        
        assert verify_hash(tampered_data, hash_value) is False


class TestUTF8Enforcement:
    """Test UTF-8 encoding enforcement."""
    
    def test_unicode_strings(self):
        """Unicode strings should hash deterministically."""
        data1 = {"text": "Hello 世界 🌍"}
        data2 = {"text": "Hello 世界 🌍"}
        
        hash1 = hash_data(data1)
        hash2 = hash_data(data2)
        
        assert hash1 == hash2
    
    def test_emoji(self):
        """Emojis should hash deterministically."""
        data = {"reaction": "👍", "message": "Great! 🎉"}
        
        hash1 = hash_data(data)
        hash2 = hash_data(data)
        
        assert hash1 == hash2
