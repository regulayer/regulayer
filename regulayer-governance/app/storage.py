"""
Regulayer Governance - Storage Layer

CRITICAL CONSTRAINTS:
1. This is a SEPARATE store from the Decision Recorder
2. NO cascading deletes to recorder data
3. NO foreign key constraints to recorder tables
4. Annotations table has NO update capability
"""

from datetime import datetime, timezone
import uuid
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Index, func, JSON, text, Boolean
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, Mapped, mapped_column
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

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(PGUUID(as_uuid=True), index=True, nullable=False)
    org_id = Column(PGUUID(as_uuid=True), index=True, nullable=True) # Making nullable for backward compatibility with phase 1
    project_id = Column(PGUUID(as_uuid=True), index=True, nullable=True)
    review_state = Column(String, nullable=False) # e.g., "pending", "approved", "rejected", "escalated"
    actor_role = Column(String, nullable=False) # "owner", "admin", "reviewer"
    actor_id = Column(PGUUID(as_uuid=True), index=True, nullable=False)
    actor_email = Column(String(255), nullable=True) # Email of the person who approved/rejected
    action_reason = Column(Text, nullable=True)
    risk_level = Column(String(50), nullable=True) # "low", "medium", "high"
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        # Composite index for fast state resolution: SELECT * ... ORDER BY timestamp DESC LIMIT 1
        Index('idx_gov_review_history_decision_ts', 'decision_id', text('timestamp DESC')),
    )


class GovernanceAssignmentQueueDB(Base):
    """
    Active assignment queue for decisions needing review.
    """
    __tablename__ = "governance_assignment_queue"

    id = Column(Integer, primary_key=True, autoincrement=True)
    decision_id = Column(PGUUID(as_uuid=True), nullable=False, index=True, unique=True)
    assigned_to = Column(PGUUID(as_uuid=True), index=True, nullable=True) # ID of user or null if unassigned
    priority = Column(String(50), nullable=False, default="normal") # "low", "normal", "high", "urgent"
    assigned_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        {'comment': 'Active review assignments queue.'}
    )


class GovernancePoliciesDB(Base):
    """
    Organization-specific governance policies (JSON).
    """
    __tablename__ = "governance_policies"

    org_id = Column(PGUUID(as_uuid=True), primary_key=True)
    policy_json = Column(JSON, nullable=False, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        {'comment': 'Organization governance configuration and risk policies.'}
    )


class GovernanceProposalDB(Base):
    """
    Mode 2: Pending/Proposed Decisions waiting for Approval before execution.
    """
    __tablename__ = "governance_proposals"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(PGUUID(as_uuid=True), index=True, nullable=True)
    project_id = Column(PGUUID(as_uuid=True), index=True, nullable=True)
    environment = Column(String(50), nullable=True, default="prod")
    proposed_payload = Column(JSON, nullable=False)
    status = Column(String(50), nullable=False, default="pending") # pending, approved, rejected
    decision_id = Column(PGUUID(as_uuid=True), index=True, nullable=True)
    action_reason = Column(Text, nullable=True)
    risk_level = Column(String(50), nullable=True)
    edit_chain = Column(JSON, nullable=True)  # Hash chain for edited responses: {original_hash, edited_hash, editor_id, timestamp}
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        {'comment': 'Mode 2: Pre-execution proposals pending approval.'}
    )


class GovernanceRuleDB(Base):
    """
    Individual governance rules with structured conditions and actions.
    Supports: risk level matching, response content matching, email notifications, etc.
    """
    __tablename__ = "governance_rules"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    org_id = Column(PGUUID(as_uuid=True), index=True, nullable=True)
    enabled = Column(Boolean, nullable=False, default=True)
    project_id = Column(PGUUID(as_uuid=True), index=True, nullable=True)
    applies_to = Column(JSON, nullable=False, default=[])  # list of system names, empty = all
    conditions = Column(JSON, nullable=False, default=[])   # [{field, operator, value}]
    actions = Column(JSON, nullable=False, default=[])      # [{type, ...params}]
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        {'comment': 'Structured governance rules with conditions and actions.'}
    )


class GovernanceAccessLogDB(Base):
    """
    APPEND-ONLY: Audit log for all governance actions.
    """
    __tablename__ = "governance_access_logs"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(PGUUID(as_uuid=True), index=True, nullable=False)
    action = Column(String, nullable=False)
    actor_id = Column(PGUUID(as_uuid=True), index=True) # nullable=True
    actor_role = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True, nullable=False)
    details = Column(JSON, default={})

    __table_args__ = (
        Index('idx_governance_access_logs_decision', 'decision_id'),
        Index('idx_governance_access_logs_timestamp', 'timestamp'),
        {'comment': 'APPEND-ONLY audit log of all governance actions.'}
    )


class GateResolutionDB(Base):
    """
    Tracks the resolution of decisions blocked by gate-mode policies.
    """
    __tablename__ = "gate_resolutions"

    decision_id = Column(PGUUID(as_uuid=True), primary_key=True)
    status = Column(String(50), nullable=False) # 'approved' or 'declined'
    edited_output = Column(JSON, nullable=True) # If the reviewer edited the AI output
    decline_message = Column(Text, nullable=True) # Custom decline message
    resolved_by = Column(String(100), nullable=False) # e.g., actor UUID or email
    resolved_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        {'comment': 'Resolutions for gate-mode blocked decisions.'}
    )


# Handle SSL mode for asyncpg
db_url = settings.governance_database_url.replace('postgresql://', 'postgresql+asyncpg://')
connect_args = {}
if "sslmode=require" in db_url:
    connect_args["ssl"] = "require"
    db_url = db_url.replace("?sslmode=require", "").replace("&sslmode=require", "")

# Async database session factory
async_engine = create_async_engine(
    db_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args=connect_args
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
    import asyncio
    for attempt in range(10):
        try:
            async with async_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                # Add project_id and org_id columns to governance_rules if they don't exist
                await conn.execute(text(
                    """
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_name = 'governance_rules' AND column_name = 'project_id'
                        ) THEN
                            ALTER TABLE governance_rules ADD COLUMN project_id UUID;
                            CREATE INDEX IF NOT EXISTS ix_governance_rules_project_id ON governance_rules(project_id);
                        END IF;
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_name = 'governance_rules' AND column_name = 'org_id'
                        ) THEN
                            ALTER TABLE governance_rules ADD COLUMN org_id UUID;
                            CREATE INDEX IF NOT EXISTS ix_governance_rules_org_id ON governance_rules(org_id);
                        END IF;
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_name = 'governance_review_history' AND column_name = 'actor_email'
                        ) THEN
                            ALTER TABLE governance_review_history ADD COLUMN actor_email VARCHAR(255);
                        END IF;
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_name = 'governance_review_history' AND column_name = 'org_id'
                        ) THEN
                            ALTER TABLE governance_review_history ADD COLUMN org_id UUID;
                        END IF;
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns
                            WHERE table_name = 'governance_review_history' AND column_name = 'project_id'
                        ) THEN
                            ALTER TABLE governance_review_history ADD COLUMN project_id UUID;
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

