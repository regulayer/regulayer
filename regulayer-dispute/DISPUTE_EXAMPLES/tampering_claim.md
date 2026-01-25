# Dispute Example: Tampering Claim

**Scenario**: A user claims the decision record in the database was altered by the organization to hide malpractice.

**Resolution**:
1. Retrieve the `proof_bundle` (JSON or Artifact).
2. Run `regulayer-reproduction/scripts/verify_single_proof.py`.
3. **Outcome A (Pass)**: The record matches the hash signed by the key. Since the key is held by the system (and potentially attested by SGX), tampering is cryptographically disproven unless the claimant proves key theft.
4. **Outcome B (Fail)**: The hash mismatch proves the database record *was* altered. The Dispute allows the user to reject the record as evidence.
