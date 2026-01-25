# Court Time Evidence Guide

## Purpose

How time anchoring supports legal proceedings without overstepping claims.

---

## Safe Language

### Use

| Phrase | Meaning |
|--------|---------|
| "Corroborates" | Supports but doesn't prove |
| "Supports temporal claims" | Provides evidence of timing |
| "Evidence of existence" | Proof something existed |
| "External attestation" | Third-party verification |

### Never Use

| Phrase | Why Prohibited |
|--------|----------------|
| "Guarantees time" | Cannot guarantee |
| "Prevents backdating" | Cannot prevent |
| "Proves timing" | Overstates capability |
| "Authoritative timestamp" | Not an authority |

---

## What Courts Can Rely On

### Time Anchors Provide

1. **Independent Corroboration**
   - External source confirms hash existence
   - Not dependent on Regulayer systems
   
2. **Third-Party Verification**
   - TSA, blockchain, or notary is separate from parties
   - Can be verified by neutral expert

3. **Cryptographic Binding**
   - Anchor is mathematically bound to record
   - Cannot be transferred to different record

### Time Anchors Do NOT Provide

1. **Absolute Time Proof**
   - Time comes from external source
   - External source could theoretically fail

2. **Prevention of Backdating**
   - Anchors prove existence BY a time
   - Cannot prove non-existence before anchor

3. **Content Accuracy**
   - Anchor proves hash existed
   - Does not prove content was correct

---

## Affidavit Support

### How Time Anchors Help

```
"The evidence bundle includes a time anchor from [TSA/Blockchain/Notary].
This anchor corroborates that the record hash existed at or before
[timestamp], as attested by [external source]."
```

### Sample Affidavit Language

> "Attached hereto as Exhibit A is an evidence bundle containing
> decision record [ID]. This bundle includes time anchoring from
> [DigiCert Time-Stamp Authority / Bitcoin blockchain / etc.].
> 
> The time anchor indicates that the cryptographic hash of this
> record existed at or before [timestamp], based on attestation
> from [external source].
>
> I have independently verified this anchor using [method]."

---

## Expert Witness Guidance

### Explain to Court

1. **What the anchor is**
   - A cryptographic timestamp from an external service
   
2. **What it proves**
   - The record hash existed at or before the timestamp
   
3. **What it doesn't prove**
   - Content accuracy
   - Decision correctness
   
4. **Why it's reliable**
   - External, independent source
   - Cryptographically bound
   - Independently verifiable

---

## Anchor Types for Legal Contexts

### RFC 3161 (Strongest for Most Jurisdictions)

- Well-established standard (1999)
- Legal precedent in many countries
- Commercial TSAs with liability
- EU eIDAS recognition

### Public Blockchain (Good Corroborating Evidence)

- Decentralized, no single authority
- Publicly auditable
- Strong cryptographic guarantees
- Less legal precedent than RFC 3161

### Court Notary (Strongest in Specific Jurisdictions)

- Traditional legal recognition
- Jurisdiction-specific validity
- Human attestation
- May be required in some courts

---

## Challenging Time Evidence

### Legitimate Challenges

1. **TSA reliability** - Is the TSA trustworthy?
2. **Clock accuracy** - Was the TSA clock correct?
3. **Hash binding** - Does the anchor match the record?

### Not Legitimate Challenges

1. **"Anchor is missing"** - Records are still valid
2. **"Anchor is from external source"** - That's the point
3. **"Regulayer created the anchor"** - Regulayer only forwards to external services

---

## Jurisdictional Considerations

| Jurisdiction | Preferred Anchor | Notes |
|--------------|------------------|-------|
| EU | RFC 3161 (eIDAS) | Qualified timestamps recognized |
| US | RFC 3161 / Blockchain | Varies by state |
| UK | RFC 3161 | Post-Brexit, follows eIDAS principles |
| International | RFC 3161 + Blockchain | Multiple anchors recommended |

---

## Key Takeaways

1. **Optional, not required** - Records are valid without anchors
2. **Corroboration, not proof** - Supports temporal claims
3. **External, not internal** - Regulayer is not the time authority
4. **Math still wins** - Verification is deterministic
5. **Independent verification** - Any expert can check

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
