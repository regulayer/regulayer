"""
AI + Regulayer Integration App
--------------------------------
• Uses Groq API
• Logs every AI decision to Regulayer
• Handles Gate and Observe Modes natively via SDK
"""

import os
import uuid
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

# Import the native SDK logic
from regulayer import configure, trace
from regulayer.errors import GovernanceBlockedError, DuplicateDecisionError

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-app")

# Safely extract and clean the keys to prevent 401s from whitespace/quotes
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip(' \'"')
REGULAYER_API_KEY = os.getenv("REGULAYER_API_KEY", "").strip(' \'"')

if not GROQ_API_KEY or not REGULAYER_API_KEY:
    raise RuntimeError(
        "Missing API Keys! Please ensure you have generated a Project API Key from the "
        "Regulayer Dashboard and a Groq API Key. Set GROQ_API_KEY and REGULAYER_API_KEY "
        "in your .env file."
    )

logger.info(f"Loaded Regulayer API Key starting with: {REGULAYER_API_KEY[:10]}...")

# Configure Regulayer SDK natively
# We disable retries (max_retries=0) because Gate-mode governance LLM policies
# can sometimes take a little longer. If they take too long, the SDK
# could retry the exact same payload, leading to a 409 DuplicateDecisionError!
configure(
    api_key=REGULAYER_API_KEY,
    endpoint="http://localhost:8080",
    max_retries=0,        # <--- FIX: Prevent duplicate 409s on slow LLM calls
    timeout_seconds=60.0  # <--- FIX: Give the backend policy engine enough time
)

groq_client = Groq(api_key=GROQ_API_KEY)
app = FastAPI(title="Groq AI + Regulayer App")

class AIRequest(BaseModel):
    prompt: str
    temperature: float = 0.7

@app.get("/")
def health():
    return {"status": "running"}

@app.post("/ask")
def ask_ai(request: AIRequest):
    """
    Ask Groq AI and record the decision securely in Regulayer.
    """
    decision_id = str(uuid.uuid4())
    logger.info(f"New decision request: {decision_id}")

    try:
        # Step 1: Execute your AI Logic
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": request.prompt}],
            temperature=request.temperature
        )
        ai_output = response.choices[0].message.content

        # Step 2: Record decision natively 
        # If the Dashboard is set to "Gate" mode, this trace block executes 
        # synchronously and validates the policy rules instantly.
        with trace(system="groq-app", decision_id=decision_id) as t:
            t.set_input({
                "prompt": request.prompt,
                "temperature": request.temperature
            })
            t.set_output({
                "response": ai_output,
                "model": "llama-3.1-8b-instant"
            })
            
        logger.info(f"Successfully recorded (or queued) decision {decision_id}")
        return {
            "decision_id": decision_id,
            "response": ai_output,
            "status": "success",
            "message": "Passed Governance or Queued in Observe mode"
        }

    except GovernanceBlockedError as e:
        logger.warning(f"BLOCKED BY GOVERNANCE: {e.message}")
        raise HTTPException(
            status_code=403, 
            detail={
                "status": "blocked",
                "message": getattr(e, "message", str(e)),
                "decision_id": decision_id
            }
        )
    except DuplicateDecisionError as e:
        logger.warning(f"Already Exists: {e.message}")
        raise HTTPException(
            status_code=409, 
            detail={
                "status": "conflict",
                "message": "This decision ID was already successfully processed.",
                "decision_id": decision_id
            }
        )
    except Exception as e:
        logger.error(f"Execution Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
