"""
Regulayer Retention Policies

Default retention policies and configuration.

TRUST GUARANTEE: Policies affect visibility, never proofs.
"""

from typing import Dict, Any
from .models import RetentionScope


# ============================================================
# Default Retention Policies
# ============================================================

DEFAULT_POLICIES = {
    RetentionScope.METADATA: {
        "default_days": 365,  # 1 year
        "min_days": 30,
        "max_days": 3650,  # 10 years
        "description": "UI metadata, custom tags, labels",
        "cryptographic_impact": None,  # No impact
    },
    RetentionScope.GOVERNANCE: {
        "default_days": 730,  # 2 years
        "min_days": 90,
        "max_days": 3650,
        "description": "Governance annotations, approvals, reviews",
        "cryptographic_impact": None,  # No impact
    },
    RetentionScope.UI: {
        "default_days": 365,
        "min_days": 30,
        "max_days": 3650,
        "description": "UI visibility in dashboards and search",
        "cryptographic_impact": None,  # No impact
    },
}


# ============================================================
# Policy Constraints
# ============================================================

POLICY_CONSTRAINTS = {
    # What CAN be affected by retention
    "mutable": [
        "ui_visibility",
        "search_indexing",
        "dashboard_counts",
        "metadata_annotations",
        "governance_tags",
    ],
    
    # What can NEVER be affected by retention
    "immutable": [
        "cryptographic_records",
        "decision_hashes",
        "chain_integrity",
        "proof_validity",
        "offline_verification",
        "export_capability",  # Export always works
    ],
}


# ============================================================
# Legal Framework Mappings
# ============================================================

LEGAL_FRAMEWORKS = {
    "gdpr": {
        "name": "GDPR Article 17",
        "description": "Right to erasure (right to be forgotten)",
        "supported_scope": ["visibility", "metadata_only"],
        "cryptographic_deletion_required": False,
        "regulayer_approach": (
            "Regulayer hides decision from UI and redacts governance metadata. "
            "Cryptographic proof remains valid for audit purposes."
        ),
    },
    "dpdp": {
        "name": "DPDP Act (India)",
        "description": "Right to erasure of personal data",
        "supported_scope": ["visibility", "metadata_only"],
        "cryptographic_deletion_required": False,
        "regulayer_approach": (
            "Regulayer restricts visibility and redacts personal metadata. "
            "Decision records remain for compliance verification."
        ),
    },
    "contractual": {
        "name": "Contractual Obligation",
        "description": "Customer contract requirements",
        "supported_scope": ["visibility", "metadata_only"],
        "cryptographic_deletion_required": False,
        "regulayer_approach": (
            "Regulayer implements visibility restrictions per contract terms. "
            "Cryptographic integrity maintained for dispute resolution."
        ),
    },
}


def get_default_policy(scope: RetentionScope) -> Dict[str, Any]:
    """Get default retention policy for a scope."""
    return DEFAULT_POLICIES.get(scope, DEFAULT_POLICIES[RetentionScope.METADATA])


def get_legal_framework(framework: str) -> Dict[str, Any]:
    """Get legal framework configuration."""
    return LEGAL_FRAMEWORKS.get(framework, {})


def is_scope_mutable(scope: str) -> bool:
    """Check if a scope can be affected by retention."""
    return scope in POLICY_CONSTRAINTS["mutable"]


def is_scope_immutable(scope: str) -> bool:
    """Check if a scope is immutable."""
    return scope in POLICY_CONSTRAINTS["immutable"]
