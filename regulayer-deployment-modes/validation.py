"""
Regulayer Deployment Validation

Validates deployment configurations and enforces constraints.

TRUST GUARANTEE: Validation prevents invalid configurations,
never affects cryptographic proofs.
"""

from typing import Tuple, List, Optional
from dataclasses import dataclass

from .modes import DeploymentMode, DeploymentConfig
from .constraints import (
    get_constraints,
    get_component_locations,
    is_feature_enabled,
    UNIVERSAL_TRUST_GUARANTEES,
)


# ============================================================
# Validation Errors
# ============================================================

@dataclass
class ValidationError:
    """Deployment validation error."""
    code: str
    message: str
    severity: str = "error"  # error, warning


# ============================================================
# Deployment Validator
# ============================================================

class DeploymentValidator:
    """
    Validates deployment configurations.
    
    TRUST GUARANTEE: Validation is for operational correctness,
    not cryptographic integrity.
    """
    
    def validate_mode_change(
        self,
        current_mode: DeploymentMode,
        new_mode: DeploymentMode,
        org_id: str
    ) -> Tuple[bool, List[ValidationError]]:
        """
        Validate a deployment mode change.
        
        Some transitions require special handling.
        """
        errors = []
        
        # Cannot downgrade from Dedicated to SaaS (data location change)
        if current_mode == DeploymentMode.DEDICATED_VPC and new_mode == DeploymentMode.SAAS_SHARED:
            errors.append(ValidationError(
                code="MODE_DOWNGRADE_BLOCKED",
                message="Cannot migrate from Dedicated VPC to SaaS. Contact support for data migration."
            ))
        
        # Cannot switch to On-Prem Verify from any ingestion mode
        if current_mode != DeploymentMode.ON_PREM_VERIFY and new_mode == DeploymentMode.ON_PREM_VERIFY:
            errors.append(ValidationError(
                code="ON_PREM_VERIFY_ONLY",
                message="On-Prem Verify is for verification only. Existing ingestion will be disabled."
            ))
        
        return len(errors) == 0, errors
    
    def validate_feature_access(
        self,
        mode: DeploymentMode,
        feature: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Check if a feature is available in the deployment mode.
        
        Returns (allowed, reason).
        """
        if not is_feature_enabled(mode, feature):
            constraints = get_constraints(mode)
            
            # Generate helpful message based on feature
            messages = {
                "ingestion_enabled": "Ingestion is not available in this deployment mode.",
                "governance_enabled": "Governance features are not available in this mode.",
                "custom_retention": "Custom retention requires Dedicated VPC or Hybrid mode.",
                "dedicated_support": "Dedicated support requires Dedicated VPC or Hybrid mode.",
            }
            
            return False, messages.get(feature, f"Feature '{feature}' is not available in this mode.")
        
        return True, None
    
    def validate_api_call(
        self,
        mode: DeploymentMode,
        endpoint: str,
        method: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate an API call is allowed for the deployment mode.
        """
        # On-Prem Verify only allows verification endpoints
        if mode == DeploymentMode.ON_PREM_VERIFY:
            if not endpoint.startswith("/v1/verify"):
                return False, "Only verification endpoints are available in On-Prem Verify mode."
        
        # Ingestion endpoints require ingestion to be enabled
        if endpoint.startswith("/v1/decisions") and method == "POST":
            if not is_feature_enabled(mode, "ingestion_enabled"):
                return False, "Ingestion is not available in this deployment mode."
        
        return True, None
    
    def get_allowed_features(self, mode: DeploymentMode) -> List[str]:
        """Get list of features allowed in a deployment mode."""
        constraints = get_constraints(mode)
        return [k for k, v in constraints.items() if v is True]
    
    def get_blocked_features(self, mode: DeploymentMode) -> List[str]:
        """Get list of features blocked in a deployment mode."""
        constraints = get_constraints(mode)
        return [k for k, v in constraints.items() if v is False]


# ============================================================
# Control Plane Enforcement
# ============================================================

class ControlPlaneEnforcer:
    """
    Enforces deployment mode at the control plane level.
    
    TRUST GUARANTEE: Enforcement is operational, not cryptographic.
    """
    
    def __init__(self, mode: DeploymentMode):
        self.mode = mode
        self.constraints = get_constraints(mode)
        self.validator = DeploymentValidator()
    
    def can_ingest(self) -> bool:
        """Check if ingestion is allowed."""
        return self.constraints.get("ingestion_enabled", False)
    
    def can_export(self) -> bool:
        """Check if export is allowed."""
        return self.constraints.get("export_enabled", False)
    
    def can_verify(self) -> bool:
        """Check if verification is allowed."""
        # Verification is ALWAYS allowed in all modes
        return True
    
    def get_trust_statement(self) -> str:
        """
        Get trust statement for this deployment mode.
        
        IMPORTANT: Never say "compliant" — only "supports".
        """
        return (
            f"This deployment supports cryptographically verifiable decision records. "
            f"Proofs generated in this mode are identical to all other deployment modes "
            f"and can be verified offline without any network access to Regulayer systems."
        )


# ============================================================
# Utility Functions
# ============================================================

def validate_deployment(config: DeploymentConfig) -> Tuple[bool, List[ValidationError]]:
    """Validate a deployment configuration."""
    validator = DeploymentValidator()
    errors = []
    
    # Validate mode constraints
    constraints = get_constraints(config.mode)
    
    if config.ingestion_enabled and not constraints.get("ingestion_enabled", False):
        errors.append(ValidationError(
            code="INGESTION_NOT_ALLOWED",
            message="Ingestion is not allowed in this deployment mode."
        ))
    
    if config.customer_recorder_access and not constraints.get("customer_access_to_recorder", False):
        errors.append(ValidationError(
            code="RECORDER_ACCESS_NOT_ALLOWED",
            message="Customer recorder access is not allowed in this deployment mode."
        ))
    
    return len(errors) == 0, errors


def get_trust_guarantees() -> dict:
    """
    Get universal trust guarantees.
    
    These are identical across ALL deployment modes.
    """
    return UNIVERSAL_TRUST_GUARANTEES
