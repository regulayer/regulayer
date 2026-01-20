"""
Regulayer SDK Utility Functions

Helper utilities for decision ID generation and safe serialization.
"""

import uuid
import json
from typing import Any


def generate_decision_id() -> str:
    """
    Generate a unique decision ID using UUID v4.
    
    Returns:
        A UUID v4 string (36 characters)
    
    Example:
        >>> decision_id = generate_decision_id()
        >>> len(decision_id)
        36
    """
    return str(uuid.uuid4())


def safe_serialize(obj: Any) -> str:
    """
    Safely serialize an object to JSON string.
    
    Handles serialization errors gracefully by using repr() as fallback.
    
    Args:
        obj: Object to serialize
    
    Returns:
        JSON string representation of the object
    
    Note:
        This is a safety utility. For deterministic hashing,
        use hasher.hash_data() which has stricter requirements.
    """
    try:
        return json.dumps(obj, sort_keys=True, default=str)
    except (TypeError, ValueError):
        # Fallback to repr for non-serializable objects
        return repr(obj)


def get_sdk_instance_id() -> str:
    """
    Get or create the SDK instance ID for this process.
    
    The SDK instance ID is a UUID v4 generated once per process
    and cached for the lifetime of the process.
    
    Returns:
        SDK instance ID (UUID v4 string)
    
    Note:
        This enables multi-process forensics and duplicate detection.
    """
    global _SDK_INSTANCE_ID
    if _SDK_INSTANCE_ID is None:
        _SDK_INSTANCE_ID = str(uuid.uuid4())
    return _SDK_INSTANCE_ID


# Global SDK instance ID (generated once per process)
_SDK_INSTANCE_ID: str = None
