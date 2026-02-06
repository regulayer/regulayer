"""
Regulayer SDK Runtime Fingerprint Generator

Captures execution environment for forensic analysis.
"""

import sys
import platform
from typing import Optional
from .utils import get_sdk_instance_id


# SDK version - must match pyproject.toml
__version__ = "1.0.0"


class RuntimeFingerprint:
    """
    Runtime environment fingerprint.
    
    Captures:
    - Python version
    - Operating system
    - SDK version
    - SDK instance ID (unique per process)
    """
    
    def __init__(self):
        self.python_version = self._get_python_version()
        self.os = self._get_os()
        self.sdk_version = __version__
        self.sdk_instance_id = get_sdk_instance_id()
    
    def _get_python_version(self) -> str:
        """Get Python version (e.g., '3.10.5')."""
        return f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    
    def _get_os(self) -> str:
        """Get operating system (e.g., 'Linux', 'Darwin', 'Windows')."""
        return platform.system()
    
    def to_dict(self) -> dict:
        """
        Convert fingerprint to dictionary.
        
        Returns:
            Dictionary with runtime information
        """
        return {
            "python_version": self.python_version,
            "os": self.os,
            "sdk_version": self.sdk_version,
            "sdk_instance_id": self.sdk_instance_id
        }
    
    def __repr__(self) -> str:
        return (
            f"RuntimeFingerprint(python={self.python_version}, "
            f"os={self.os}, sdk={self.sdk_version}, "
            f"instance={self.sdk_instance_id[:8]}...)"
        )


def get_runtime_fingerprint() -> RuntimeFingerprint:
    """
    Get current runtime fingerprint.
    
    Returns:
        RuntimeFingerprint instance
    
    Note:
        Called once per decision to create forensic trail
        and enable multi-process tracking.
    """
    return RuntimeFingerprint()
