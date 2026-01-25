# Replay Verification

## Core Principle

> **Replay ≠ Rewrite. Replay ≠ Ambiguity.**

Replaying old events cannot alter history, extend chains improperly,
or create ambiguous state.

---

## What Is Replay?

### Definition

Replay occurs when a previously processed event is delivered again.

Causes:
- Queue retry after timeout
- Disaster recovery replay
- Testing with production data
- Malicious attempt to duplicate

### Types of Replay

| Type | Description | Handling |
|------|-------------|----------|
| Queue retry | Same message, short window | Idempotency key |
| DR replay | Old events, long window | Sequence validation |
| Malicious replay | Attacker submits old payload | Full validation |

---

## Proof: Replays Cannot Rewrite History

### Mechanism

```
Existing chain: [R1] → [R2] → [R3]
                 ↓       ↓       ↓
              seq=1   seq=2   seq=3

Replay attempt: Submit R2 again

Validation:
1. Check idempotency key → Already exists
2. Return existing record ID
3. Chain unchanged
```

### Guarantee

| Property | Guaranteed |
|----------|------------|
| Existing records modified | **Never** |
| Sequence numbers reused | **Never** |
| Previous hashes changed | **Never** |

---

## Proof: Replays Cannot Extend Chains Improperly

### Mechanism

```
Existing chain: [R1] → [R2] → [R3]

Replay attempt: Submit "R4" with old previous_hash

Validation:
1. R4 claims previous_hash = hash(R2)
2. Current chain head = R3
3. Expected previous_hash = hash(R3)
4. Mismatch → REJECT

Result: Invalid extension rejected
```

### Guarantee

| Scenario | Result |
|----------|--------|
| Old previous_hash | Rejected |
| Stale sequence number | Rejected |
| Fork attempt | Detected and rejected |

---

## Proof: Replays Cannot Alter Proofs

### Mechanism

Proofs are mathematical artifacts:

```
Proof = {
  record_hash: sha256(canonical_content),
  signature: sign(key, record_hash),
  chain_position: {sequence, previous_hash}
}
```

Replay cannot alter proofs because:
1. **record_hash** - computed from content, immutable
2. **signature** - bound to record_hash, cannot be regenerated
3. **chain_position** - determined at creation time

### Guarantee

| Attempt | Blocked By |
|---------|------------|
| Change content | Hash changes, signature fails |
| Change signature | Signature verification fails |
| Change position | Chain verification fails |

---

## Duplicate Payload Detection

### Idempotency Key Mechanism

```python
def process_claim(claim, idempotency_key):
    # Check for existing record with same key
    existing = lookup_by_idempotency_key(idempotency_key)
    
    if existing:
        # Return existing record, no new write
        return existing.record_id
    
    # First time: create new record
    record = create_record(claim)
    store_idempotency_mapping(idempotency_key, record.id)
    return record.id
```

### Determinism

Same idempotency key → Same outcome (always)

| Delivery | Result |
|----------|--------|
| First | New record created |
| Second | Existing record returned |
| Third | Existing record returned |
| N-th | Existing record returned |

---

## Mixed Legacy + Attested Replays

### Scenario

Replay includes mix of:
- Old records (legacy, no attestation)
- New records (fully attested)

### Handling

```
Replay sequence: [L1 (legacy)] → [A1 (attested)] → [A2 (attested)]

Validation:
1. L1: Accept (legacy path)
2. A1: Check attestation, accept if valid
3. A2: Check attestation, accept if valid

Chain integrity preserved regardless of attestation presence.
```

### Guarantee

| Record Type | Chain Position | Valid |
|-------------|----------------|-------|
| Legacy | Correct | ✅ |
| Attested | Correct | ✅ |
| Legacy after Attested | Correct | ✅ (degraded trust model) |
| Attested after Legacy | Correct | ✅ |

---

## Formal Statement

### Replay Safety Theorem

For any record R in chain C:

```
∀ replay_attempt(R):
  - chain_length(C) unchanged
  - sequence_numbers(C) unchanged  
  - previous_hashes(C) unchanged
  - signatures(C) unchanged
  - verification_result(C) unchanged
```

Replays are **operationally harmless** to cryptographic truth.

---

## Verification Procedure

To prove replay safety in production:

```python
def verify_replay_safety():
    # Before replay
    chain_before = export_chain(project_id)
    verification_before = verify_chain(chain_before)
    
    # Attempt replay of all records
    for record in chain_before:
        submit(record.original_payload, record.idempotency_key)
    
    # After replay
    chain_after = export_chain(project_id)
    verification_after = verify_chain(chain_after)
    
    # Assertions
    assert chain_length(chain_before) == chain_length(chain_after)
    assert verification_before == verification_after
    assert all_hashes_match(chain_before, chain_after)
    
    return "REPLAY_SAFE"
```

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
