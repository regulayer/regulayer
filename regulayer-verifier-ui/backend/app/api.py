"""
Regulayer Verification UI - Read-Only API Endpoints

ALL ENDPOINTS ARE GET-ONLY.
NO POST, PUT, DELETE ALLOWED.
"""

import sys
import os
from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import Optional
from uuid import UUID

# Add recorder to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../regulayer-recorder'))

from regulayer_recorder.app.storage import AsyncSession, AsyncSessionLocal, DecisionRecordDB
from sqlalchemy import select, func

from .models import (
    ChainStatus,
    VerificationResult,
    DecisionSummary,
    DecisionListResponse,
    DecisionDetail,
    SpotVerification
)
from .verifier import (
    get_chain_status,
    run_full_verification,
    verify_single_decision
)

router = APIRouter(prefix="/v1")


async def get_db_session():
    """Get read-only database session."""
    async with AsyncSessionLocal() as session:
        yield session


@router.get("/verify/chain", response_model=ChainStatus)
async def chain_status(session: AsyncSession = Depends(get_db_session)):
    """
    Get chain status overview.
    
    Returns:
        ChainStatus with integrity assessment
    """
    return await get_chain_status(session)


@router.get("/verify/chain/full", response_model=VerificationResult)
async def full_verification(session: AsyncSession = Depends(get_db_session)):
    """
    Run full chain verification.
    
    WARNING: This can be slow for large chains.
    
    Returns:
        VerificationResult with detailed findings
    """
    return await run_full_verification(session)


@router.get("/decisions", response_model=DecisionListResponse)
async def list_decisions(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_db_session)
):
    """
    Get paginated list of decisions.
    
    Args:
        limit: Number of records to return (max 1000)
        offset: Number of records to skip
    
    Returns:
        DecisionListResponse with paginated decisions
    """
    from regulayer_recorder.app.config import settings as recorder_settings
    
    # Get total count
    count_stmt = select(func.count(DecisionRecordDB.record_id)).where(
        DecisionRecordDB.chain_id == recorder_settings.chain_id
    )
    total_result = await session.execute(count_stmt)
    total = total_result.scalar_one()
    
    # Get paginated records
    stmt = (
        select(DecisionRecordDB)
        .where(DecisionRecordDB.chain_id == recorder_settings.chain_id)
        .order_by(DecisionRecordDB.server_timestamp.desc())
        .limit(limit)
        .offset(offset)
    )
    
    result = await session.execute(stmt)
    records = result.scalars().all()
    
    # Convert to summaries
    decisions = [
        DecisionSummary(
            decision_id=r.decision_id,
            record_id=r.record_id,
            server_timestamp=r.server_timestamp,
            system_name=r.system_name,
            event_state=r.event_state,
            record_hash=r.record_hash
        )
        for r in records
    ]
    
    return DecisionListResponse(
        decisions=decisions,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/decisions/{decision_id}", response_model=DecisionDetail)
async def get_decision_detail(
    decision_id: UUID,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Get detailed decision record.
    
    Args:
        decision_id: Decision ID
    
    Returns:
        DecisionDetail with full record data
    
    Raises:
        404: Decision not found
    """
    stmt = select(DecisionRecordDB).where(DecisionRecordDB.decision_id == decision_id)
    result = await session.execute(stmt)
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Decision {decision_id} not found"
        )
    
    return DecisionDetail(
        decision_id=record.decision_id,
        record_id=record.record_id,
        record_hash=record.record_hash,
        previous_record_hash=record.previous_record_hash,
        canonical_payload=record.canonical_payload,
        canonical_payload_hash=record.canonical_payload_hash,
        sdk_instance_id=record.sdk_instance_id,
        server_timestamp=record.server_timestamp,
        system_name=record.system_name,
        risk_level=record.risk_level,
        event_state=record.event_state,
        sdk_version=record.sdk_version,
        verification_status="unverified"
    )


@router.get("/verify/decision/{decision_id}", response_model=SpotVerification)
async def verify_decision(
    decision_id: UUID,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Spot-verify a single decision.
    
    Args:
        decision_id: Decision ID to verify
    
    Returns:
        SpotVerification result
    
    Raises:
        404: Decision not found
    """
    # Check decision exists
    stmt = select(DecisionRecordDB).where(DecisionRecordDB.decision_id == decision_id)
    result = await session.execute(stmt)
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Decision {decision_id} not found"
        )
    
    return await verify_single_decision(session, decision_id)
