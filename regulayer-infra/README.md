# Regulayer Infrastructure

Production-grade deployment infrastructure for Regulayer SaaS.

## Core Principle

> **Deployment must not weaken verifiability.**

## Modules

### Secrets Management (`secrets.py`)
- Load keys from environment or KMS
- Support AWS, GCP, Azure, Vault
- No keys in code, DB, or logs

### Key Rotation (`key_rotation.py`)
- Rotate keys without breaking history
- Track key versions and status
- Support revocation for incidents

### Environment Isolation (`environments.py`)
- Dev / Staging / Prod separation
- Environment-scoped configuration
- Guards against cross-env leakage

### Tenant Isolation (`tenant_isolation.py`)
- Application-layer isolation enforcement
- Row-level security (PostgreSQL RLS)
- Violation detection and audit

### Observability (`metrics.py`)
- Operational metrics (no sensitive data)
- Prometheus-compatible export
- Alert condition checking

### System API (`api.py`)
- `/v1/system/health` - Health check
- `/v1/system/version` - Version info
- `/v1/system/keys/status` - Key metadata (not keys!)
- `/v1/system/metrics` - Safe metrics

## Quick Start

```bash
# Set environment
export REGULAYER_ENV=prod
export REGULAYER_SIGNING_KEY=<base64-encoded-key>
export REGULAYER_HMAC_KEY=<base64-encoded-key>

# Run
uvicorn app.api:app --host 0.0.0.0 --port 8300
```

## Deployment

```bash
cd deploy
docker-compose up -d
```

## Security Notes

- Recorder is single-writer (chain integrity)
- All services are stateless
- Secrets loaded at startup only
- Proof verifier works offline (no infra dependency)
