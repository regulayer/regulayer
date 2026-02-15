"""
Regulayer Decision Recorder - PostgreSQL Storage Layer

Append-only storage with immutability enforcement.

RULES:
- INSERT only
- NO UPDATE
- NO DELETE
- Immutability enforced at DB permission level
"""

from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID
from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON, BigInteger, Index, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from .config import settings
from .errors import DuplicateDecisionError, StorageError

# Database models
Base = declarative_base()


class DecisionRecordDB(Base):
    """
    Decision record database model.
    
    This table is APPEND-ONLY. No updates or deletes allowed.
    """
    __tablename__ = "decisions"
    
    # Record metadata
    record_id = Column(BigInteger, primary_key=True, autoincrement=True)
    decision_id = Column(PGUUID(as_uuid=True), unique=True, nullable=False, index=True)
    record_hash = Column(String(64), unique=True, nullable=False)
    previous_record_hash = Column(String(64), nullable=True)  # NULL for first record
    canonical_payload = Column(JSON, nullable=False)
    canonical_payload_hash = Column(String(64), unique=True, nullable=False)
    chain_id = Column(String(50), nullable=False, default="global")
    sequence_number = Column(Integer, nullable=True) # Per-project sequence
    server_timestamp = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    # Phase 2.2: Attestation fields (WRITE-ONCE, enforced by application)
    signature_algorithm = Column(String(20), nullable=True)
    identity_id = Column(PGUUID(as_uuid=True), nullable=True)
    signed_at = Column(DateTime(timezone=True), nullable=True)
    attestation_payload = Column(JSON, nullable=True)  # Full attestation envelope
    
    # Flattened event data for querying
    sdk_instance_id = Column(PGUUID(as_uuid=True), nullable=False, index=True)
    system_name = Column(String(255), nullable=False, index=True)
    risk_level = Column(String(50), nullable=False)
    event_state = Column(String(20), nullable=False)
    sdk_version = Column(String(50), nullable=False)
    
    __table_args__ = (
        Index('idx_decisions_chain', 'chain_id', 'record_id'),
        Index('idx_decisions_timestamp', 'server_timestamp'),
        Index('idx_decisions_identity', 'identity_id'), # New index for querying by signer
        # Table comment
        {'comment': 'Append-only decision records. record_id ordering MUST always match hash-chain order.'}
    )


# Async database session factory
async_engine = create_async_engine(
    settings.database_url.replace('postgresql://', 'postgresql+asyncpg://'),
    echo=False,
    pool_pre_ping=True
)

AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_db_session() -> AsyncSession:
    """Get async database session."""
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    """Initialize database (create tables if needed)."""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def check_duplicate_decision(session: AsyncSession, decision_id: UUID) -> bool:
    """
    Check if decision_id already exists.
    
    Args:
        session: Database session
        decision_id: Decision ID to check
    
    Returns:
        True if duplicate exists, False otherwise
    """
    from sqlalchemy import select
    
    stmt = select(DecisionRecordDB).where(DecisionRecordDB.decision_id == decision_id)
    result = await session.execute(stmt)
    existing = result.scalar_one_or_none()
    
    return existing is not None


