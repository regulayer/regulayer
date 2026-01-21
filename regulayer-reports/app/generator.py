"""
Regulayer Reports - Report Generator

CRITICAL CONSTRAINTS:
1. READ-ONLY: No write access, no signing keys, no verification logic
2. Reports present already-proven trust, they don't create it
3. Reports are snapshots, not live systems
"""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from .models import (
    ReportMetadata,
    SystemTrustReport,
    DecisionTrustReport,
    ChainIntegrityReport,
    IntegrityProof,
    AttestationProof,
    VerificationResults,
    GovernanceContext,
    ChainSummary,
    ThreatCoverage,
    OperationalAssumptions
)
from .disclaimers import get_disclaimers, get_disclaimer_hash
from .config import settings


class ReportGenerator:
    """
    Generates static trust reports from recorder data.
    
    This is a READ-ONLY service. It has:
    - NO write access
    - NO signing keys
    - NO verification logic
    
    It only assembles already-verified data into report format.
    """
    
    def _create_metadata(self, report_type: str) -> ReportMetadata:
        """Create common report metadata."""
        disclaimers = get_disclaimers(report_type)
        return ReportMetadata(
            generated_at=datetime.now(timezone.utc),
            generator_version=settings.report_version,
            recorder_version=settings.report_version,
            disclaimer_hash=get_disclaimer_hash(disclaimers),
            report_type=report_type,
            report_id=uuid4()
        )
    
    def generate_system_report(self) -> SystemTrustReport:
        """
        Generate a System Trust Report.
        
        This is a static document describing Regulayer's trust architecture.
        No dynamic data is fetched.
        """
        return SystemTrustReport(
            metadata=self._create_metadata("system"),
            disclaimers=get_disclaimers("system")
        )
    
    def generate_decision_report(
        self,
        decision_id: UUID,
        record_id: int,
        system_name: str,
        recorded_at: datetime,
        record_hash: str,
        previous_record_hash: Optional[str],
        canonical_payload_hash: str,
        chain_id: str,
        hash_valid: bool,
        chain_valid: bool,
        # Optional attestation
        attestation: Optional[dict] = None,
        signature_valid: Optional[bool] = None,
        # Optional governance
        governance: Optional[dict] = None
    ) -> DecisionTrustReport:
        """
        Generate a Decision Trust Report.
        
        Data must be pre-fetched from recorder/governance (read-only).
        """
        # Determine attestation status
        if attestation is None:
            attestation_status = "LEGACY"
            attestation_proof = None
        elif attestation.get("revocation_status") == "revoked_after":
            attestation_status = "REVOKED_AFTER"
            attestation_proof = AttestationProof(
                identity_id=attestation["identity_id"],
                algorithm=attestation.get("algorithm", "Ed25519"),
                signed_at=attestation["signed_at"],
                revocation_status="revoked_after"
            )
        else:
            attestation_status = "SIGNED"
            attestation_proof = AttestationProof(
                identity_id=attestation["identity_id"],
                algorithm=attestation.get("algorithm", "Ed25519"),
                signed_at=attestation["signed_at"],
                revocation_status="active"
            )
        
        # Determine overall integrity
        integrity_status = "VALID" if (hash_valid and chain_valid) else "INVALID"
        
        # Build governance context if present
        governance_context = None
        if governance:
            governance_context = GovernanceContext(
                review_state=governance.get("review_state", "unreviewed"),
                tags=governance.get("tags", []),
                approvals=governance.get("approvals", []),
                last_updated=governance.get("last_updated", datetime.now(timezone.utc))
            )
        
        return DecisionTrustReport(
            metadata=self._create_metadata("decision"),
            decision_id=decision_id,
            record_id=record_id,
            system_name=system_name,
            recorded_at=recorded_at,
            integrity_proof=IntegrityProof(
                record_hash=record_hash,
                previous_record_hash=previous_record_hash,
                canonical_payload_hash=canonical_payload_hash,
                chain_id=chain_id
            ),
            integrity_status=integrity_status,
            attestation_proof=attestation_proof,
            attestation_status=attestation_status,
            verification_results=VerificationResults(
                hash_valid=hash_valid,
                chain_valid=chain_valid,
                signature_valid=signature_valid
            ),
            governance_present=governance is not None,
            governance_context=governance_context,
            disclaimers=get_disclaimers("decision")
        )
    
    def generate_chain_report(
        self,
        chain_id: str,
        record_count: int,
        first_timestamp: datetime,
        last_timestamp: datetime,
        is_intact: bool,
        broken_at_index: Optional[int] = None,
        hash_excerpt: Optional[list] = None
    ) -> ChainIntegrityReport:
        """
        Generate a Chain Integrity Report.
        
        Verification result must be pre-computed (read-only).
        """
        return ChainIntegrityReport(
            metadata=self._create_metadata("chain"),
            chain_summary=ChainSummary(
                chain_id=chain_id,
                record_count=record_count,
                first_timestamp=first_timestamp,
                last_timestamp=last_timestamp
            ),
            integrity_result="INTACT" if is_intact else "BROKEN",
            broken_at_index=broken_at_index,
            hash_chain_excerpt=hash_excerpt,
            disclaimers=get_disclaimers("chain")
        )


# Global generator instance
report_generator = ReportGenerator()
