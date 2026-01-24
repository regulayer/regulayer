"""
Regulayer Residency Models

Data models for residency and jurisdiction controls.

CORE PRINCIPLE (NON-NEGOTIABLE):
Jurisdiction controls storage and access —
never evidence, hashes, or verification semantics.

A proof exported from EU, India, or US Gov Cloud
must verify identically anywhere in the world, offline.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel


# ============================================================
# Residency Regions
# ============================================================

class ResidencyRegion(str, Enum):
    """
    Supported data residency regions.
    
    Each region has its own recorder instance.
    Proof format is IDENTICAL across all regions.
    """
    
    EU = "eu"
    """European Union - GDPR, AI Act"""
    
    INDIA = "india"
    """India - DPDP Act"""
    
    US = "us"
    """United States"""
    
    US_GOV = "us_gov"
    """US Government Cloud - FedRAMP"""
    
    GLOBAL = "global"
    """No regional restrictions"""


# ============================================================
# Residency Policy
# ============================================================

class ResidencyPolicy(BaseModel):
    """
    Organization-level residency policy.
    
    TRUST GUARANTEE: Residency controls WHERE data is stored,
    never affects WHAT is provable.
    """
    
    org_id: UUID
    
    # Region configuration
    primary_region: ResidencyRegion
    allowed_regions: List[ResidencyRegion]
    
    # Export controls (informational only)
    data_export_allowed: bool = True  # Never block, only log
    export_requires_notice: bool = False
    
    # Compliance metadata
    compliance_frameworks: List[str] = []  # e.g., ["GDPR", "DPDP"]
    
    # Lock status
    region_locked: bool = False  # Locked after first ingest
    locked_at: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime


class ResidencyPolicyCreate(BaseModel):
    """Request to create residency policy."""
    primary_region: ResidencyRegion
    allowed_regions: List[ResidencyRegion]
    export_requires_notice: bool = False


class ResidencyPolicyUpdate(BaseModel):
    """Request to update residency policy."""
    allowed_regions: Optional[List[ResidencyRegion]] = None
    export_requires_notice: Optional[bool] = None
    # Note: primary_region cannot be updated after first ingest


# ============================================================
# Region Metadata
# ============================================================

REGION_METADATA = {
    ResidencyRegion.EU: {
        "name": "European Union",
        "code": "EU",
        "flag": "🇪🇺",
        "legal_frameworks": ["GDPR", "AI Act"],
        "recorder_location": "eu-west-1",
    },
    ResidencyRegion.INDIA: {
        "name": "India",
        "code": "IN",
        "flag": "🇮🇳",
        "legal_frameworks": ["DPDP Act"],
        "recorder_location": "ap-south-1",
    },
    ResidencyRegion.US: {
        "name": "United States",
        "code": "US",
        "flag": "🇺🇸",
        "legal_frameworks": [],
        "recorder_location": "us-east-1",
    },
    ResidencyRegion.US_GOV: {
        "name": "US Government",
        "code": "US-GOV",
        "flag": "🏛️",
        "legal_frameworks": ["FedRAMP"],
        "recorder_location": "us-gov-west-1",
    },
    ResidencyRegion.GLOBAL: {
        "name": "Global",
        "code": "GLOBAL",
        "flag": "🌐",
        "legal_frameworks": [],
        "recorder_location": "us-east-1",  # Default
    },
}


# ============================================================
# Audit Events
# ============================================================

class ResidencyEventType(str, Enum):
    POLICY_CREATED = "policy_created"
    POLICY_UPDATED = "policy_updated"
    REGION_LOCKED = "region_locked"
    EXPORT_NOTICE = "export_notice"
    RESIDENCY_VIOLATION_BLOCKED = "residency_violation_blocked"


class ResidencyEvent(BaseModel):
    """Audit event for residency changes."""
    id: UUID
    org_id: UUID
    event_type: ResidencyEventType
    region: Optional[ResidencyRegion] = None
    details: dict = {}
    timestamp: datetime
