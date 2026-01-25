# Court Reproduction Guide

**Goal**: Determine if a digital record is authentic and admissible evidence.

## Language for Affidavits
> "I have independently verified the digital signature of the record [Record ID] using standard, open-source cryptographic tools. The record timestamped [Date] has not been altered since creation."

## Verification Checklist

### 1. The Document
- [ ] Visual Inspection: Does the document content match the `payload` in the proof bundle?
- [ ] ID Match: Does the `decision_id` on the proof match the document ID?

### 2. The Timeline
- [ ] Timestamp: Is `record_timestamp` consistent with the event timeline?
- [ ] Sequence: If part of a chain, does it logically follow the previous record?

### 3. The Authority
- [ ] Key Identity: Is the signing key (`key_id`) listed in the organization's published authorized keys?
- [ ] Revocation Check: Was the key valid (not revoked) at the time of signing?

## Verdict
If the cryptographic verification passes (green checkmark in independent tool) and the checklist is satisfied, the record is considered **Authentic** and **Unaltered**.
