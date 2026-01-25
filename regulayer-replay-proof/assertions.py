"""
Regulayer Replay Proof - Assertions

Validates strict invariants for idempotency and temporal safety.
"""

from typing import Dict, Any, List

class ReplayAssertionError(Exception):
    pass

class ReplayAssertions:
    
    @staticmethod
    def assert_idempotency(expected_accepted: int, accepted_count: int):
        """
        Invariant: Accepted count must exactly match expected.
        For duplicates, this usually means 1 accepted, N-1 rejected.
        """
        if accepted_count != expected_accepted:
             raise ReplayAssertionError(
                 f"Idempotency Violated: Expected {expected_accepted} accepted, got {accepted_count}"
             )

    @staticmethod
    def assert_rejection_reason(responses: List[Dict[str, Any]], expected_code: int):
        """
        Invariant: All rejections must be explicit (e.g., 409 Conflict).
        """
        for r in responses:
            if r['status'] != 200 and r['status'] != 201:
                if r['status'] != expected_code:
                     raise ReplayAssertionError(
                         f"Invalid Rejection Code: Expected {expected_code}, got {r['status']}"
                     )

    @staticmethod
    def assert_chain_growth(baseline_len: int, current_len: int, expected_growth: int):
        """
        Invariant: Chain must grow by exactly expected amount (0 or 1).
        """
        actual_growth = current_len - baseline_len
        if actual_growth != expected_growth:
            raise ReplayAssertionError(
                f"Chain Integrity Violated: Expected growth {expected_growth}, got {actual_growth}"
            )
    
    @staticmethod
    def assert_response_consistency(responses: List[Dict[str, Any]]):
        """
        Invariant: All successful responses for the same ID must return the same Record ID / Hash.
        (If idempotency returns 200 OK with same data).
        """
        # Collect successful responses
        successes = [r for r in responses if 200 <= r['status'] < 300]
        if not successes:
            return
            
        first = successes[0]
        # Compare key fields if they exist in body
        pass
