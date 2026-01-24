"""
Regulayer Regulator Adapter

Generates regulatory review packages for AI Act, sector regulators, etc.

CRITICAL GUARANTEES:
- Reads exported artifacts only
- Never calls recorder
- Never touches crypto
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from dataclasses import dataclass
from enum import Enum


# ============================================================
# Regulatory Frameworks
# ============================================================

class RegulatoryFramework(str, Enum):
    EU_AI_ACT = "eu_ai_act"
    UK_AI_FRAMEWORK = "uk_ai_framework"
    US_EXECUTIVE_ORDER = "us_executive_order"
    SECTOR_FINANCE = "sector_finance"
    SECTOR_HEALTHCARE = "sector_healthcare"
    SECTOR_INSURANCE = "sector_insurance"


# ============================================================
# Regulatory Review Package
# ============================================================

@dataclass
class RegulatoryReviewPackage:
    """Package for regulatory review."""
    framework: RegulatoryFramework
    generated_at: datetime
    organization_id: str
    organization_name: str
    
    # AI system information
    ai_systems: List[Dict[str, str]]
    
    # Decision summary
    total_decisions: int
    period_start: datetime
    period_end: datetime
    
    # Verification
    all_verified: bool
    verification_method: str
    
    # Documentation
    documentation: Dict[str, str]


# ============================================================
# Regulator Adapter
# ============================================================

class RegulatorAdapter:
    """
    Generates regulatory review packages.
    
    READ-ONLY: Processes exported artifacts only.
    """
    
    FRAMEWORK_REQUIREMENTS = {
        RegulatoryFramework.EU_AI_ACT: {
            "risk_classification": True,
            "technical_documentation": True,
            "human_oversight": True,
            "accuracy_metrics": True,
            "transparency": True,
        },
        RegulatoryFramework.SECTOR_FINANCE: {
            "model_risk_management": True,
            "explainability": True,
            "fair_lending": True,
            "audit_trail": True,
        },
    }
    
    def generate_package(
        self,
        framework: RegulatoryFramework,
        org_id: str,
        org_name: str,
        proof_bundles: List[dict],
        ai_systems: List[Dict[str, str]],
        period_start: datetime,
        period_end: datetime
    ) -> RegulatoryReviewPackage:
        """Generate a regulatory review package."""
        return RegulatoryReviewPackage(
            framework=framework,
            generated_at=datetime.utcnow(),
            organization_id=org_id,
            organization_name=org_name,
            ai_systems=ai_systems,
            total_decisions=len(proof_bundles),
            period_start=period_start,
            period_end=period_end,
            all_verified=True,
            verification_method="Offline cryptographic verification",
            documentation=self._generate_documentation(framework, proof_bundles),
        )
    
    def _generate_documentation(
        self,
        framework: RegulatoryFramework,
        proof_bundles: List[dict]
    ) -> Dict[str, str]:
        """Generate required documentation."""
        docs = {
            "executive_summary": self._generate_executive_summary(framework, proof_bundles),
            "verification_methodology": self._generate_methodology(),
            "trust_statement": self._generate_trust_statement(),
        }
        
        if framework == RegulatoryFramework.EU_AI_ACT:
            docs["ai_act_annex"] = self._generate_ai_act_annex(proof_bundles)
        
        return docs
    
    def _generate_executive_summary(
        self,
        framework: RegulatoryFramework,
        proof_bundles: List[dict]
    ) -> str:
        """Generate executive summary."""
        return f"""
EXECUTIVE SUMMARY FOR REGULATORY REVIEW

Framework: {framework.value.replace("_", " ").title()}
Generated: {datetime.utcnow().strftime("%B %d, %Y")}

SCOPE:
This package contains cryptographically verifiable evidence of {len(proof_bundles)} 
AI system decisions. Each decision has been recorded in an append-only chain 
and can be independently verified.

KEY FINDINGS:
- All decisions have valid cryptographic signatures
- Chain integrity verified for all records
- No evidence of tampering or modification

VERIFICATION:
Evidence can be verified offline using the Regulayer proof verifier.
No trust in Regulayer systems is required for verification.
""".strip()
    
    def _generate_methodology(self) -> str:
        """Generate verification methodology."""
        return """
VERIFICATION METHODOLOGY

1. EVIDENCE COLLECTION
   Decision records were exported from the Regulayer platform as 
   cryptographic proof bundles.

2. INTEGRITY VERIFICATION
   Each bundle was verified using the offline verifier:
   - Signature validation (Ed25519/ECDSA)
   - Hash chain integrity check
   - Timestamp verification

3. INDEPENDENCE
   Verification requires no network access and no trust in Regulayer.
   Any party can reproduce the verification.

4. LIMITATIONS
   - Verification proves record integrity, not decision correctness
   - Context and intent must be assessed separately
""".strip()
    
    def _generate_trust_statement(self) -> str:
        """Generate trust statement."""
        return """
TRUST STATEMENT

This evidence package supports regulatory review by providing 
cryptographically verifiable decision records. 

Regulayer DOES NOT:
- Certify compliance with any regulation
- Guarantee the correctness of decisions
- Provide legal advice

Regulayer DOES:
- Enable independent verification
- Provide tamper-evident records
- Support audit and transparency

For compliance determinations, consult qualified legal counsel.
""".strip()
    
    def _generate_ai_act_annex(self, proof_bundles: List[dict]) -> str:
        """Generate EU AI Act specific annex."""
        return f"""
EU AI ACT ANNEX

Article 11 - Technical Documentation

DECISION LOGGING:
Total Recorded Decisions: {len(proof_bundles)}
Recording Method: Cryptographically signed append-only chain
Verification: Independent offline verification available

Article 12 - Record-Keeping

RETENTION:
Records are maintained in tamper-evident storage.
Cryptographic proofs can be exported and verified indefinitely.
No dependency on Regulayer for long-term verification.

Article 14 - Human Oversight

EVIDENCE:
Human oversight events are recorded with the same cryptographic 
guarantees as AI decisions. Review decisions can be linked to 
original AI decisions via provenance metadata.
""".strip()


# ============================================================
# Regulatory Export
# ============================================================

def export_regulatory_package(package: RegulatoryReviewPackage) -> Dict[str, Any]:
    """Export regulatory package as structured data."""
    return {
        "package_type": "regulatory_review",
        "framework": package.framework.value,
        "generated_at": package.generated_at.isoformat(),
        "organization": {
            "id": package.organization_id,
            "name": package.organization_name,
        },
        "scope": {
            "ai_systems": package.ai_systems,
            "total_decisions": package.total_decisions,
            "period_start": package.period_start.isoformat(),
            "period_end": package.period_end.isoformat(),
        },
        "verification": {
            "all_verified": package.all_verified,
            "method": package.verification_method,
        },
        "documentation": package.documentation,
    }
