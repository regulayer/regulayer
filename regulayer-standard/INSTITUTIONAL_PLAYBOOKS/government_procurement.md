# Government Procurement Playbook

## Purpose

This playbook explains how government agencies can evaluate and procure
systems implementing the Evidence Standard.

---

## Procurement Considerations

### 1. Vendor Neutrality

The standard is open and implementation-agnostic.

Government agencies can:
- Specify the standard without naming vendors
- Accept multiple compliant implementations
- Avoid vendor lock-in

### 2. Long-Term Viability

The standard ensures:
- Evidence remains valid indefinitely
- Verification works offline
- No vendor dependency for validation

### 3. Interoperability

Agencies can require:
- Open format evidence exports
- Standard schema conformance
- Reference implementation compatibility

---

## RFP Language Examples

### Requirement: Evidence Integrity

> "The system shall produce cryptographically verifiable evidence
> of AI system decisions. Evidence shall be independently verifiable
> without requiring vendor systems or network access."

### Requirement: Standard Conformance

> "Evidence produced by the system shall conform to [Standard Name]
> version 1.0 or later, including:
> - SHA-256 hash chain integrity
> - Ed25519 or equivalent digital signatures
> - RFC 8785 canonicalization"

### Requirement: Offline Verification

> "The contractor shall provide verification tools that operate
> without network connectivity. Verification shall not require
> access to contractor systems."

### Requirement: Data Portability

> "All evidence data shall be exportable in standard formats.
> The government shall retain the right to migrate evidence
> to alternative systems without data loss."

---

## Evaluation Criteria

### Technical Evaluation

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Standard conformance | High | Meets Evidence Standard v1.0+ |
| Offline verification | High | Works without vendor systems |
| Data portability | High | Standard export formats |
| Cryptographic strength | Medium | Uses approved algorithms |
| Performance | Medium | Meets throughput requirements |

### Non-Technical Evaluation

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Vendor viability | High | Long-term sustainability |
| Exit strategy | High | Ability to migrate away |
| Support | Medium | Training and documentation |
| Cost | Medium | Total cost of ownership |

---

## Contract Clauses

### Data Rights

> "All evidence data created using the system is the property
> of the Government. The contractor shall provide complete
> exports upon request at no additional cost."

### Standard Compliance

> "The contractor warrants that the system conforms to
> [Standard Name] version 1.0 or later. Deviations from
> the standard require prior written approval."

### Exit Rights

> "Upon contract termination, the contractor shall provide
> complete data exports in standard format within [X] days.
> The contractor shall provide transition assistance for
> [Y] days at no additional cost."

### Verification Tool Access

> "The contractor shall provide verification tool source code
> or provide verification tools under an open source license.
> The Government retains the right to develop independent
> verification capabilities."

---

## Security Considerations

### Key Management

Require documentation of:
- Key generation procedures
- Key storage security
- Key rotation policies
- Incident response for key compromise

### FedRAMP Alignment (if applicable)

Evidence systems may need:
- FedRAMP authorization
- Continuous monitoring
- Incident reporting

### Cryptographic Approvals

Verify algorithms comply with:
- NIST recommendations
- CISA guidance
- Agency-specific requirements

---

## Implementation Verification

### Acceptance Testing

1. Generate test decisions
2. Export evidence bundles
3. Verify using reference verifier
4. Confirm schema conformance
5. Test offline verification

### Ongoing Verification

- Periodic verification sampling
- Automated monitoring (if available)
- Annual compliance reviews

---

## FAQ for Procurement

### Q: Can we require a specific vendor?

Generally no (competition requirements).
Specify the standard, not the vendor.

### Q: What about existing systems?

Existing systems may be upgraded or integrated.
Focus on evidence format, not system replacement.

### Q: Can the vendor go out of business?

Standard is designed for vendor independence.
Evidence remains valid; require data exports.

### Q: Do we need in-house expertise?

Training recommended for:
- Procurement officers
- Technical evaluators
- Compliance staff
