# Regulayer Decision Recorder

**Authoritative Backend Service - Converts SDK Claims into Immutable Facts**

## Overview

The Decision Recorder is a single-service, append-only backend that receives decision events from the Regulayer SDK, validates authenticity and integrity, and stores them as immutable, cryptographically-chained records.

**Core Principle:** SDK sends claims. Decision Recorder produces facts.

## Architecture

- **Single Service**: One responsibility - record truth
- **Append-Only Storage**: PostgreSQL with INSERT-only permissions
- **Hash Chaining**: Each record links to previous via SHA-256 hashes
- **No Business Logic**: Pure forensics, not governance

## Features

✅ Schema & semantic validation  
✅ Signature verification (HMAC-SHA256, abstracted for future asymmetric)  
✅ Canonical normalization (deterministic serialization)  
✅ Cryptographic hash chaining  
✅ Append-only storage with immutability enforcement  
✅ Duplicate & replay detection  
✅ Full chain integrity verification  
✅ Tamper detection  

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Start services
docker-compose up -d

# Check health
curl http://localhost:8000/health

# View logs
docker-compose logs -f recorder
```

### Manual Setup

```bash
# 1. Install dependencies
pip install -e .

# 2. Set up PostgreSQL
createdb regulayer_recorder

# 3. Configure environment
cp .env.example .env
# Edit .env with your configuration

# 4. Run migrations (if using Alembic)
alembic upgrade head

#5. Start server
python -m uvicorn app.main:app --reload
```

## API Reference

### POST /v1/decisions

Ingest a decision event from SDK.

**Headers:**
- `X-Regulayer-Signature`: Event signature (HMAC-SHA256 hex)
- `X-Regulayer-Algorithm`: Signature algorithm (must be "HMAC-SHA256")
- `X-Regulayer-SDK-Version`: SDK version (e.g., "1.0.0")

**Body:** `DecisionEvent` (JSON)

**Responses:**
- `201 Created` → Accepted & recorded
  ```json
  {
    "record_id": 12345,
    "decision_id": "uuid",
    "record_hash": "sha256...",
    "server_timestamp": "2024-01-20T10:30:00Z"
  }
  ```
- `400 Bad Request` → Schema violation
- `401 Unauthorized` → Signature invalid
- `409 Conflict` → Duplicate decision_id
- `422 Unprocessable Entity` → Semantic inconsistency

### GET /health

Health check endpoint.

**Responses:**
- `200 OK` → Service healthy, ingestion safe
  ```json
  {
    "status": "healthy",
    "database_reachable": true,
    "chain_writable": true,
    "last_record_timestamp": "2024-01-20T10:30:00Z",
    "total_records": 12345
  }
  ```
- `503 Service Unavailable` → Service degraded, ingestion must halt

### GET /metrics

Basic service metrics.

```json
{
  "total_records": 12345,
  "chain_id": "global",
  "last_record_timestamp": "2024-01-20T10:30:00Z",
  "last_record_id": 12345
}
```

## Configuration

All configuration via environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `HMAC_SECRET_KEY` | Yes | - | HMAC signing secret (≥32 chars) |
| `LOG_LEVEL` | No | `INFO` | Logging level |
| `ALLOWED_SDK_VERSIONS` | No | `1.0.0` | Comma-separated allowed SDK versions |
| `MAX_TIMESTAMP_DRIFT_SECONDS` | No | `300` | Max acceptable timestamp drift (5 min) |
| `CHAIN_ID` | No | `global` | Chain identifier (constant in Phase 1) |
| `HOST` | No | `0.0.0.0` | Server host |
| `PORT` | No | `8000` | Server port |

## Database Schema

```sql
CREATE TABLE decisions (
    record_id BIGSERIAL PRIMARY KEY,
    decision_id UUID UNIQUE NOT NULL,
    record_hash VARCHAR(64) NOT NULL UNIQUE,
    previous_record_hash VARCHAR(64),
    canonical_payload JSONB NOT NULL,
    canonical_payload_hash VARCHAR(64) NOT NULL UNIQUE,
    chain_id VARCHAR(50) NOT NULL DEFAULT 'global',
    server_timestamp TIMESTAMPTZ NOT NULL,
    sdk_instance_id UUID NOT NULL,
    system_name VARCHAR(255) NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    event_state VARCHAR(20) NOT NULL,
    sdk_version VARCHAR(50) NOT NULL
);
```

**Immutability:** INSERT-only permissions, UPDATE/DELETE blocked at DB level.

**Monotonic Ordering:** `record_id` ordering MUST match hash-chain order.

## Hash Chaining

Each record contains:
- `record_hash`: SHA-256 of canonical_payload
- `previous_record_hash`: Links to previous record

**First record:** `previous_record_hash = NULL`  
**Subsequent records:** `previous_record_hash = previous_record.record_hash`

This makes tampering detectable forever.

## Security

- ✅ TLS enforced (HTTPS only)
- ✅ Secrets from environment variables
- ✅ No sensitive data logged
- ✅ No stack traces in responses
- ✅ Prepared statements (SQL injection prevention)
- ✅ Constant-time signature comparison

## Verification

The service includes a verification engine that can:
- Verify full chain integrity
- Spot-verify specific decisions
- Detect:  
  - Tampered payloads
  - Broken chain links
  - Missing records

**Can be run offline and deterministically.**

## Production Deployment

1. **Use strong secrets**: HMAC key ≥32 characters
2. **Enable TLS**: Configure PostgreSQL with SSL
3. **Set DB permissions**: Grant INSERT-only to app user
4. **Monitor health endpoint**: Alert on `503` responses
5. **Regular chain verification**: Run integrity checks periodically
6. **Backup database**: Maintain immutable backup strategy

##Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests (when implemented)
pytest tests/ -v

# Run with auto-reload
uvicorn app.main:app --reload
```

## Project Structure

```
regulayer-recorder/
├── app/
│   ├── main.py              # FastAPI application
│   ├── api.py               # HTTP ingestion endpoint
│   ├── config.py            # Configuration
│   ├── models.py            # Pydantic schemas
│   ├── errors.py            # Error taxonomy
│   ├── validator.py         # Validation logic
│   ├── signer.py            # Signature verification
│   ├── canonicalizer.py     # Canonical normalization
│   ├── hasher.py            # Hashing & chain computation
│   ├── recorder.py          # Append-only write logic
│   ├── storage.py           # PostgreSQL abstraction
│   └── verifier.py          # Chain verification
├── tests/
├── migrations/
├── pyproject.toml
├── Dockerfile
├── docker-compose.yml
├── README.md
└── SECURITY.md
```

## License

MIT License - see LICENSE file

## Support

For issues or questions:
- GitHub Issues: [https://github.com/Zor-AI/regulayer](https://github.com/Zor-AI/regulayer)
- Email: support@regulayer.io

---

**This is the reason Regulayer exists. Get this right, everything else becomes possible.**
