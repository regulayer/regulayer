# Auditor Integration Playbook

## Purpose

This playbook explains how auditors can integrate evidence bundle
verification into audit workflows.

---

## Audit Use Cases

### 1. Financial Statement Audits

Verify evidence of AI-assisted decisions affecting:
- Loan approvals
- Credit decisions
- Fraud detection
- Risk assessment

### 2. SOC2 / IT Audits

Verify evidence of:
- System operations
- Change management
- Access controls
- Incident response

### 3. Regulatory Compliance Audits

Verify evidence for:
- AI Act requirements
- GDPR accountability
- Industry-specific regulations

---

## Integration Approaches

### Approach 1: Manual Verification

1. Request evidence bundle export
2. Run reference verifier
3. Document results in work papers

**Best for**: Ad-hoc verification, small samples

### Approach 2: Automated Sampling

1. API access to evidence exports
2. Automated verification of samples
3. Exception-based human review

**Best for**: High-volume audits

### Approach 3: Continuous Monitoring

1. Real-time evidence feed
2. Automated verification pipeline
3. Alert on failures

**Best for**: Ongoing compliance monitoring

---

## Verification Procedure

### Step 1: Obtain Evidence

```bash
# Export from client's system
curl -o evidence.zip "https://client.regulayer.io/export?range=2025"
unzip evidence.zip
```

### Step 2: Verify

```bash
# Run batch verification
for f in evidence/*.json; do
    python reference_verifier.py "$f" >> results.txt
done
```

### Step 3: Document

Record in work papers:
- Sample selection methodology
- Verification method used
- Results (pass/fail counts)
- Any anomalies

---

## Work Paper Documentation

### Sample Evidence

```
WORK PAPER REF: WP-AI-001
CLIENT: [Client Name]
AUDIT PERIOD: 2025

PROCEDURE: Verification of AI decision evidence

SAMPLE:
- Population: 10,000 AI decisions
- Sample size: 100 (statistical sampling)
- Selection method: Random

RESULTS:
- Verified: 100
- Failed: 0
- Not applicable: 0

VERIFICATION METHOD: Reference verifier v1.0.0

CONCLUSION: Evidence integrity controls operating effectively.
```

### Exception Documentation

```
EXCEPTION: Evidence bundle #47 failed hash verification

DETAIL: Bundle dec_12345 showed hash mismatch
INVESTIGATION: Client confirmed file corruption during transfer
RESOLUTION: Re-exported bundle verified successfully
CONCLUSION: No control deficiency identified
```

---

## Control Testing

### Integrity Controls

Test: "Records cannot be modified after creation"

1. Obtain evidence bundles from two points in time
2. Verify both independently
3. Confirm hashes match
4. Document results

### Attestation Controls

Test: "All records are cryptographically attested"

1. Sample evidence bundles
2. Verify signatures present
3. Verify signatures valid
4. Confirm key validity at signing time

### Chain Controls

Test: "Records maintain chronological ordering"

1. Export chain segment
2. Verify previous_hash linking
3. Confirm no gaps
4. Document results

---

## Management Letter Points

### Positive Observation

> "The client has implemented cryptographic evidence controls
> for AI system decisions. Testing confirmed that evidence
> bundles are verifiable and maintain integrity."

### Deficiency Example

> "During testing of AI decision evidence, we noted that [X]%
> of bundles lacked attestation signatures. Management should
> ensure all decisions are properly attested."

---

## Auditor Independence

### What to Use

- Reference implementations (not vendor-provided)
- Independent verification tools
- Standard cryptographic libraries

### What to Avoid

- Vendor-provided verification only
- Trusting vendor representations
- Skipping independent verification

---

## FAQ for Auditors

### Q: Do I need to audit the vendor?

Not necessarily. Verification is mathematical.
However, key management controls may warrant review.

### Q: What if verification fails?

Document the failure. Investigate root cause.
Consider implications for control effectiveness.

### Q: What about legacy records?

Legacy records may have reduced guarantees.
Document the trust model for each record type.
