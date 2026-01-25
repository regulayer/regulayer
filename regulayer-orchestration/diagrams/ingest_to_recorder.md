# Ingest to Recorder Flow

## Trust Boundaries Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           TRUST BOUNDARY: CLIENT                            │
│  ┌──────────────┐                                                          │
│  │     SDK      │  Creates claim, adds metadata                            │
│  │              │  NO hashing, NO signing                                  │
│  └──────┬───────┘                                                          │
│         │                                                                   │
│         │ HTTPS + Auth Token                                               │
│         │ { claim_data, project_id, idempotency_key }                      │
│         ▼                                                                   │
├─────────┴──────────────────────────────────────────────────────────────────┤
│                        TRUST BOUNDARY: OPERATIONAL                          │
│                                                                             │
│  ┌──────────────┐                                                          │
│  │   Gateway    │  Auth, rate limit, validate format                       │
│  │              │  Payload is OPAQUE - no inspection                       │
│  └──────┬───────┘                                                          │
│         │                                                                   │
│         │ Internal queue message                                            │
│         │ { queue_meta, original_payload }                                  │
│         ▼                                                                   │
│  ┌──────────────┐                                                          │
│  │    Queue     │  Buffer, preserve order, retry                           │
│  │              │  Per-project partitioning                                │
│  └──────┬───────┘                                                          │
│         │                                                                   │
│         │ Ordered delivery                                                  │
│         │ Exactly same payload                                              │
│         ▼                                                                   │
├─────────┴──────────────────────────────────────────────────────────────────┤
│                       TRUST BOUNDARY: CRYPTOGRAPHIC                         │
│                          ⚠️ SENSITIVE ZONE ⚠️                               │
│                                                                             │
│  ┌──────────────┐                                                          │
│  │   Recorder   │  ONLY component that:                                    │
│  │              │    - Canonicalizes                                       │
│  │   ┌──────┐   │    - Computes hashes                                     │
│  │   │ HSM  │◄──│    - Signs attestations                                  │
│  │   └──────┘   │    - Appends to chain                                    │
│  └──────┬───────┘                                                          │
│         │                                                                   │
│         │ Committed record                                                  │
│         │ { decision, attestation, chain_position }                         │
│         ▼                                                                   │
│  ┌──────────────┐                                                          │
│  │   Storage    │  Immutable after write                                   │
│  │              │  Durable before ACK                                      │
│  └──────────────┘                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Transformation Points

```
INPUT:                    OUTPUT:
{ claim_data }            { decision with record_hash,
                            attestation with signature,
                            chain_position with previous_hash }

     │                             ▲
     │                             │
     └──────────► RECORDER ────────┘
                 (ONLY HERE)
```

## Guarantees at Each Boundary

| Transition | Guarantee |
|------------|-----------|
| Client → Gateway | Authenticated, validated |
| Gateway → Queue | Byte-for-byte, ordered |
| Queue → Recorder | At-least-once, ordered |
| Recorder → Storage | Atomic, durable |
