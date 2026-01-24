# Regulayer Status Service

Public system status and health monitoring.

## Core Principle

> **Operational failures must never create cryptographic ambiguity.**

## API

### System Status
```
GET /v1/status
```

Response:
```json
{
  "status": "OPERATIONAL",
  "components": {
    "ingestion": "operational",
    "recorder": "operational",
    "verification": "operational"
  },
  "last_updated": "2026-01-24T10:32:00Z"
}
```

### Error Codes
```
GET /v1/error-codes
```

## Status Levels

| Status | Meaning |
|--------|---------|
| OPERATIONAL | All systems normal |
| DEGRADED | Reduced performance |
| PARTIAL_OUTAGE | Some components down |
| MAJOR_OUTAGE | Critical failure |

## Error Taxonomy

| Code | Description |
|------|-------------|
| INGEST_RATE_LIMITED | Too many requests |
| INGEST_QUOTA_EXCEEDED | Daily limit reached |
| RECORDER_UNAVAILABLE | Temporary outage |
| ATTESTATION_INVALID | Signature rejected |

## Important

Status shows **operational health**, not cryptographic validity. Outages don't affect proof verification.
