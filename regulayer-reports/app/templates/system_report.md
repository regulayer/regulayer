# Regulayer System Trust Report

**Generated:** {{ generated_at }}  
**Report ID:** {{ report_id }}  
**Generator Version:** {{ generator_version }}

---

## Executive Summary

### What Regulayer Does

{{ what_it_does }}

### What Regulayer Does NOT Do

{{ what_it_does_not_do }}

---

## Trust Architecture

### Claim → Fact → Proof Flow

{% for step in trust_flow %}
{{ step }}
{% endfor %}

---

## Cryptographic Guarantees

| Property | Value |
|----------|-------|
| **Hash Algorithm** | {{ hash_algorithm }} |
| **Signature Algorithm** | {{ signature_algorithm }} |
| **Chain Structure** | {{ chain_structure }} |

---

## Threat Coverage

| Threat | Mitigation |
|--------|------------|
| **Insider Tampering** | {{ threat_coverage.insider_tampering }} |
| **Replay Attacks** | {{ threat_coverage.replay_attacks }} |
| **Forgery** | {{ threat_coverage.forgery }} |

---

## Operational Assumptions

| Assumption | Requirement |
|------------|-------------|
| **TLS Enabled** | {{ operational_assumptions.tls_enabled }} |
| **Key Custody** | {{ operational_assumptions.key_custody }} |
| **DB Immutability** | {{ operational_assumptions.db_immutability }} |

---

## ⚠️ Explicit Disclaimers

{% for disclaimer in disclaimers %}
- {{ disclaimer }}
{% endfor %}

---

**STATIC REPORT** — This document is a snapshot and does not reflect live system state.
