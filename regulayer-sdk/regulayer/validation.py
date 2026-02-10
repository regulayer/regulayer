"""
Regulayer SDK Validation
"""
import json
from typing import Any, Dict
from .errors import PayloadTooLargeError, ValidationError

MAX_PAYLOAD_SIZE = 5 * 1024 * 1024  # 5MB

def validate_payload_size(payload: Dict[str, Any]) -> None:
    """
    Ensure payload is within size limits and JSON serializable.
    """
    try:
        serialized = json.dumps(payload)
    except (TypeError, ValueError) as e:
        raise ValidationError("payload", f"JSON serialization failed: {str(e)}")
    
    size = len(serialized.encode("utf-8"))
    if size > MAX_PAYLOAD_SIZE:
        raise PayloadTooLargeError(max_size=MAX_PAYLOAD_SIZE)

def validate_circular_refs(obj: Any) -> None:
    """
    Check for circular references in input/output.
    """
    # json.dumps detects circular refs by default
    try:
        json.dumps(obj)
    except ValueError as e:
        if "Circular reference" in str(e):
            raise ValidationError("payload", "Circular reference detected in payload")
        raise
