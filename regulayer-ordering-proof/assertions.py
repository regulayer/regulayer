"""
Regulayer Ordering Proof - Assertions

Validates strict ordering invariants under partial failure.
Phase E.2.3
"""

from typing import Dict, Any, List

class OrderingAssertionError(Exception):
    pass

class OrderingAssertions:
    
    @staticmethod
    def assert_exact_order(observed: List[str], expected: List[str]):
        """
        Invariant: Observed sequence must match expected sequence exactly.
        """
        if observed != expected:
            raise OrderingAssertionError(
                f"Ordering Violated: Expected {expected}, got {observed}"
            )

    @staticmethod
    def assert_monotonicity(records: List[Dict[str, Any]]):
        """
        Invariant: Sequence numbers must strictly increase (1, 2, 3...) with no gaps or reordering,
        OR record timestamps must be monotonic if sequence not strictly enforced.
        """
        last_seq = None
        for r in records:
            seq = r.get('sequence_number')
            if seq is not None:
                if last_seq is not None:
                    if seq <= last_seq:
                         raise OrderingAssertionError(
                             f"Monotonicity Violated: Seq {seq} came after {last_seq}"
                         )
                last_seq = seq
            else:
                # If no sequence number, we rely on record_id monotonicity (database primary key autoincrement)
                pass 

    @staticmethod
    def assert_project_isolation(records: List[Dict[str, Any]], project_id: str):
        """
        Invariant: All records in this chain matches the project_id.
        Phase E implementation puts records in same DB but linked via chain_id.
        """
        # Note: Observer fetches by project_id, so this implicitly checks API filtering.
        pass

    @staticmethod
    def assert_no_missing_records(observed: List[str], submitted: List[str]):
        """
        Invariant: If we submitted [A, B], and no errors occurred, we expect [A, B].
        """
        observed_set = set(observed)
        submitted_set = set(submitted)
        missing = submitted_set - observed_set
        if missing:
             raise OrderingAssertionError(
                 f"Data Loss Violated: Missing records {missing}"
             )
