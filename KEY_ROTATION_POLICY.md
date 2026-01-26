# Key Rotation Policy (Recorder)

**Identity Lifecycle Management**

The `regulayer-recorder` uses a long-lived cryptographic identity (Ed25519 Keypair) to sign all records.

## Bootstrap
On first startup, if no key is found at `SIGNING_KEY_PATH`, a new key is generated. This is the **Genesis Key**.

## Rotation Logic
1.  **Manual Trigger**: Rotation is effectively a "Key Replacement".
2.  **Process**:
    - Stop recorder service.
    - Archive existing `recorder_ed25519.key` to `recorder_ed25519.key.bak.<date>`.
    - Generate/Place new key at `recorder_ed25519.key`.
    - Restart recorder.
3.  **Verification Continuity**:
    - The Verifier MUST have access to the *History of Public Keys*.
    - Proofs signed by the *Old Key* remain valid for timestamps *before* the rotation date.

## Emergency Rotation
In case of Key Compromise:
1.  Rotate Key immediately.
2.  Publish Revocation of Old Key via `regulayer-governance` or public CRL.
3.  Mark all records signed by Old Key after Compromise Date as `SUSPECT` or `INVALID`.
