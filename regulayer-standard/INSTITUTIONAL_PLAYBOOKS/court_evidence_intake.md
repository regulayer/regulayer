# Court Evidence Intake Playbook

## Purpose

This playbook explains how courts can receive, verify, and evaluate
cryptographic evidence bundles in legal proceedings.

---

## Evidence Overview

### What Courts Receive

- Evidence bundle (JSON file)
- Verification capability
- Chain of custody documentation

### Evidentiary Properties

| Property | Meaning |
|----------|---------|
| Hash verification | Content unchanged since recording |
| Signature verification | Authentic attestation |
| Chain verification | Ordering preserved |

---

## Evidence Intake Procedure

### Step 1: Production

Party produces evidence bundle along with:
- Expert declaration (if applicable)
- Verification instructions
- Chain of custody affidavit

### Step 2: Opposing Party Review

Opposing party may:
- Independently verify evidence
- Challenge verification
- Request expert testimony

### Step 3: Court Verification (if disputed)

Court may:
- Appoint neutral expert
- Order independent verification
- Evaluate competing claims

---

## Verification Methods

### Option 1: Party-Provided Verification

Producing party demonstrates verification.
Opposing party may challenge.

### Option 2: Neutral Expert

Court appoints neutral expert to:
- Run verification independently
- Document findings
- Testify if needed

### Option 3: Court Technology Staff

Court technical staff may run verification:

```bash
# Download reference verifier (open source)
# Run verification
python reference_verifier.py evidence.json
```

---

## What Verified Evidence Proves

### Evidence Shows

1. **Record Integrity**: The record has not been modified
2. **Recording Time**: When the record was created
3. **Attestation**: Who attested to the record

### Evidence Does NOT Show

1. **Decision Correctness**: Whether the decision was right
2. **Content Accuracy**: Whether the content is true
3. **Legal Compliance**: Whether requirements were met

---

## Admissibility Considerations

### Authentication (FRE 901)

Evidence bundles are self-authenticating through:
- Cryptographic signatures
- Hash verification
- Public key infrastructure

Expert testimony may assist in explaining verification.

### Best Evidence (FRE 1001-1008)

The evidence bundle IS the original record.
It is not a copy—it is the cryptographic original.

### Hearsay Considerations

The evidence bundle is offered to prove:
- That a record was made
- When it was made
- By whom it was attested

Content may raise separate hearsay issues depending on purpose.

---

## Chain of Custody

### Cryptographic Custody

The evidence bundle itself provides:
- Proof of content at recording time
- Proof of unmodified state
- Proof of attestation

### Physical Custody

Standard chain of custody applies for:
- How the bundle was obtained
- How it was stored pending trial
- Who had access

---

## Expert Testimony

### When Needed

Expert testimony may help court understand:
- How verification works
- What cryptographic guarantees mean
- Limitations of the evidence

### Expert Qualifications

Experts should have:
- Cryptography background
- Understanding of hash chains
- Digital signature expertise

### Expert Independent Verification

Experts can verify evidence independently using:
- Reference implementations
- Standard tools (openssl, etc.)
- Custom implementations

---

## Jury Instructions (Suggested)

> "You have heard evidence regarding cryptographic verification.
> This verification shows that the record has not been modified
> since it was created. It does not tell you whether the contents
> of the record are true or whether any decision was correct.
> You must evaluate the content based on all the evidence."

---

## Template Findings

### Verification Passed

> "The evidence bundle was verified using [method].
> The hash verification passed, indicating the record is unchanged.
> The signature verification passed, indicating authentic attestation.
> The chain verification passed, indicating preserved ordering."

### Verification Failed

> "The evidence bundle could not be verified.
> [Describe failure mode]. The evidence [should/should not]
> be given [less/no] weight accordingly."
