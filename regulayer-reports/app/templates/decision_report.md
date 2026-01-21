# Regulayer Decision Trust Report

**Generated:** {{ generated_at }}  
**Report ID:** {{ report_id }}  
**Generator Version:** {{ generator_version }}

---

## Decision Identification

| Field | Value |
|-------|-------|
| **Decision ID** | `{{ decision_id }}` |
| **Record ID** | {{ record_id }} |
| **System Name** | {{ system_name }} |
| **Recorded At** | {{ recorded_at }} |

---

## Integrity Proof

| Field | Value |
|-------|-------|
| **Record Hash** | `{{ integrity_proof.record_hash }}` |
| **Previous Record Hash** | `{{ integrity_proof.previous_record_hash or 'NULL (First Record)' }}` |
| **Canonical Payload Hash** | `{{ integrity_proof.canonical_payload_hash }}` |
| **Chain ID** | `{{ integrity_proof.chain_id }}` |

### Integrity Status: **{{ integrity_status }}** {{ '✅' if integrity_status == 'VALID' else '❌' }}

---

## Attestation Proof

{% if attestation_proof %}
| Field | Value |
|-------|-------|
| **Identity ID** | `{{ attestation_proof.identity_id }}` |
| **Algorithm** | {{ attestation_proof.algorithm }} |
| **Signed At** | {{ attestation_proof.signed_at }} |
| **Revocation Status** | {{ attestation_proof.revocation_status }} |

### Attestation Status: **{{ attestation_status }}**
{% else %}
**Status:** LEGACY (Unsigned Record)

This record was created before cryptographic attestation was enabled.
It relies on hash-chain integrity for security.
{% endif %}

---

## Verification Results

| Check | Result |
|-------|--------|
| **Hash Valid** | {{ '✅ PASS' if verification_results.hash_valid else '❌ FAIL' }} |
| **Chain Valid** | {{ '✅ PASS' if verification_results.chain_valid else '❌ FAIL' }} |
{% if verification_results.signature_valid is not none %}
| **Signature Valid** | {{ '✅ PASS' if verification_results.signature_valid else '❌ FAIL' }} |
{% endif %}

---

## Governance Context (Non-Authoritative)

{% if governance_present %}
> ⚠️ **This section is organizational process, not cryptographic fact.**

| Field | Value |
|-------|-------|
| **Review State** | {{ governance_context.review_state }} |
| **Tags** | {{ governance_context.tags | join(', ') or 'None' }} |
| **Approvals** | {{ governance_context.approvals | join(', ') or 'None' }} |
| **Last Updated** | {{ governance_context.last_updated }} |
{% else %}
*No governance metadata recorded for this decision.*
{% endif %}

---

## Export References

| Field | Value |
|-------|-------|
| **Proof Bundle Checksum** | `{{ proof_bundle_checksum or 'Not exported' }}` |
| **Verifier Tool Version** | {{ verifier_tool_version }} |

---

## ⚠️ Legal Boundary

{% for disclaimer in disclaimers %}
- {{ disclaimer }}
{% endfor %}

---

**STATIC REPORT** — This report proves integrity, not correctness.
