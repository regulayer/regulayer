"""
Regulayer Archival - API Endpoints

READ-ONLY endpoints for archival operations.
No mutations. No recomputation.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from uuid import UUID, uuid4
from typing import List, Optional

from .models import (
    CryptographicSnapshot,
    KeyRotationLog,
    SecondaryHash,
    ArchivalBundle
)
from .snapshot import snapshot_generator, key_rotation_manager
from .rehash import rehash_engine

router = APIRouter(prefix="/v1/archival", tags=["archival"])


@router.get(
    "/snapshot/{decision_id}",
    response_model=CryptographicSnapshot,
    summary="Export cryptographic snapshot"
)
async def get_snapshot(decision_id: UUID) -> CryptographicSnapshot:
    """
    Export the cryptographic snapshot for a decision.
    
    The snapshot captures:
    - Algorithms used at time of creation
    - Public keys valid at time of creation
    - NIST recommendations at time of creation
    
    Use this for archival verification with --archival flag.
    """
    # In production, fetch from storage
    # For demo, generate a snapshot
    snapshot = snapshot_generator.create_snapshot(
        decision_id=decision_id,
        public_keys=["ed25519:fingerprint_demo_123"],
        created_at=datetime.now(timezone.utc)
    )
    
    return snapshot


@router.get(
    "/key-rotations",
    response_model=KeyRotationLog,
    summary="Export key rotation history"
)
async def get_key_rotations(
    identity_id: Optional[str] = None
) -> KeyRotationLog:
    """
    Export the append-only key rotation log.
    
    CRITICAL: Key rotation does NOT invalidate past signatures.
    Historical signatures remain verifiable forever.
    """
    log = key_rotation_manager.log
    
    if identity_id:
        # Filter to specific identity
        filtered_entries = [
            e for e in log.entries
            if e.identity_id == identity_id
        ]
        return KeyRotationLog(
            log_version=log.log_version,
            entries=filtered_entries,
            last_updated=log.last_updated
        )
    
    return log


@router.get(
    "/rehash/{decision_id}",
    response_model=SecondaryHash,
    summary="Generate future-proof hash"
)
async def generate_rehash(
    decision_id: UUID,
    algorithm: str = "SHA3-512"
) -> SecondaryHash:
    """
    Generate a secondary hash using a modern algorithm.
    
    CRITICAL RULES:
    - Original hashes are NEVER modified
    - Secondary hashes are LAYERED on top
    - This is for future-proofing, not replacement
    """
    # In production, fetch canonical payload from recorder
    # For demo, use mock data
    mock_payload = f'{{"decision_id": "{decision_id}"}}'.encode()
    
    secondary = rehash_engine.compute_secondary_hash(
        decision_id=decision_id,
        record_id=1,
        original_hash=f"sha256:mock_{decision_id}",
        canonical_payload=mock_payload,
        algorithm=algorithm
    )
    
    return secondary


@router.get(
    "/bundle/{decision_id}",
    response_model=ArchivalBundle,
    summary="Export complete archival bundle"
)
async def get_archival_bundle(decision_id: UUID) -> ArchivalBundle:
    """
    Export a complete archival bundle for a decision.
    
    Contains everything needed to verify forever:
    - Cryptographic snapshot
    - Key rotation history
    - Secondary hashes
    """
    # Generate snapshot
    snapshot = snapshot_generator.create_snapshot(
        decision_id=decision_id,
        created_at=datetime.now(timezone.utc)
    )
    
    # Get key history (in production, filter by relevant identities)
    key_history = key_rotation_manager.log.entries
    
    # Generate secondary hash
    mock_payload = f'{{"decision_id": "{decision_id}"}}'.encode()
    secondary = rehash_engine.compute_secondary_hash(
        decision_id=decision_id,
        record_id=1,
        original_hash=f"sha256:mock_{decision_id}",
        canonical_payload=mock_payload
    )
    
    return ArchivalBundle(
        archival_version="1.0.0",
        decision_id=decision_id,
        snapshot=snapshot,
        key_history=key_history,
        secondary_hashes=[secondary],
        verification_notes=(
            "To verify this decision in archival mode:\n"
            "regulayer-proof-verifier verify proof.json --archival\n\n"
            "This uses the snapshot crypto context instead of current recommendations."
        ),
        generated_at=datetime.now(timezone.utc)
    )


@router.get(
    "/algorithms",
    summary="Get supported rehash algorithms"
)
async def get_supported_algorithms() -> dict:
    """
    Get information about supported rehash algorithms.
    
    Includes current recommendation and explanations.
    """
    return {
        "supported": list(rehash_engine.SUPPORTED_ALGORITHMS.keys()),
        "recommended": rehash_engine.get_recommended_algorithm(),
        "explanations": {
            algo: rehash_engine.explain_algorithm_choice(algo)
            for algo in rehash_engine.SUPPORTED_ALGORITHMS.keys()
        }
    }
