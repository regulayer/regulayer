"""
Regulayer Decision Recorder - Core Recording Logic

Append-only write logic with duplicate detection and chain linking.
"""

from uuid import UUID
from datetime import datetime, timezone

from .models import DecisionEvent, RecordConfirmation
from .canonicalizer import canonicalize_event, parse_canonical_payload
from .hasher import compute_record_hash
from .storage import (
    AsyncSession,
    check_duplicate_decision,
    get_last_record,
    insert_record
)
from .errors import DuplicateDecisionError, OrderingViolationError
from .config import settings
from regulayer_attestation.app.models import AttestationMetadata
from typing import Optional


async def record_decision(
    session: AsyncSession, 
    event: DecisionEvent,
    attestation: Optional[AttestationMetadata] = None,
    project_id: str = "global",
    environment: str = "production"
) -> RecordConfirmation:
    """
    Record a decision event (append-only).
    
    Args:
        session: Database session
        event: Validated DecisionEvent
        attestation: Optional attestation metadata (for attested events)
        project_id: Project identifier for chain isolation (default: "global")
        environment: Origin environment (e.g. "production", "staging")
    """
    # 1. Check for duplicate decision_id
    is_duplicate = await check_duplicate_decision(session, event.decision_id)
    if is_duplicate:
        raise DuplicateDecisionError(
            f"Decision ID {event.decision_id} already exists",
            decision_id=str(event.decision_id)
        )
    
    # 2. Canonicalize event
    canonical_json = canonicalize_event(event)
    canonical_dict = parse_canonical_payload(canonical_json)
    
    # 3. Compute hashes
    record_hash = compute_record_hash(canonical_json)
    canonical_payload_hash = record_hash  # Same hash
    
    # 4. Get last record for chaining (Per-Project)
    chain_id = project_id
    last_record = await get_last_record(session, chain_id=chain_id)
    previous_record_hash = last_record.record_hash if last_record else None
    
    # 5. Sequence Validation (Ordering Guarantee)
    # If sequence_number is provided in the event, we enforce strict ordering.
    if event.sequence_number is not None:
        expected_seq = (last_record.sequence_number + 1) if (last_record and last_record.sequence_number is not None) else 1
        # If last record has no sequence (legacy), we start at last_record_count + 1?
        # Or if this is the first "ordered" event, it might be 1?
        # Robust logic: If last_record exists but has no sequence, treat last sequence as 0?
        if last_record and last_record.sequence_number is None:
             # Legacy migration case: We can't strict check against None. 
             # For now, let's assume if event has sequence, we try to validate.
             # Ideally we should backfill or reset.
             pass 

        if event.sequence_number != expected_seq and not (last_record and last_record.sequence_number is None):
             # Only raise if we have a valid baseline or it should be 1
             raise OrderingViolationError(
                 f"Sequence mismatch for project {project_id}. Expected {expected_seq}, got {event.sequence_number}",
                 decision_id=str(event.decision_id)
             )
    
    # Prepare attestation fields
    signature_algorithm = None
    identity_id = None
    signed_at = None
    attestation_payload = None
    
    if attestation:
        signature_algorithm = attestation.algorithm
        identity_id = attestation.identity_id
        signed_at = attestation.signed_at
        # Store full envelope details
        attestation_payload = attestation.model_dump(mode='json')
        
    # Inject Watermark if not production
    if environment and environment.lower() != "production":
        if attestation_payload is None:
            attestation_payload = {}
        attestation_payload["_watermark"] = {
            "environment": environment,
            "notice": "NON-PRODUCTION PROOF"
        }

    # Extract SDK identification securely
    sdk_instance_id_str = "00000000-0000-0000-0000-000000000000"
    sdk_version = "unknown"
    if event.runtime_fingerprint:
        sdk_instance_id_str = event.runtime_fingerprint.sdk_instance_id
        sdk_version = event.runtime_fingerprint.sdk_version
    elif event.client_metadata and isinstance(event.client_metadata, dict) and "runtime_fingerprint" in event.client_metadata:
        rf = event.client_metadata["runtime_fingerprint"]
        if isinstance(rf, dict):
            sdk_instance_id_str = rf.get("sdk_instance_id", sdk_instance_id_str)
            sdk_version = rf.get("sdk_version", sdk_version)

    # 6. Insert record (append-only)
    db_record = await insert_record(
        session=session,
        decision_id=event.decision_id,
        record_hash=record_hash,
        previous_record_hash=previous_record_hash,
        canonical_payload=canonical_dict,
        canonical_payload_hash=canonical_payload_hash,
        chain_id=chain_id,
        sdk_instance_id=UUID(sdk_instance_id_str),
        system_name=event.system_name or getattr(event, 'system', 'default'),
        risk_level=event.risk_level,
        event_state=event.event_state,
        sdk_version=sdk_version,
        # Attestation
        signature_algorithm=signature_algorithm,
        identity_id=identity_id,
        signed_at=signed_at,
        attestation_payload=attestation_payload,
        # Ordering
        sequence_number=event.sequence_number
    )
    
    # 7. Return confirmation
    return RecordConfirmation(
        record_id=db_record.record_id,
        decision_id=db_record.decision_id,
        record_hash=db_record.record_hash,
        server_timestamp=db_record.server_timestamp
    )
