# Operational & Compliance Boundaries

**Version:** 1.0.0
**Status:** DRAFT

## 1. Introduction

Cryptography cannot solve operational failures. This document defines the **Operational Contract**: the set of assumptions and requirements that the deploying organization MUST satisfy for Regulayer's guarantees to hold valid.

## 2. Key Management Assumptions

Regulayer verifies signatures but does not store or manage private keys.

| Assumption | Requirement |
| :--- | :--- |
| **Private Key Secrecy** | The system operator MUST ensure that the Ed25519 private keys used by SDKs are stored securely (e.g., in HSMs, Vault, or secure environment variables) and are never exposed to unauthorized personnel. |
| **Registry Integrity** | The system operator MUST ensure that the Identity Registry (the source of `IdentityID -> PublicKey` mapping) is tamper-proof. If an attacker can overwrite the public key for an identity, they can impersonate it. |
| **Rotation & Revocation** | The system operator MUST have a process to rotate keys and signal revocation to the Regulayer Recorder immediately upon suspected compromise. |

> **Implication**: If an attacker steals a private key and the key is not revoked, Regulayer will correctly validate the signature and treat the fraudulent event as a Fact. This is an operational failure, not a system failure.

## 3. Deployment Assumptions

| Assumption | Requirement |
| :--- | :--- |
| **Transport Security** | All traffic between the SDK and Recorder MUST be encrypted via TLS 1.2+ to prevent Man-in-the-Middle attacks. Regulayer does not implement application-layer encryption for the transit channel. |
| **Database Security** | The PostgreSQL database holding the `decision_records` table MUST rely on the Recorder for all writes. No other user/service should have `INSERT`/`UPDATE` permissions on the ledger table. |
| **Read-Only Roles** | The Verifier UI and Auditors MUST access the database via a strictly read-only user/role to prevent accidental manipulation during verification steps. |
| **Time Synchronization** | The Recorder host MUST be synchronized with reliable NTP sources. Significant clock drift can cause discrepancies in the `server_timestamp` that may confuse auditors. |

## 4. Compliance Mapping

Regulayer is designed to support specific compliance artifacts.

| Requirement | Regulayer capability | Limitations |
| :--- | :--- | :--- |
| **Non-Repudiation** | Provides cryptographic proof of authorship. | Depends on key secrecy. |
| **Audit Trail** | Provides immutable, ordered log of decisions. | Does not validate external truth. |
| **Tamper Evidence** | Provides hash-chain verification. | Requires independent verification tool (UI or CLI). |
| **Record Retention** | Database is persistent and append-only. | Data backups are an operational responsibility. |

## 5. Liability Boundary

**Regulayer is an Evidence Recorder, not a Judge.**
- We do not certify the quality of the AI model.
- We do not certify the correctness of the input data.
- We do not certify the security of the SDK host environment.

Our liability is strictly limited to the **integrity of the record** once it has been accepted by the Recorder.
