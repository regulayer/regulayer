# Defensive Defaults

**Why the System Says "NO"**

To prevent misuse, Regulayer's reference verifier defaults to a defensive posture.

## 1. Fail Closed on Ambiguity
If a proof bundle is malformed or has extra unknown fields that change semantics:
**Result**: `INVALID`.
**Reason**: Ambiguity is a vector for interpretation attacks.

## 2. Warning on Degraded Context
If the Time Anchor is unreachable:
**Result**: `VALID_WITH_WARNING`.
**Reason**: We cannot confirm the timestamp freshness. We refuse to give a "Clean Green" without full context.

## 3. No "Partial" Verification
If the Hash matches but the Signature fails:
**Result**: `INVALID`.
**Reason**: A correct hash with a bad signature is indistinguishable from a forgery. We do not expose "Partial Success" to prevent "Good Enough" auditing.
