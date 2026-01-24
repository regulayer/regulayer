# Regulayer Deployment Modes

This module defines customer isolation and deployment configurations.

## Core Principle (Non-Negotiable)

**Deployment affects where services run — never what is provable.**

A proof exported from:
- Shared SaaS
- Dedicated VPC
- On-prem recorder

must verify identically with the same offline tool.

## Supported Modes

| Mode | Description | Buyer Type |
|------|-------------|------------|
| `saas_shared` | Multi-tenant cloud | Startups, mid-market |
| `dedicated_vpc` | Single-tenant cloud | Banks, enterprises |
| `hybrid` | SaaS control + private recorder | Regulated orgs |
| `on_prem_verify` | Offline-only verification | Courts, regulators |

## Architecture

```
           ┌───────────────────────┐
           │   Control Plane        │
           │  (Identity, Billing)   │
           └─────────┬─────────────┘
                     │
      ┌──────────────┴───────────────┐
      │                               │
┌─────▼─────┐                   ┌─────▼─────┐
│ SaaS Stack│                   │ Dedicated  │
│ (Shared)  │                   │ VPC Stack  │
└───────────┘                   └───────────┘

        Proof Export → Offline Verifier (Always)
```

## Files

| File | Purpose |
|------|---------|
| `modes.py` | Deployment mode definitions |
| `constraints.py` | Per-mode feature constraints |
| `validation.py` | Configuration validation |

## Trust Guarantees

These are **identical across all deployment modes**:

- Proof format: identical
- Verification algorithm: identical
- Offline verification: always available
- Regulayer cannot forge proofs
- Customer cannot forge proofs
- Tampering is detectable

## Usage

```python
from regulayer_deployment_modes.modes import DeploymentMode
from regulayer_deployment_modes.validation import ControlPlaneEnforcer

enforcer = ControlPlaneEnforcer(DeploymentMode.DEDICATED_VPC)

if enforcer.can_ingest():
    # Process ingestion
    pass

# Trust statement for documentation
statement = enforcer.get_trust_statement()
```

## Important Notes

1. **Never say "compliant"** — only "supports"
2. **Proofs are identical** across all modes
3. **Offline verification always works**
4. **Customer cannot forge** (even in Hybrid mode)
5. **Regulayer cannot forge** (cryptographic guarantee)