async def get_last_record(session: AsyncSession, chain_id: str = "global") -> Optional[DecisionRecordDB]:
    """
    Get the last record in the chain.
    
    Args:
        session: Database session
        chain_id: Chain identifier
    
    Returns:
        Last DecisionRecordDB or None if chain is empty
    """
    from sqlalchemy import select, desc
    
    stmt = (
        select(DecisionRecordDB)
        .where(DecisionRecordDB.chain_id == chain_id)
        .order_by(desc(DecisionRecordDB.record_id))
        .limit(1)
    )
    
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def get_first_record(session: AsyncSession, chain_id: str = "global") -> Optional[DecisionRecordDB]:
    """
    Get the first record in the chain.
    """
    from sqlalchemy import select, asc
    
    stmt = (
        select(DecisionRecordDB)
        .where(DecisionRecordDB.chain_id == chain_id)
        .order_by(asc(DecisionRecordDB.record_id))
        .limit(1)
    )
    
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def insert_record(
    session: AsyncSession,
    decision_id: UUID,
    record_hash: str,
    previous_record_hash: Optional[str],
    canonical_payload: dict,
    canonical_payload_hash: str,
    chain_id: str,
    sdk_instance_id: UUID,
    system_name: str,
    risk_level: str,
    event_state: str,
    sdk_version: str,
    # New attested fields
    signature_algorithm: Optional[str] = None,
    identity_id: Optional[UUID] = None,
    signed_at: Optional[datetime] = None,
    attestation_payload: Optional[dict] = None,
    # Ordering
    sequence_number: Optional[int] = None
) -> DecisionRecordDB:
    """
    Insert a new decision record (append-only).
    """
    # Create record
    record = DecisionRecordDB(
        decision_id=decision_id,
        record_hash=record_hash,
        previous_record_hash=previous_record_hash,
        canonical_payload=canonical_payload,
        canonical_payload_hash=canonical_payload_hash,
        chain_id=chain_id,
        server_timestamp=datetime.now(timezone.utc),
        sdk_instance_id=sdk_instance_id,
        system_name=system_name,
        risk_level=risk_level,
        event_state=event_state,
        sdk_version=sdk_version,
        # Attestation
        signature_algorithm=signature_algorithm,
        identity_id=identity_id,
        signed_at=signed_at,
        attestation_payload=attestation_payload,
        sequence_number=sequence_number
    )
    
    session.add(record)
    
    try:
        await session.flush()  # Flush to get record_id
        await session.commit()
        await session.refresh(record)
        return record
    
    except Exception as e:
        await session.rollback()
        
        # Check if it's a duplicate error
        if "decisions_decision_id_key" in str(e):
            raise DuplicateDecisionError(
                f"Decision ID {decision_id} already exists",
                decision_id=str(decision_id)
            )
        
        raise StorageError(f"Failed to insert record: {str(e)}", decision_id=str(decision_id))


async def get_total_records(session: AsyncSession) -> int:
    """
    Get total number of records.
    
    Args:
        session: Database session
    
    Returns:
        Total record count
    """
    from sqlalchemy import select, func
    
    stmt = select(func.count(DecisionRecordDB.record_id))
    result = await session.execute(stmt)
    return result.scalar_one()


async def get_chain_record_count(session: AsyncSession, chain_id: str) -> int:
    """
    Get total record count for a specific chain.
    """
    from sqlalchemy import select, func
    
    stmt = select(func.count(DecisionRecordDB.record_id)).where(DecisionRecordDB.chain_id == chain_id)
    result = await session.execute(stmt)
    return result.scalar_one()


async def get_records_in_range(
    session: AsyncSession,
    start_record_id: int,
    end_record_id: int,
    chain_id: str = "global"
) -> List[DecisionRecordDB]:
    """
    Get records in a range for verification.
    
    Args:
        session: Database session
        start_record_id: Start record ID (inclusive)
        end_record_id: End record ID (inclusive)
        chain_id: Chain identifier
    
    Returns:
        List of DecisionRecordDB in order
    """
    from sqlalchemy import select
    
    stmt = (
        select(DecisionRecordDB)
        .where(
            DecisionRecordDB.chain_id == chain_id,
            DecisionRecordDB.record_id >= start_record_id,
            DecisionRecordDB.record_id <= end_record_id
        )
        .order_by(DecisionRecordDB.record_id)
    )
    
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_latest_records(
    session: AsyncSession,
    chain_id: str,
    limit: int = 50,
    offset: int = 0
) -> List[DecisionRecordDB]:
    """
    Get latest records for a chain (descending order).
    
    Args:
        session: Database session
        chain_id: Chain identifier (project_id)
        limit: Max records
        offset: Offset
        
    Returns:
        List of DecisionRecordDB
    """
    from sqlalchemy import select, desc
    
    stmt = (
        select(DecisionRecordDB)
        .where(DecisionRecordDB.chain_id == chain_id)
        .order_by(desc(DecisionRecordDB.server_timestamp))
        .limit(limit)
        .offset(offset)
    )
    
    result = await session.execute(stmt)
    return list(result.scalars().all())
