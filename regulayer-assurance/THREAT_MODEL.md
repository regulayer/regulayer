# Threat Model & Security Assumptions

**Version:** 1.0.0
**Status:** DRAFT

## 1. Introduction

This document outlines the threat landscape for Regulayer. It defines the adversaries we defend against, the specific threats we mitigate, and the explicit boundaries of our defense. This ensures auditors understand what risks are managed by the system.

## 2. Threat Actors

We consider the following adversaries in our design:

| Actor | Motivation | Capabilities |
| :--- | :--- | :--- |
| **Malicious SDK User** | Falsify audit trails to hide non-compliance or inject false success signals. | Can manipulate SDK inputs, mock local time, and withhold events. CANNOT produce valid signatures for other identities. |
| **Compromised Identity** | An attacker who steals a valid signing key. | Can sign arbitrary payloads as the stolen identity. Mitigated via **Revocation**. |
| **Insider (DB Admin)** | Alter historical records to cover up an incident. | Direct access to the database. Mitigated via **Hash Chaining** (tampering breaks the chain). |
| **Network Attacker** | Intercept or modify traffic between SDK and Recorder. | Man-in-the-Middle (MitM). Mitigated via **TLS** (Transport) and **Ed25519 Signatures** (Payload Integrity). |
| **UI User / Auditor** | Manipulate the verification view to hide a failure. | Browser-based manipulation. Mitigated via **Client-Side Verification** (UI re-computes hashes locally). |

## 3. Threats Prevented

Regulayer implements specific controls to neutralize these threats.

| Threat | Description | Control / Mitigation |
| :--- | :--- | :--- |
| **Event Tampering (Transit)** | Modifying a decision while it travels to the recorder. | **Signature Verification**: The signature covers the entire canonical payload. Any bit-flip invalidates it. |
| **Signature Forgery** | Creating a fake signature for a trusted identity. | **Ed25519 Algorithm**: Computationally infeasible to forge without the private key. |
| **Identity Masquerading** | Using a stolen key to sign new events. | **Revocation Enforcement**: The Recorder rejects signatures from identities marked as `revoked`. |
| **Replay Attacks** | Resending a valid historical event to duplicate it. | **Uniqueness Constraint**: The Recorder enforces unique `decision_id` and checks for duplicate payload hashes. |
| **Post-Fact Mutation** | Altering a record *after* it has been stored (e.g., changing "Failed" to "Passed"). | **Hash Chaining**: Each record includes the hash of the previous record. Testing verification reveals the break immediately. |
| **History Insertion** | Inserting a backdated record into the past. | **Linear Chaining**: You cannot insert a record without re-hashing all subsequent records, which changes the `head` hash. |
| **UI Manipulation** | Modifying HTML to show "Green" badge on failed record. | **Exportable Proofs**: The ultimate verification is the offline JSON bundle, which can be checked by independent CLI tools, bypassing the UI entirely. |

## 4. Explicit Non-Goals

The following threats are **OUT OF SCOPE** for Regulayer. We rely on operational controls to manage these risks.

### 4.1. The "Oracle Problem"
Regulayer guarantees that the *signed data* has not changed. It **does not** guarantee that the data itself is true.
- If a corrupted AI model outputs "2+2=5", Regulayer will faithfully record "2+2=5".
- **Mitigation**: This is an AI Governance issue, not a ledger issue.

### 4.2. Private Key Protection
Regulayer does not manage the internal security of the SDK host.
- If a server's file system is compromised and the `private.pem` is stolen, the attacker can sign as that identity.
- **Mitigation**: Operational security (Section 4 in Assurance Package) and Revocation.

### 4.3. Denial of Service (DoS)
While we produce lightweight 400 errors, the Recorder is not a DDoS mitigation appliance.
- **Mitigation**: Upstream WAF/API Gateway.

## 5. Security Critical Assumptions
1.  **Transport Security**: All communication occurs over TLS 1.2+.
2.  **Clock Synchronization**: The Recorder's clock is synchronized via NTP.
3.  **Identity Registry**: The mapping of `IdentityID -> PublicKey` is trusted and managed securely.
