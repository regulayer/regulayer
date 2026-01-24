"""
Regulayer Deployment Constraints

Defines what is allowed per deployment mode.

TRUST GUARANTEE: Constraints affect operations, never proofs.
"""

from typing import Dict, Any
from .modes import DeploymentMode


# ============================================================
# Deployment Constraints
# ============================================================

DEPLOYMENT_CONSTRAINTS: Dict[DeploymentMode, Dict[str, Any]] = {
    
    DeploymentMode.SAAS_SHARED: {
        # Infrastructure
        "shared_db": True,
        "shared_queue": True,
        "shared_recorder": True,
        
        # Customer access
        "customer_access_to_recorder": False,
        "customer_access_to_storage": False,
        "customer_access_to_keys": False,
        
        # Features
        "ingestion_enabled": True,
        "verification_enabled": True,
        "export_enabled": True,
        "governance_enabled": True,
        
        # Limits
        "custom_retention": False,
        "custom_sla": False,
        "dedicated_support": False,
        
        # Trust boundary
        "trust_boundary": "regulayer_cloud",
    },
    
    DeploymentMode.DEDICATED_VPC: {
        # Infrastructure
        "shared_db": False,
        "shared_queue": False,
        "shared_recorder": False,
        
        # Customer access
        "customer_access_to_recorder": False,  # Regulayer managed
        "customer_access_to_storage": False,
        "customer_access_to_keys": False,
        
        # Features
        "ingestion_enabled": True,
        "verification_enabled": True,
        "export_enabled": True,
        "governance_enabled": True,
        
        # Limits
        "custom_retention": True,
        "custom_sla": True,
        "dedicated_support": True,
        
        # Trust boundary
        "trust_boundary": "customer_vpc",
    },
    
    DeploymentMode.HYBRID: {
        # Infrastructure
        "shared_db": False,
        "shared_queue": False,
        "shared_recorder": False,
        
        # Customer access
        "customer_access_to_recorder": True,  # Customer runs recorder
        "customer_access_to_storage": True,
        "customer_access_to_keys": False,     # Regulayer manages signing
        
        # Features
        "ingestion_enabled": True,
        "verification_enabled": True,
        "export_enabled": True,
        "governance_enabled": True,
        
        # Limits
        "custom_retention": True,
        "custom_sla": True,
        "dedicated_support": True,
        
        # Trust boundary
        "trust_boundary": "split",  # Control plane: Regulayer, Data: Customer
    },
    
    DeploymentMode.ON_PREM_VERIFY: {
        # Infrastructure
        "shared_db": False,
        "shared_queue": False,
        "shared_recorder": False,
        
        # Customer access
        "customer_access_to_recorder": False,
        "customer_access_to_storage": False,
        "customer_access_to_keys": False,
        
        # Features
        "ingestion_enabled": False,  # Verification only
        "verification_enabled": True,
        "export_enabled": False,     # Receives exports, doesn't create
        "governance_enabled": False,
        
        # Limits
        "custom_retention": False,
        "custom_sla": False,
        "dedicated_support": False,
        
        # Trust boundary
        "trust_boundary": "air_gapped",
    },
}


# ============================================================
# Component Locations per Mode
# ============================================================

COMPONENT_LOCATIONS = {
    DeploymentMode.SAAS_SHARED: {
        "control_plane": "regulayer_cloud",
        "ingestion_gateway": "regulayer_cloud",
        "queue": "regulayer_cloud",
        "recorder": "regulayer_cloud",
        "storage": "regulayer_cloud",
        "billing": "regulayer_cloud",
    },
    
    DeploymentMode.DEDICATED_VPC: {
        "control_plane": "regulayer_cloud",
        "ingestion_gateway": "customer_vpc",
        "queue": "customer_vpc",
        "recorder": "customer_vpc",
        "storage": "customer_vpc",
        "billing": "regulayer_cloud",
    },
    
    DeploymentMode.HYBRID: {
        "control_plane": "regulayer_cloud",
        "ingestion_gateway": "customer_environment",
        "queue": "customer_environment",
        "recorder": "customer_environment",
        "storage": "customer_environment",
        "billing": "regulayer_cloud",
    },
    
    DeploymentMode.ON_PREM_VERIFY: {
        "control_plane": None,
        "ingestion_gateway": None,
        "queue": None,
        "recorder": None,
        "storage": None,
        "billing": None,
        "verifier": "customer_airgapped",
    },
}


# ============================================================
# Trust Guarantees (Identical Across All Modes)
# ============================================================

UNIVERSAL_TRUST_GUARANTEES = {
    "proof_format": "identical across all deployment modes",
    "verification_algorithm": "identical across all deployment modes",
    "offline_verification": "always available",
    "regulayer_cannot_forge": True,
    "customer_cannot_forge": True,
    "tampering_detectable": True,
}


def get_constraints(mode: DeploymentMode) -> Dict[str, Any]:
    """Get constraints for a deployment mode."""
    return DEPLOYMENT_CONSTRAINTS.get(mode, {})


def get_component_locations(mode: DeploymentMode) -> Dict[str, str]:
    """Get component locations for a deployment mode."""
    return COMPONENT_LOCATIONS.get(mode, {})


def is_feature_enabled(mode: DeploymentMode, feature: str) -> bool:
    """Check if a feature is enabled for a deployment mode."""
    constraints = get_constraints(mode)
    return constraints.get(feature, False)
