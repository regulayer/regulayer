"""
Regulayer Infrastructure - Key Rotation

Support key rotation without invalidating historical proofs.

CORE PRINCIPLE:
- Key rotation NEVER breaks history
- Old signatures remain valid forever
- New key used for new records only
"""

from datetime import datetime, timezone
from typing import List, Optional, Dict
from uuid import UUID, uuid4
from dataclasses import dataclass, field
from enum import Enum
import json


class KeyType(str, Enum):
    """Type of cryptographic key."""
    ED25519_SIGNING = "ed25519_signing"
    HMAC_SHA256 = "hmac_sha256"


class KeyStatus(str, Enum):
    """Status of a key version."""
    ACTIVE = "active"          # Currently in use for new signatures
    ROTATED = "rotated"        # No longer used, but signatures still valid
    REVOKED = "revoked"        # Compromised - signatures during period suspect


@dataclass
class KeyVersion:
    """A versioned key entry in the rotation log."""
    version_id: str
    key_type: KeyType
    status: KeyStatus
    fingerprint: str  # First 8 chars of key hash
    activated_at: datetime
    rotated_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    revocation_reason: Optional[str] = None


@dataclass
class KeyRotationLog:
    """Append-only log of key rotations."""
    entries: List[KeyVersion] = field(default_factory=list)
    
    def add_key(self, key_type: KeyType, fingerprint: str) -> KeyVersion:
        """Add a new key version to the log."""
        version = KeyVersion(
            version_id=f"v{len(self.entries) + 1}",
            key_type=key_type,
            status=KeyStatus.ACTIVE,
            fingerprint=fingerprint,
            activated_at=datetime.now(timezone.utc)
        )
        
        # Mark previous active key as rotated
        for entry in self.entries:
            if entry.key_type == key_type and entry.status == KeyStatus.ACTIVE:
                entry.status = KeyStatus.ROTATED
                entry.rotated_at = datetime.now(timezone.utc)
        
        self.entries.append(version)
        return version
    
    def revoke_key(self, version_id: str, reason: str) -> bool:
        """Mark a key as revoked (compromised)."""
        for entry in self.entries:
            if entry.version_id == version_id:
                entry.status = KeyStatus.REVOKED
                entry.revoked_at = datetime.now(timezone.utc)
                entry.revocation_reason = reason
                return True
        return False
    
    def get_active_key(self, key_type: KeyType) -> Optional[KeyVersion]:
        """Get the currently active key for a type."""
        for entry in reversed(self.entries):
            if entry.key_type == key_type and entry.status == KeyStatus.ACTIVE:
                return entry
        return None
    
    def get_key_at_time(
        self,
        key_type: KeyType,
        timestamp: datetime
    ) -> Optional[KeyVersion]:
        """Get the key that was active at a specific time."""
        candidates = [
            e for e in self.entries
            if e.key_type == key_type and e.activated_at <= timestamp
        ]
        
        if not candidates:
            return None
        
        # Find the most recent key active at that time
        candidates.sort(key=lambda e: e.activated_at, reverse=True)
        return candidates[0]
    
    def to_dict(self) -> Dict:
        """Serialize for storage/export."""
        return {
            "entries": [
                {
                    "version_id": e.version_id,
                    "key_type": e.key_type.value,
                    "status": e.status.value,
                    "fingerprint": e.fingerprint,
                    "activated_at": e.activated_at.isoformat(),
                    "rotated_at": e.rotated_at.isoformat() if e.rotated_at else None,
                    "revoked_at": e.revoked_at.isoformat() if e.revoked_at else None,
                    "revocation_reason": e.revocation_reason
                }
                for e in self.entries
            ]
        }


class KeyRotationManager:
    """
    Manage key rotation across the system.
    
    Ensures:
    - New keys are used for new signatures
    - Historical signatures remain verifiable
    - Key metadata is accessible for verification
    """
    
    def __init__(self):
        self.log = KeyRotationLog()
    
    def register_key(self, key_type: KeyType, key_bytes: bytes) -> KeyVersion:
        """Register a new key (typically on startup or rotation)."""
        import hashlib
        fingerprint = hashlib.sha256(key_bytes).hexdigest()[:8]
        return self.log.add_key(key_type, fingerprint)
    
    def rotate_signing_key(self, new_key_bytes: bytes) -> KeyVersion:
        """Rotate to a new signing key."""
        return self.register_key(KeyType.ED25519_SIGNING, new_key_bytes)
    
    def revoke_key(self, version_id: str, reason: str) -> bool:
        """Revoke a key (incident response)."""
        return self.log.revoke_key(version_id, reason)
    
    def get_key_status_at_signature_time(
        self,
        fingerprint: str,
        signature_time: datetime
    ) -> str:
        """
        Determine trust status for a signature based on key state.
        
        Returns: VALID, DEGRADED, or UNTRUSTED
        """
        # Find key by fingerprint
        matching = [e for e in self.log.entries if e.fingerprint == fingerprint]
        
        if not matching:
            return "UNKNOWN"
        
        key = matching[0]
        
        # Key was never revoked
        if key.status != KeyStatus.REVOKED:
            return "VALID"
        
        # Key was revoked - check if signature was before compromise
        if key.revoked_at and signature_time < key.revoked_at:
            # If we have an estimated compromise window, check it
            return "DEGRADED"  # Signature predates known revocation
        
        return "UNTRUSTED"  # Signature during compromise period
    
    def get_rotation_log(self) -> Dict:
        """Get the rotation log for export/audit."""
        return self.log.to_dict()


# ============================================================
# Global Instance
# ============================================================

_rotation_manager: Optional[KeyRotationManager] = None


def get_rotation_manager() -> KeyRotationManager:
    """Get or create the global rotation manager."""
    global _rotation_manager
    
    if _rotation_manager is None:
        _rotation_manager = KeyRotationManager()
    
    return _rotation_manager
