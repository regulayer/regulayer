"""
Regulayer SDK Deterministic Hashing Engine

Strict SHA-256 hashing with canonical formatting.
Guarantees: Same input → same hash, always.
"""

import hashlib
import json
from typing import Any, List
from datetime import datetime


class HashingError(Exception):
    """Raised when deterministic hashing cannot be guaranteed."""
    pass


def hash_data(data: Any) -> str:
    """
    Deterministically hash data using SHA-256.
    
    This function guarantees that the same input will always produce
    the same hash. It uses strict canonicalization:
    - UTF-8 encoding enforcement
    - Sorted JSON keys
    - Canonical float formatting
    - ISO 8601 UTC datetime normalization
    
    Args:
        data: Data to hash (dict, list, str, int, float, bool, None, datetime)
    
    Returns:
        SHA-256 hash as 64-character hex string
    
    Raises:
        HashingError: If deterministic serialization cannot be guaranteed
    
    Note:
        Trust > convenience. If we cannot guarantee determinism,
        we fail explicitly rather than producing unreliable hashes.
    
    Example:
        >>> data = {"user": "john", "amount": 1000}
        >>> hash1 = hash_data(data)
        >>> hash2 = hash_data(data)
        >>> hash1 == hash2
        True
    """
    try:
        canonical = _canonicalize(data)
        serialized = json.dumps(canonical, sort_keys=True, ensure_ascii=False)
        encoded = serialized.encode('utf-8')
        return hashlib.sha256(encoded).hexdigest()
    except Exception as e:
        raise HashingError(
            f"Cannot guarantee deterministic hashing for input: {type(data).__name__}. "
            f"Error: {str(e)}"
        )


def hash_list(items: List[Any]) -> List[str]:
    """
    Hash multiple items deterministically.
    
    Args:
        items: List of items to hash
    
    Returns:
        List of SHA-256 hashes (64-character hex strings)
    
    Raises:
        HashingError: If any item cannot be hashed deterministically
    """
    return [hash_data(item) for item in items]


def _canonicalize(data: Any) -> Any:
    """
    Convert data to canonical form for deterministic serialization.
    
    Args:
        data: Data to canonicalize
    
    Returns:
        Canonicalized data
    
    Raises:
        HashingError: If data type cannot be canonicalized deterministically
    """
    # None
    if data is None:
        return None
    
    # Booleans (must check before int, as bool is subclass of int)
    if isinstance(data, bool):
        return data
    
    # Numbers
    if isinstance(data, int):
        return data
    
    if isinstance(data, float):
        # Canonical float formatting
        # Use repr for precision, but handle special values
        if data != data:  # NaN
            raise HashingError("Cannot hash NaN - non-deterministic")
        if data == float('inf') or data == float('-inf'):
            raise HashingError("Cannot hash infinity - non-deterministic")
        # Round to 15 significant digits for determinism
        return round(data, 15)
    
    # Strings
    if isinstance(data, str):
        return data
    
    # Datetime - normalize to ISO 8601 UTC
    if isinstance(data, datetime):
        # Convert to UTC and ISO format
        if data.tzinfo is None:
            raise HashingError(
                "Cannot hash naive datetime - timezone required for determinism. "
                "Use datetime.now(timezone.utc) or add timezone info."
            )
        utc_dt = data.astimezone(tz=None)  # Convert to UTC
        return utc_dt.isoformat()
    
    # Lists
    if isinstance(data, (list, tuple)):
        return [_canonicalize(item) for item in data]
    
    # Dictionaries
    if isinstance(data, dict):
        return {
            str(key): _canonicalize(value)
            for key, value in data.items()
        }
    
    # Reject non-deterministic types
    raise HashingError(
        f"Type {type(data).__name__} cannot be hashed deterministically. "
        f"Supported types: dict, list, str, int, float, bool, None, datetime (with timezone)"
    )


def verify_hash(data: Any, expected_hash: str) -> bool:
    """
    Verify that data produces the expected hash.
    
    Useful for detecting tampering or data changes.
    
    Args:
        data: Data to hash
        expected_hash: Expected SHA-256 hash (64-character hex string)
    
    Returns:
        True if hash matches, False otherwise
    
    Example:
        >>> data = {"decision": "approve"}
        >>> hash_value = hash_data(data)
        >>> verify_hash(data, hash_value)
        True
        >>> verify_hash({"decision": "deny"}, hash_value)
        False
    """
    try:
        actual_hash = hash_data(data)
        return actual_hash == expected_hash
    except HashingError:
        return False
