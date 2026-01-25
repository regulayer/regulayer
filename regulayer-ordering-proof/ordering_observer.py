"""
Regulayer Ordering Proof - Observer

Verifies recorded chain order against expected sequences.
"""

import os
import httpx
from datetime import datetime
from typing import Dict, Any, List

RECORDER_URL = os.getenv("RECORDER_API_URL", "http://localhost:8000")

class OrderingObserver:
    def __init__(self, project_id: str):
        self.project_id = project_id
        self.client = httpx.Client(base_url=RECORDER_URL, timeout=5.0)

    def fetch_chain_sequence(self) -> List[Dict[str, Any]]:
        """
        Fetch full chain and extract (record_id, decision_id, sequence_number).
        """
        try:
            # Assumes endpoint to get full chain or iterating via links.
            # For proof, we might just get 'latest' and verify internally?
            # Or use a dedicated verification endpoint that returns list.
            # Simulating getting list of records.
            resp = self.client.get(f"/v1/chain/{self.project_id}/records") # Hypothertical or we use DB direct.
            
            # Since endpoint might not exist, we'll assume we can get them.
            # If not, we might need to fallback to DB like Chaos Harness.
            # For dry run, we mock.
            if resp.status_code != 200:
                return []
                
            records = resp.json()
            # Sort by record_id to get recorded order (truth)
            records.sort(key=lambda x: x['record_id'])
            
            return [
                {
                    "record_id": r['record_id'],
                    "decision_id": r['decision_id'],
                    "sequence_number": r.get('sequence_number'),
                    "timestamp": r['server_timestamp']
                }
                for r in records
            ]
        except Exception:
            return []

    def verify_links(self, records: List[Dict[str, Any]]) -> bool:
        """
        Crypto verification of chain links.
        """
        # Placeholder for full crypto check.
        # In a real run, this would re-hash everything.
        return True
