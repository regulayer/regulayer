"""
Regulayer Reports - Data Models

CRITICAL CONSTRAINTS:
1. Reports do not create trust - they only present already-proven trust
2. Reports are snapshots, not live systems
3. No verification logic in report generation
"""

from datetime import datetime
from typing import List, Optional, Literal
from uuid import UUID
from pydantic import BaseModel, Field


class ReportMetadata(BaseModel):
    """Metadata present in all reports."""
    generated_at: datetime
    generator_version: str = "1.0.0"
    recorder_version: str = "1.0.0"
    disclaimer_hash: str = Field(
        description="SHA-256 hash of the disclaimer text for integrity"
    )
    report_type: str
    report_id: UUID


# ============ System Trust Report ============

class ThreatCoverage(BaseModel):
    """What threats does the system mitigate?"""
    insider_tampering: str = "Detectable via hash-chain verification"
    replay_attacks: str = "Blocked via unique decision IDs and timestamps"
    forgery: str = "Rejected via Ed25519 signature verification"


class OperationalAssumptions(BaseModel):
    """Assumptions that must hold for trust guarantees."""
    tls_enabled: str = "All communications over TLS 1.3"
    key_custody: str = "Private keys stored in secure key management system"
    db_immutability: str = "Database append-only, no UPDATE/DELETE on records"


class SystemTrustReport(BaseModel):
    """
    High-level regulator briefing document.
    
    Answers: "Can this system be trusted at all?"
    """
    metadata: ReportMetadata
    
    # Executive Summary
    system_name: str = "Regulayer Decision Recorder"
    what_it_does: str = (
        "Records AI decisions with cryptographic integrity guarantees. "
        "Each decision is hashed into an append-only chain and optionally signed."
    )
    what_it_does_not_do: str = (
        "Does not evaluate AI correctness, fairness, or compliance. "
        "Does not make legal determinations. "
        "Does not guarantee system availability."
    )
    
    # Trust Architecture
    trust_flow: List[str] = [
        "1. AI System makes decision",
        "2. Regulayer SDK captures decision as canonical payload",
        "3. Payload is hashed (SHA-256) and linked to previous record",
        "4. Optional: Payload is signed (Ed25519) by authorized identity",
        "5. Record is stored immutably",
        "6. Auditor can verify integrity offline using proof bundle"
    ]
    
    # Cryptographic Guarantees
    hash_algorithm: str = "SHA-256"
    signature_algorithm: str = "Ed25519"
    chain_structure: str = "Blockchain-style linked hashes (H(n) includes H(n-1))"
    
    # Threats & Assumptions
    threat_coverage: ThreatCoverage = Field(default_factory=ThreatCoverage)
    operational_assumptions: OperationalAssumptions = Field(default_factory=OperationalAssumptions)
    
    # Explicit Disclaimers
    disclaimers: List[str] = []


# ============ Decision Trust Report ============

class IntegrityProof(BaseModel):
    """Cryptographic integrity evidence for a decision."""
    record_hash: str
    previous_record_hash: Optional[str]
    canonical_payload_hash: str
    chain_id: str


class AttestationProof(BaseModel):
    """Cryptographic signature evidence."""
    identity_id: str
    algorithm: str
    signed_at: datetime
    revocation_status: Literal["active", "revoked_after", "legacy"]


class VerificationResults(BaseModel):
    """Pre-computed verification results (not re-verified)."""
    hash_valid: bool
    chain_valid: bool
    signature_valid: Optional[bool] = None  # None for legacy records


class GovernanceContext(BaseModel):
    """
    Non-authoritative governance overlay.
    
    WARNING: This section is organizational process, not cryptographic fact.
    """
    review_state: str
    tags: List[str]
    approvals: List[str]
    last_updated: datetime


class DecisionTrustReport(BaseModel):
    """
    Evidence for one specific AI decision.
    
    Answers: "Can this specific decision be trusted?"
    """
    metadata: ReportMetadata
    
    # Decision Identification
    decision_id: UUID
    record_id: int
    system_name: str
    recorded_at: datetime
    
    # Integrity Proof
    integrity_proof: IntegrityProof
    integrity_status: Literal["VALID", "INVALID"]
    
    # Attestation Proof (optional for legacy)
    attestation_proof: Optional[AttestationProof] = None
    attestation_status: Literal["SIGNED", "LEGACY", "REVOKED_AFTER"]
    
    # Verification Results (pre-computed)
    verification_results: VerificationResults
    
    # Governance Context (clearly marked)
    governance_present: bool = False
    governance_context: Optional[GovernanceContext] = None
    
    # Export References
    proof_bundle_checksum: Optional[str] = None
    verifier_tool_version: str = "1.0.0"
    
    # Legal Boundary
    disclaimers: List[str] = []


# ============ Chain Integrity Report ============

class ChainSummary(BaseModel):
    """Summary of a hash chain."""
    chain_id: str
    record_count: int
    first_timestamp: datetime
    last_timestamp: datetime
    verification_method: str = "Sequential hash-chain verification"


class ChainIntegrityReport(BaseModel):
    """
    Historical tamper-resistance evidence.
    
    Answers: "Is the historical record intact?"
    """
    metadata: ReportMetadata
    
    # Chain Summary
    chain_summary: ChainSummary
    
    # Verification Result
    integrity_result: Literal["INTACT", "BROKEN"]
    broken_at_index: Optional[int] = None  # If broken, where
    
    # Optional Appendix
    hash_chain_excerpt: Optional[List[dict]] = None  # First 5, last 5
    
    # Disclaimers
    disclaimers: List[str] = []
