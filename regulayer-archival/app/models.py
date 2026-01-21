"""
Regulayer Archival - Data Models

CORE PRINCIPLES:
1. Past truth must outlive present systems
2. Key rotation must not break history
3. Algorithm aging must be addressable
4. Verification must be possible offline forever
5. No retroactive mutation of evidence
"""

from datetime import datetime
from typing import List, Dict, Optional, Literal
from uuid import UUID
from pydantic import BaseModel, Field


class CryptographicSnapshot(BaseModel):
    """
    Freezes cryptographic context at time of record creation.
    
    A verifier knows exactly what crypto assumptions were valid at the time.
    This allows verification even after algorithms are deprecated.
    """
    snapshot_version: str = "1.0.0"
    snapshot_id: UUID
    decision_id: UUID
    
    # Algorithm context at time of creation
    algorithms: Dict[str, str] = Field(
        default={
            "hash": "SHA-256",
            "signature": "Ed25519",
            "canonicalization": "JSON Canonical Form"
        },
        description="Algorithms used at time of record creation"
    )
    
    # Public keys valid at time of creation
    public_keys: List[str] = Field(
        default_factory=list,
        description="Public key fingerprints valid at creation time"
    )
    
    created_at: datetime
    
    rationale: str = Field(
        default="Snapshot taken at record creation to preserve crypto context for future verification",
        description="Why this snapshot was created"
    )
    
    # Future-proofing metadata
    nist_recommendations_at_time: str = Field(
        default="SHA-256 and Ed25519 approved per NIST SP 800-57 (2026)",
        description="Cryptographic standards applicable at creation"
    )


class KeyRotationEntry(BaseModel):
    """
    Entry in the append-only key rotation log.
    
    CRITICAL RULES:
    - Key revocation does NOT invalidate past signatures
    - Revocation is contextualized via timestamps
    - Historical signatures remain verifiable forever
    """
    entry_id: UUID
    identity_id: str
    old_key_fingerprint: str
    new_key_fingerprint: str
    effective_at: datetime
    reason: str = Field(
        examples=["Scheduled rotation", "Key compromise", "Personnel change"]
    )
    
    # Verification context
    signatures_before_rotation_valid: bool = True
    rotation_recorded_at: datetime


class KeyRotationLog(BaseModel):
    """
    Append-only log of all key rotations.
    
    No deletions. Ever.
    """
    log_version: str = "1.0.0"
    entries: List[KeyRotationEntry] = Field(default_factory=list)
    last_updated: datetime
    
    def get_valid_keys_at(self, timestamp: datetime, identity_id: str) -> List[str]:
        """Get which keys were valid for an identity at a specific time."""
        valid_keys = []
        for entry in self.entries:
            if entry.identity_id == identity_id:
                if entry.effective_at <= timestamp:
                    # Old key was valid before rotation
                    if entry.old_key_fingerprint:
                        valid_keys.append(entry.old_key_fingerprint)
                    # New key became valid at rotation
                    valid_keys.append(entry.new_key_fingerprint)
        return list(set(valid_keys))


class SecondaryHash(BaseModel):
    """
    Layered hash for crypto agility.
    
    Original record hash stays immutable.
    New hashes are layered on top, never replacing originals.
    """
    decision_id: UUID
    record_id: int
    
    original_hash: str = Field(
        description="The immutable original hash (e.g., sha256:...)"
    )
    original_algorithm: str = "SHA-256"
    
    secondary_hash: str = Field(
        description="Future-proof hash (e.g., sha3-512:...)"
    )
    secondary_algorithm: str = "SHA3-512"
    
    computed_at: datetime
    
    rationale: str = Field(
        default="Secondary hash computed for algorithm agility and future verification"
    )


class ArchivalVerificationContext(BaseModel):
    """
    Context needed for archival-mode verification.
    
    Used when verifying old proofs with their original crypto assumptions.
    """
    verification_mode: Literal["current", "archival"] = "archival"
    
    # Use snapshot crypto context instead of current
    use_snapshot_algorithms: bool = True
    
    # Accept deprecated algorithms for historical verification
    allow_deprecated_algorithms: bool = True
    
    # Keys valid at time of original signing
    historical_keys: List[str] = Field(default_factory=list)
    
    # Snapshot reference
    snapshot_id: Optional[UUID] = None


class ArchivalBundle(BaseModel):
    """
    Complete archival package for a decision.
    
    Contains everything needed to verify forever:
    - Original proof bundle
    - Cryptographic snapshot
    - Key rotation history
    - Secondary hashes (if computed)
    """
    archival_version: str = "1.0.0"
    decision_id: UUID
    
    # Cryptographic context
    snapshot: CryptographicSnapshot
    
    # Key history relevant to this decision
    key_history: List[KeyRotationEntry] = Field(default_factory=list)
    
    # Future-proofing
    secondary_hashes: List[SecondaryHash] = Field(default_factory=list)
    
    # Verification guidance
    verification_notes: str = Field(
        default="Verify using --archival flag to use historical crypto context"
    )
    
    generated_at: datetime
