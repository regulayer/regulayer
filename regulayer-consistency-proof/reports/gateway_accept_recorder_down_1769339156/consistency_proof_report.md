# Consistency Proof: gateway_accept_recorder_down

**Verdict**: PASS

## Observations
```json
{'gateway_response': 202, 'recorder_state': 'not_found', 'verifier_state': 'not_found', 'export_state': 'not_found', 'ui_state': 'not_found'}
```

> [!TIP]
> **Success**: All Regulayer interfaces observed a single, consistent cryptographic history.

## Timeline
- [2026-01-25T16:35:56.944598] Starting Consistency Proof: gateway_accept_recorder_down_1769339156
- [2026-01-25T16:35:56.944809] Action: start_gateway {'action': 'start_gateway'}
- [2026-01-25T16:35:56.944851] Action: stop_recorder {'action': 'stop_recorder'}
- [2026-01-25T16:35:56.944913] Action: send_decision {'action': 'send_decision', 'decision_id': 'cons_test_1', 'content': 'valid'}
- [2026-01-25T16:35:56.944986] Collecting observations from all surfaces...
- [2026-01-25T16:35:56.945030] Observations: {'gateway_response': 202, 'recorder_state': 'not_found', 'verifier_state': 'not_found', 'export_state': 'not_found', 'ui_state': 'not_found'}
- [2026-01-25T16:35:56.945222] VERDICT: PASS - All Regulayer interfaces observed a single, consistent cryptographic history.
