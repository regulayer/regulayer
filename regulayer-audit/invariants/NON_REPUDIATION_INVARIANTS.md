# Non-Repudiation Invariants

## Purpose

This document defines the invariants that ensure no party can deny their actions.
Non-repudiation is the core legal property that makes evidence court-admissible.

---

## INVARIANT: Customer Cannot Deny Recording

**CLAIM**: A customer cannot deny that they submitted a decision for recording.

**VIOLATION**: If this were false, customers could claim "I never recorded that."

**TEST**:
1. Customer authenticates (API key / IAM)
2. Customer submits decision
3. Record includes customer's project/org identifiers
4. Authentication logs correlate with recording
5. Customer cannot produce alternative explanation

**Evidence Trail**:
- API key used (hashed)
- Timestamp of request
- IP address (governance layer)
- Project context

---

## INVARIANT: Regulayer Cannot Deny Attestation

**CLAIM**: Regulayer cannot deny that it attested a decision.

**VIOLATION**: If this were false, Regulayer could claim "We never signed that."

**TEST**:
1. Attestation contains Regulayer's signature
2. Signature verifies against Regulayer's published public key
3. Key is registered in certificate transparency or equivalent
4. Regulayer's private key is sole means to produce signature

**Evidence Trail**:
- Digital signature
- Key ID linking to published key
- Timestamp in signed data

---

## INVARIANT: Timestamp Cannot Be Repudiated

**CLAIM**: Neither party can claim a different recording time.

**VIOLATION**: If this were false, records could be claimed to have been made earlier or later.

**TEST**:
1. Timestamp is included in signed record
2. Timestamp is set by recorder, not customer
3. Signature binds timestamp to record permanently
4. Chain ordering provides relative time proof

**Evidence Trail**:
- Signed timestamp
- Chain sequence number
- Previous record's timestamp (ordering proof)

---

## INVARIANT: Content Cannot Be Repudiated

**CLAIM**: The content of the decision cannot be disputed after recording.

**VIOLATION**: If this were false, parties could claim "That's not what was recorded."

**TEST**:
1. Full record content is hashed
2. Hash is signed
3. Original content must match hash
4. Any content dispute → recompute hash → verify

**Evidence Trail**:
- Hash of complete content
- Signature over hash
- Original content for recomputation

---

## INVARIANT: Export Cannot Be Repudiated

**CLAIM**: An exported proof bundle is a faithful representation of the record.

**VIOLATION**: If this were false, exports could be questioned as potentially altered.

**TEST**:
1. Export is deterministic (same record → same export)
2. Export contains all verification material
3. Independent verification produces same result
4. No trust in Regulayer required to verify

**Evidence Trail**:
- Self-contained proof bundle
- Offline verifier
- Schema conformance

---

## Court Presentation

When presenting evidence in court:

| Question | Answer | Proof |
|----------|--------|-------|
| "Did the customer record this?" | Yes | API authentication + record |
| "Did Regulayer attest this?" | Yes | Digital signature verification |
| "When was it recorded?" | T | Signed timestamp in chain |
| "Is this the exact content?" | Yes | Hash recomputation |
| "Could either party have altered it?" | No | Cryptographic guarantees |

---

## Burden of Proof

### To dispute a record, an adversary must:

1. **Forge a signature** → Computationally infeasible
2. **Find a hash collision** → Computationally infeasible  
3. **Break chain ordering** → Requires modifying all subsequent records
4. **Compromise all copies** → Exports are distributed

### Regulayer's position:

We attest, we do not adjudicate. The mathematics provides the proof.

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
