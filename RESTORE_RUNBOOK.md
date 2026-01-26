# Restore Runbook

**Procedure for Restoring the Recorder**

This runbook defines how to restore the Regulayer Recorder from backup while preserving trust continuity.

## Prerequisites
- Backup of PostgreSQL Database (`regulayer_recorder`).
- Backup of Signing Key Volume (`recorder_keys`).

## Procedure

1.  **Stop Services**: Stop `recorder` and `queue-worker`.
2.  **Restore Key**:
    - Ensure `recorder_ed25519.key` is placed in the volume at `/keys`.
    - Verify fingerprint matches known public key.
3.  **Restore Database**:
    - `pg_restore` the `regulayer_recorder` dump.
4.  **Integrity Verification (Critical)**:
    - Start Recorder.
    - Call verify hook (Admin only):
      ```bash
      curl -X POST http://localhost:8001/v1/recorder/verify-integrity
      ```
    - This scans the entire hash chain in the DB.
    - If it returns `FAIL` or `integrty_error`, DO NOT OPEN FOR WRITES. The backup is corrupt.
5.  **Resume Service**:
    - If integrity passes, start `queue-worker` and `gateway`.

## Warnings
- **Never rewrite history**: Do not use `UPDATE` or `DELETE` on the restored DB.
- **Key Mismatch**: If you restore the DB but lose the Key, the system cannot sign new records on the old chain. You must fork the chain.
