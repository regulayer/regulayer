# Regulayer Certification Pack

**Version:** 1.0.0

This directory contains auditor-ready documentation and sample evidence for independent verification of Regulayer records.

## Contents

| Document | Purpose |
| :--- | :--- |
| [AUDITOR_CERTIFICATION_GUIDE.md](./AUDITOR_CERTIFICATION_GUIDE.md) | Step-by-step verification procedures |
| [INDEPENDENT_VERIFICATION_STATEMENT.md](./INDEPENDENT_VERIFICATION_STATEMENT.md) | What Regulayer proves and does not prove |
| [REGULATORY_ALIGNMENT_NOTE.md](./REGULATORY_ALIGNMENT_NOTE.md) | Mapping to audit/regulatory concepts |
| [GLOSSARY.md](./GLOSSARY.md) | Non-technical definitions |
| [SAMPLE_EVIDENCE_PACK/](./SAMPLE_EVIDENCE_PACK/) | Pre-built test artifacts |

## Quick Start for Auditors

1. Install the verifier: `pip install -e ../regulayer-proof-verifier`
2. Verify a valid bundle: `regulayer verify-proof SAMPLE_EVIDENCE_PACK/valid_attested_bundle.json`
3. Verify tampering detection: `regulayer verify-proof SAMPLE_EVIDENCE_PACK/tampered_bundle.json`
4. Verify a chain: `regulayer verify-chain SAMPLE_EVIDENCE_PACK/mixed_chain/ --strict`

## No Trust Required

All verification is performed offline. No network access, no Regulayer servers, no credentials.
