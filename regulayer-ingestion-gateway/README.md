# Regulayer Ingestion Gateway

Public SaaS entry point for decision ingestion.

## Purpose

This gateway sits between the internet and the Decision Recorder:

```
SDK / Client
   ↓
Ingestion Gateway (this service)
   ↓
Decision Recorder (cryptographic core)
```

**The Recorder is NEVER exposed directly to the internet.**

## Core Guarantees

- ✅ Authenticates API keys
- ✅ Enforces rate limits
- ✅ Enforces quotas
- ✅ Injects tenant context
- ✅ Forwards payload byte-for-byte
- ❌ No hashing
- ❌ No canonicalization
- ❌ No signature verification

## Quick Start

```bash
pip install -e .
uvicorn app.main:app --host 0.0.0.0 --port 8400
```

## API

### Ingest Decision
```
POST /v1/ingest/decision

Headers:
  X-Regulayer-Api-Key: rl_xxx...
  X-Regulayer-Project-Id: <optional>
  Content-Type: application/json

Body: <decision payload>
```

### Quota Status
```
GET /v1/quota/status

Headers:
  X-Regulayer-Api-Key: rl_xxx...
```

## Error Responses

| Code | Error | Cause |
|------|-------|-------|
| 401 | UNAUTHORIZED | Invalid/missing API key |
| 403 | FORBIDDEN | Key lacks 'ingest' scope |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 429 | QUOTA_EXCEEDED | Daily limit reached |
| 502 | FORWARDING_ERROR | Recorder unavailable |

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| GATEWAY_CONTROL_PLANE_URL | http://localhost:8100 | Control Plane URL |
| GATEWAY_RECORDER_URL | http://localhost:8000 | Recorder URL |
| GATEWAY_DEFAULT_RATE_LIMIT | 100 | Requests/minute |
| GATEWAY_DEFAULT_DAILY_QUOTA | 10000 | Decisions/day |
