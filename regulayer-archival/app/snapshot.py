"""
Regulayer Archival - Cryptographic Snapshotting

Freezes cryptographic context at record creation time.
Allows verification even after algorithms are deprecated.
"""

from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid4

from .models import CryptographicSnapshot, KeyRotationEntry, KeyRotationLog


class SnapshotGenerator:
    """
    Generates cryptographic snapshots for decisions.
    
    A snapshot captures:
    - Algorithms used at time of creation
    - Public keys valid at time of creation
    - NIST recommendations at time of creation
    """
    
    # Current algorithm defaults (as of 2026)
    CURRENT_ALGORITHMS = {
        "hash": "SHA-256",
        "signature": "Ed25519",
        "canonicalization": "JSON Canonical Form (RFC 8785)"
    }
    
    CURRENT_NIST_GUIDANCE = "SHA-256 and Ed25519 approved per NIST SP 800-57 Rev 5 (2020)"
    
    def create_snapshot(
        self,
        decision_id: UUID,
        public_keys: List[str] = None,
        algorithms: dict = None,
        created_at: datetime = None
    ) -> CryptographicSnapshot:
        """
        Create a cryptographic snapshot for a decision.
        
        Args:
            decision_id: The decision being snapshotted
            public_keys: Public key fingerprints valid at creation
            algorithms: Override algorithm defaults
            created_at: Override creation time
        
        Returns:
            CryptographicSnapshot capturing crypto context
        """
        return CryptographicSnapshot(
            snapshot_version="1.0.0",
            snapshot_id=uuid4(),
            decision_id=decision_id,
            algorithms=algorithms or self.CURRENT_ALGORITHMS,
            public_keys=public_keys or [],
            created_at=created_at or datetime.now(timezone.utc),
            rationale="Snapshot taken at record creation to preserve crypto context for future verification",
            nist_recommendations_at_time=self.CURRENT_NIST_GUIDANCE
        )
    
    def snapshot_for_archival(
        self,
        decision_id: UUID,
        record_hash: str,
        identity_id: Optional[str] = None,
        signed_at: Optional[datetime] = None
    ) -> CryptographicSnapshot:
        """
        Create a snapshot optimized for archival purposes.
        
        Includes additional context for long-term verification.
        """
        snapshot = self.create_snapshot(
            decision_id=decision_id,
            created_at=signed_at
        )
        
        # Add archival-specific rationale
        snapshot.rationale = (
            f"Archival snapshot for decision {decision_id}. "
            f"Record hash: {record_hash[:32]}... "
            f"Use --archival flag when verifying after algorithm deprecation."
        )
        
        return snapshot


class KeyRotationManager:
    """
    Manages the append-only key rotation log.
    
    CRITICAL RULES:
    - Key revocation does NOT invalidate past signatures
    - Historical signatures remain verifiable forever
    - No deletions. Ever.
    """
    
    def __init__(self):
        self.log = KeyRotationLog(
            log_version="1.0.0",
            entries=[],
            last_updated=datetime.now(timezone.utc)
        )
    
    def record_rotation(
        self,
        identity_id: str,
        old_key_fingerprint: str,
        new_key_fingerprint: str,
        reason: str = "Scheduled rotation"
    ) -> KeyRotationEntry:
        """
        Record a key rotation event.
        
        This is APPEND-ONLY. Old entries are never modified or deleted.
        """
        entry = KeyRotationEntry(
            entry_id=uuid4(),
            identity_id=identity_id,
            old_key_fingerprint=old_key_fingerprint,
            new_key_fingerprint=new_key_fingerprint,
            effective_at=datetime.now(timezone.utc),
            reason=reason,
            signatures_before_rotation_valid=True,
            rotation_recorded_at=datetime.now(timezone.utc)
        )
        
        self.log.entries.append(entry)
        self.log.last_updated = datetime.now(timezone.utc)
        
        return entry
    
    def get_valid_key_at_time(
        self,
        identity_id: str,
        at_time: datetime
    ) -> Optional[str]:
        """
        Determine which key was valid for an identity at a specific time.
        
        Used for archival verification of historical signatures.
        """
        # Find the most recent rotation before the target time
        relevant_entries = [
            e for e in self.log.entries
            if e.identity_id == identity_id and e.effective_at <= at_time
        ]
        
        if not relevant_entries:
            return None
        
        # Sort by effective_at descending
        relevant_entries.sort(key=lambda e: e.effective_at, reverse=True)
        
        # The new key from the most recent rotation is valid
        return relevant_entries[0].new_key_fingerprint
    
    def is_key_valid_at_time(
        self,
        identity_id: str,
        key_fingerprint: str,
        at_time: datetime
    ) -> bool:
        """
        Check if a specific key was valid at a specific time.
        
        Key rotation does NOT invalidate historical signatures.
        """
        # Find all rotations for this identity
        identity_entries = [
            e for e in self.log.entries
            if e.identity_id == identity_id
        ]
        
        if not identity_entries:
            # No rotations recorded, assume key is valid if provided
            return True
        
        # Check if the key was valid at the given time
        for entry in identity_entries:
            if entry.effective_at <= at_time:
                # This key was valid before this rotation
                if entry.old_key_fingerprint == key_fingerprint:
                    return True
                if entry.new_key_fingerprint == key_fingerprint:
                    return True
        
        return False
    
    def export_for_decision(
        self,
        identity_ids: List[str],
        from_time: Optional[datetime] = None
    ) -> List[KeyRotationEntry]:
        """
        Export key rotation history relevant to specific identities.
        
        Used when creating archival bundles.
        """
        return [
            e for e in self.log.entries
            if e.identity_id in identity_ids
        ]


# Global instances
snapshot_generator = SnapshotGenerator()
key_rotation_manager = KeyRotationManager()
