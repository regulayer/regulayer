# Hostile Reviewer Guide (Red Team)

**Goal**: Attempt to break the trust model by falsifying verification.

## Attack Vector 1: Mutation
**Action**: Modify one character in `canonical_payload`.
**Result**:
- `canonical_payload_hash` verification FAILS.
- If you update the payload hash to match, `record_hash` verification FAILS.
- If you update the record hash, `signature` verification FAILS.

## Attack Vector 2: Reordering
**Action**: Swap the order of two chain links.
**Result**:
- `previous_record_hash` of the second record will not match the (now missing) first record.
- Chain verification halts at the break.

## Attack Vector 3: Forgery
**Action**: Sign a fake record with your own key.
**Result**:
- Signature verification passes (for your key).
- **BUT**: Your key ID is not in the `TrustedKeyList` of the organization.
- Audit result: **UNAUTHORIZED SIGNER**.

## Conclusion
The system relies on cryptographic binding, not obscurity. Assuming the private key is secure, falsification is mathematically impossible.
