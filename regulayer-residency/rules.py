"""
Regulayer Residency Rules

Legal constraints per region without crypto logic.

TRUST GUARANTEE: Rules affect operations, never proofs.
"""

from typing import Dict, Any
from .models import ResidencyRegion


# ============================================================
# Residency Rules per Region
# ============================================================

RESIDENCY_RULES: Dict[ResidencyRegion, Dict[str, Any]] = {
    
    ResidencyRegion.EU: {
        # Data handling
        "personal_data_allowed": False,  # Recommend against PII in payloads
        "local_storage_required": True,
        "cross_border_transfer_restricted": True,
        
        # Export controls
        "export_requires_notice": True,
        "export_log_required": True,
        
        # Compliance
        "supported_frameworks": ["GDPR", "AI Act"],
        "data_subject_rights": True,
        "right_to_erasure_note": "Metadata erasure supported; proofs are immutable by design",
        
        # Verification
        "verification_unrestricted": True,  # Always
        "offline_verification": True,       # Always
    },
    
    ResidencyRegion.INDIA: {
        # Data handling
        "personal_data_allowed": True,
        "local_storage_required": True,
        "cross_border_transfer_restricted": True,
        
        # Export controls
        "export_requires_notice": False,
        "export_log_required": True,
        
        # Compliance
        "supported_frameworks": ["DPDP Act"],
        "data_subject_rights": True,
        
        # Verification
        "verification_unrestricted": True,
        "offline_verification": True,
    },
    
    ResidencyRegion.US: {
        # Data handling
        "personal_data_allowed": True,
        "local_storage_required": False,
        "cross_border_transfer_restricted": False,
        
        # Export controls
        "export_requires_notice": False,
        "export_log_required": False,
        
        # Compliance
        "supported_frameworks": [],
        
        # Verification
        "verification_unrestricted": True,
        "offline_verification": True,
    },
    
    ResidencyRegion.US_GOV: {
        # Data handling
        "personal_data_allowed": True,
        "local_storage_required": True,
        "cross_border_transfer_restricted": True,
        
        # Export controls
        "export_requires_notice": True,
        "export_log_required": True,
        
        # Compliance
        "supported_frameworks": ["FedRAMP"],
        "government_only": True,
        
        # Verification
        "verification_unrestricted": True,
        "offline_verification": True,
    },
    
    ResidencyRegion.GLOBAL: {
        # Data handling
        "personal_data_allowed": True,
        "local_storage_required": False,
        "cross_border_transfer_restricted": False,
        
        # Export controls
        "export_requires_notice": False,
        "export_log_required": False,
        
        # Compliance
        "supported_frameworks": [],
        
        # Verification
        "verification_unrestricted": True,
        "offline_verification": True,
    },
}


# ============================================================
# Universal Rules (All Regions)
# ============================================================

UNIVERSAL_RULES = {
    # Export ALWAYS allowed
    "export_blocked": False,  # NEVER True
    
    # Verification ALWAYS works
    "verification_restricted": False,  # NEVER True
    "offline_verification_blocked": False,  # NEVER True
    
    # Proof semantics unchanged
    "proof_format_modified": False,  # NEVER True
    "hash_algorithm_changed": False,  # NEVER True
}


def get_rules(region: ResidencyRegion) -> Dict[str, Any]:
    """Get residency rules for a region."""
    return RESIDENCY_RULES.get(region, RESIDENCY_RULES[ResidencyRegion.GLOBAL])


def is_export_allowed(region: ResidencyRegion) -> bool:
    """
    Check if export is allowed.
    
    IMPORTANT: This ALWAYS returns True.
    Export is never blocked.
    """
    return True  # Never block export


def requires_export_notice(region: ResidencyRegion) -> bool:
    """Check if export requires a notice."""
    rules = get_rules(region)
    return rules.get("export_requires_notice", False)


def is_local_storage_required(region: ResidencyRegion) -> bool:
    """Check if local storage is required."""
    rules = get_rules(region)
    return rules.get("local_storage_required", False)
