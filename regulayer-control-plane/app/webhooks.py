import httpx
import hmac
import hashlib
import json
import asyncio
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from loguru import logger
from typing import Dict, Any, List

from .storage import WebhookDestinationDB

async def _fire_webhook(w: WebhookDestinationDB, body: bytes, event_type: str):
    signature = hmac.new(w.secret.encode('utf-8'), body, hashlib.sha256).hexdigest()
    headers = {
        "Content-Type": "application/json",
        "X-Regulayer-Signature": f"sha256={signature}",
        "X-Regulayer-Event": event_type,
        "User-Agent": "Regulayer-Webhook/1.0"
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(w.url, content=body, headers=headers, timeout=5.0)
            if resp.status_code >= 400:
                logger.warning(f"Webhook {w.id} ({w.name}) failed with status {resp.status_code}")
                # We could implement exponential backoff here in a robust system
    except Exception as e:
        logger.error(f"Failed to dispatch webhook {w.id} ({w.name}) to {w.url}: {e}")

async def dispatch_webhook(db: Session, org_id: str, event_type: str, payload: Dict[Any, Any]):
    """
    Finds applicable webhooks for an organization and event type, and fires them.
    """
    try:
        webhooks = db.query(WebhookDestinationDB).filter(
            WebhookDestinationDB.organization_id == org_id,
            WebhookDestinationDB.status == "active"
        ).all()
        
        targets = [w for w in webhooks if event_type in w.events]
        if not targets:
            return
            
        wrapper = {
            "event_type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "organization_id": str(org_id),
            "data": payload
        }
        
        body = json.dumps(wrapper).encode('utf-8')
        
        # Fire requests concurrently
        await asyncio.gather(*(_fire_webhook(w, body, event_type) for w in targets))
    except Exception as e:
        logger.error(f"Error during webhook dispatch setup: {e}")
