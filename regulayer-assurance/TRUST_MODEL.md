# Trust Model Specification

**Version:** 1.0.0
**Status:** DRAFT

## 1. Introduction

This document formally defines the trust model of the Regulayer system. It specifies what the system trusts, when that trust is established, and the boundaries of that trust. This model serves as the authoritative reference for auditors and security architects.

## 2. System Roles

We define five distinct, non-overlapping roles within the ecosystem.

| Role | Responsibility | Trust Level |
| :--- | :--- | :--- |
| **SDK (Claim Producer)** | Generates decision events and requests ingestion. | **Untrusted**. The SDK is software running in an uncontrolled environment. It can be manipulated, mocked, or bypassed. |
| **Attestation Identity (Signer)** | Cryptographically signs the event payload using a private key (Ed25519). | **Conditionally Trusted**. The identity is trusted only if the signature is valid and the identity is not revoked at the time of signing. |
| **Recorder (Fact Authority)** | Validates signatures, enforces revocation, timestamps, and commits events to the immutable ledger. | **Trusted Authority**. The recorder is the gatekeeper. Once a record is accepted by the recorder, it is considered a "Fact". |
| **Verification UI (Observer)** | visualizing records, verifying hashes, and checking signatures against the immutable ledger. | **Read-Only / Dependent**. The UI creates no trust; it only verifies existing proofs. It relies on the Recorder's database. |
| **Auditor (Verifier)** | Independent human or system that reviews the export bundles and cryptographic proofs. | **Verifier**. The ultimate consumer of the trust model. |

> **CRITICAL**: The SDK is *never* a source of truth. It is merely a "claim producer". Truth is established only when the Recorder validates and timestamps the claim.

## 3. The Claim → Fact Transition

Trust is not binary; it is a state transition. Regulayer enforces a strict pipeline for establishing trust.

| Stage | Status | Description | Trust Level |
| :--- | :--- | :--- | :--- |
| **1. Event Creation** | `Claim` | SDK generates a JSON payload. | **None** (Untrusted Data) |
| **2. Signing** | `Signed Claim` | Identity signs the payload. | **Authentication** (We know WHO produced the untrusted data) |
| **3. Ingestion Guard** | `Validated Claim` | Recorder verifies signature & checks revocation. | **Authorized** (The signer was allowed to speak) |
| **4. Commitment** | `Fact` | Recorder writes to DB with Server Timestamp. | **Trusted** (System of Record) |
| **5. Hashing** | `Chained Fact` | Record is hash-linked to previous record. | **Tamper-Evident** (Immutable Sequence) |
| **6. Verification** | `Proof` | Auditor re-computes hashes/signatures from Export. | **Verified** (External Attestation) |

### Rejection Policy
Any claim that fails Stage 3 (Ingestion Guard) is **permanently rejected**.
- **Invalid Signature**: 401 Unauthorized.
- **Revoked Identity**: 401 Unauthorized.
- **Malformed Payload**: 400 Bad Request.

Regulayer does *not* attempt to "fix" or "sanitize" invalid claims. They are dropped to preserve the integrity of the system.

## 4. Trust Invariants

These are non-negotiable properties of the system. If any of these are violated, the system is compromised.

1.  **Immutability of Facts**: Once a decision is recorded and acknowledged (201 Created), its content, timestamp, and signature can never be modified without breaking the cryptographic hash chain.
2.  **Revocation Effectiveness**: An identity that is revoked cannot successfully commit new records after the revocation signal is processed by the Recorder.
3.  **No Retroactive Invalidation**: Revoking an identity *does not* invalidate records created and signed *before* the revocation time (unless explicitly marked as a key compromise event in an external audit log, which is outside the scope of the ledger functionality).
4.  **Global Ordering**: All records are strictly ordered by `record_id` and hash-linked. No branching or inserting history is possible.
5.  **Observer Integrity**: The Verification UI is strictly read-only. It cannot create, modify, or annotated records.

## 5. Explicit Non-Claims

To protect legal and compliance standing, Regulayer explicitly **DOES NOT** claim:

- **AI Correctness**: We prove *what* the AI decided, not whether the decision was "correct" or "fair".
- **Input Validity**: We prove the input *provided* to the SDK was signed, not that the input was factually true in the real world (Oracle Problem).
- **Identity Security**: We trust the *signature*, but we cannot technically prove the private key wasn't stolen (unless revocation occurs).
