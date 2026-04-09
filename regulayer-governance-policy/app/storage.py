"""
Regulayer Governance Policy - Storage Layer

CRITICAL CONSTRAINTS:
1. Policies stored separately from recorder
2. Approval records are APPEND-ONLY (no update, no delete)
3. Policy evaluation logs are immutable
"""

from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean, JSON, Index
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from .config import settings

Base = declarative_base()


class GovernancePolicyDB(Base):
    """Policy definition storage."""
    __tablename__ = "governance_rules"
    
    policy_id = Column("id", PGUUID(as_uuid=True), primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    org_id = Column(PGUUID(as_uuid=True), index=True, nullable=True)
    project_id = Column(PGUUID(as_uuid=True), index=True, nullable=True)
    enabled = Column(Boolean, nullable=False, default=True)
    applies_to = Column(JSON, nullable=False, default=list)
    conditions = Column(JSON, nullable=False)
    actions = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        {'comment': 'Governance policy definitions. Policies never affect cryptographic facts.'}
    )


class PolicyEvaluationLogDB(Base):
    """
    Immutable log of policy evaluations.
    
    APPEND-ONLY: No updates, no deletes.
    """
    __tablename__ = "policy_evaluation_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    decision_id = Column(PGUUID(as_uuid=True), nullable=False, index=True)
    policy_id = Column(PGUUID(as_uuid=True), nullable=False, index=True)
    matched = Column(Boolean, nullable=False)
    actions_executed = Column(JSON, nullable=False, default=list)
    evaluated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        Index('idx_eval_logs_decision', 'decision_id'),
        {'comment': 'APPEND-ONLY policy evaluation log.'}
    )


class ApprovalRecordDB(Base):
    """
    Immutable approval records.
    
    APPEND-ONLY: No updates, no deletes, even for admins.
    """
    __tablename__ = "approval_records"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    decision_id = Column(PGUUID(as_uuid=True), nullable=False, index=True)
    role = Column(String(50), nullable=False)
    approved = Column(Boolean, nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        Index('idx_approvals_decision', 'decision_id'),
        {'comment': 'APPEND-ONLY. No update or delete permitted, even by admins.'}
    )


class RequiredApprovalDB(Base):
    """Tracks which approvals are required for a decision."""
    __tablename__ = "required_approvals"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    decision_id = Column(PGUUID(as_uuid=True), nullable=False, index=True)
    role = Column(String(50), nullable=False)
    required_by_policy_id = Column(PGUUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        Index('idx_required_approvals_decision', 'decision_id'),
    )


# Async database session factory
# Handle SSL for asyncpg which doesn't support sslmode in URL
db_url = settings.database_url.replace('postgresql://', 'postgresql+asyncpg://')
connect_args = {}
if "sslmode=require" in db_url:
    db_url = db_url.replace("?sslmode=require", "").replace("&sslmode=require", "")
    connect_args["ssl"] = "require"

async_engine = create_async_engine(
    db_url,
    echo=settings.debug,
    pool_pre_ping=True,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_policy_session():
    """Dependency for FastAPI endpoints."""
    async with AsyncSessionLocal() as session:
        yield session


async def init_policy_db():
    """Initialize policy tables."""
    from sqlalchemy import text
    import asyncio
    for attempt in range(10):
        try:
            async with async_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                # Add org_id column to governance_rules if it doesn't exist
                await conn.execute(text(
                    """
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_name = 'governance_rules' AND column_name = 'org_id'
                        ) THEN
                            ALTER TABLE governance_rules ADD COLUMN org_id UUID;
                            CREATE INDEX IF NOT EXISTS ix_governance_rules_org_id ON governance_rules(org_id);
                        END IF;
                    END $$;
                    """
                ))
            break
        except Exception as e:
            if attempt == 9:
                raise e
            print(f"DB Init failed (attempt {attempt+1}/10), retrying in 3s... {e}")
            await asyncio.sleep(3)
