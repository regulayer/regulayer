"""
Regulayer Control Plane - Database Storage

Multi-tenant database schema for SaaS control plane.
"""

from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID, uuid4
import hashlib
import secrets

from sqlalchemy import (
    create_engine, Column, String, DateTime, ForeignKey,
    Boolean, Enum as SQLEnum, JSON, Index, Integer
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

from .enums import OrgStatus, ProjectEnvironment, UserRole, ApiKeyScope


Base = declarative_base()


class OrganizationDB(Base):
    """Organization table."""
    __tablename__ = "organizations"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    logo_url = Column(String(1024), nullable=True) # URL to logo image
    status = Column(SQLEnum(OrgStatus), default=OrgStatus.ACTIVE, nullable=False)
    is_demo = Column(Boolean, default=False, nullable=False)
    environment = Column(String(50), default="prod", nullable=False)
    data_region = Column(String(50), nullable=True)
    stripe_customer_id = Column(String(255), nullable=True)
    subscription_status = Column(String(50), nullable=True)
    custom_decision_cap = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    projects = relationship("ProjectDB", back_populates="organization")
    users = relationship("UserDB", back_populates="organization")


class ProjectDB(Base):
    """Project table."""
    __tablename__ = "projects"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    environment = Column(SQLEnum(ProjectEnvironment), default=ProjectEnvironment.DEV, nullable=False)
    data_region = Column(String(50), nullable=True)
    ai_act_risk_category = Column(String(50), nullable=True)
    governance_mode = Column(String(20), nullable=False, default="observe", server_default="observe")  # "observe" or "gate"
    gate_decline_message = Column(String(500), nullable=True, default="Decision declined by governance.", server_default="Decision declined by governance.")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization = relationship("OrganizationDB", back_populates="projects")
    api_keys = relationship("ApiKeyDB", back_populates="project")
    
    # Indexes
    __table_args__ = (
        Index("ix_projects_organization_id", "organization_id"),
    )


class ApiKeyDB(Base):
    """API key table."""
    __tablename__ = "api_keys"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    project_id = Column(PGUUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    key_prefix = Column(String(12), nullable=False)  # "rl_" + first 7 hex chars
    key_hash = Column(String(64), nullable=False)   # SHA-256 hash of full key
    scopes = Column(JSON, nullable=False)           # List of scope strings
    is_demo_key = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    project = relationship("ProjectDB", back_populates="api_keys")
    
    # Indexes
    __table_args__ = (
        Index("ix_api_keys_project_id", "project_id"),
        Index("ix_api_keys_key_prefix", "key_prefix"),
        Index("ix_api_keys_key_hash", "key_hash"),
    )


class UserDB(Base):
    """User table."""
    __tablename__ = "users"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    role = Column(SQLEnum(UserRole), default=UserRole.MEMBER, nullable=False)
    password_hash = Column(String(128), nullable=True)  # For future auth
    is_superadmin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization = relationship("OrganizationDB", back_populates="users")
    
    # Indexes
    __table_args__ = (
        Index("ix_users_organization_id", "organization_id"),
        Index("ix_users_email", "email"),
    )


class SessionDB(Base):
    """Session table for user authentication."""
    __tablename__ = "sessions"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    token_hash = Column(String(64), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Indexes
    __table_args__ = (
        Index("ix_sessions_user_id", "user_id"),
        Index("ix_sessions_token_hash", "token_hash"),
    )



class PasswordResetTokenDB(Base):
    """Token for password reset workflow."""
    __tablename__ = "password_reset_tokens"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    token_hash = Column(String(64), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    used = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    user = relationship("UserDB")
    
    # Indexes
    __table_args__ = (
        Index("ix_pwd_reset_token_hash", "token_hash"),
        Index("ix_pwd_reset_user_id", "user_id"),
    )


class OtpCodeDB(Base):
    """OTP codes for signup verification."""
    __tablename__ = "otp_codes"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String(255), nullable=False)
    code_hash = Column(String(64), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    verified = Column(Boolean, default=False, nullable=False) # True if verified but not yet used for cleanup
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Indexes
    __table_args__ = (
        Index("ix_otp_codes_email", "email"),
    )


class InvitationDB(Base):
    """Pending invitations for users."""
    __tablename__ = "invitations"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    email = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.MEMBER, nullable=False)
    token_hash = Column(String(64), nullable=False, unique=True)
    inviter_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    accepted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    organization = relationship("OrganizationDB")
    inviter = relationship("UserDB")
    
    # Indexes
    __table_args__ = (
        Index("ix_invitations_token_hash", "token_hash"),
        Index("ix_invitations_organization_id", "organization_id"),
        Index("ix_invitations_email", "email"),
    )


class UsageEventDB(Base):
    """Usage event table for metering."""
    __tablename__ = "usage_events"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    project_id = Column(PGUUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    event_type = Column(String(50), nullable=False)
    count = Column(Integer, default=1)
    recorded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    event_metadata = Column(JSON, default={})
    
    # Indexes
    __table_args__ = (
        Index("ix_usage_events_project_id", "project_id"),
        Index("ix_usage_events_recorded_at", "recorded_at"),
    )


class UsageMeterDB(Base):
    """Aggregated usage meter for billing periods."""
    __tablename__ = "usage_meters"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    project_id = Column(PGUUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    decisions_ingested = Column(Integer, default=0)
    proofs_exported = Column(Integer, default=0)
    reports_generated = Column(Integer, default=0)
    api_calls = Column(Integer, default=0)
    
    # Indexes
    __table_args__ = (
        Index("ix_usage_meters_project_id", "project_id"),
    )


class AuditLogDB(Base):
    """Audit log table."""
    __tablename__ = "audit_logs"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    actor_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True) # Null for system actions or API keys
    actor_email = Column(String(255), nullable=True) # Snapshot for history
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(PGUUID(as_uuid=True), nullable=True)
    details = Column(JSON, default={})
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("OrganizationDB")
    actor = relationship("UserDB")

    # Indexes
    __table_args__ = (
        Index("ix_audit_logs_organization_id", "organization_id"),
        Index("ix_audit_logs_created_at", "created_at"),
        Index("ix_audit_logs_actor_id", "actor_id"),
    )

class NotificationPreferenceDB(Base):
    """Notification preferences for a user in an organization."""
    __tablename__ = "notification_preferences"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    # Types of notifications
    incident_alerts = Column(Boolean, default=True, nullable=False)
    governance_reviews = Column(Boolean, default=True, nullable=False)
    billing_updates = Column(Boolean, default=True, nullable=False)
    
    # Channels
    email_enabled = Column(Boolean, default=True, nullable=False)
    in_app_enabled = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=True, onupdate=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        Index("ix_notif_prefs_user_org", "user_id", "organization_id", unique=True),
    )

class WebhookDestinationDB(Base):
    """Registered webhook endpoints for an organization."""
    __tablename__ = "webhook_destinations"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    url = Column(String(1024), nullable=False)
    secret = Column(String(255), nullable=False)
    events = Column(JSON, nullable=False, default=list)
    status = Column(String(50), nullable=False, default="active") # active, disabled, failing
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=True, onupdate=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        Index("ix_webhook_dests_org_id", "organization_id"),
    )


# ============================================================
# Database Setup
# ============================================================

from .config import settings

DATABASE_URL = settings.database_url

engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=50,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


import time
def init_db():
    """Initialize database tables."""
    for attempt in range(10):
        try:
            Base.metadata.create_all(bind=engine)
            break
        except Exception as e:
            if attempt == 9:
                raise e
            print(f"DB Init failed (attempt {attempt+1}/10), retrying in 3s... {e}")
            time.sleep(3)


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================
# API Key Utilities
# ============================================================

def generate_api_key(is_demo: bool = False) -> tuple[str, str, str]:
    """
    Generate a new API key.
    
    Args:
        is_demo: If True, generates a demo key (rl_demo_...), else live key (rl_live_...)
    
    Returns:
        (full_key, key_prefix, key_hash)
    """
    # Generate 32 random bytes, encode as hex (64 chars)
    key_bytes = secrets.token_bytes(32)
    prefix = "rl_demo_" if is_demo else "rl_live_"
    full_key = f"{prefix}{key_bytes.hex()}"
    
    # Extract prefix for identification
    key_prefix = full_key[:12]  # "rl_demo_" or "rl_live_" + first chars
    
    # Hash for storage
    key_hash = hashlib.sha256(full_key.encode()).hexdigest()
    
    return full_key, key_prefix, key_hash


def hash_api_key(key: str) -> str:
    """Hash an API key for comparison."""
    return hashlib.sha256(key.encode()).hexdigest()

# ============================================================
# EU AI Act Compliance
# ============================================================

class AISystemDB(Base):
    __tablename__ = "ai_systems"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    version = Column(String(50), nullable=False)
    description = Column(String(1024), nullable=False)
    intended_purpose = Column(String(1024), nullable=False)
    provider_name = Column(String(255), nullable=False)
    risk_tier = Column(String(50), nullable=False)
    annex_category = Column(String(50), nullable=False)
    lifecycle_status = Column(String(50), nullable=False)
    classification_rationale = Column(String(1024), nullable=False)
    member_states = Column(JSON, nullable=False, default=list)
    deployment_date = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class ConformityAssessmentDB(Base):
    __tablename__ = "conformity_assessments"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    system_id = Column(PGUUID(as_uuid=True), nullable=False)
    system_name = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False)
    assessment_type = Column(String(50), nullable=False)
    checklist = Column(JSON, nullable=False, default=list)
    ce_declaration_generated = Column(Boolean, default=False)
    started_at = Column(String(50), nullable=True)
    completed_at = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class FRIADB(Base):
    __tablename__ = "fria_assessments"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    system_id = Column(PGUUID(as_uuid=True), nullable=False)
    system_name = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False)
    deployer_info = Column(JSON, nullable=False, default=dict)
    system_description = Column(JSON, nullable=False, default=dict)
    rights_analysis = Column(JSON, nullable=False, default=list)
    mitigation_measures = Column(JSON, nullable=False, default=list)
    human_oversight_plan = Column(String(2048), nullable=False)
    monitoring_commitments = Column(String(2048), nullable=False)
    authority_submission = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class TechDocumentationDB(Base):
    __tablename__ = "tech_documentation"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    system_id = Column(PGUUID(as_uuid=True), nullable=False)
    system_name = Column(String(255), nullable=True)
    overall_completeness = Column(Integer, default=0)
    sections = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class MonitoringPlanDB(Base):
    __tablename__ = "monitoring_plans"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    system_id = Column(PGUUID(as_uuid=True), nullable=False)
    system_name = Column(String(255), nullable=True)
    review_frequency = Column(String(50), nullable=False)
    next_review_date = Column(String(50), nullable=False)
    alerts_enabled = Column(Boolean, default=False)
    kpis = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class IncidentReportDB(Base):
    __tablename__ = "incident_reports"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    system_id = Column(PGUUID(as_uuid=True), nullable=False)
    system_name = Column(String(255), nullable=True)
    severity = Column(String(50), nullable=False)
    deadline_days = Column(Integer, default=0)
    deadline_date = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)
    authority_name = Column(String(255), nullable=False)
    submission_date = Column(String(50), nullable=True)
    linked_incident_ids = Column(JSON, nullable=False, default=list)
    form_data = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
