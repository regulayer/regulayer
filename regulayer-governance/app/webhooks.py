"""
Regulayer Governance - External Webhook Dispatchers

Handles sending rich action-oriented notifications to enterprise tools (Slack, Teams).
"""

import httpx
import logging
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

async def dispatch_slack_interception(
    webhook_url: str,
    decision_id: str,
    project_id: str,
    risk_level: str,
    reason: str,
    system_name: str = "Unknown System",
    decision_input: Optional[Dict[str, Any]] = None,
    decision_output: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Dispatch a rich Slack Block-Kit message when a decision is intercepted and requires approval.
    """
    if not webhook_url:
        return False
        
    color = "#FF0000" if risk_level.lower() == "high" else "#FFA500"
    
    # Format input/output nicely for Slack
    input_str = json.dumps(decision_input, indent=2)[:500] + ("..." if len(json.dumps(decision_input)) > 500 else "") if decision_input else "{}"
    output_str = json.dumps(decision_output, indent=2)[:500] + ("..." if len(json.dumps(decision_output)) > 500 else "") if decision_output else "{}"
    
    # A public URL to deep-link to the Regulayer Dashboard
    # In production, this would be read from settings (e.g., https://app.regulayer.tech)
    dashboard_url = f"https://regulayer.app/decisions/{decision_id}"

    payload = {
        "text": f"🚨 Regulayer Governance: Interception in {project_id}",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"🚨 AI Decision Intercepted: {system_name}",
                    "emoji": True
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Project:* {project_id}\n*Risk:* `{risk_level.upper()}`\n*Reason:* {reason}"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Input Context:*\n```\n{input_str}\n```"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Proposed Output:*\n```\n{output_str}\n```"
                }
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "plain_text",
                        "text": f"Decision ID: {decision_id} | Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}",
                        "emoji": True
                    }
                ]
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "emoji": True,
                            "text": "Review in Dashboard"
                        },
                        "style": "primary",
                        "url": dashboard_url,
                        "value": "review_decision"
                    }
                ]
            }
        ]
    }
    
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.post(webhook_url, json=payload)
            resp.raise_for_status()
            logger.info(f"Successfully dispatched Slack Block-Kit for {decision_id}")
            return True
    except Exception as e:
        logger.error(f"Failed to dispatch Slack webhook for {decision_id}: {e}")
        return False
