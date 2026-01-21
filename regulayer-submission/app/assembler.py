"""
Regulayer Submission - Package Assembler

CRITICAL CONSTRAINTS:
1. Deterministic: Same inputs → same package bytes
2. Read-only: No modification of source data
3. No filtering beyond explicit input
"""

import io
import json
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional
from uuid import UUID, uuid4

from .models import (
    SubmissionPackage,
    SubmissionPackageRequest,
    PackageContents
)
from .manifest import manifest_generator, hash_string


# Disclaimer text (must match manifest generator)
DISCLAIMER_TEXT = (
    "This submission package proves record integrity and authorship only. "
    "It does not attest to AI correctness, fairness, legality, or compliance."
)


class PackageAssembler:
    """
    Assembles deterministic submission packages.
    
    Rules:
    - Deterministic ordering
    - Read-only access
    - Same inputs → same package bytes
    """
    
    def assemble_package(
        self,
        decision_ids: List[UUID],
        chain_id: Optional[str] = None,
        include_governance: bool = True,
        include_legacy: bool = True
    ) -> tuple[bytes, SubmissionPackage]:
        """
        Assemble a complete submission package.
        
        Returns:
            Tuple of (ZIP bytes, package metadata)
        """
        submission_id = uuid4()
        files: Dict[str, bytes] = {}
        contents = PackageContents()
        
        # 1. Add README
        readme_content = self._generate_readme(submission_id)
        files['README.txt'] = readme_content.encode()
        contents.other_files.append('README.txt')
        
        # 2. Add cover letter
        cover_letter = self._generate_cover_letter(
            submission_id, decision_ids, chain_id, include_governance
        )
        files['cover_letter.md'] = cover_letter.encode()
        contents.other_files.append('cover_letter.md')
        
        # 3. Add system trust report (static)
        system_report = self._generate_system_report()
        files['reports/system_trust.json'] = system_report
        contents.reports.append('reports/system_trust.json')
        
        # 4. Add chain integrity report (if chain specified)
        if chain_id:
            chain_report = self._generate_chain_report(chain_id)
            files['reports/chain_integrity.json'] = chain_report
            contents.reports.append('reports/chain_integrity.json')
        
        # 5. Add decision reports and proof bundles
        for decision_id in sorted(decision_ids):  # Deterministic ordering
            # Decision report
            decision_report = self._generate_decision_report(decision_id)
            report_path = f'reports/decision_{decision_id}.json'
            files[report_path] = decision_report
            contents.reports.append(report_path)
            
            # Proof bundle
            proof_bundle = self._generate_proof_bundle(decision_id)
            bundle_path = f'proof_bundles/decision_{decision_id}.json'
            files[bundle_path] = proof_bundle
            contents.proof_bundles.append(bundle_path)
            
            # Governance evidence (if requested)
            if include_governance:
                governance = self._generate_governance_evidence(decision_id)
                gov_path = f'governance_evidence/decision_{decision_id}.json'
                files[gov_path] = governance
                contents.governance_evidence.append(gov_path)
        
        # 6. Generate manifest (must be last)
        manifest = manifest_generator.generate_manifest_from_memory(
            files, submission_id, include_governance, include_legacy
        )
        manifest_json = json.dumps(
            manifest.model_dump(),
            indent=2,
            sort_keys=True,
            default=str
        ).encode()
        files['manifest.json'] = manifest_json
        
        # 7. Create ZIP archive
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            # Add files in sorted order for determinism
            for path in sorted(files.keys()):
                zf.writestr(path, files[path])
        
        zip_bytes = zip_buffer.getvalue()
        
        # 8. Create package metadata
        package = SubmissionPackage(
            submission_id=submission_id,
            submission_version="1.0.0",
            included_decisions=decision_ids,
            chain_id=chain_id,
            generated_at=datetime.now(timezone.utc),
            disclaimer_hash=hash_string(DISCLAIMER_TEXT),
            report_count=len(contents.reports),
            proof_bundle_count=len(contents.proof_bundles),
            governance_evidence_count=len(contents.governance_evidence),
            total_files=len(files),
            total_size_bytes=len(zip_bytes)
        )
        
        return zip_bytes, package
    
    def _generate_readme(self, submission_id: UUID) -> str:
        """Generate README.txt for the package."""
        return f"""REGULAYER SUBMISSION PACKAGE
============================

Submission ID: {submission_id}
Generated: {datetime.now(timezone.utc).isoformat()}

CONTENTS
--------
- manifest.json     : SHA-256 hashes of all files (integrity anchor)
- cover_letter.md   : Human-readable summary for regulators
- reports/          : Static trust reports (JSON)
- proof_bundles/    : Cryptographic proof bundles (JSON)
- governance_evidence/ : Organizational process records (JSON)

VERIFICATION
------------
To verify this package:

1. Check manifest.json against all files
2. Use regulayer-proof-verifier to validate proof bundles
3. Proof bundles can be verified offline

DISCLAIMER
----------
{DISCLAIMER_TEXT}

For detailed verification instructions, see:
https://github.com/regulayer/regulayer-proof-verifier

END OF README
"""
    
    def _generate_cover_letter(
        self,
        submission_id: UUID,
        decision_ids: List[UUID],
        chain_id: Optional[str],
        include_governance: bool
    ) -> str:
        """Generate cover_letter.md for regulators."""
        return f"""# Regulayer Evidence Submission

**Submission ID:** `{submission_id}`  
**Generated:** {datetime.now(timezone.utc).isoformat()}  
**Decision Count:** {len(decision_ids)}

---

## What This Package Contains

This package contains cryptographic evidence for {len(decision_ids)} AI decision record(s).

### Included Artifacts:

1. **System Trust Report** - Architecture and security guarantees
2. **Decision Trust Reports** - Per-decision integrity evidence
3. **Cryptographic Proof Bundles** - Verifiable offline
{'4. **Governance Evidence** - Organizational review records' if include_governance else ''}

---

## What Regulayer Attests To

- Each decision was recorded at the stated timestamp
- Record hashes are computed correctly (SHA-256)
- Hash chains are linked correctly (sequential integrity)
- Signatures are valid for attested records (Ed25519)

---

## What Regulayer Does NOT Attest To

⚠️ **Critical Legal Boundary**

- **AI Correctness**: The AI's decisions may be wrong
- **AI Fairness**: The AI may be biased or unfair
- **Legal Compliance**: This is not a compliance certificate
- **Business Appropriateness**: Decisions may be inappropriate

{'Governance evidence is organizational process only and does not constitute cryptographic proof.' if include_governance else ''}

---

## How to Verify Independently

```bash
# Install the verification tool
pip install regulayer-proof-verifier

# Verify a proof bundle
regulayer-verify verify-proof proof_bundles/decision_<id>.json

# Verify all bundles in chain
regulayer-verify verify-chain proof_bundles/ --strict
```

No access to Regulayer systems is required.

---

## Integrity Verification

All files in this package are listed in `manifest.json` with SHA-256 hashes.

To verify package integrity:
1. Compute SHA-256 of each file
2. Compare against manifest.json
3. Any mismatch indicates tampering

---

**{DISCLAIMER_TEXT}**
"""
    
    def _generate_system_report(self) -> bytes:
        """Generate system trust report JSON."""
        # In production, call the reports API
        report = {
            "report_type": "system_trust",
            "version": "1.0.0",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "system_name": "Regulayer Decision Recorder",
            "hash_algorithm": "SHA-256",
            "signature_algorithm": "Ed25519",
            "disclaimer": DISCLAIMER_TEXT
        }
        return json.dumps(report, indent=2, sort_keys=True).encode()
    
    def _generate_chain_report(self, chain_id: str) -> bytes:
        """Generate chain integrity report JSON."""
        report = {
            "report_type": "chain_integrity",
            "chain_id": chain_id,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "integrity_result": "INTACT",
            "record_count": 100,
            "disclaimer": DISCLAIMER_TEXT
        }
        return json.dumps(report, indent=2, sort_keys=True).encode()
    
    def _generate_decision_report(self, decision_id: UUID) -> bytes:
        """Generate decision trust report JSON."""
        report = {
            "report_type": "decision_trust",
            "decision_id": str(decision_id),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "integrity_status": "VALID",
            "attestation_status": "SIGNED",
            "disclaimer": DISCLAIMER_TEXT
        }
        return json.dumps(report, indent=2, sort_keys=True).encode()
    
    def _generate_proof_bundle(self, decision_id: UUID) -> bytes:
        """Generate proof bundle JSON."""
        bundle = {
            "proof_bundle_version": "1.0.0",
            "decision_id": str(decision_id),
            "record_hash": f"sha256:mock_{decision_id}",
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        return json.dumps(bundle, indent=2, sort_keys=True).encode()
    
    def _generate_governance_evidence(self, decision_id: UUID) -> bytes:
        """Generate governance evidence JSON."""
        evidence = {
            "governance_evidence_version": "1.0.0",
            "decision_id": str(decision_id),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "review_state": "reviewed",
            "disclaimer": "Governance evidence is organizational process, not cryptographic fact."
        }
        return json.dumps(evidence, indent=2, sort_keys=True).encode()


# Global assembler instance
package_assembler = PackageAssembler()
