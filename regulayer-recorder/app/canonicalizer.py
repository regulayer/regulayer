"""
Reg

ulayer Decision Recorder - Canonical Normalization

Deterministic normalization of decision events.
CRITICAL: All events must be normalized to canonical form before hashing.
"""

import json
from datetime import datetime
from typing import Any, Dict

from .models import DecisionEvent


def canonicalize_event(event: DecisionEvent) -> str:
    """
    Convert DecisionEvent to canonical JSON representation.
    
    This ensures deterministic serialization:
    - Sorted keys
    - UTF-8 encoding
    - ISO 8601 UTC timestamps
    - Consistent formatting
    
    Args:
        event: DecisionEvent to canonicalize
    
    Returns:
        Canonical JSON string (deterministic)
    
    Guarantee: Same event → same canonical form, always.
    """
    # Convert to dict
    event_dict = event.model_dump(mode='json')
    
    # Normalize timestamps to ISO 8601 UTC strings
    event_dict = _normalize_timestamps(event_dict)
    
    # Serialize deterministically
    canonical_json = json.dumps(
        event_dict,
        sort_keys=True,
        ensure_ascii=False,
        separators=(',', ':')  # No spaces for consistency
    )
    
    return canonical_json


def _normalize_timestamps(data: Any) -> Any:
    """
    Recursively normalize datetime objects to ISO 8601 UTC strings.
    
    Args:
        data: Data structure potentially containing datetimes
    
    Returns:
        Data with datetimes normalized to ISO 8601 strings
    """
    if isinstance(data, datetime):
        # Convert to UTC and format as ISO 8601
        return data.isoformat()
    
    elif isinstance(data, dict):
        return {key: _normalize_timestamps(value) for key, value in data.items()}
    
    elif isinstance(data, list):
        return [_normalize_timestamps(item) for item in data]
    
    else:
        return data


def parse_canonical_payload(canonical_json: str) -> Dict:
    """
    Parse canonical JSON back to dictionary.
    
    Args:
        canonical_json: Canonical JSON string
    
    Returns:
        Parsed dictionary
    """
    return json.loads(canonical_json)
