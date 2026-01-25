# Chain Standard

## Document Status

| Property | Value |
|----------|-------|
| Standard Version | 1.0.0 |
| Status | Stable |
| Last Updated | 2026-01-25 |
| Normative | Yes |

---

## Abstract

This document defines the structure and semantics of append-only decision
chains. It specifies how records are linked, how chain integrity is verified,
and what guarantees the chain provides.

---

## 1. Scope

This standard defines:
- Chain structure
- Record linking
- Integrity guarantees
- Verification procedures

This standard does NOT define:
- Storage implementation
- Replication strategy
- Backup procedures

---

## 2. Concepts

### 2.1 Append-Only Chain

A sequence of records where:
- New records can only be added to the end
- Existing records cannot be modified or deleted
- Each record cryptographically links to its predecessor

### 2.2 Chain Properties

| Property | Description |
|----------|-------------|
| Immutability | Records cannot be modified after creation |
| Ordering | Records have a strict sequence |
| Continuity | No gaps in the sequence |
| Verifiability | Chain integrity can be independently verified |

---

## 3. Chain Structure

### 3.1 Record Linking

Each record SHALL contain a reference to its predecessor:

```
Record N
├── sequence_number: N
├── previous_hash: hash(Record N-1)
└── [content]
```

### 3.2 Genesis Record

The first record in a chain is the genesis record.

Genesis record properties:
- sequence_number SHALL be 1
- previous_hash SHALL be empty, null, or a defined constant

### 3.3 Subsequent Records

For all records after genesis:
- sequence_number SHALL be (previous.sequence_number + 1)
- previous_hash SHALL be the record_hash of the preceding record

---

## 4. Hash Computation

### 4.1 Record Hash

The record hash binds all record content:

```
record_hash = sha256(canonicalize(record_without_hash))
```

Where:
- canonicalize follows RFC 8785
- record_without_hash excludes the record_hash field

### 4.2 Chain Link

The chain link is established by including previous_hash:

```
record_hash(N) = sha256(canonicalize({
  ...content,
  previous_hash: record_hash(N-1)
}))
```

This creates a cryptographic chain where modifying any record
invalidates all subsequent records.

---

## 5. Integrity Guarantees

### 5.1 Tamper Detection

If any record in the chain is modified:
1. Its record_hash changes
2. The next record's previous_hash no longer matches
3. Chain verification fails

### 5.2 Deletion Detection

If any record is deleted:
1. A gap appears in sequence numbers
2. Chain linking breaks
3. Chain verification fails

### 5.3 Insertion Detection

If a record is inserted mid-chain:
1. Subsequent sequence numbers would conflict
2. Hash links would not match
3. Chain verification fails

### 5.4 Reordering Detection

If records are reordered:
1. Sequence numbers would be out of order
2. Previous hashes would not match
3. Chain verification fails

---

## 6. Verification Procedure

### 6.1 Single Record Verification

To verify a single record:

1. Recompute record_hash
2. Compare with claimed record_hash
3. Record is VALID if hashes match

### 6.2 Chain Verification

To verify a chain of records:

```
function verify_chain(records):
    sort records by sequence_number
    
    for i in range(len(records)):
        # Verify record hash
        if not verify_record_hash(records[i]):
            return FAIL("Invalid record hash at position " + i)
        
        # Verify genesis
        if i == 0:
            if records[i].sequence_number != 1:
                return FAIL("First record must be genesis")
            continue
        
        # Verify linking
        expected_previous = records[i-1].record_hash
        actual_previous = records[i].previous_hash
        
        if expected_previous != actual_previous:
            return FAIL("Chain link broken at position " + i)
        
        # Verify sequence
        if records[i].sequence_number != records[i-1].sequence_number + 1:
            return FAIL("Sequence gap at position " + i)
    
    return PASS
```

---

## 7. Partial Chain Verification

### 7.1 Checkpoint-Based Verification

For large chains, verification MAY use checkpoints:

1. Trust a known-good checkpoint (sequence_number, record_hash)
2. Verify chain from checkpoint forward
3. Requires initial trust in checkpoint

### 7.2 Merkle Proofs (Optional)

Implementations MAY provide Merkle proofs for efficient verification
of individual records within a large chain.

---

## 8. Chain Splits

### 8.1 Definition

A chain split occurs when two valid chains exist with the same ancestry.

### 8.2 Detection

Chain splits can be detected by observing:
- Two records with the same sequence_number
- Two records with the same previous_hash
- Divergent chains from the same genesis

### 8.3 Resolution

This standard does not define chain split resolution.
Implementations SHOULD prevent splits through consensus mechanisms.

---

## 9. Conformance

An implementation conforms to this standard if it:

1. Produces chains with correct linking
2. Enforces append-only semantics
3. Enables verification per Section 6
4. Detects tampering per Section 5

---

## Appendix A: Example Chain

```
Record 1 (Genesis)
├── sequence_number: 1
├── previous_hash: null
├── record_hash: "sha256:aaa..."
└── content: {...}

Record 2
├── sequence_number: 2
├── previous_hash: "sha256:aaa..."
├── record_hash: "sha256:bbb..."
└── content: {...}

Record 3
├── sequence_number: 3
├── previous_hash: "sha256:bbb..."
├── record_hash: "sha256:ccc..."
└── content: {...}
```
