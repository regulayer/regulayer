Regulayer Trust Verification Kit
Version: 1.0.2
Date: 2026-02-12

This kit contains everything you need to verify Regulayer decision proofs offline.

CONTENTS
--------
1. offline_verifier.py  - Standalone Python script to verify .json proof bundles.
2. root_keys.json       - Snapshot of Regulayer's root public keys (Top-level trust anchors).

PREREQUISITES
-------------
1. Python 3.8+
2. Cryptography library:
   pip install cryptography

USAGE
-----
1. Export a proof bundle from the Regulayer Dashboard (e.g. proof_123.json).
2. Run the verifier:
   python offline_verifier.py proof_123.json

VERIFICATION LOGIC
------------------
The script checks:
1. Canonicalization: Re-serializes the event data to ensure it matches the layout used for hashing.
2. Integrity: Re-computes the SHA-256 hash of the canonical data and matches it against the record.
3. Authenticity: Verifies the Ed25519 signature using the public key embedded in the attestation.

TRUST ANCHORING
---------------
For maximum security, compare the "public_key" in your proof bundle with the keys listed in "root_keys.json".
In a real shutdown scenario, the final root hash would be published to Ethereum.

LICENSE
-------
MIT License. You are free to fork, modify, and use this verification logic forever.
