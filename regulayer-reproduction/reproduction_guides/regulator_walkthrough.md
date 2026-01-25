# Regulator Walkthrough

**Goal**: Verify system compliance and data integrity for audit purposes.

## Compliance Checks

1. **Immutability**:
   - Verify that `record_hash` depends on `previous_record_hash`.
   - Confirm that any change breaks the chain.

2. **time-stamping**:
   - Verify `record_timestamp` against external Time Anchors (if present).
   - Confirm sequence monotonicity.

3. **Data Residency**:
   - Verify `project_id` / `org_id` implies correct jurisdiction handling (if applicable).

4. **Incident Response**:
   - In case of key compromise, verify that `Revoked Keys` are respected and new keys are used moving forward.

## Audit Procedure
Run the independent verification script `reproduce_chain.py` on the exported dataset.

**Pass Criteria**:
- 100% Signature Match
- 100% Chain Link Continuity
- 0% Unauthorized Keys
