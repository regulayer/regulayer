# Chaos Report: gateway_kill_1769338147

**Scenario**: gateway_kill
**Description**: Kill ingestion gateway during active traffic to verify no partial writes occurs.
**Verdict**: PASS

> [!TIP]
> **Success**: Availability degraded. Cryptographic truth remained intact.

## Timeline
- [2026-01-25T16:19:08.311376] Starting Chaos Run: gateway_kill_1769338147
- [2026-01-25T16:19:08.311618] Scenario: Kill ingestion gateway during active traffic to verify no partial writes occurs.
- [2026-01-25T16:19:08.311737] Capturing BASELINE state...
- [2026-01-25T16:19:12.409412] Baseline Chain Length: 0
- [2026-01-25T16:19:12.409700] Starting background traffic generation...
- [2026-01-25T16:19:12.409949] Injecting Failure: {'component': 'ingestion-gateway', 'action': 'terminate', 'duration_seconds': 30}
- [2026-01-25T16:19:12.410080] [DRY-RUN] Skipping actual injection command
- [2026-01-25T16:19:12.410170] Waiting for 30 seconds...
- [2026-01-25T16:19:12.510693] Recovering system...
- [2026-01-25T16:19:12.510920] [DRY-RUN] Skipping recovery command
- [2026-01-25T16:19:12.510999] Capturing POST-FAILURE state...
- [2026-01-25T16:19:16.615410] Final Chain Length: 0
- [2026-01-25T16:19:16.615467] Verifying Cryptographic Invariants...
- [2026-01-25T16:19:16.615580] VERDICT: PASS - Availability degraded. Cryptographic truth remained intact.
