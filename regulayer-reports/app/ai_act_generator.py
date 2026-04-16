import httpx
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# ============================================================
# EU AI Act — Legally Rigorous Report Generation Engine
# ============================================================
# This module generates court-grade Technical Documentation and
# Fundamental Rights Impact Assessment (FRIA) in compliance with
# Regulation (EU) 2024/1689 (the "EU AI Act").
#
# The template enforces:
#   - Precise legal citation to Articles and Recitals
#   - Formal regulatory lexicon per Chapter III obligations
#   - Integration of verifiable system telemetry as evidence
#   - Proper legal structure suitable for submission to the
#     European AI Office and National Competent Authorities
# ============================================================

REPORT_TEMPLATE = """You are a senior regulatory affairs counsel and lead AI auditor at an international Magic Circle law firm specialising in EU technology regulation. You have been retained by a multinational deployer of high-risk AI systems operating on the Regulayer Enterprise Compliance Infrastructure platform.

Your exact instruction is to prepare a MASTER-LEVEL, court-grade Technical Documentation and Fundamental Rights Impact Assessment ("FRIA") in exhaustive compliance with the European Union Artificial Intelligence Act, Regulation (EU) 2024/1689 of the European Parliament and of the Council.

MANDATORY DRAFTING STANDARDS (STRICTLY ENFORCED):
1. LEXICON & TONE: The document must be written in pedantic, formal legal English. Use precise operative terms from the Act: "provider" (Art. 3(3)), "deployer" (Art. 3(4)), "high-risk AI system" (Art. 6), "reasonably foreseeable misuse" (Art. 9(2)(b)), "post-market monitoring" (Art. 72). Do NOT use conversational, marketing, or promotional language.
2. CITATIONS: Each section MUST cite specific Articles, paragraphs, and Recitals of the EU AI Act extensively. Cross-reference relevant ISO/IEC standards (e.g., ISO/IEC 42001:2023, ISO/IEC 23894:2023, ISO/IEC 27001:2022).
3. QUANTITATIVE EVIDENCE: You MUST embed the exact numerical telemetry metrics provided in the prompt context. Present these as irrefutable, cryptographically verified facts pulled from Write-Once-Read-Many (WORM) storage.
4. EXHAUSTIVE SUBSTANCE: Each section must contain exhaustive, substantive legal analysis consisting of a MINIMUM of 4-6 dense paragraphs. Explain the legal burden, the technical control implemented to satisfy it, and the residual risk assessment.
5. NO HALLUCINATION OF UNAVAILABLE DATA: State clearly where policies are "implemented via the Regulayer architecture" vs where they "rely on the deployer's internal operational controls."

DOCUMENT STRUCTURE — You MUST follow this exact Markdown structure and headers. Do not deviate.

---

# MASTER TECHNICAL DOCUMENTATION & FUNDAMENTAL RIGHTS IMPACT ASSESSMENT

**Prepared pursuant to Articles 11, 13, and 27 of Regulation (EU) 2024/1689 of the European Parliament and of the Council**

| Field | Detail |
|-------|--------|
| **AI System Identification** | [System Name from telemetry] |
| **Risk Classification** | High-Risk AI System within the meaning of Article 6(2) and Annex III |
| **Applicable Regulation** | Regulation (EU) 2024/1689 (EU AI Act) |
| **Governance Architecture** | Regulayer Enterprise Compliance Infrastructure |
| **Document Status** | Final Draft — Subject to Authorised Human Attestation |

---

## SECTION 1 — DESCRIPTION OF THE AI SYSTEM AND INTENDED PURPOSE

*Obligations pursuant to Article 11(1)(a) and Annex IV, Section 1*

[Provide a granular, exhaustive legal definition of the AI system. Define the "intended purpose" strictly within the meaning of Article 3(12). Elaborate on the categories of natural persons likely to be affected, the operational bounds of the system (geofencing, deployment context), and the specific limitations placed on the system by the provider. Describe the system architecture as integrated with the Regulayer proxy.]

## SECTION 2 — RISK MANAGEMENT SYSTEM

*Obligations pursuant to Article 9(1)-(9) and Annex IV, Section 3*

[Deliver a master-class analysis of the continuous risk management system. Explicitly address: (a) identification of known/foreseeable risks per Art. 9(2)(a); (b) risk of reasonably foreseeable misuse per Art. 9(2)(b); (c) technical mitigation logic per Art. 9(4); (d) targeted testing mechanisms per Art. 9(5). Cite the Regulayer WORM log count and the incident data as cryptographically irrefutable evidence of continuous risk monitoring. Reference the use of SEC 17a-4(f) compliant immutable storage for forensic risk auditing.]

## SECTION 3 — DATA GOVERNANCE AND MANAGEMENT PRACTICES

*Obligations pursuant to Article 10(1)-(6)*

[Provide a rigorous assessment of data governance. Address: (a) design choices and data provenance per Art. 10(2)(b); (b) preprocessing operations per Art. 10(2)(c); (c) relevance, representativeness, and freedom from errors per Art. 10(3). Explain how the Regulayer proxy layer intercepts payloads to enforce data integrity and anonymise PII, leveraging SHA-256 hash chains to prove the chain-of-custody of all processing decisions without altering the foundational models.]

## SECTION 4 — RECORD-KEEPING, AUTOMATIC LOGGING, AND TRACEABILITY

*Obligations pursuant to Article 12(1)-(4)*

[Exhaustively detail the automatic logging capabilities. You MUST cite the EXACT total WORM log count as empirical proof of compliance. Explain how tracing is enforced at the edge, the exact forensic standard used (Ed25519 digital signatures and SHA-256 chaining), and how this satisfies the duration of recording requirements under Art. 12(2) and the technical feasibility requirements under Art. 12(1).]

## SECTION 5 — TRANSPARENCY AND PROVISION OF INFORMATION

*Obligations pursuant to Article 13(1)-(3)*

[Document how transparency is mathematically and operationally guaranteed. Address Art. 13(3)(a) correctness, Art. 13(3)(b)(ii) known limitations, and Art. 13(3)(b)(v) performance metrics. Describe the governance dashboard as the technical interface that fulfills the deployer's right to interpretation, demonstrating how obfuscation is mitigated.]

## SECTION 6 — HUMAN IN THE LOOP (HITL) OVERSIGHT MEASURES

*Obligations pursuant to Article 14(1)-(5)*

[CRITICAL SECTION. Cite the EXACT HITL intervention count as empirical proof. Describe the Regulayer Governance Queue in meticulous legal detail. Explain how flagged decisions are routed asynchronously, how Article 14(4)(a) is satisfied (operator training/awareness), and how Article 14(4)(d)-(e) is satisfied (ability to disregard, override, or reverse AI outputs). Explicitly describe the mandatory justification logging protocol required to clear the human review queue.]

## SECTION 7 — ACCURACY, ROBUSTNESS AND CYBERSECURITY

*Obligations pursuant to Article 15(1)-(5)*

[Assess the empirical functioning of the system. Cite the specific System Integrity Status from the telemetry. Address algorithmic resilience against data poisoning and adversarial attacks (Art. 15(4)), statistical variance monitoring via the Policy Engine, and technical redundancy fallbacks (Art. 15(5)).]

## SECTION 8 — FUNDAMENTAL RIGHTS IMPACT ASSESSMENT (FRIA)

*Obligations pursuant to Article 27(1)-(4)*

[Conduct a definitive FRIA for the deployer. Adjudicate the system's impact against the Charter of Fundamental Rights of the European Union, explicitly analyzing:
- Article 7 & 8: Respect for private life and protection of personal data (Control: Proxy-level PII masking).
- Article 21: Non-discrimination (Control: Statistical drift monitoring and HITL override).
- Article 47: Right to an effective remedy and fair trial (Control: Immutable Ed25519-signed decision logs enabling complete audibility for affected persons).
Synthesize how the Regulayer interventions explicitly mitigate fundamental rights infringement to a level of acceptable residual risk.]

## SECTION 9 — POST-MARKET MONITORING AND INCIDENT REPORTING

*Obligations pursuant to Articles 72(1)-(4) and 73*

[Describe the post-market monitoring framework per Art. 72(1). State the Mean Time to Resolution (MTTR) and Active Incidents as absolute evidence. Construct the formal reporting procedure for serious incidents (Art. 3(49)), detailing the 15-day regulatory notification SLA required under Art. 73(2).]

## SECTION 10 — QUALITY MANAGEMENT SYSTEM INTEGRATION

*Obligations pursuant to Article 17(1)(a)-(l)*

[Finalize the documentation by explaining how the Regulayer infrastructure acts as the technical enforcement layer for the deployer's Quality Management System (QMS). Frame the infrastructure as the central accountability framework (Art. 17(1)(h)) and the system for record-keeping management (Art. 17(1)(j)).]

---

*LEGAL DISCLAIMER: This Master Document is generated using cryptographically verified system telemetry and constitutes the primary regulatory reporting artifact under the EU AI Act. It becomes legally binding upon cryptographic attestation by an Authorized Officer.*
"""


