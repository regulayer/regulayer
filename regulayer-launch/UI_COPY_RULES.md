# UI Copy Rules

## Purpose

This document defines what text is allowed in the Regulayer UI.
Every word visible to users must preserve trust and avoid misleading claims.

---

## Core Principles

### 1. Never Imply

The UI must NEVER imply:

| Concept | Why Prohibited | Example Violation |
|---------|----------------|-------------------|
| Fixing | We don't fix decisions | ❌ "Decision fixed" |
| Correcting | We don't correct | ❌ "Error corrected" |
| Approving | We don't approve | ❌ "Decision approved ✓" |
| Validating | We don't validate models | ❌ "AI validated" |
| Compliance | We don't determine compliance | ❌ "Compliant ✓" |

### 2. Constantly Remind

The UI must constantly remind users of trust guarantees:

| Reminder | Where |
|----------|-------|
| "Records are immutable" | Dashboard, decision detail |
| "Proofs remain valid offline" | Export dialogs |
| "Actions affect access, not evidence" | Governance panels |
| "Original authorship preserved" | Custody transfer |

---

## Mandatory Banners

### Dashboard Banner

```
ℹ️ Recorded decisions are cryptographically immutable. 
   Governance actions affect visibility, not evidence integrity.
```

### Export Dialog Banner

```
ℹ️ This proof bundle can be verified offline without Regulayer.
   It contains all data needed for independent verification.
```

### Governance Panel Banner

```
ℹ️ Governance operations (visibility, retention, custody) 
   never affect cryptographic records or proof validity.
```

### Deletion Confirmation Banner

```
⚠️ This hides the record from your view.
   The cryptographic record and chain position are preserved.
   Existing proofs remain valid.
```

### Custody Transfer Banner

```
ℹ️ Transferring custody changes visibility and billing.
   Original authorship and recording timestamp are permanently preserved.
```

---

## Button and Action Labels

### Approved Labels

| Action | Label | Tooltip |
|--------|-------|---------|
| Record decision | "Record" | "Create immutable record" |
| Export proof | "Export Proof" | "Download verifiable proof bundle" |
| View chain | "View Chain" | "See append-only record sequence" |
| Verify | "Verify" | "Check cryptographic validity" |
| Hide | "Hide" | "Remove from view (record preserved)" |
| Transfer custody | "Transfer Custody" | "Change organizational custody" |

### Prohibited Labels

| ❌ Prohibited | Why | ✅ Use Instead |
|--------------|-----|---------------|
| "Approve" | Implies endorsement | "Record" |
| "Validate" | Implies assessment | "Verify" |
| "Delete" (without context) | Misleading | "Hide" or "Remove from view" |
| "Fix" | Implies correction | "Annotate" |
| "Certify" | Implies authority | "Attest" |

---

## Status Indicators

### Verification Status

✅ Approved:
- "Verified" (green checkmark)
- "Valid" (green)
- "Signature valid" (technical)

❌ Prohibited:
- "Approved" (implies endorsement)
- "Certified" (implies authority)
- "Compliant" (implies regulatory judgment)

### Chain Status

✅ Approved:
- "Recorded"
- "In chain"
- "Sequence #42"

❌ Prohibited:
- "Confirmed" (blockchain terminology)
- "Finalized" (implies process completion)
- "Accepted" (implies approval)

---

## Error Messages

### Approved Pattern

```
[What happened]. [What it means]. [What to do].
```

### Examples

✅ "Verification failed. The signature does not match the record. Contact support if this is unexpected."

✅ "Export incomplete. Some records could not be included. Try again or reduce the date range."

### Prohibited Patterns

❌ "Your decision is invalid." (Ambiguous)
❌ "Compliance error." (Wrong domain)
❌ "Fix required." (Implies we fix things)

---

## Empty States

### Approved

- "No decisions recorded yet."
- "No proofs exported."
- "No governance actions."

### Prohibited

- "No approved decisions." (Implies approval)
- "Nothing validated." (Implies validation)

---

## Tooltips and Help Text

### Rule

Every governance action must have a tooltip explaining:
1. What it does
2. What it does NOT do to proofs

### Example

**Hide Button Tooltip:**
> "Removes this record from your dashboard view.
> Does NOT delete the cryptographic record or invalidate proofs."

**Retention Policy Tooltip:**
> "Sets how long governance metadata is retained.
> Cryptographic records are never affected by retention policies."

---

## Accessibility Copy

All UI copy must also be screen-reader friendly:

- Use complete sentences for tooltips
- Avoid jargon in status announcements
- Provide context for icons

---

## Review Checklist

Before shipping any UI copy:

- [ ] No approval/certification language
- [ ] Mandatory banners present
- [ ] Actions have clear, honest labels
- [ ] Governance actions explain what is NOT affected
- [ ] Error messages are precise and actionable

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
