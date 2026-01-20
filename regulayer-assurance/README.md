# Regulayer Assurance Package

**Specification Version:** 1.0.0

This directory contains the **Formal Trust, Threat & Assurance Specifications** for the Regulayer ecosystem. These documents define the "Rules of the Road" for auditors, regulators, and security architects.

They are authoritative. If the code contradicts these documents, it is a critical bug.

## 📚 Document Index

| Document | Purpose | Target Audience |
| :--- | :--- | :--- |
| [**TRUST_MODEL.md**](./TRUST_MODEL.md) | Defines system roles, trust transitions, and non-negotiable invariants. | Auditors, Architects |
| [**THREAT_MODEL.md**](./THREAT_MODEL.md) | Enumerates threat actors and the specific controls used to mitigate them. | Security Engineers, Pentesters |
| [**CRYPTOGRAPHIC_GUARANTEES.md**](./CRYPTOGRAPHIC_GUARANTEES.md) | Mathematical definition of integrity, non-repudiation, and ordering. | Cryptographers, Auditors |
| [**OPERATIONAL_ASSUMPTIONS.md**](./OPERATIONAL_ASSUMPTIONS.md) | Requirements for the deployment environment (Keys, TLS, DB) to maintain trust. | DevOps, SREs |
| [**VERSIONING_POLICY.md**](./VERSIONING_POLICY.md) | Defines how these specifications are versioned and aligned with software releases. | Project Managers |

## 🛡️ Core Guarantee
Regulayer guarantees that **once a decision is recorded, it cannot be secretly altered or forged.**

We do **not** guarantee the correctness of the AI model itself, only the integrity of its audit trail.
