# Regulayer Submission Package Specification

Version: 1.0.0  
Status: NORMATIVE

---

## Purpose

This document defines the structure, rules, and integrity guarantees of Regulayer submission packages.

---

## Package Structure

```
submission-<uuid>/
├── manifest.json           # Integrity anchor (SHA-256 hashes)
├── cover_letter.md         # Human-readable summary
├── README.txt              # Quick reference guide
├── reports/
│   ├── system_trust.json   # System architecture report
│   ├── chain_integrity.json # Chain verification report (optional)
│   └── decision_<id>.json  # Per-decision trust reports
├── proof_bundles/
│   └── decision_<id>.json  # Cryptographic proof bundles
└── governance_evidence/    # Optional
    └── decision_<id>.json  # Organizational process records
```

---

## Manifest Rules

### manifest.json

The manifest is the **single source of truth** for package integrity.

| Field | Type | Description |
|-------|------|-------------|
| submission_id | UUID | Unique package identifier |
| generated_at | ISO-8601 | Generation timestamp |
| contents | Dict[path, hash] | SHA-256 hash of each file |
| disclaimer_hash | string | Hash of disclaimer text |

### Integrity Rules

1. **Every file MUST be listed** in the manifest
2. **No extra files allowed** beyond what's in manifest
3. **Hash mismatch = package invalid**
4. **Manifest itself is NOT hashed** (it's the root of trust)

---

## Determinism Guarantees

Submission packages are **deterministic**:

- Same inputs → same package bytes
- File ordering is alphabetical
- Timestamps are embedded, not dynamic
- JSON uses sorted keys

### Reproducibility

To reproduce a package:
1. Use same decision IDs
2. Use same chain ID
3. Use same flags (include_governance, include_legacy)
4. Use same generator version

---

## File Formats

### Reports (JSON)

Reports are read-only snapshots. They contain:
- Pre-computed verification results
- No live data
- Legal disclaimers

### Proof Bundles (JSON)

Proof bundles are cryptographic evidence. They contain:
- Record hashes
- Chain links
- Attestation signatures

Can be verified offline using `regulayer-proof-verifier`.

### Governance Evidence (JSON)

Governance evidence is **non-authoritative**. It documents:
- Review states
- Approvals
- Tags
- Annotations

Marked clearly as organizational process, not cryptographic fact.

---

## Verification Process

### Package Integrity

```bash
# Verify all files against manifest
sha256sum -c manifest.checksums
```

Or programmatically:
1. Load manifest.json
2. For each file in contents:
   - Compute SHA-256
   - Compare against manifest
3. Check for extra files not in manifest

### Proof Bundle Verification

```bash
regulayer-verify verify-proof proof_bundles/decision_<id>.json
```

### Chain Verification

```bash
regulayer-verify verify-chain proof_bundles/ --strict
```

---

## Archive Safety

Packages are designed for long-term archival:

- Self-contained (no external dependencies)
- Standard formats (JSON, MD, TXT)
- No binary dependencies
- Timestamps in ISO-8601

Recommended storage: 7+ years for regulatory compliance.

---

## Legal Boundaries

Every package includes the disclaimer:

```
This submission package proves record integrity and authorship only.
It does not attest to AI correctness, fairness, legality, or compliance.
```

The `disclaimer_hash` field can be used to verify the disclaimer hasn't changed.

---

**END OF SPECIFICATION**
