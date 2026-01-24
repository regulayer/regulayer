# Regulayer Trust Boundaries

## What Regulayer IS

- A decision logging service
- An immutable record store
- A cryptographic hash chain
- A proof generation system
- An audit evidence platform

## What Regulayer IS NOT

- An AI system
- A decision-maker
- A compliance certifier
- A regulator
- A legal advisor

---

## Trust Claims We Make

| Claim | Evidence |
|-------|----------|
| Records are immutable | Hash chain, append-only DB |
| Records are ordered | Sequence numbers, prev_hash |
| Records are attested | Ed25519 signatures |
| Proofs work offline | Self-contained bundles |

## Trust Claims We DO NOT Make

| Non-Claim | Why |
|-----------|-----|
| Your AI is correct | We log, we don't evaluate |
| You are compliant | Compliance requires more than logging |
| Regulators will accept proofs | Jurisdiction-dependent |
| Proofs are legally binding | Depends on context |

---

## Boundary Language

When communicating about Regulayer, use:

✅ **"Supports"** not "guarantees"
✅ **"Evidence of"** not "proof of compliance"
✅ **"Captures"** not "certifies"
✅ **"Auditors can verify"** not "auditors approve"

---

## What Survives

Even if:
- Regulayer shuts down → Proofs verify offline
- Payment lapses → Existing proofs valid
- Key rotates → Old signatures still verify

---

## Customer Responsibility

Customers must:
- Understand their regulatory requirements
- Decide what to log
- Interpret proof significance
- Engage their own legal counsel
