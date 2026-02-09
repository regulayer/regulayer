"""
Regulayer Control Plane - Enums

Shared enumerations for models and storage.
"""

from enum import Enum


class OrgStatus(str, Enum):
    """Organization status."""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING = "pending"
    TRIAL = "trial"
    TRIAL_ENDED = "trial_ended"
    FROZEN = "frozen"


class ProjectEnvironment(str, Enum):
    """Project environment type."""
    PROD = "prod"
    STAGING = "staging"
    DEV = "dev"


class UserRole(str, Enum):
    """User role within organization."""
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    AUDITOR = "auditor"


class ApiKeyScope(str, Enum):
    """API key permission scopes."""
    INGEST = "ingest"       # Can record decisions
    VERIFY = "verify"       # Can verify proofs
    EXPORT = "export"       # Can export evidence
    GOVERNANCE = "governance"  # Can manage governance
