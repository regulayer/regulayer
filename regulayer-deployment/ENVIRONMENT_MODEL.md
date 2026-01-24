# Regulayer Environment Model

## Environments

| Env | Purpose | Data | Keys |
|-----|---------|------|------|
| dev | Fast iteration | Synthetic | Dev keys |
| staging | Pre-prod testing | Anonymized | Staging keys |
| prod | Real customers | Real | Prod keys |

---

## Hard Isolation Guarantees

1. **No shared databases** — each env has own RDS
2. **No shared keys** — each env has own KMS ring
3. **No shared Redis** — each env has own cluster
4. **No proof migration** — proofs never move between envs

---

## Network Isolation

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     DEV VPC     │  │   STAGING VPC   │  │    PROD VPC     │
│   10.0.0.0/16   │  │   10.1.0.0/16   │  │   10.2.0.0/16   │
│                 │  │                 │  │                 │
│  No peering     │  │  No peering     │  │  No peering     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Promotion Path

```
Code: dev → staging → prod
Data: NEVER
Keys: NEVER
Config: Manual per-env
```

---

## Prod-Specific Rules

- `ALLOW_LEGACY_INGESTION = false`
- Strict SDK version allowlist
- Read-only export endpoints
- Enhanced logging
- No debug endpoints
