# Implementation Guide

## Purpose

This guide enables third parties to implement standard-compliant evidence
systems **without any reference to Regulayer code or services**.

---

## Prerequisites

To implement a compliant system, you need:

1. **SHA-256** hashing capability
2. **Ed25519** (or ECDSA-P256, RSA-PSS) signing capability
3. **RFC 8785** JSON canonicalization
4. **Append-only storage** (any form)

No Regulayer code, SDK, or service is required.

---

## Implementation Overview

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    EVIDENCE SYSTEM                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Recorder   │  │    Chain     │  │   Exporter   │   │
│  │              │→ │              │→ │              │   │
│  │ Accept claim │  │ Store record │  │ Bundle proof │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │   Attester   │  │   Verifier   │                     │
│  │              │  │              │                     │
│  │ Sign records │  │ Check proofs │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

---

## Step 1: Recording

### 1.1 Accept Input

Accept decision data in any format. Convert to JSON object.

```python
decision_data = {
    "decision_id": generate_uuid(),
    "recorded_at": current_utc_time(),  # RFC 3339
    # ... application-specific fields
}
```

### 1.2 Canonicalize

Apply RFC 8785 canonicalization:

```python
def canonicalize(obj):
    """RFC 8785 JSON Canonicalization Scheme"""
    if obj is None:
        return "null"
    elif isinstance(obj, bool):
        return "true" if obj else "false"
    elif isinstance(obj, (int, float)):
        return format_number(obj)  # No trailing zeros
    elif isinstance(obj, str):
        return escape_string(obj)
    elif isinstance(obj, list):
        return "[" + ",".join(canonicalize(x) for x in obj) + "]"
    elif isinstance(obj, dict):
        sorted_keys = sorted(obj.keys())
        pairs = [canonicalize(k) + ":" + canonicalize(obj[k]) for k in sorted_keys]
        return "{" + ",".join(pairs) + "}"
```

### 1.3 Hash

Compute SHA-256 hash of canonical form:

```python
canonical = canonicalize(decision_data)
record_hash = "sha256:" + sha256(canonical.encode("utf-8")).hexdigest()
```

### 1.4 Add Hash to Record

```python
decision_data["record_hash"] = record_hash
```

---

## Step 2: Chaining

### 2.1 Get Previous Hash

```python
previous_record = get_last_record(chain_id)
if previous_record:
    previous_hash = previous_record["record_hash"]
    sequence_number = previous_record["sequence_number"] + 1
else:
    previous_hash = None  # Genesis
    sequence_number = 1
```

### 2.2 Create Chain Position

```python
chain_position = {
    "sequence_number": sequence_number,
    "previous_hash": previous_hash or "",
    "chain_id": chain_id
}
```

---

## Step 3: Attestation

### 3.1 Sign the Hash

```python
signature = ed25519_sign(private_key, record_hash.encode("utf-8"))
signature_b64 = base64_encode(signature)
```

### 3.2 Create Attestation

```python
attestation = {
    "signature": signature_b64,
    "algorithm": "Ed25519",
    "key_id": key_id,
    "signed_at": current_utc_time()
}
```

---

## Step 4: Storage

### 4.1 Create Complete Record

```python
complete_record = {
    "decision": decision_data,
    "attestation": attestation,
    "chain_position": chain_position
}
```

### 4.2 Store Immutably

Store in append-only format:
- Append-only file
- Immutable database table
- Write-once storage

The storage mechanism is implementation-dependent.

---

## Step 5: Export

### 5.1 Create Evidence Bundle

```python
evidence_bundle = {
    "schema_version": "1.0.0",
    "bundle_id": generate_uuid(),
    "exported_at": current_utc_time(),
    "decision": decision_data,
    "attestation": attestation,
    "chain_position": chain_position,
    "verification": {
        "verifiable_offline": True
    }
}
```

### 5.2 Serialize

```python
bundle_json = json.dumps(evidence_bundle, indent=2)
```

---

## Step 6: Verification

### 6.1 Verify Hash

```python
def verify_hash(decision):
    claimed = decision["record_hash"]
    decision_copy = {k: v for k, v in decision.items() if k != "record_hash"}
    canonical = canonicalize(decision_copy)
    computed = "sha256:" + sha256(canonical.encode("utf-8")).hexdigest()
    return claimed == computed
```

### 6.2 Verify Signature

```python
def verify_signature(attestation, record_hash, public_key):
    signature = base64_decode(attestation["signature"])
    return ed25519_verify(public_key, record_hash.encode("utf-8"), signature)
```

### 6.3 Verify Chain

```python
def verify_chain(records):
    records = sorted(records, key=lambda r: r["chain_position"]["sequence_number"])
    for i, record in enumerate(records):
        if i == 0:
            continue  # Genesis
        expected = records[i-1]["decision"]["record_hash"]
        actual = record["chain_position"]["previous_hash"]
        if expected != actual:
            return False
    return True
```

---

## Implementation Checklist

Before deploying, verify:

- [ ] Canonicalization matches RFC 8785
- [ ] Hashes reproducible across platforms
- [ ] Signatures use approved algorithms
- [ ] Chain links correctly
- [ ] Exports are self-contained
- [ ] Verification works offline

---

## No Regulayer Dependency

This implementation:
- ✅ Uses only standard cryptographic primitives
- ✅ References only open standards (RFC 8785, RFC 8032)
- ✅ Requires no Regulayer code or services
- ✅ Produces interoperable evidence bundles

---

## References

| Standard | Document |
|----------|----------|
| Evidence Format | REGULAYER_EVIDENCE_STANDARD.md |
| Attestation | REGULAYER_ATTESTATION_STANDARD.md |
| Chain | REGULAYER_CHAIN_STANDARD.md |
| RFC 8785 | JSON Canonicalization Scheme |
| RFC 8032 | Ed25519 |
