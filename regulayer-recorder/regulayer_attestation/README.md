# Regulayer Attestation Module (Phase 2.1)

This module provides the core cryptographic attestation and non-repudiation capabilities for Regulayer.

## Purpose
- **Identity Registry**: Manages trusted signing identities.
- **Ed25519 Signing**: Generates asymmetric signatures for decision events.
- **Attestation Envelope**: Wraps events with cryptographic proofs.
- **Verification**: Validates signatures and identity status offline.

## Structure
- `app/`: Core application logic.
- `tests/`: Comprehensive test suite.

## Usage
This module is intended to be used by the Regulayer SDK (for signing) and the Regulayer Recorder (for verification).
