# Trust Boundaries

## Layered Trust Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TRUST BOUNDARY DIAGRAM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                     UNTRUSTED ZONE (External)                            ││
│  │                                                                          ││
│  │   ┌──────────┐   ┌──────────┐   ┌──────────┐                            ││
│  │   │ SDK/API  │   │  Client  │   │ Third    │                            ││
│  │   │ Clients  │   │  Apps    │   │ Parties  │                            ││
│  │   └──────────┘   └──────────┘   └──────────┘                            ││
│  │                                                                          ││
│  └──────────────────────────────┬──────────────────────────────────────────┘│
│                                 │ Authentication boundary                    │
│  ┌──────────────────────────────▼──────────────────────────────────────────┐│
│  │                     OPERATIONAL ZONE                                     ││
│  │                     (No cryptographic authority)                         ││
│  │                                                                          ││
│  │   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐            ││
│  │   │ Gateway  │   │  Queue   │   │   UI     │   │ Billing  │            ││
│  │   │          │   │          │   │          │   │          │            ││
│  │   │ Controls:│   │ Controls:│   │ Controls:│   │ Controls:│            ││
│  │   │ • Auth   │   │ • Buffer │   │ • Display│   │ • Payment│            ││
│  │   │ • Rate   │   │ • Order  │   │ • Filter │   │ • Quota  │            ││
│  │   │ • Route  │   │ • Retry  │   │ • Navigate│   │ • Plans │            ││
│  │   └──────────┘   └──────────┘   └──────────┘   └──────────┘            ││
│  │                                                                          ││
│  │   CAN: Route, filter, limit, bill                                       ││
│  │   CANNOT: Hash, sign, verify, modify chain                              ││
│  │                                                                          ││
│  └──────────────────────────────┬──────────────────────────────────────────┘│
│                                 │ Cryptographic boundary                     │
│  ┌──────────────────────────────▼──────────────────────────────────────────┐│
│  │                     CRYPTOGRAPHIC ZONE                                   ││
│  │                     ⚠️ HIGHEST TRUST ⚠️                                  ││
│  │                                                                          ││
│  │   ┌──────────────────────────────────────────────────────┐              ││
│  │   │                    RECORDER                           │              ││
│  │   │                                                       │              ││
│  │   │   ┌─────────┐   ┌─────────┐   ┌─────────┐            │              ││
│  │   │   │ Canon-  │   │  Hash   │   │  Sign   │            │              ││
│  │   │   │ icalize │ → │ SHA-256 │ → │ Ed25519 │            │              ││
│  │   │   └─────────┘   └─────────┘   └─────────┘            │              ││
│  │   │                        │                              │              ││
│  │   │                        ▼                              │              ││
│  │   │            ┌─────────────────────┐                   │              ││
│  │   │            │    Chain Append     │                   │              ││
│  │   │            │  (sequence + link)  │                   │              ││
│  │   │            └─────────────────────┘                   │              ││
│  │   │                                                       │              ││
│  │   └──────────────────────────────────────────────────────┘              ││
│  │                                                                          ││
│  │   CAN: Create cryptographic truth                                       ││
│  │   CANNOT: Enforce business rules                                        ││
│  │                                                                          ││
│  └──────────────────────────────┬──────────────────────────────────────────┘│
│                                 │ Immutability boundary                      │
│  ┌──────────────────────────────▼──────────────────────────────────────────┐│
│  │                     STORAGE ZONE                                         ││
│  │                                                                          ││
│  │   ┌──────────────────────────────────────────────────────┐              ││
│  │   │              IMMUTABLE STORAGE                        │              ││
│  │   │                                                       │              ││
│  │   │   Records written once, never modified                │              ││
│  │   │   Verifiable by cryptographic chain                   │              ││
│  │   │   Replication preserves bit-for-bit                   │              ││
│  │   │                                                       │              ││
│  │   └──────────────────────────────────────────────────────┘              ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  GOVERNANCE OVERLAY (Separate, Non-Cryptographic)                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │   Sits BESIDE cryptographic zone, never INSIDE                          ││
│  │                                                                          ││
│  │   ┌──────────┐                                                          ││
│  │   │Governance│ CAN: Annotate, review, hide                              ││
│  │   │  Overlay │ CANNOT: Modify hashes, signatures, chain                 ││
│  │   └──────────┘                                                          ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Boundary Violations

```
DETECTED BY CRYPTOGRAPHIC VERIFICATION:

  ┌───────────────────────────────────────────────────────────────┐
  │                                                                │
  │  If ANY layer modifies cryptographic content:                 │
  │                                                                │
  │    1. Hash verification FAILS                                 │
  │    2. Signature verification FAILS                            │
  │    3. Chain verification FAILS                                │
  │                                                                │
  │  This is AUTOMATIC and MATHEMATICAL.                          │
  │  No human intervention needed to detect violations.           │
  │                                                                │
  └───────────────────────────────────────────────────────────────┘
```

## Key Insight

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  OPERATIONAL layers have POWER (access, billing, visibility)    │
│  but NO AUTHORITY over truth.                                   │
│                                                                  │
│  CRYPTOGRAPHIC layer has AUTHORITY (creates truth)              │
│  but NO POWER over operations.                                  │
│                                                                  │
│  This separation is what enables regulatory trust.              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
