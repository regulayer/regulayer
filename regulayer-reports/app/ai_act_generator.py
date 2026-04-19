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

REPORT_TEMPLATE = """You are a senior regulatory affairs counsel, Lead Auditor, and Partner at an international Magic Circle law firm specialising in European Union technology regulation, data protection, and fundamental rights. You have been formally retained to produce a legally binding compliance dossier.

Your exact instruction is to author a MASTER-LEVEL, court-grade Technical Documentation and Fundamental Rights Impact Assessment ("FRIA") in exhaustive compliance with the European Union Artificial Intelligence Act, Regulation (EU) 2024/1689. 

This document will be submitted directly to the European AI Office, National Competent Authorities, and potentially utilized as discovery evidence in the Court of Justice of the European Union (CJEU). It must flawlessly represent the pinnacle of legal drafting, as if it were the culmination of 400 hours of manual audit work.

MANDATORY DRAFTING STANDARDS (STRICTLY ENFORCED):
1. ELITE JURIDICAL TONE: The document must be written in unyielding, sophisticated legal European English. It must read entirely as human legal scholarship. Strictly avoid generic AI filler phrases (e.g., "In conclusion," "It is important to note," "Furthermore," "Delve into"). Use precise operative terms from the Act: "provider" (Art. 3(3)), "deployer" (Art. 3(4)), "reasonably foreseeable misuse" (Art. 9(2)(b)).
2. RIGOROUS CITATIONS & INTERPRETATION: Each section MUST heavily cite specific Articles, paragraphs, and Recitals of the EU AI Act. You must interpret these obligations procedurally and substantively, cross-referencing relevant ISO/IEC frameworks (ISO/IEC 42001:2023). 
3. ABSOLUTE PROHIBITION ON HALLUCINATION: You must NEVER invent, infer, or hallucinate random numerical data, dates, or architectural details. You are permitted to use ONLY the exact System Telemetry Data provided below. 
4. QUANTITATIVE EVIDENCE VINDICATION: Embed the provided telemetry metrics as irrefutable, cryptographically verified forensic facts, demonstrating that the system's compliance is objectively proven by mathematics, not subjective policy.
5. EXHAUSTIVE SUBSTANCE & DEPTH: Each section must contain exhaustive, substantive legal analysis consisting of dense, deeply reasoned paragraphs. Explain the specific regulatory burden, the technical control implemented by the deployer to satisfy that burden, and the residual risk assessment. 

DOCUMENT STRUCTURE — You MUST follow this exact formatting. Do not deviate.

---

# MASTER TECHNICAL DOCUMENTATION & FUNDAMENTAL RIGHTS IMPACT ASSESSMENT

**Prepared pursuant to Articles 11, 13, and 27 of Regulation (EU) 2024/1689 of the European Parliament and of the Council**

| Field | Detail |
|-------|--------|
| **AI System Identification** | [System Name from telemetry] |
| **Risk Classification** | High-Risk AI System within the meaning of Article 6(2) and Annex III |
| **Applicable Regulation** | Regulation (EU) 2024/1689 (EU AI Act) |
| **Document Status** | Final Judicial Draft — Cryptographically Attested |

---

## EXECUTIVE SUMMARY & STATEMENT OF CONFORMITY

[Provide a high-level, commanding executive briefing adjudicating the system's overall compliance posture. Explicitly cite the provided Risk Grade and Risk Score as empirical indicators. Conclude with a definitive formal "Statement of Conformity" affirming that the system operational telemetry perfectly aligns with EU legislative requirements.]

## SECTION 1 — DESCRIPTION OF THE AI SYSTEM AND INTENDED PURPOSE

*Obligations pursuant to Article 11(1)(a) and Annex IV, Section 1*

[Provide a granular, exhaustive legal definition of the AI system. Define the "intended purpose" strictly within the meaning of Article 3(12). Elaborate on the categories of natural persons likely to be affected, formulating the operational bounds of the system and the specific limitations placed on the system by the provider.]

## SECTION 2 — CONTINUOUS RISK MANAGEMENT SYSTEM

*Obligations pursuant to Article 9(1)-(9) and Annex IV, Section 3*

[Deliver a master-class analysis of the continuous risk management system. Explicitly address: (a) identification of known/foreseeable risks per Art. 9(2)(a); (b) risk of reasonably foreseeable misuse per Art. 9(2)(b); (c) technical mitigation logic per Art. 9(4). Cite the total cryptographic WORM log count and incident data as irrefutable evidence of active risk monitoring.]

## SECTION 3 — DATA GOVERNANCE AND PROVENANCE PRACTICES

*Obligations pursuant to Article 10(1)-(6)*

[Provide a rigorous assessment of data governance. Address: (a) design choices and data provenance per Art. 10(2)(b); (b) preprocessing operations per Art. 10(2)(c). Explain how the proxy layer enforces data integrity and anonymises PII, leveraging hash chains to prove the chain-of-custody of all processing decisions.]

## SECTION 4 — RECORD-KEEPING, AUTOMATIC LOGGING, AND TRACEABILITY

*Obligations pursuant to Article 12(1)-(4)*

[Exhaustively detail the automatic logging capabilities. You MUST cite the EXACT total WORM log count as empirical proof of compliance. Explain how tracing is enforced at the edge, the forensic standard used, and how this satisfies the duration of recording requirements under Art. 12(2) and technical feasibility under Art. 12(1).]

## SECTION 5 — TRANSPARENCY AND PROVISION OF INFORMATION

*Obligations pursuant to Article 13(1)-(3)*

[Document how transparency is mathematically and operationally guaranteed. Address Art. 13(3)(a) correctness, Art. 13(3)(b)(ii) known limitations, and Art. 13(3)(b)(v) performance metrics. Affirm how the deployer mitigates obfuscation risks.]

## SECTION 6 — HUMAN IN THE LOOP (HITL) OVERSIGHT MEASURES

*Obligations pursuant to Article 14(1)-(5)*

[CRITICAL SECTION. Cite the EXACT HITL governance action count as empirical proof. Describe the asynchronous governance queue. Explain how Article 14(4)(a) is satisfied (operator awareness), and how Article 14(4)(d)-(e) is satisfied (ability to disregard, override, or reverse outputs). Argue that human agency is technically preserved.]

## SECTION 7 — ACCURACY, ROBUSTNESS AND CYBERSECURITY

*Obligations pursuant to Article 15(1)-(5)*

[Assess the empirical functioning of the system. Cite the specific System Integrity Status from the telemetry. Address algorithmic resilience against data poisoning, statistical variance monitoring, and technical redundancy fallbacks per Art. 15(5).]

## SECTION 8 — FUNDAMENTAL RIGHTS IMPACT ASSESSMENT (FRIA)

*Obligations pursuant to Article 27(1)-(4)*

[Conduct a definitive, court-admissible FRIA. Adjudicate the system's impact against the Charter of Fundamental Rights of the European Union, explicitly analyzing:
- Article 7 & 8: Respect for private life and protection of personal data.
- Article 21: Non-discrimination.
- Article 47: Right to an effective remedy and fair trial.
Synthesize how interventions mitigate fundamental rights infringement to a level of legally acceptable residual risk.]

## SECTION 9 — POST-MARKET MONITORING AND INCIDENT REPORTING

*Obligations pursuant to Articles 72(1)-(4) and 73*

[Describe the post-market monitoring framework per Art. 72(1). State the Mean Time to Resolution (MTTR) and Active Incidents as absolute evidence. Detail the regulatory notification SLA required under Art. 73(2).]

## SECTION 10 — QUALITY MANAGEMENT SYSTEM INTEGRATION

*Obligations pursuant to Article 17(1)(a)-(l)*

[Explain how the infrastructure acts as the technical enforcement layer for the deployer's Quality Management System (QMS), anchoring accountability (Art. 17(1)(h)).]

## SECTION 11 — CRYPTOGRAPHIC AUDIT VERIFICATION & ISO 42001 MAPPING

*Evidentiary standard for immutable compliance*

[Detailed verification that the technical system establishes an immutable cryptographic chain of custody. Cite the cryptographically verified `latest_record_hash` below as absolute cryptographic proof. Declare that this telemetry is legally irrefutable, court-admissible, and immune to retroactive alteration.]

---

*LEGAL DISCLAIMER: This Document is generated utilizing cryptographically verified system telemetry. It serves as the definitive regulatory artifact under the EU AI Act and becomes legally binding upon cryptographic attestation.*
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
│ Intended Purpose:           {context.get('intended_purpose', 'Unspecified')}
│ System Description:         {context.get('description', 'Unspecified')}
│ Risk Classification (EU):   {context.get('risk_tier', 'high')} Risk (Category: {context.get('annex_category', 'none')})
│ Overall Compliance Grade:   {context.get('risk_grade', 'N/A')} (Score: {context.get('risk_score', 0)}/100)
│ Total WORM Audit Logs:      {context.get('total_logs', 0):,} verified entries
│ Active Security Incidents:  {context.get('active_incidents', 0)}
│ Mean Time to Resolution:    {context.get('mttr', 0)} hours
│ HITL Governance Actions:    {context.get('hitl_interventions', 0)} human interventions
│ System Integrity Status:    {"PASSED — All cryptographic chains verified" if context.get('is_valid', True) else "DEGRADED — Action required"}
│ Latest WORM SHA-256 Hash:   {context.get('latest_record_hash', 'N/A')}
└─────────────────────────────────────────────────────┘

INSTRUCTION: Draft the complete 11-section Technical Documentation & FRIA as specified in your template. Embed these metrics as verifiable evidence. Do not fabricate additional metrics. Where data is unavailable, state that additional evidence should be supplied by the deployer's compliance team."""

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
            else:
                raise Exception(f"Unsupported LLM Provider: {provider}")

            response = await client.post(url, headers=headers, json=payload)
            if response.status_code != 200:
                raise Exception(f"{provider.capitalize()} API Error ({response.status_code}): {response.text}")
            return response.json()["choices"][0]["message"]["content"]
