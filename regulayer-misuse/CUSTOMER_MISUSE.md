# Customer Misuse Constraints

**How Users May Attempt to Abuse the System**

## 1. The "Data Dump"
**Abuse**: Dumping gigabytes of raw binary data into the payload.
**Impact**: Bloats the chain, verified uselessly.
**Constraint**: Use `canonical_payload` for structured metadata, reference large blobs by hash.

## 2. The "Ghost Recorder"
**Abuse**: Running a recorder that logs nothing, just to say "We have a recorder".
**Impact**: Audit theater.
**Constraint**: Auditors check for *volume* and *frequency* of records, not just presence of the binary.

## 3. The "Key Shredding"
**Abuse**: "Accidentally" losing the private key to make audits impossible.
**Impact**: "Sorry, we can't show you the proofs."
**Constraint**: Key loss is treated as an **Integrity Failure** by the Standard. Loss of evidence = Guilt in many contexts.
