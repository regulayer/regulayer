"""
Regulayer Decision Recorder - Chain Integrity Verification

Verifies hash chain integrity to detect tampering.
"""

from typing import Optional, List, Tuple
import json

from .storage import (
    AsyncSession,
    get_records_in_range,
    get_total_records,
    get_last_record
)
from .hasher import verify_record_hash, verify_chain_link
from .errors import ChainIntegrityError
from .config import settings


class VerificationResult:
    """Result of chain verification."""
    
    def __init__(self):
        self.is_valid = True
        self.total_records = 0
        self.verified_records = 0
        self.errors: List[str] = []
    
    def add_error(self, error: str):
        """Add verification error."""
        self.is_valid = False
        self.errors.append(error)


async def verify_chain(
    session: AsyncSession,
    start_record_id: Optional[int] = None,
    end_record_id: Optional[int] = None,
    chain_id: str = "global"
) -> VerificationResult:
    """
    Verify hash chain integrity.
    
    Checks:
    1. Each record's hash matches its canonical payload
    2. Each record correctly links to previous record
    3. No gaps in chain
    
    Args:
        session: Database session
        start_record_id: Start verification from this record (None = from beginning)
        end_record_id: End verification at this record (None = to end)
        chain_id: Chain identifier
    
    Returns:
        VerificationResult
    
    Note:
        This can be run offline, deterministically, without SDK.
    """
    result = VerificationResult()
    
    # Get total records for context
    result.total_records = await get_total_records(session)
    
    if result.total_records == 0:
        return result  # Empty chain is valid
    
    # Determine range
    if start_record_id is None:
        start_record_id = 1
    
    if end_record_id is None:
        last_record = await get_last_record(session, chain_id)
        end_record_id = last_record.record_id if last_record else 0
    
    # Get records in range
    records = await get_records_in_range(session, start_record_id, end_record_id, chain_id)
    
    if not records:
        result.add_error(f"No records found in range [{start_record_id}, {end_record_id}]")
        return result
    
    # Verify each record
    previous_hash = None
    expected_record_id = start_record_id
    
    for record in records:
        # Check for gaps
        if record.record_id != expected_record_id:
            result.add_error(
                f"Gap in chain: expected record_id {expected_record_id}, "
                f"got {record.record_id}"
            )
        
        # Verify record hash matches canonical payload
        canonical_json = json.dumps(record.canonical_payload, sort_keys=True, separators=(',', ':'))
        if not verify_record_hash(canonical_json, record.record_hash):
            result.add_error(
                f"Record {record.record_id}: hash mismatch. "
                f"Payload has been tampered with."
            )
        
        # Verify hash also matches canonical_payload_hash
        if record.record_hash != record.canonical_payload_hash:
            result.add_error(
                f"Record {record.record_id}: record_hash mismatch with canonical_payload_hash"
            )
        
        # Verify chain link
        if not verify_chain_link(record.record_hash, record.previous_record_hash, previous_hash):
            result.add_error(
                f"Record {record.record_id}: broken chain link. "
                f"Expected previous_hash={previous_hash}, got={record.previous_record_hash}"
            )
        
        # Move to next
        previous_hash = record.record_hash
        expected_record_id = record.record_id + 1
        result.verified_records += 1
    
    return result


async def verify_decision_by_id(session: AsyncSession, decision_id: str) -> VerificationResult:
    """
    Spot-verify a specific decision by ID.
    
    Args:
        session: Database session
        decision_id: Decision ID to verify
    
    Returns:
        VerificationResult
    """
    from sqlalchemy import select
    from .storage import DecisionRecordDB
    from uuid import UUID
    
    # Get record
    stmt = select(DecisionRecordDB).where(DecisionRecordDB.decision_id == UUID(decision_id))
    db_result = await session.execute(stmt)
    record = db_result.scalar_one_or_none()
    
    result = VerificationResult()
    
    if not record:
        result.add_error(f"Decision {decision_id} not found")
        return result
    
    # Verify hash
    canonical_json = json.dumps(record.canonical_payload, sort_keys=True, separators=(',', ':'))
    if not verify_record_hash(canonical_json, record.record_hash):
        result.add_error(f"Decision {decision_id}: hash mismatch - tampered")
    
    result.verified_records = 1
    return result

async def verify_full_integrity(session: AsyncSession) -> dict:
    """
    Run full forensic integrity check (Hash + Link + Signature).
    Returns dict compatible with IntegrityReport.
    """
    from sqlalchemy import select, asc
    from .storage import DecisionRecordDB
    # from .recorder import compute_canonical_hash as _unused_
    from .hasher import compute_canonical_hash
    from .attestation_guard import guard
    from regulayer_attestation.app.models import AttestationEnvelope
    
    # Strictly ordered
    stmt = select(DecisionRecordDB).order_by(asc(DecisionRecordDB.record_id))
    result = await session.execute(stmt)
    records = result.scalars().all()
    
    records_checked = 0
    expected_prev_hash = None
    
    for record in records:
        records_checked += 1
        
        # 1. Hash Mismatch
        computed_hash = compute_canonical_hash(record.canonical_payload)
        if computed_hash != record.record_hash:
            return {
                "status": "CORRUPTED",
                "records_checked": records_checked,
                "first_error": {
                    "decision_id": str(record.decision_id),
                    "reason": f"Hash mismatch: stored={record.record_hash}, computed={computed_hash}"
                }
            }
            
        # 2. Linkage
        if record.record_id == 1:
            if record.previous_record_hash is not None:
                return {
                    "status": "CORRUPTED",
                    "records_checked": records_checked,
                    "first_error": {
                        "decision_id": str(record.decision_id),
                        "reason": "Genesis record has previous_hash"
                    }
                }
        else:
            if record.previous_record_hash != expected_prev_hash:
                return {
                    "status": "CORRUPTED",
                    "records_checked": records_checked,
                    "first_error": {
                        "decision_id": str(record.decision_id),
                        "reason": f"Broken link: prev={record.previous_record_hash}, expected={expected_prev_hash}"
                    }
                }
                
        # 3. Signature
        if record.signature_algorithm:
            if not record.attestation_payload:
                return {
                    "status": "CORRUPTED",
                    "records_checked": records_checked,
                    "first_error": {
                        "decision_id": str(record.decision_id),
                        "reason": f"Missing attestation payload at {record.record_id}"
                    }
                }
            try:
                envelope = AttestationEnvelope(**record.attestation_payload)
                verify_result = guard.verifier.verify(envelope) # Uses internal registry
                if not verify_result.is_valid:
                     return {
                        "status": "CORRUPTED",
                        "records_checked": records_checked,
                        "first_error": {
                            "decision_id": str(record.decision_id),
                            "reason": f"Signature verification failed: {'; '.join(verify_result.errors)}"
                        }
                    }
            except Exception as e:
                 return {
                    "status": "CORRUPTED",
                    "records_checked": records_checked,
                    "first_error": {
                        "decision_id": str(record.decision_id),
                        "reason": f"Signature verification exception: {str(e)}"
                    }
                }
        
        expected_prev_hash = record.record_hash
        
    return {
        "status": "VALID",
        "records_checked": records_checked,
        "first_error": None
    }
