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
    Boolean, Enum as SQLEnum, JSON, Index
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
    status = Column(SQLEnum(OrgStatus), default=OrgStatus.ACTIVE, nullable=False)
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
    key_prefix = Column(String(8), nullable=False)  # First 8 chars for identification
    key_hash = Column(String(64), nullable=False)   # SHA-256 hash of full key
    scopes = Column(JSON, nullable=False)           # List of scope strings
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


class UsageEventDB(Base):
    """Usage event table for metering."""
    __tablename__ = "usage_events"
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    project_id = Column(PGUUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    event_type = Column(String(50), nullable=False)
    count = Column(String(20), default="1")
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
    decisions_ingested = Column(String(20), default="0")
    proofs_exported = Column(String(20), default="0")
    reports_generated = Column(String(20), default="0")
    api_calls = Column(String(20), default="0")
    
    # Indexes
    __table_args__ = (
        Index("ix_usage_meters_project_id", "project_id"),
    )


# ============================================================
# Database Setup
# ============================================================

from .config import settings

DATABASE_URL = settings.database_url

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)


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

def generate_api_key() -> tuple[str, str, str]:
    """
    Generate a new API key.
    
    Returns:
        (full_key, key_prefix, key_hash)
    """
    # Generate 32 random bytes, encode as hex (64 chars)
    key_bytes = secrets.token_bytes(32)
    full_key = f"rl_{key_bytes.hex()}"
    
    # Extract prefix for identification
    key_prefix = full_key[:10]  # "rl_" + first 7 hex chars
    
    # Hash for storage
    key_hash = hashlib.sha256(full_key.encode()).hexdigest()
    
    return full_key, key_prefix, key_hash


def hash_api_key(key: str) -> str:
    """Hash an API key for comparison."""
    return hashlib.sha256(key.encode()).hexdigest()
