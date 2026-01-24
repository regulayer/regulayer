# Regulayer Billing

Commercial enforcement for Regulayer SaaS.

## Core Principle

> **Money controls access, never facts.**
> **Billing lives above ingestion, never inside it.**

## Architecture

Billing observes and limits — it NEVER alters payloads or crypto.

## Plans

| Plan | Projects | Decisions/Day | Attestation | Price |
|------|----------|---------------|-------------|-------|
| Free | 1 | 1,000 | ❌ | $0 |
| Pro | 5 | 100,000 | ✅ | $299/mo |
| Enterprise | Unlimited | Unlimited | ✅ | Custom |

## What Gets Metered

✅ Decisions ingested
✅ Attested decisions
✅ Proof exports
✅ Governance actions

❌ Never: Hash verification, offline proof verification, internal audits

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/plans` | List plans |
| GET | `/v1/usage/{org_id}` | Get usage |
| GET | `/v1/limits/check/decision` | Check quota |
| POST | `/v1/subscriptions` | Create subscription |
| POST | `/v1/webhooks/stripe` | Stripe events |

## Enforcement Points

| Location | Action |
|----------|--------|
| Gateway | Reject over quota → 429 |
| Control Plane | Prevent new keys if unpaid |
| Recorder | ❌ NEVER sees billing |

## Critical Guarantee

> **Stripe failures do NOT affect existing proofs.**
> **Frozen orgs can still export evidence.**
