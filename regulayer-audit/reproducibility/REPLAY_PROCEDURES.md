# Replay Procedures

## Purpose

This document defines procedures for replaying and re-verifying Regulayer records.
Replay capability is essential for audits, court proceedings, and dispute resolution.

---

## PROCEDURE: Single Record Verification

**Goal**: Verify a single decision record.

### Inputs
- Proof bundle (JSON file)
- Public key (or key registry URL)

### Steps

```bash
# 1. Download offline verifier
curl -O https://releases.regulayer.io/verifier/v1.0.0/regulayer-verify

# 2. Verify bundle
./regulayer-verify bundle.json

# Expected output:
# ✓ Schema: valid
# ✓ Hash: valid
# ✓ Signature: valid
# ✓ Chain position: 42
# RESULT: VALID
```

### Verification Checklist
- [ ] Schema conforms to published version
- [ ] Record hash matches embedded hash
- [ ] Signature verifies against public key
- [ ] Timestamp is within key validity period

---

## PROCEDURE: Chain Segment Verification

**Goal**: Verify a contiguous segment of the chain.

### Inputs
- Multiple proof bundles (ordered by sequence number)

### Steps

```bash
# 1. Export chain segment
regulayer-cli export --from 100 --to 200 --output segment/

# 2. Verify chain integrity
./regulayer-verify-chain segment/

# Expected output:
# ✓ Record 100: VALID
# ✓ Record 101: VALID (links to 100)
# ...
# ✓ Record 200: VALID (links to 199)
# CHAIN INTEGRITY: VALID
```

### Verification Checklist
- [ ] Each record individually valid
- [ ] Each record's `previous_hash` matches prior record's hash
- [ ] Sequence numbers are consecutive
- [ ] No gaps in chain

---

## PROCEDURE: Historical State Reconstruction

**Goal**: Reconstruct state at a specific point in time.

### Inputs
- Target timestamp
- Chain access

### Steps

1. Identify last record before target timestamp
2. Export all records up to that point
3. Verify chain integrity
4. Apply records in order to reconstruct state

### Reconstruction Rules
- Only records with `recorded_at <= target_time` are included
- Chain must be verified before reconstruction
- State is deterministic given same records

---

## PROCEDURE: Cross-System Replay

**Goal**: Verify provenance across multiple systems.

### Inputs
- Provenance graph export
- Proof bundles from each system

### Steps

```bash
# 1. Export provenance graph
regulayer-cli export-provenance --decision dec_123 --depth 5

# 2. For each node in graph
for bundle in graph/*.json; do
    ./regulayer-verify $bundle
done

# 3. Verify graph structure
# Note: Graph is contextual, not cryptographic
# Each node verifies independently
```

### Verification Checklist
- [ ] Each decision in graph is individually valid
- [ ] Provenance links are declared (not enforced)
- [ ] No cryptographic dependency between linked decisions

---

## PROCEDURE: Dispute Resolution Replay

**Goal**: Replay for court or regulator dispute.

### Inputs
- Decision ID in dispute
- All related proof bundles
- Key registry snapshots

### Steps

1. **Gather Evidence**
   ```bash
   regulayer-cli export --decision dec_123 --full
   ```

2. **Establish Timeline**
   - Recording timestamp (signed)
   - Key validity at recording time
   - Chain position at recording time

3. **Verify Independently**
   - Use offline verifier (no Regulayer access)
   - Use key from public registry
   - Document verification steps

4. **Generate Report**
   ```bash
   regulayer-cli audit-report --decision dec_123 --output report/
   ```

### Evidence Package Contents
- Proof bundle (JSON)
- Verification log (text)
- Public key certificate
- Timeline reconstruction

---

## PROCEDURE: Legacy Record Migration

**Goal**: Verify records from legacy (pre-attestation) period.

### Inputs
- Legacy records (SRI-only)
- Chain checkpoint

### Steps

```bash
# 1. Identify legacy records
regulayer-cli list --before 2026-01-01 --legacy-only

# 2. Verify legacy records (reduced guarantees)
./regulayer-verify-legacy bundle.json

# Expected output:
# ✓ Hash: valid
# ⚠ Signature: not attested (legacy record)
# ⚠ Non-repudiation: recorder only (legacy)
# RESULT: VALID (legacy)
```

### Legacy Caveats
- Pre-attestation records have SRI integrity only
- Non-repudiation is recorder-level, not cryptographic
- Chain integrity still applies

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
