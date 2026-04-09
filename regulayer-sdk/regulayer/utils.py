"""
Regulayer SDK Utilities
"""
import uuid
import platform
import sys
from datetime import datetime, timezone
from typing import Dict, Any

from . import __version__

def generate_decision_id() -> str:
    """Generate a canonical decision ID (UUID4)."""
    return str(uuid.uuid4())

def get_current_timestamp() -> str:
    """Get current UTC timestamp in ISO 8601 format."""
    return datetime.now(timezone.utc).isoformat()

def get_runtime_fingerprint() -> Dict[str, Any]:
    """Capture runtime environment details for forensics."""
    return {
        "sdk_version": __version__,
        "sdk_instance_id": str(uuid.uuid4()),
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "os": f"{platform.system()} {platform.release()}",
        "extra": {}
    }

def apply_zkp_commitments(data: Dict[str, Any], hidden_fields: list, salt: str = "") -> Dict[str, Any]:
    """
    Recursively traverse a dictionary and replace any keys found in `hidden_fields`
    with a Zero-Knowledge salted hash commitment.
    Original dict is deeply copied and not mutated.
    """
    import copy
    import hashlib
    import json
    
    if not data or not hidden_fields:
        return data

    def _mask_value(val: Any) -> str:
        # Commit = SHA256(salt + CanonicalJSON(val))
        try:
            val_str = json.dumps(val, sort_keys=True)
            hashed = hashlib.sha256((salt + val_str).encode('utf-8')).hexdigest()
            return f"ZKP_COMMIT:{hashed}"
        except Exception:
            return "ZKP_COMMIT:UNHASHABLE_DATA"

    def _traverse(node: Any):
        if isinstance(node, dict):
            for k, v in node.items():
                if k in hidden_fields:
                    node[k] = _mask_value(v)
                else:
                    _traverse(v)
        elif isinstance(node, list):
            for item in node:
                _traverse(item)

    copied_data = copy.deepcopy(data)
    _traverse(copied_data)
    return copied_data
