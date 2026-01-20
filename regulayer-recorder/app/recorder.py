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
from .errors import DuplicateDecisionError
from .config import settings
from regulayer_attestation.app.models import AttestationMetadata
from typing import Optional


async def record_decision(
    session: AsyncSession, 
    event: DecisionEvent,
    attestation: Optional[AttestationMetadata] = None
) -> RecordConfirmation:
    """
    Record a decision event (append-only).
    
    Args:
        session: Database session
        event: Validated DecisionEvent
        attestation: Optional attestation metadata (for attested events)
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
    
    # 4. Get last record for chaining
    last_record = await get_last_record(session, chain_id=settings.chain_id)
    previous_record_hash = last_record.record_hash if last_record else None
    
    # Prepare attestation fields
    signature_algorithm = None
    identity_id = None
    signed_at = None
    attestation_payload = None
    
    if attestation:
        signature_algorithm = attestation.algorithm
        identity_id = attestation.identity_id
        signed_at = attestation.signed_at
        # Store full envelope details if needed, but storage expects specific columns
        # storage.insert_record logic maps these.
        # We need to serialize attestation payload for storage potentially?
        # The column is JSON.
        attestation_payload = attestation.model_dump(mode='json')

    # 5. Insert record (append-only)
    db_record = await insert_record(
        session=session,
        decision_id=event.decision_id,
        record_hash=record_hash,
        previous_record_hash=previous_record_hash,
        canonical_payload=canonical_dict,
        canonical_payload_hash=canonical_payload_hash,
        chain_id=settings.chain_id,
        sdk_instance_id=UUID(event.runtime_fingerprint.sdk_instance_id),
        system_name=event.system_name,
        risk_level=event.risk_level,
        event_state=event.event_state,
        sdk_version=event.runtime_fingerprint.sdk_version,
        # Attestation
        signature_algorithm=signature_algorithm,
        identity_id=identity_id,
        signed_at=signed_at,
        attestation_payload=attestation_payload
    )
    
    # 6. Return confirmation
    return RecordConfirmation(
        record_id=db_record.record_id,
        decision_id=db_record.decision_id,
        record_hash=db_record.record_hash,
        server_timestamp=db_record.server_timestamp
    )
