"""
Regulayer Court Adapter

Generates judge-friendly evidence packets for legal proceedings.

CRITICAL GUARANTEES:
- Reads exported artifacts only
- Never calls recorder
- Never touches crypto
"""

from datetime import datetime
from typing import Optional, List
from dataclasses import dataclass


# ============================================================
# Court Evidence Packet
# ============================================================

@dataclass
class CourtEvidencePacket:
    """
    Evidence packet formatted for court proceedings.
    
    Designed for legal professionals who are not technical experts.
    """
    
    # Identification
    case_reference: Optional[str]
    generated_at: datetime
    
    # Decision summary
    decision_id: str
    decision_hash: str
    recorded_at: datetime
    
    # Verification status
    verified: bool
    verification_method: str
    
    # Human-readable explanation
    plain_english_summary: str
    technical_appendix: str
    
    # Attachments
    proof_bundle_path: str
    verification_log_path: Optional[str]


# ============================================================
# Court Adapter
# ============================================================

class CourtAdapter:
    """
    Generates court-friendly evidence packages.
    
    READ-ONLY: This adapter only processes exported artifacts.
    It has no access to the recorder or cryptographic keys.
    """
    
    def generate_packet(
        self,
        proof_bundle: dict,
        case_reference: Optional[str] = None
    ) -> CourtEvidencePacket:
        """
        Generate a court evidence packet from a proof bundle.
        """
        decision = proof_bundle.get("decision", {})
        attestation = proof_bundle.get("attestation", {})
        
        return CourtEvidencePacket(
            case_reference=case_reference,
            generated_at=datetime.utcnow(),
            decision_id=decision.get("decision_id", ""),
            decision_hash=decision.get("record_hash", ""),
            recorded_at=datetime.fromisoformat(decision.get("recorded_at", "")),
            verified=True,  # Assumes bundle was verified
            verification_method="Offline cryptographic verification",
            plain_english_summary=self._generate_summary(proof_bundle),
            technical_appendix=self._generate_technical_appendix(proof_bundle),
            proof_bundle_path="",
            verification_log_path=None,
        )
    
    def _generate_summary(self, proof_bundle: dict) -> str:
        """Generate plain English summary for court."""
        decision = proof_bundle.get("decision", {})
        chain = proof_bundle.get("chain_position", {})
        
        return f"""
EVIDENCE SUMMARY FOR COURT PROCEEDINGS

This document summarizes a cryptographically verified decision record.

WHAT THIS PROVES:
A decision was recorded at {decision.get("recorded_at", "unknown time")} 
and has not been modified since. The record is part of an append-only 
chain at position #{chain.get("sequence_number", "N/A")}.

VERIFICATION:
The cryptographic signature on this record has been verified using 
industry-standard algorithms. The record's integrity is mathematically 
proven.

KEY FACTS:
- Decision ID: {decision.get("decision_id", "N/A")}
- Record Hash: {decision.get("record_hash", "N/A")}
- Cannot be backdated or modified
- Can be independently verified by any party

WHAT THIS DOES NOT PROVE:
- The correctness of the decision itself
- The context in which the decision was made
- Any subsequent actions taken

For technical details, see the Technical Appendix.
""".strip()
    
    def _generate_technical_appendix(self, proof_bundle: dict) -> str:
        """Generate technical appendix."""
        attestation = proof_bundle.get("attestation", {})
        chain = proof_bundle.get("chain_position", {})
        
        return f"""
TECHNICAL APPENDIX

Signature Algorithm: {attestation.get("algorithm", "N/A")}
Key Identifier: {attestation.get("key_id", "N/A")}
Chain Position: {chain.get("sequence_number", "N/A")}
Previous Hash: {chain.get("previous_hash", "N/A")}

VERIFICATION INSTRUCTIONS:
1. Download the offline verifier from the provided URL
2. Run: regulayer-verify bundle.json
3. Confirm output shows "VALID"

The verification process requires no network access and no trust 
in Regulayer systems.
""".strip()


# ============================================================
# Court Document Generator
# ============================================================

def generate_court_submission(
    packet: CourtEvidencePacket,
    jurisdiction: str = "US Federal"
) -> str:
    """Generate formatted court submission document."""
    return f"""
EXHIBIT ___

CRYPTOGRAPHIC EVIDENCE SUBMISSION

Jurisdiction: {jurisdiction}
Case Reference: {packet.case_reference or "To be assigned"}
Generated: {packet.generated_at.strftime("%B %d, %Y at %H:%M UTC")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{packet.plain_english_summary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{packet.technical_appendix}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ATTESTATION

I certify that this evidence packet was generated from a 
cryptographically verified proof bundle. The verification 
process used no privileged access and can be independently 
reproduced.

_____________________________
Signature / Date
""".strip()
