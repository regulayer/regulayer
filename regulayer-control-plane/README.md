# Regulayer Control Plane

Multi-tenant SaaS control plane for Regulayer.

## Purpose

Manages organizations, projects, users, and API keys for the Regulayer SaaS platform.

## Core Principle

> **Tenancy affects access and organization — NEVER cryptographic truth.**

- Hash chains remain pure
- Proof bundles remain verifiable outside SaaS
- Tenancy is metadata + access control, not part of the proof

## Quick Start

```bash
# Install dependencies
pip install -e .

# Run the service
uvicorn app.api:app --host 0.0.0.0 --port 8100
```

## API Endpoints

### Organizations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/orgs` | Create organization |
| GET | `/v1/orgs/{id}` | Get organization |
| GET | `/v1/orgs` | List organizations |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/orgs/{id}/projects` | Create project |
| GET | `/v1/projects/{id}` | Get project |
| GET | `/v1/orgs/{id}/projects` | List org projects |

### API Keys
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/projects/{id}/keys` | Create API key |
| GET | `/v1/projects/{id}/keys` | List project keys |
| POST | `/v1/keys/{id}/revoke` | Revoke key |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/me` | Get current context |
| POST | `/v1/auth/validate` | Validate API key |

## Data Model

```
Organization (tenant)
  └── Projects
       └── API Keys
           └── Scopes: [ingest, verify, export, governance]
```

## Integration with Other Services

Other Regulayer services validate API keys via:

```http
POST /v1/auth/validate
Content-Type: application/json

{"api_key": "rl_..."}
```

Response:
```json
{
  "valid": true,
  "organization_id": "...",
  "project_id": "...",
  "scopes": ["ingest", "verify"]
}
```
