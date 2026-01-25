# Dispute Resolution Model

**Core Principle**: Regulayer is a witness, not a judge.

## Scope of Verification
Regulayer provides cryptographic answers to specific questions. It does not answer moral, legal, or qualitative questions.

| Question | Regulayer Answer | Verification Method |
| :--- | :--- | :--- |
| **Was this record altered?** | **YES / NO** | Hash Comparison (`record_hash`) |
| **Who signed this record?** | **Key ID** | Signature Verification (Ed25519) |
| **When did this happen?** | **Timestamp** | Time Anchor / Chain Position |
| **Was the AI correct?** | ❌ **UNKNOWN** | Out of Scope |
| **Is this fair?** | ❌ **UNKNOWN** | Out of Scope |
| **Who owns this data?** | ❌ **UNKNOWN** | Out of Scope |

## The Role of the Standard
In a dispute, the Regulayer Standard acts as the **Definition of Truth** for the integrity of variables. If the standard says a hash mismatch implies tampering, that definition is binding for the interpretation of the evidence.
