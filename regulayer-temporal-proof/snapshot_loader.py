"""
Regulayer Temporal Proof - Snapshot Loader

Loads and parses historical proof bundles (snapshots).
"""
import json
import os
from typing import Dict, Any

SNAPSHOTS_DIR = os.path.join(os.path.dirname(__file__), "snapshots")

class SnapshotLoader:
    @staticmethod
    def load(snapshot_id: str) -> Dict[str, Any]:
        """
        Load a snapshot JSON by filename.
        """
        path = os.path.join(SNAPSHOTS_DIR, snapshot_id)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Snapshot {snapshot_id} not found in {SNAPSHOTS_DIR}")
        
        with open(path, 'r') as f:
            return json.load(f)

    @staticmethod
    def get_metadata(snapshot: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract crypto metadata (version, timestamp, key_id).
        """
        return {
            "version": snapshot.get("proof_version", "1.0"),
            "timestamp": snapshot.get("record_timestamp"),
            "key_id": snapshot.get("signature", {}).get("key_id"),
            "record_id": snapshot.get("record_id")
        }
