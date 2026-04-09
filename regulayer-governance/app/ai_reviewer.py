"""
Regulayer Governance - AI Review Assistant
Integrates with Groq to automatically evaluate incoming decisions.
"""

import json
import logging
from typing import Dict, Any, Optional, Tuple
from groq import AsyncGroq
from .config import settings

logger = logging.getLogger(__name__)

async def analyze_decision_risk(
    decision_input: Dict[str, Any],
    decision_output: Dict[str, Any],
    policy_json: Dict[str, Any]
) -> Tuple[str, str, Optional[str]]:
    """
    Analyzes a decision using an LLM to determine its risk level based on org policies.
    Returns: (risk_level, action_reason, suggested_assignment(role))
    """
    if not settings.groq_api_key:
        logger.warning("GROQ_API_KEY not configured. Falling back to default risk evaluation.")
        return ("low", "Default risk assessment due to missing Groq API Key.", "reviewer")

    try:
        client = AsyncGroq(api_key=settings.groq_api_key)
        
        prompt = f"""
        You are an AI governance compliance engine. Evaluate the following decision and 
        determine its risk level according to the provided org policy.

        ORG POLICY
        ----------
        {json.dumps(policy_json, indent=2) if policy_json else 'Default: Any PII is high risk, otherwise low.'}

        DECISION INPUT
        --------------
        {json.dumps(decision_input, indent=2)}

        DECISION OUTPUT
        ---------------
        {json.dumps(decision_output, indent=2)}

        Provide your analysis in EXACT JSON format with the following keys:
        - "risk_level": string ("low", "medium", "high")
        - "action_reason": string (a short justification for this risk level)
        - "suggested_assignment": string ("reviewer", "compliance", "admin", or null)
        
        Output only raw JSON.
        """

        response = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You output only valid JSON matching the requested schema. No markdown wrapping."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.0
        )
        
        raw_text = response.choices[0].message.content.strip()
        # Clean potential markdown wrapping
        if raw_text.startswith("```json"):
            raw_text = raw_text[len("```json"):].strip()
        if raw_text.startswith("```"):
            raw_text = raw_text[len("```"):].strip()
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3].strip()

        analysis = json.loads(raw_text)
        
        return (
            analysis.get("risk_level", "medium"),
            analysis.get("action_reason", "AI categorized based on context."),
            analysis.get("suggested_assignment", "reviewer")
        )
        
    except Exception as e:
        logger.error(f"Failed to analyze decision with Groq: {e}")
        return ("medium", f"Failed AI analysis: {str(e)}", "compliance")
