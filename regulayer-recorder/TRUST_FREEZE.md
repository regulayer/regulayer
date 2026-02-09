# Trust Freeze: Regulayer V1 Cryptographic Hardening

> **STATUS: FROZEN (v1)**
> **EFFECTIVE DATE: 2024-02-09**

This document certifies the immutable cryptographic standards for Regulayer Decision Recorder v1. 
Any change to these parameters constitutes a BREAKING CHANGE requiring a new major version (v2).

## 1. Hash Algorithm
- **Algorithm**: SHA-256
- **Implementation**: Python `hashlib.sha256(canonical_bytes).hexdigest()`
- **Canonicalization**:
  - JSON keys sorted alphabetically (`sort_keys=True`)
  - No whitespace (`separators=(',', ':')`)
  - UTF-8 encoding
  - ISO 8601 UTC timestamps

## 2. Signature Scheme
- **Algorithm**: Ed25519 (EdDSA)
- **Library**: `pynacl` (libsodium binding) or `cryptography`
- **Key Format**: Hex-encoded 32-byte public key
- **Signature Format**: Hex-encoded 64-byte signature

## 3. Chain Integrity
- **Genesis Block**: `previous_record_hash` IS NULL.
- **Linkage**: `Record[N].previous_record_hash === Record[N-1].record_hash`
- **Immutability**: Database `UPDATE` and `DELETE` are structurally disabled.

## 4. Evidence Bundle (v1.0.0)
- **Schema**: Fixed.
- **Verification**: Self-contained. Requires no online access to verify (contains public key).
- **Governance Overlay**: Non-cryptographic attachment. Does NOT affect the signature.

## 5. Trust Anchors
- **Endpoint**: `GET /v1/recorder/keys`
- **Rotation**: Keys may rotate, but algorithm MUST remain Ed25519 for v1.
