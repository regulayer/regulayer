# Assurance Package Versioning Policy

**Version:** 1.0.0
**Status:** DRAFT

## 1. Specification vs Implementation

The **Regulayer Assurance Package** is versioned independently of the software components (`regulayer-recorder`, `regulayer-sdk`, etc.), but maintaining alignment is critical.

- **Major Version (X.0.0)**: Represents a fundamental change in the Trust Model or Cryptographic Guarantees (e.g., switching from Ed25519 to Dilithium, or changing the definition of "Fact"). This REQUIRES re-audit.
- **Minor Version (1.X.0)**: Adds new clarifications, threat scenarios, or operational guidance that do NOT change the underlying trust mechanics.
- **Patch Version (1.0.X)**: Fixes typos, formatting, or ambiguous phrasing.

## 2. Alignment Matrix

| Assurance Spec Version | Supported Recorder Version | Supported SDK Version | Status |
| :--- | :--- | :--- | :--- |
| **1.0.0** | 1.0.0+ | 1.0.0+ | **Current** |

## 3. Change Control
Any change to documents in `regulayer-assurance/` must be:
1.  Proposed via Pull Request.
2.  Reviewed by the Security/Assurance Lead.
3.  Approved by an External Auditor (if applicable for compliance).
4.  Merged only after approval.
