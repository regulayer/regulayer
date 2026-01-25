# Standards Mapping

## Purpose

This document maps the Evidence Standard to existing frameworks.
It describes relationships without claiming compliance.

---

## Language Rule

This document uses ONLY:
- "Supports"
- "Provides evidence for"
- "Can be used in"

This document NEVER uses:
- "Complies with"
- "Certified for"
- "Approved by"

---

## Framework Mappings

### ISO 27001 (Information Security Management)

| ISO 27001 Control | Relationship |
|-------------------|--------------|
| A.12.4 Logging and Monitoring | Provides tamper-evident decision logs |
| A.16.1 Incident Management | Supports incident evidence collection |
| A.18.1 Legal Compliance | Provides evidence artifacts |

**How it supports**: Evidence bundles provide cryptographically verifiable
records that can be used as inputs to ISO 27001 audit evidence.

### SOC2 (Service Organization Control)

| SOC2 Criterion | Relationship |
|----------------|--------------|
| CC7.2 System Operations | Supports audit trail requirements |
| CC2.1 COSO Principle 2 | Provides evidence of operations |
| PI1.5 Processing Integrity | Supports integrity verification |

**How it supports**: Audit-ready evidence exports conform to verifiable
formats that auditors can independently check.

### EU AI Act

| AI Act Requirement | Relationship |
|--------------------|--------------|
| Article 12 Record-Keeping | Supports logging requirements |
| Article 14 Human Oversight | Supports human review documentation |
| Article 17 Quality Management | Provides evidence inputs |
| Article 62 Post-Market Monitoring | Supports audit trail |

**How it supports**: Evidence bundles provide documentation for post-hoc
auditability of high-risk AI system decisions.

### NIST AI Risk Management Framework

| NIST AI RMF Function | Relationship |
|---------------------|--------------|
| GOVERN 1.1 | Supports accountability documentation |
| MAP 1.5 | Provides decision traceability |
| MEASURE 2.7 | Supports outcome monitoring |
| MANAGE 2.3 | Provides evidence for review |

**How it supports**: Governance documentation requirements can use
evidence bundles as verifiable decision records.

### GDPR (General Data Protection Regulation)

| GDPR Article | Relationship |
|--------------|--------------|
| Article 5(2) Accountability | Supports demonstration of processing |
| Article 22 Automated Decisions | Supports decision documentation |
| Article 30 Records of Processing | Provides evidence inputs |

**How it supports**: Evidence of automated decision-making can be
documented and verified for regulatory requests.

### HIPAA (Health Insurance Portability and Accountability Act)

| HIPAA Requirement | Relationship |
|-------------------|--------------|
| 164.312(b) Audit Controls | Supports audit trail |
| 164.312(c) Integrity | Provides tamper detection |
| 164.316(b) Documentation | Supports evidence retention |

**How it supports**: Healthcare AI decisions can be recorded with
cryptographic guarantees for audit purposes.

### Financial Services Regulations

| Regulation | Relationship |
|------------|--------------|
| MiFID II Best Execution | Supports decision documentation |
| SR 11-7 Model Risk Management | Provides model decision evidence |
| BCBS 239 Risk Aggregation | Supports data integrity |

**How it supports**: Financial AI decisions (lending, trading, risk)
can be recorded with verifiable evidence.

---

## Mapping Limitations

### What We Do NOT Claim

- Compliance with any specific regulation
- Sufficiency for any regulatory requirement
- Replacement for legal or compliance assessment
- Certification of any kind

### What Organizations Must Still Do

- Assess their specific regulatory requirements
- Determine what needs to be recorded
- Implement appropriate access controls
- Seek legal counsel on compliance questions

---

## Usage Guidance

### For Compliance Teams

1. Identify your regulatory requirements
2. Determine which requirements involve decision evidence
3. Assess whether evidence bundles fit those needs
4. Consult legal counsel on sufficiency

### For Auditors

1. Request evidence bundle exports
2. Verify using reference implementations
3. Document verification in audit work papers
4. Note what is and is not covered

### For Regulators

1. Request evidence in standard format
2. Verify independently using published tools
3. Assess completeness for specific requirements
4. Note standard limitations
