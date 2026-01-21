# Regulayer Chain Integrity Report

**Generated:** {{ generated_at }}  
**Report ID:** {{ report_id }}  
**Generator Version:** {{ generator_version }}

---

## Chain Summary

| Field | Value |
|-------|-------|
| **Chain ID** | `{{ chain_summary.chain_id }}` |
| **Record Count** | {{ chain_summary.record_count }} |
| **First Record** | {{ chain_summary.first_timestamp }} |
| **Last Record** | {{ chain_summary.last_timestamp }} |
| **Verification Method** | {{ chain_summary.verification_method }} |

---

## Integrity Result

{% if integrity_result == 'INTACT' %}
### ✅ Chain Status: **INTACT**

All records have been verified. The hash chain is complete and unbroken.
No tampering detected.
{% else %}
### ❌ Chain Status: **BROKEN**

**Broken at Index:** {{ broken_at_index }}

The hash chain has been compromised at the indicated position.
This indicates potential tampering, data corruption, or missing records.
{% endif %}

---

## Hash Chain Excerpt

{% if hash_chain_excerpt %}
### First 5 Records:
{% for record in hash_chain_excerpt[:5] %}
| {{ record.index }} | `{{ record.hash[:16] }}...` | {{ record.timestamp }} |
{% endfor %}

### Last 5 Records:
{% for record in hash_chain_excerpt[-5:] %}
| {{ record.index }} | `{{ record.hash[:16] }}...` | {{ record.timestamp }} |
{% endfor %}
{% else %}
*Hash chain excerpt not included in this report.*
{% endif %}

---

## ⚠️ Disclaimers

{% for disclaimer in disclaimers %}
- {{ disclaimer }}
{% endfor %}

---

**STATIC REPORT** — This document is a snapshot and does not reflect live system state.
