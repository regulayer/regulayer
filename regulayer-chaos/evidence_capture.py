"""
Regulayer Chaos Harness - Evidence Capture

Responsible for safely capturing system state (API responses, DB snapshots)
without modifying it.
"""

import httpx
import os
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from assertions import ChainSnapshot

# Default config (can be overridden by Harness)
RECORDER_API_URL = os.getenv("RECORDER_API_URL", "http://localhost:8000")
DB_CONNECTION_STRING = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/regulayer")

class EvidenceCapturer:
    
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        self.client = httpx.Client(base_url=RECORDER_API_URL, timeout=10.0)
        
    def capture_snapshot(self, stage: str, project_id: str = "global") -> ChainSnapshot:
        """
        Capture current chain state from API.
        """
        try:
            # 1. Get Chain Status
            resp = self.client.get(f"/v1/chain/{project_id}/status")
            resp.raise_for_status()
            status = resp.json()
            
            # 2. Get Last Record (for hash)
            # Assuming an endpoint or we list latest. 
            # If we don't have get-last, we verify via verification endpoint
            # For this harness, let's assume we can export the latest to get hash.
            # Or we use internal knowledge if allowed. 
            # Let's try to verify the full chain to get the "records" list for our assertion engine.
            
            # In a real heavy chain, we'd fetch range. For unit/integration chaos, full chain is fine.
            # verify endpoint returns result, not records.
            # We need an export endpoint or DB access for full scrutiny.
            
            # Use specific export endpoint if available, else DB.
            # Let's assume we use DB for "Truth" in Chaos testing because API might be down.
            records = self._fetch_records_from_db(project_id)
            
            length = len(records)
            last_hash = records[-1]['record_hash'] if length > 0 else "0" * 64
            last_seq = records[-1].get('sequence_number') if length > 0 else None
            
            snapshot = ChainSnapshot(
                chain_id=project_id,
                length=length,
                last_hash=last_hash,
                last_sequence=last_seq,
                records=records
            )
            
            self._save_evidence(f"{stage}_snapshot.json", {
                "timestamp": datetime.utcnow().isoformat(),
                "chain_id": project_id,
                "length": length,
                "last_hash": last_hash,
                "record_count": len(records)
            })
            
            return snapshot
            
        except Exception as e:
            # If we fail to capture, that's significant if we expected uptime.
            # But if stage is "during_failure", it might be expected.
            # For snapshotting, we usually want DB access as ground truth even if API is dead.
            print(f"Warning: API capture failed: {e}. Falling back to DB only.")
            records = self._fetch_records_from_db(project_id) # Ensure this exists
            # Reconstruct snapshot from DB
            length = len(records)
            last_hash = records[-1]['record_hash'] if length > 0 else "0" * 64
            last_seq = records[-1].get('sequence_number') if length > 0 else None
             
            return ChainSnapshot(
                chain_id=project_id,
                length=length,
                last_hash=last_hash,
                last_sequence=last_seq,
                records=records
            )

    def _fetch_records_from_db(self, chain_id: str) -> List[Dict[str, Any]]:
        """
        Direct DB read for ground truth.
        """
        # Placeholder for DB Access - would use SQLAlchemy or asyncpg here.
        # For the purpose of this file generation, providing a mockable structure or basic implementation.
        # We'll use a simple SQL query simulation or actual library if available.
        # Since I generally can't install new libs in this env easily, 
        # I'll write this to be "injectable" or use what's available (sqlalchemy).
        
        # Assumption: We can import app session or use direct connection.
        # For safety/isolation, let's try to look at how tests do it or just rely on a "Dump" helper.
        
        # RETURNING EMPTY FOR NOW - implementation should occur when harness is run with env.
        return [] 

    def _save_evidence(self, filename: str, data: Dict[str, Any]):
        path = os.path.join(self.output_dir, filename)
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)

