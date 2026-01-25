# Regulayer Reproduction Kit

**Independent, Third-Party Verification Tools**

This module contains guides and "No-SDK" scripts to prove that Regulayer's cryptographic proofs can be verified by anyone, anywhere, without access to Regulayer software.

## Guides
- **For Auditors**: `reproduction_guides/auditor_walkthrough.md`
- **For Courts**: `reproduction_guides/court_walkthrough.md`
- **For Regulators**: `reproduction_guides/regulator_walkthrough.md`
- **For Red Teams**: `reproduction_guides/hostile_reviewer.md`

## Scripts (Pure Python)
These scripts use **zero** Regulayer dependencies. They rely only on `cryptography` and standard libraries.

- `verify_single_proof.py`: Verify one JSON bundle.
- `verify_chain.py`: Verify a list of bundles.

## Usage

```bash
cd scripts
# Verify a bundle
python reproduce_single_proof.py ../artifacts/sample_bundle.json ../artifacts/sample_key.pem
```

## Philosophy
True trust comes from the ability to verify without the vendor's help.
