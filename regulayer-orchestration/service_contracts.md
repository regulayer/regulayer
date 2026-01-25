# Service Contracts

## Purpose

Explicit contracts between services that define guarantees and prohibitions.

> **Clarity prevents ambiguity. Ambiguity is worse than failure.**

---

## Contract: SDK → Gateway

```yaml
contract: sdk_to_gateway
version: 1.0.0

guarantees:
  - authenticated_request
  - valid_json_payload
  - project_id_present
  - idempotency_key_present

limitations:
  - sdk_may_retry_on_timeout
  - sdk_does_not_guarantee_order

forbidden:
  - sdk_computing_hashes
  - sdk_signing_payloads
  - sdk_manipulating_chain
```

### Behavior

| Scenario | SDK Action | Gateway Response |
|----------|------------|------------------|
| Valid request | Submit | 202 Accepted |
| Invalid auth | Submit | 401 Unauthorized |
| Rate limited | Submit | 429 Too Many Requests |
| Invalid format | Submit | 400 Bad Request |
| Network error | Retry | - |

---

## Contract: Gateway → Queue

```yaml
contract: gateway_to_queue
version: 1.0.0

guarantees:
  - byte_for_byte_forwarding
  - project_order_preserved
  - authenticated_origin_attached
  - timestamp_attached

forbidden:
  - payload_mutation
  - conditional_forwarding_on_content
  - inspection_of_business_data
  - reordering_within_project
```

### Message Format

```json
{
  "queue_metadata": {
    "enqueued_at": "2026-01-15T14:30:00Z",
    "project_id": "proj_123",
    "idempotency_key": "idem_abc",
    "origin_ip": "10.0.0.1"
  },
  "payload": {
    // Unchanged from SDK
  }
}
```

---

## Contract: Queue → Recorder

```yaml
contract: queue_to_recorder
version: 1.0.0

guarantees:
  - at_least_once_delivery
  - strict_per_project_order
  - payload_integrity
  - retry_on_transient_failure

forbidden:
  - parallel_writes_same_project
  - partial_batch_commits
  - silent_message_drops
  - out_of_order_delivery
```

### Ordering Protocol

```
Queue maintains per-project sequence:

Project A: [msg1, msg2, msg3] → delivered in order
Project B: [msg1, msg2]       → delivered in order

Cross-project: NO ordering guarantee (not required)
```

### Retry Behavior

| Failure | Action | Max Retries |
|---------|--------|-------------|
| Recorder timeout | Retry | 3 |
| Recorder reject | Dead letter | 0 |
| Recorder 5xx | Retry with backoff | 5 |

---

## Contract: Recorder → Storage

```yaml
contract: recorder_to_storage
version: 1.0.0

guarantees:
  - write_then_ack
  - atomic_record_commit
  - durable_before_response
  - immutable_after_commit

forbidden:
  - ack_before_durable
  - partial_writes
  - lazy_persistence
  - modification_after_commit
```

### Commit Protocol

```
1. Recorder computes hash
2. Recorder signs
3. Recorder writes to storage
4. Storage confirms durability
5. Recorder returns success
```

No step can be reordered. Failure at any step = full rollback.

---

## Contract: Recorder → Governance

```yaml
contract: recorder_to_governance
version: 1.0.0

guarantees:
  - async_notification
  - record_id_provided
  - governance_does_not_block_recording

forbidden:
  - governance_modifying_record
  - governance_vetoing_record
  - synchronous_governance_check
```

### Relationship

```
Recording: INDEPENDENT of governance
Governance: REACTS to recording

Recorder ──(async)──► Governance
    │
    └── Recording completes regardless of governance state
```

---

## Contract: Storage → Export

```yaml
contract: storage_to_export
version: 1.0.0

guarantees:
  - complete_record_retrieval
  - chain_integrity_preserved
  - no_transformation

forbidden:
  - partial_chain_export
  - hash_recomputation
  - signature_regeneration
  - selective_field_omission
```

### Export Format

Export produces the exact data stored:
- Same hashes
- Same signatures
- Same chain positions
- Plus verification metadata

---

## Contract: Export → Verification

```yaml
contract: export_to_verification
version: 1.0.0

guarantees:
  - self_contained_bundle
  - offline_verifiable
  - deterministic_result

forbidden:
  - online_verification_required
  - dynamic_hash_computation
  - server_side_validation_only
```

### Verification Independence

```
Export produces bundle
    ↓
Bundle contains all verification data
    ↓
Verification is PURE FUNCTION
    ↓
Result depends ONLY on bundle content
```

---

## Contract Violations

### Detection

Contract violations are detected via:
- Logging at boundaries
- Hash comparison
- Sequence number checks
- Signature verification

### Response

| Violation Type | Response | Recovery |
|----------------|----------|----------|
| Payload mutation | Reject + alert | Sender retry |
| Order violation | Reject + alert | Requeue |
| Silent drop | Detected via sequence gap | Manual investigation |
| Hash mismatch | Reject + alert | Source investigation |

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
