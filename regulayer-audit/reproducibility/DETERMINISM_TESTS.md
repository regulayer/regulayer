# Determinism Tests

## Purpose

This document defines tests to verify that all cryptographic operations are deterministic.
Determinism is required for reproducibility and independent verification.

---

## TEST: Hash Determinism

**Goal**: Same input → same hash, always.

### Procedure

```python
def test_hash_determinism():
    record = {"action": "approve", "model": "gpt-4", "timestamp": "2026-01-01T00:00:00Z"}
    
    # Compute hash 1000 times
    hashes = [compute_hash(record) for _ in range(1000)]
    
    # All must be identical
    assert len(set(hashes)) == 1
    
    # Across processes
    hash_a = subprocess.run(["hash-tool", json.dumps(record)], capture_output=True)
    hash_b = subprocess.run(["hash-tool", json.dumps(record)], capture_output=True)
    
    assert hash_a.stdout == hash_b.stdout
```

### Expected Result
- 100% identical hashes
- No variation across runs, processes, or machines

---

## TEST: Canonicalization Determinism

**Goal**: JSON canonicalization produces identical output regardless of input ordering.

### Procedure

```python
def test_canonicalization_determinism():
    # Same content, different orderings
    record_a = {"z": 1, "a": 2, "m": 3}
    record_b = {"a": 2, "m": 3, "z": 1}
    record_c = {"m": 3, "z": 1, "a": 2}
    
    canon_a = canonicalize(record_a)
    canon_b = canonicalize(record_b)
    canon_c = canonicalize(record_c)
    
    # All must be byte-identical
    assert canon_a == canon_b == canon_c
    
    # Expected output (RFC 8785)
    assert canon_a == b'{"a":2,"m":3,"z":1}'
```

### Expected Result
- Byte-identical output for semantically identical input
- Conformance to RFC 8785

---

## TEST: Signature Determinism

**Goal**: Same key + same message → same signature (for deterministic algorithms).

### Procedure

```python
def test_signature_determinism():
    key = load_test_key("ed25519")
    message = b"test message hash"
    
    # Ed25519 is deterministic
    sig_a = sign(key, message)
    sig_b = sign(key, message)
    
    assert sig_a == sig_b
    
    # Verify both
    assert verify(key.public_key, message, sig_a)
    assert verify(key.public_key, message, sig_b)
```

### Expected Result
- Identical signatures for Ed25519
- Note: ECDSA with random k is non-deterministic (RFC 6979 for determinism)

---

## TEST: Export Determinism

**Goal**: Same record → same proof bundle export.

### Procedure

```python
def test_export_determinism():
    decision_id = "dec_123"
    
    # Export twice
    bundle_a = export_proof_bundle(decision_id)
    bundle_b = export_proof_bundle(decision_id)
    
    # Remove timestamp field for comparison (export time differs)
    del bundle_a["exported_at"]
    del bundle_b["exported_at"]
    
    # All other fields must be identical
    assert bundle_a == bundle_b
```

### Expected Result
- Proof bundles are identical except for export timestamp

---

## TEST: Verification Determinism

**Goal**: Same bundle → same verification result.

### Procedure

```python
def test_verification_determinism():
    bundle = load_test_bundle("valid_bundle.json")
    
    # Verify 100 times
    results = [verify_bundle(bundle) for _ in range(100)]
    
    # All must be identical
    assert all(r.valid == results[0].valid for r in results)
    assert all(r.decision_hash == results[0].decision_hash for r in results)
```

### Expected Result
- 100% consistent verification results

---

## TEST: Cross-Platform Determinism

**Goal**: Same operations produce same results across platforms.

### Procedure

1. Prepare test vectors with expected outputs
2. Run tests on:
   - Linux (x64)
   - macOS (ARM)
   - Windows (x64)
3. Compare outputs

### Test Vectors

| Input | Expected Hash |
|-------|--------------|
| `{"a":1}` | `sha256:abc123...` |
| `{"z":26,"a":1}` | `sha256:def456...` |
| `{}` | `sha256:ghi789...` |

### Expected Result
- Identical outputs across all platforms

---

## Failure Modes

If determinism fails:

| Symptom | Likely Cause |
|---------|-------------|
| Different hashes | Floating point, encoding, or ordering issue |
| Different signatures | Non-deterministic k generation |
| Different exports | Timestamp or ordering in serialization |

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
