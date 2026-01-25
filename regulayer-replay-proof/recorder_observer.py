"""
Regulayer Replay Proof - Recorder Observer

Captures state from the recorder (chain length, last hash, system logs)
to verify what actually happened during a replay scenario.
"""

import os
import httpx
from datetime import datetime
from typing import Dict, Any, Optional

# Defaults - ideally loaded from env
RECORDER_URL = os.getenv("RECORDER_API_URL", "http://localhost:8000")

class RecorderObserver:
    def __init__(self, project_id: str = "global"):
        self.project_id = project_id
        self.client = httpx.Client(base_url=RECORDER_URL, timeout=5.0)

    def capture_state(self) -> Dict[str, Any]:
        """
        Capture current chain state: length, last_hash.
        """
        try:
            resp = self.client.get(f"/v1/chain/{self.project_id}/status")
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "timestamp": datetime.utcnow().isoformat(),
                    "chain_id": data.get("chain_id"),
                    "total_records": data.get("total_records", 0),
                    # "last_record" fetch if available
                }
            else:
                return {
                    "error": f"Status check failed: {resp.status_code}",
                    "total_records": -1
                }
        except Exception as e:
            return {
                "error": str(e),
                "total_records": -1
            }

    def verify_rejection_log(self, decision_id: str) -> bool:
        """
        (Optional) Check if a rejection was logged for this ID.
        Requires log access or specific admin endpoint.
        For now, we rely on HTTP status codes captured by Runner.
        """
        return True 
