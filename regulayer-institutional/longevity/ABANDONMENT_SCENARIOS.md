# Abandonment Scenarios

**What happens if verification infrastructure disappears?**

## Scenario A: Regulation Inc. Bankruptcy
**Impact**: Hosted SaaS APIs go offline.
**Mitigation**:
- Proof bundles are self-contained.
- Offline `regulayer-verifier` tool continues to work.
- Trust anchors (Public Blockchains) remain accessible.
**Verdict**: **NO LOSS OF VERIFIABILITY.**

## Scenario B: Acquisition by Hostile Entity
**Impact**: New owner attempts to change rules or monetize verification.
**Mitigation**:
- The "Reference Standard" is open and forked (see Fork Policy).
- Existing keys cannot be extracted or spoofed retroactively.
- Community moves to community-maintained Verifier fork.
**Verdict**: **TRUST MIGRATES; HISTORY PRESERVED.**

## Scenario C: Global Internet Failure
**Impact**: Cannot fetch new revocation lists or time anchors.
**Mitigation**:
- `offline_sufficiency` proofs (Phase E.2.5) ensure offline verification works with cached context.
**Verdict**: **DEGRADED BUT FUNCTIONAL.**
