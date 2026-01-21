# Glossary

**Version:** 1.0.0

This glossary defines key terms used in Regulayer documentation. Definitions are intentionally non-technical.

---

## A

### Attestation
A cryptographic proof that a specific identity authorized a specific record. Created by signing the record with a private key.

### Append-Only
A storage model where data can only be added, never modified or deleted. Regulayer's ledger is append-only.

---

## C

### Canonicalization
The process of converting data into a standard, deterministic format before hashing. Ensures the same data always produces the same hash, regardless of formatting differences.

### Chain (Hash Chain)
A sequence of records where each record includes a reference to the hash of the previous record. Breaking any link is detectable.

---

## D

### Decision Event
The core data structure recorded by Regulayer. Contains the decision made by an AI system, along with metadata like timestamp and system name.

---

## E

### Ed25519
A modern digital signature algorithm. Used by Regulayer for attestations. Known for speed, security, and small key sizes.

---

## H

### Hash
A fixed-size "fingerprint" of data. Even a tiny change to the input produces a completely different hash. Regulayer uses SHA-256.

---

## I

### Identity
A registered signing entity in Regulayer. Each identity has a unique ID and a public/private key pair.

---

## L

### Legacy Record
A decision record that was recorded without cryptographic attestation (unsigned). Still valid for integrity verification, but lacks non-repudiation.

---

## N

### Non-Repudiation
The inability to deny having signed something. If a signature is valid, the signer cannot later claim they didn't sign it.

---

## P

### Proof Bundle
A self-contained JSON file containing everything needed to verify a single decision record offline. Includes the event, hash, signature, and public key.

---

## R

### Record Hash
The SHA-256 hash of the canonicalized decision event. Used for integrity verification.

### Revocation
The process of marking an identity as no longer trusted. Revoked identities cannot sign new records, but historical signatures remain valid.

---

## S

### SHA-256
A cryptographic hash function producing a 256-bit (64 character hex) output. Industry standard for integrity verification.

### Signature
A cryptographic value proving that a specific private key was used to authorize a specific payload.

---

## T

### Tampering
Any unauthorized modification to a record after it was stored. Detected by hash mismatches.

---

## V

### Verification
The process of checking that a record's hash and signature are valid. Can be performed offline by any party.
