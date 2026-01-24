"""
Regulayer Deployment Modes

Defines deployment configurations for different isolation levels.

CORE PRINCIPLE (NON-NEGOTIABLE):
Deployment affects where services run — never what is provable.

A proof exported from:
- Shared SaaS
- Dedicated VPC
- On-prem recorder

must verify identically with the same offline tool.
"""

from enum import Enum
from typing import Optional
from dataclasses import dataclass


# ============================================================
# Deployment Mode Enum
# ============================================================

class DeploymentMode(str, Enum):
    """
    Supported deployment modes.
    
    TRUST GUARANTEE: Cryptographic behavior is identical across all modes.
    """
    
    SAAS_SHARED = "saas_shared"
    """
    Multi-tenant cloud deployment.
    - Shared infrastructure
    - Lowest cost
    - For: Startups, mid-market
    """
    
    DEDICATED_VPC = "dedicated_vpc"
    """
    Single-tenant cloud deployment.
    - Isolated infrastructure
    - Customer VPC
    - For: Banks, enterprises
    """
    
    HYBRID = "hybrid"
    """
    SaaS control plane + private recorder.
    - Control plane in Regulayer cloud
    - Recorder in customer environment
    - For: Regulated organizations
    """
    
    ON_PREM_VERIFY = "on_prem_verify"
    """
    Offline verification only.
    - No ingestion capability
    - Verification-only deployment
    - For: Courts, regulators
    """


# ============================================================
# Deployment Configuration
# ============================================================

@dataclass
class DeploymentConfig:
    """Configuration for a specific deployment."""
    
    mode: DeploymentMode
    org_id: str
    
    # Component locations
    control_plane_location: str = "regulayer_cloud"
    recorder_location: Optional[str] = None
    storage_location: Optional[str] = None
    
    # Features
    ingestion_enabled: bool = True
    verification_enabled: bool = True
    export_enabled: bool = True
    
    # Customer access
    customer_recorder_access: bool = False
    customer_storage_access: bool = False
    
    # Compliance
    data_residency_region: Optional[str] = None


# ============================================================
# Mode Descriptions (For UI/Docs)
# ============================================================

MODE_DESCRIPTIONS = {
    DeploymentMode.SAAS_SHARED: {
        "name": "SaaS (Shared)",
        "description": "Multi-tenant cloud deployment with shared infrastructure",
        "buyer_type": "Startups, mid-market",
        "features": [
            "Instant setup",
            "Automatic updates",
            "Shared infrastructure",
            "Standard SLA"
        ],
        "trust_note": "Proofs identical to all other modes"
    },
    DeploymentMode.DEDICATED_VPC: {
        "name": "Dedicated VPC",
        "description": "Single-tenant cloud deployment in isolated infrastructure",
        "buyer_type": "Banks, enterprises",
        "features": [
            "Isolated environment",
            "Customer VPC",
            "Enhanced SLA",
            "Dedicated support"
        ],
        "trust_note": "Proofs identical to all other modes"
    },
    DeploymentMode.HYBRID: {
        "name": "Hybrid",
        "description": "SaaS control plane with private recorder",
        "buyer_type": "Regulated organizations",
        "features": [
            "Data stays in-house",
            "Regulayer control plane",
            "Customer-owned recorder",
            "Full data sovereignty"
        ],
        "trust_note": "Proofs identical to all other modes"
    },
    DeploymentMode.ON_PREM_VERIFY: {
        "name": "On-Prem Verify",
        "description": "Offline verification without network access",
        "buyer_type": "Courts, regulators",
        "features": [
            "Air-gapped verification",
            "No network required",
            "Court-admissible",
            "Regulator-ready"
        ],
        "trust_note": "Verification-only, no ingestion"
    }
}
