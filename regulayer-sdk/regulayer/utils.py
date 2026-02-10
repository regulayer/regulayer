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
