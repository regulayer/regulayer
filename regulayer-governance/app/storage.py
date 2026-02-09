"""
Regulayer Governance - Storage Layer

CRITICAL CONSTRAINTS:
1. This is a SEPARATE store from the Decision Recorder
2. NO cascading deletes to recorder data
3. NO foreign key constraints to recorder tables
4. Annotations table has NO update capability
"""

from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Index
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from .config import settings

Base = declarative_base()


class GovernanceMetadataDB(Base):
    """
    Core governance record for a decision.
    
    decision_id is a reference to the recorder, but NOT a foreign key.
    """
    __tablename__ = "governance_metadata"
    
    decision_id = Column(PGUUID(as_uuid=True), primary_key=True)
    review_state = Column(String(50), nullable=False, default="unreviewed")
    last_updated = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        {'comment': 'Governance metadata overlay. Does NOT affect cryptographic verification.'}
    )


class GovernanceTagDB(Base):
    """
    Tags attached to decisions.
    
    ADD-ONLY in Phase 4.1 (no deletion).
    """
    __tablename__ = "governance_tags"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    decision_id = Column(PGUUID(as_uuid=True), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    source = Column(String(50), nullable=False, default="manual")
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        Index('idx_governance_tags_decision', 'decision_id'),
        {'comment': 'Tags are descriptive only. No deletion in Phase 4.1.'}
    )


class GovernanceAnnotationDB(Base):
    """
    Annotations attached to decisions.
    
    APPEND-ONLY: No update, no delete, even for admins.
    """
    __tablename__ = "governance_annotations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    decision_id = Column(PGUUID(as_uuid=True), nullable=False, index=True)
    author_role = Column(String(50), nullable=False)
    note = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        Index('idx_governance_annotations_decision', 'decision_id'),
        {'comment': 'APPEND-ONLY. No update or delete permitted, even by admins.'}
    )


class GovernanceReviewHistoryDB(Base):
    """
    APPEND-ONLY: Stores review state transitions.
    Current state is derived from the latest entry by timestamp for a decision_id.
    NEVER UPDATE OR DELETE ROWS HERE.
    """
    __tablename__ = "governance_review_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    decision_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    review_state: Mapped[str] = mapped_column(String, nullable=False) # e.g., "pending", "approved", "rejected"
    actor_role: Mapped[str] = mapped_column(String, nullable=False) # "owner", "admin"
    actor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        # Composite index for fast state resolution: SELECT * ... ORDER BY timestamp DESC LIMIT 1
        Index('idx_gov_review_history_decision_ts', 'decision_id', text('timestamp DESC')),
    )

class GovernanceAccessLogDB(Base):
    """
    APPEND-ONLY: Audit log for all governance actions.
    """

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    decision_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=False)
    action: Mapped[str] = mapped_column(String, nullable=False)
    actor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True, nullable=True) # made nullable for system events if any
    actor_role: Mapped[str] = mapped_column(String, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True, nullable=False)
    details: Mapped[dict] = mapped_column(JSON, default={})

    __table_args__ = (
        Index('idx_governance_access_logs_decision', 'decision_id'),
        Index('idx_governance_access_logs_timestamp', 'timestamp'),
        {'comment': 'APPEND-ONLY audit log of all governance actions.'}
    )


# Async database session factory
async_engine = create_async_engine(
    settings.governance_database_url.replace('postgresql://', 'postgresql+asyncpg://'),
    echo=settings.debug,
    pool_pre_ping=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_governance_session():
    """Dependency for FastAPI endpoints."""
    async with AsyncSessionLocal() as session:
        yield session


async def init_governance_db():
    """Initialize governance tables."""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

