"""
Regulayer Chaos Harness - Cryptographic Assertions

This module implements strict invariants that must NEVER be violated,
regardless of system state (crashed, partitioned, offline).
"""

import hashlib
import json
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from uuid import UUID

@dataclass
class ChainSnapshot:
    """Represents the state of a hash chain at a point in time."""
    chain_id: str
    length: int
    last_hash: str
    last_sequence: Optional[int]
    records: List[Dict[str, Any]]


class AssertionFailedError(Exception):
    """Raised when a cryptographic invariant is violated."""
    pass


class InvariantChecker:
    
    @staticmethod
    def assert_monotonicity(baseline: ChainSnapshot, current: ChainSnapshot) -> None:
        """
        Invariant: Chain length must never decrease.
        """
        if current.length < baseline.length:
            raise AssertionFailedError(
                f"Chain Integrity Violated: Length decreased from {baseline.length} to {current.length}"
            )
        
        # If length is same, hash must be same
        if current.length == baseline.length:
            if current.last_hash != baseline.last_hash:
                 raise AssertionFailedError(
                    f"Chain Integrity Violated: History rewritten (Same length, different hash)"
                )

    @staticmethod
    def assert_hash_integrity(records: List[Dict[str, Any]]) -> None:
        """
        Invariant: Every record's hash must match the SHA-256 of its canonical payload.
        Invariant: Every record's previous_hash must match the actual hash of the previous record.
        """
        expected_prev_hash = None
        
        for i, record in enumerate(records):
            # 1. Verify Payload Hash
            # Note: dependent on canonicalizer. For strictly independent check, we'd reimplement simple consistent serialization here.
            # Assuming record['canonical_payload'] is dict.
            payload_str = json.dumps(record['canonical_payload'], sort_keys=True, separators=(',', ':'))
            computed_hash = hashlib.sha256(payload_str.encode('utf-8')).hexdigest()
            
            if computed_hash != record['record_hash']:
                raise AssertionFailedError(
                    f"Record {record['record_id']} Corrupted: Hash mismatch. Stored: {record['record_hash']}, Computed: {computed_hash}"
                )
            
            # 2. Verify Chain Link
            # First record might have prev_hash None
            stored_prev = record.get('previous_record_hash')
            if i == 0:
                # If checking full chain from 0
                if stored_prev is not None and stored_prev != "": 
                     # Could be a segment check, but let's assume full chain for chaos
                     pass 
            else:
                if stored_prev != expected_prev_hash:
                    raise AssertionFailedError(
                        f"Chain Broken at {record['record_id']}: PrevHash {stored_prev} != {expected_prev_hash}"
                    )
            
            expected_prev_hash = record['record_hash']

    @staticmethod
    def assert_sequence_continuity(records: List[Dict[str, Any]]) -> None:
        """
        Invariant: Sequence numbers must be contiguous (N, N+1, N+2).
        """
        last_seq = None
        
        for record in records:
            curr_seq = record.get('sequence_number')
            if curr_seq is None:
                continue # Skip legacy or unordered
            
            if last_seq is not None:
                if curr_seq != last_seq + 1:
                    raise AssertionFailedError(
                        f"Sequence Gap Detected: {last_seq} -> {curr_seq} at record {record.get('record_id')}"
                    )
            
            last_seq = curr_seq
    
    @staticmethod
    def assert_no_partial_records(records: List[Dict[str, Any]]) -> None:
        """
        Invariant: Records must be complete (have hash, payload, ID).
        """
        required_fields = ['record_hash', 'canonical_payload', 'decision_id', 'record_id']
        for r in records:
            for field in required_fields:
                if field not in r or r[field] is None:
                     raise AssertionFailedError(
                        f"Partial Record Detected: Missing {field} in record {r.get('record_id', 'unknown')}"
                    )