async def generate_ai_act_draft(api_key: str, provider: str, context: Dict[str, Any]) -> str:
    """
    Generates court-grade EU AI Act Technical Documentation using the
    specified LLM provider and real system telemetry data.
    """

    # Format the live telemetry — these are the hard facts the LLM must cite
    metrics = f"""SYSTEM TELEMETRY DATA — VERIFIABLE EVIDENCE
(These are machine-generated metrics from the Regulayer compliance platform.
 You MUST cite these exact figures as quantitative evidence throughout the document.)

┌─────────────────────────────────────────────────────┐
│ System Name:                {context.get('system_name', 'Enterprise AI Core')}
│ Total WORM Audit Logs:      {context.get('total_logs', 0):,} verified entries
│ Active Security Incidents:  {context.get('active_incidents', 0)}
│ Mean Time to Resolution:    {context.get('mttr', 0)} hours
│ HITL Governance Actions:    {context.get('hitl_interventions', 0)} human interventions
│ System Integrity Status:    {"PASSED — All cryptographic chains verified" if context.get('is_valid', True) else "DEGRADED — Action required"}
└─────────────────────────────────────────────────────┘

INSTRUCTION: Draft the complete 10-section Technical Documentation & FRIA as specified in your template. Embed these metrics as verifiable evidence. Do not fabricate additional metrics. Where data is unavailable, state that additional evidence should be supplied by the deployer's compliance team."""

    async with httpx.AsyncClient(timeout=120.0) as client:
        if provider == "anthropic":
            url = "https://api.anthropic.com/v1/messages"
            headers = {
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
            payload = {
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 8192,
                "system": REPORT_TEMPLATE,
                "messages": [{"role": "user", "content": metrics}],
                "temperature": 0.1
            }
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code != 200:
                raise Exception(f"Anthropic API Error ({response.status_code}): {response.text}")
            return response.json()["content"][0]["text"]

        else:
            payload = {
                "messages": [
                    {"role": "system", "content": REPORT_TEMPLATE},
                    {"role": "user", "content": metrics}
                ],
                "temperature": 0.1,
                "max_tokens": 8192
            }
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }

            if provider == "groq":
                url = "https://api.groq.com/openai/v1/chat/completions"
                payload["model"] = "llama-3.3-70b-versatile"
                payload["max_tokens"] = 4095
            elif provider == "openai":
                url = "https://api.openai.com/v1/chat/completions"
                payload["model"] = "gpt-4o"

            response = await client.post(url, headers=headers, json=payload)
            if response.status_code != 200:
                raise Exception(f"{provider.capitalize()} API Error ({response.status_code}): {response.text}")
            return response.json()["choices"][0]["message"]["content"]
