"""
Regulayer Interop Validation

Allows third parties to validate bundles against schemas.

This is how trust scales beyond Regulayer.
"""

import json
from typing import Optional, Tuple, List, Dict, Any
from dataclasses import dataclass
from enum import Enum

from .registry import get_registry, SchemaType, is_version_supported


# ============================================================
# Validation Results
# ============================================================

class ValidationSeverity(str, Enum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


@dataclass
class ValidationIssue:
    """A single validation issue."""
    path: str
    message: str
    severity: ValidationSeverity


@dataclass
class ValidationResult:
    """Result of schema validation."""
    valid: bool
    schema_type: SchemaType
    schema_version: str
    issues: List[ValidationIssue]
    
    def get_summary(self) -> str:
        errors = sum(1 for i in self.issues if i.severity == ValidationSeverity.ERROR)
        warnings = sum(1 for i in self.issues if i.severity == ValidationSeverity.WARNING)
        return f"{'VALID' if self.valid else 'INVALID'}: {errors} errors, {warnings} warnings"


# ============================================================
# Schema Validator
# ============================================================

class SchemaValidator:
    """
    Validates bundles against Regulayer schemas.
    
    Allows third parties to assert:
    - "This bundle conforms to Regulayer Evidence v1.0"
    - "This provenance graph is well-formed"
    - "This governance overlay did not affect proofs"
    """
    
    def validate_evidence_bundle(self, bundle: Dict[str, Any]) -> ValidationResult:
        """Validate an evidence bundle against the schema."""
        issues = []
        
        # Check schema version
        schema_version = bundle.get("schema_version", "unknown")
        if not is_version_supported(SchemaType.EVIDENCE, schema_version):
            issues.append(ValidationIssue(
                path="schema_version",
                message=f"Unsupported schema version: {schema_version}",
                severity=ValidationSeverity.ERROR,
            ))
        
        # Check required fields
        required = ["bundle_id", "decision", "attestation", "chain_position", "verification"]
        for field in required:
            if field not in bundle:
                issues.append(ValidationIssue(
                    path=field,
                    message=f"Missing required field: {field}",
                    severity=ValidationSeverity.ERROR,
                ))
        
        # Validate decision
        if "decision" in bundle:
            self._validate_decision(bundle["decision"], issues)
        
        # Validate attestation
        if "attestation" in bundle:
            self._validate_attestation(bundle["attestation"], issues)
        
        # Validate chain position
        if "chain_position" in bundle:
            self._validate_chain_position(bundle["chain_position"], issues)
        
        # Validate verification
        if "verification" in bundle:
            self._validate_verification(bundle["verification"], issues)
        
        return ValidationResult(
            valid=not any(i.severity == ValidationSeverity.ERROR for i in issues),
            schema_type=SchemaType.EVIDENCE,
            schema_version=schema_version,
            issues=issues,
        )
    
    def _validate_decision(self, decision: Dict, issues: List[ValidationIssue]):
        """Validate decision section."""
        required = ["decision_id", "record_hash", "recorded_at"]
        for field in required:
            if field not in decision:
                issues.append(ValidationIssue(
                    path=f"decision.{field}",
                    message=f"Missing required field: {field}",
                    severity=ValidationSeverity.ERROR,
                ))
        
        # Validate hash format
        record_hash = decision.get("record_hash", "")
        if not record_hash.startswith("sha256:") or len(record_hash) != 71:
            issues.append(ValidationIssue(
                path="decision.record_hash",
                message="Invalid hash format. Expected sha256:<64 hex chars>",
                severity=ValidationSeverity.ERROR,
            ))
    
    def _validate_attestation(self, attestation: Dict, issues: List[ValidationIssue]):
        """Validate attestation section."""
        required = ["signature", "algorithm", "key_id"]
        for field in required:
            if field not in attestation:
                issues.append(ValidationIssue(
                    path=f"attestation.{field}",
                    message=f"Missing required field: {field}",
                    severity=ValidationSeverity.ERROR,
                ))
        
        # Validate algorithm
        valid_algorithms = ["Ed25519", "ECDSA-P256", "RSA-PSS"]
        if attestation.get("algorithm") not in valid_algorithms:
            issues.append(ValidationIssue(
                path="attestation.algorithm",
                message=f"Invalid algorithm. Expected one of: {valid_algorithms}",
                severity=ValidationSeverity.ERROR,
            ))
    
    def _validate_chain_position(self, chain: Dict, issues: List[ValidationIssue]):
        """Validate chain position section."""
        required = ["sequence_number", "previous_hash"]
        for field in required:
            if field not in chain:
                issues.append(ValidationIssue(
                    path=f"chain_position.{field}",
                    message=f"Missing required field: {field}",
                    severity=ValidationSeverity.ERROR,
                ))
        
        # Validate sequence number
        seq = chain.get("sequence_number")
        if isinstance(seq, int) and seq < 1:
            issues.append(ValidationIssue(
                path="chain_position.sequence_number",
                message="Sequence number must be >= 1",
                severity=ValidationSeverity.ERROR,
            ))
    
    def _validate_verification(self, verification: Dict, issues: List[ValidationIssue]):
        """Validate verification section."""
        if verification.get("verifiable_offline") is not True:
            issues.append(ValidationIssue(
                path="verification.verifiable_offline",
                message="verifiable_offline must be true",
                severity=ValidationSeverity.ERROR,
            ))
    
    def validate_provenance_graph(self, graph: Dict[str, Any]) -> ValidationResult:
        """Validate a provenance graph against the schema."""
        issues = []
        schema_version = graph.get("schema_version", "unknown")
        
        # Check required fields
        if "graph" not in graph:
            issues.append(ValidationIssue(
                path="graph",
                message="Missing required field: graph",
                severity=ValidationSeverity.ERROR,
            ))
        else:
            graph_data = graph["graph"]
            if "nodes" not in graph_data:
                issues.append(ValidationIssue(
                    path="graph.nodes",
                    message="Missing required field: nodes",
                    severity=ValidationSeverity.ERROR,
                ))
            if "edges" not in graph_data:
                issues.append(ValidationIssue(
                    path="graph.edges",
                    message="Missing required field: edges",
                    severity=ValidationSeverity.ERROR,
                ))
        
        return ValidationResult(
            valid=not any(i.severity == ValidationSeverity.ERROR for i in issues),
            schema_type=SchemaType.PROVENANCE,
            schema_version=schema_version,
            issues=issues,
        )
    
    def validate_governance_overlay(self, overlay: Dict[str, Any]) -> ValidationResult:
        """Validate a governance overlay against the schema."""
        issues = []
        schema_version = overlay.get("schema_version", "unknown")
        
        # Check required fields
        required = ["decision_id", "overlays"]
        for field in required:
            if field not in overlay:
                issues.append(ValidationIssue(
                    path=field,
                    message=f"Missing required field: {field}",
                    severity=ValidationSeverity.ERROR,
                ))
        
        # Validate trust statement
        if "retention" in overlay.get("overlays", {}):
            retention = overlay["overlays"]["retention"]
            if retention.get("cryptographic_records_affected") is True:
                issues.append(ValidationIssue(
                    path="overlays.retention.cryptographic_records_affected",
                    message="cryptographic_records_affected must always be false",
                    severity=ValidationSeverity.ERROR,
                ))
        
        return ValidationResult(
            valid=not any(i.severity == ValidationSeverity.ERROR for i in issues),
            schema_type=SchemaType.GOVERNANCE,
            schema_version=schema_version,
            issues=issues,
        )


# ============================================================
# Public API
# ============================================================

def validate_bundle(content: Dict[str, Any], schema_type: SchemaType) -> ValidationResult:
    """Validate content against a schema."""
    validator = SchemaValidator()
    
    if schema_type == SchemaType.EVIDENCE:
        return validator.validate_evidence_bundle(content)
    elif schema_type == SchemaType.PROVENANCE:
        return validator.validate_provenance_graph(content)
    elif schema_type == SchemaType.GOVERNANCE:
        return validator.validate_governance_overlay(content)
    else:
        return ValidationResult(
            valid=False,
            schema_type=schema_type,
            schema_version="unknown",
            issues=[ValidationIssue(
                path="",
                message=f"Unknown schema type: {schema_type}",
                severity=ValidationSeverity.ERROR,
            )],
        )
