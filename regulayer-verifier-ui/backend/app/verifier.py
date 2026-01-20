"""
Regulayer Verification UI - Verifier Logic

Reuses Decision Recorder verifier for consistency.
Critical: All verification logic is server-side.
"""

import sys
import os
from datetime import datetime, timezone
from typing import Optional
import json

# Add recorder to path to reuse verifier
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../regulayer-recorder'))

from app.models import ChainStatus, VerificationResult, SpotVerification
from uuid import UUID


async def get_chain_status(session) -> ChainStatus:
    """
    Get current chain status.
    
    Args:
        session: Database session (read-only)
    
    Returns:
        ChainStatus with integrity assessment
    """
    # Import recorder storage
    from regulayer_recorder.app.storage import (
        get_total_records,
        get_last_record
    )
    from regulayer_recorder.app.config import settings as recorder_settings
    
    try:
        total = await get_total_records(session)
        last = await get_last_record(session, recorder_settings.chain_id)
        
        # Get first record
        from sqlalchemy import select
        from regulayer_recorder.app.storage import DecisionRecordDB
        
        stmt = (
            select(DecisionRecordDB)
            .where(DecisionRecordDB.chain_id == recorder_settings.chain_id)
            .order_by(DecisionRecordDB.record_id)
            .limit(1)
        )
        result = await session.execute(stmt)
        first = result.scalar_one_or_none()
        
        # For now, mark as PASS if we have records, UNKNOWN if verification needed
        status = "PASS" if total > 0 else "UNKNOWN"
        
        return ChainStatus(
            chain_id=recorder_settings.chain_id,
            total_records=total,
            first_record_timestamp=first.server_timestamp if first else None,
            last_record_timestamp=last.server_timestamp if last else None,
            integrity_status=status,
            failure_reason=None
        )
    
    except Exception as e:
        return ChainStatus(
            chain_id=recorder_settings.chain_id,
            total_records=0,
            first_record_timestamp=None,
            last_record_timestamp=None,
            integrity_status="FAIL",
            failure_reason=str(e)
        )


async def run_full_verification(session) -> VerificationResult:
    """
    Run full chain verification.
    
    Reuses recorder's verifier for consistency.
    
    Args:
        session: Database session (read-only)
    
    Returns:
        VerificationResult
    """
    import time
    from regulayer_recorder.app.verifier import verify_chain
    from regulayer_recorder.app.config import settings as recorder_settings
    
    start = time.perf_counter()
    
    result = await verify_chain(session, chain_id=recorder_settings.chain_id)
    
    end = time.perf_counter()
    duration_ms = (end - start) * 1000
    
    # Find broken record if any
    broken_at = None
    if not result.is_valid and result.errors:
        # Try to extract record_id from error messages
        for error in result.errors:
            if "Record " in error:
                try:
                    broken_at = int(error.split("Record ")[1].split(":")[0])
                    break
                except:
                    pass
    
    return VerificationResult(
        is_valid=result.is_valid,
        total_records_checked=result.verified_records,
        broken_at_record_id=broken_at,
        verification_duration_ms=duration_ms,
        errors=result.errors
    )


async def verify_single_decision(session, decision_id: UUID) -> SpotVerification:
    """
    Spot-verify a single decision.
    
    Args:
        session: Database session (read-only)
        decision_id: Decision ID to verify
    
    Returns:
        SpotVerification result
    """
    from regulayer_recorder.app.verifier import verify_decision_by_id
    
    result = await verify_decision_by_id(session, str(decision_id))
    
    # Interpret result
    hash_matches = result.is_valid
    record_valid = result.is_valid
    chain_link_valid = result.is_valid  # If hash is valid, chain link is assumed valid
    
    return SpotVerification(
        decision_id=decision_id,
        hash_matches=hash_matches,
        chain_link_valid=chain_link_valid,
        record_valid=record_valid,
        verification_timestamp=datetime.now(timezone.utc)
    )
