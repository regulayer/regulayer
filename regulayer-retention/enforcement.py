"""
Regulayer Retention Enforcement

Enforces retention policies and generates legal artifacts.

TRUST GUARANTEE: Enforcement affects visibility, never proofs.
"""

from datetime import datetime
from typing import Optional

from .models import (
    RetentionPolicy,
    RetentionScope,
    DeletionRequest,
    DeletionStatus,
    DELETION_ACTIONS,
)
from .policies import (
    get_default_policy,
    get_legal_framework,
    POLICY_CONSTRAINTS,
)


# ============================================================
# Retention Enforcer
# ============================================================

class RetentionEnforcer:
    """
    Enforces retention policies.
    
    CRITICAL GUARANTEES:
    - Cryptographic records are NEVER affected
    - Proofs remain valid indefinitely
    - Export always works
    """
    
    def __init__(self, policy: RetentionPolicy):
        self.policy = policy
    
    def is_retained(self, created_at: datetime) -> bool:
        """Check if a record is within retention period."""
        age_days = (datetime.utcnow() - created_at).days
        return age_days <= self.policy.retention_days
    
    def should_apply_retention(
        self,
        scope: str,
        created_at: datetime
    ) -> bool:
        """Check if retention should be applied."""
        # Never apply to immutable scopes
        if scope in POLICY_CONSTRAINTS["immutable"]:
            return False
        
        return not self.is_retained(created_at)
    
    def get_trust_statement(self) -> str:
        """
        Get trust statement for retention policy.
        
        Language uses "hides", "redacts", never "deletes evidence".
        """
        return (
            f"This organization's retention policy ({self.policy.retention_days} days) "
            f"affects UI visibility and governance metadata. "
            f"Cryptographic records are never deleted or modified."
        )


# ============================================================
# Legal Artifact Generation
# ============================================================

def generate_deletion_semantics_doc() -> str:
    """Generate DATA_DELETION_SEMANTICS.md content."""
    does = DELETION_ACTIONS["does"]
    never = DELETION_ACTIONS["never_does"]
    
    return f"""# Data Deletion Semantics

## What Deletion DOES

| Area | Action |
|------|--------|
| UI | {does["ui"]} |
| Governance Metadata | {does["governance_metadata"]} |
| Search | {does["search"]} |
| Dashboards | {does["dashboards"]} |
| Exports | {does["exports"]} |

## What Deletion NEVER Does

| Area | Guarantee |
|------|-----------|
| Hash | {never["hash"]} |
| Record | {never["record"]} |
| Chain | {never["chain"]} |
| Proof | {never["proof"]} |
| Offline Verification | {never["offline_verification"]} |

## Export Behavior

Deleted decisions can **always** be exported:

- With explicit decision ID
- For court requests
- For regulator audits

A banner is shown: "This decision is hidden due to a legal request. Cryptographic proof remains valid."

---
Generated: {datetime.utcnow().isoformat()}
"""


def generate_gdpr_erasure_doc() -> str:
    """Generate GDPR_ERASURE_EXPLANATION.md content."""
    framework = get_legal_framework("gdpr")
    
    return f"""# GDPR Article 17 Erasure Explanation

## Regulayer's Approach

{framework.get("regulayer_approach", "")}

## Supported Scope

- **Visibility**: Decision hidden from UI
- **Metadata Only**: Annotations and tags redacted

## What Remains

1. **Cryptographic Record**: The hash and chain position remain intact
2. **Proof Validity**: Proofs can still be verified offline
3. **Audit Capability**: Regulators can still access records with proper authorization

## Why This Is Compliant

GDPR Article 17 provides for erasure "without undue delay" but also includes exceptions for:

- Legal claims (Article 17(3)(e))
- Compliance with legal obligations (Article 17(3)(b))
- Archiving in the public interest (Article 17(3)(d))

Regulayer's approach:
- **Hides** personal data from normal access
- **Redacts** governance metadata
- **Preserves** cryptographic proof for legal obligations

This ensures data subjects' rights are respected while maintaining legal and compliance capabilities.

---
This document does not constitute legal advice.
Generated: {datetime.utcnow().isoformat()}
"""


def generate_retention_limits_doc(policy: RetentionPolicy) -> str:
    """Generate RETENTION_LIMITS_NOTE.md content."""
    return f"""# Retention Limits Note

## Organization Policy

- **Retention Period**: {policy.retention_days} days
- **Applies To**: {policy.applies_to.value}
- **Cryptographic Records Affected**: No (never)

## Effects After Retention Period

After {policy.retention_days} days:

1. UI visibility may be reduced
2. Dashboard counts may exclude old records
3. Governance metadata may be archived

## What Is Never Affected

- Decision hashes
- Chain integrity
- Proof validity
- Export capability
- Offline verification

## Important Note

Retention limits are a governance feature, not a cryptographic feature.
Proofs remain valid indefinitely regardless of retention settings.

---
Generated: {datetime.utcnow().isoformat()}
"""
