"""
Regulayer Consistency Proof - Assertions

Validates strict cross-service consistency invariants.
Phase E.2.4
"""

from typing import Dict, Any

class ConsistencyAssertionError(Exception):
    pass

class ConsistencyAssertions:
    
    @staticmethod
    def assert_single_source_of_truth(observations: Dict[str, str]):
        """
        Invariant: If Recorder says 'not_found', NO other service (Verifier, Export, UI)
        can say 'found'.
        """
        recorder_state = observations.get("recorder_state", "unavailable")
        
        if recorder_state == "not_found":
            for service in ["verifier_state", "export_state", "ui_state"]:
                state = observations.get(service, "unavailable")
                if state == "found" or state == "valid": # valid is for verifier
                     raise ConsistencyAssertionError(
                         f"Split-Brain Detected: Recorder says not_found but {service} says {state}"
                     )

    @staticmethod
    def assert_visibility_consistency(observations: Dict[str, str]):
        """
        Invariant: UI, Verifier, and Export should generally align.
        If Verifier says 'valid', Export should say 'found'.
        """
        verifier = observations.get("verifier_state")
        export = observations.get("export_state")
        
        # If Verifier confirms validity, Export must allow download.
        if verifier == "valid" and export == "not_found":
             raise ConsistencyAssertionError(
                 f"Inconsistency: Verifier says valid but Export says not_found"
             )

    @staticmethod
    def assert_offline_parity(online_result: str, offline_result: str):
        """
        Invariant: Offline verification result must match Online result.
        """
        if online_result != offline_result:
             raise ConsistencyAssertionError(
                 f"Offline Parity Failed: Online={online_result}, Offline={offline_result}"
             )

    @staticmethod
    def assert_forbidden(forbidden_keys: list, observations: Dict[str, str]):
        """
        Check specific forbidden states from scenario.
        """
        # Mapping forbidden keys to logic
        if "partial_record_visible" in forbidden_keys:
            # Implies we found it somewhere but not fully committed?
            # Or specifically if recorder is down/failed, we shouldn't see it.
            # Reuse single source check.
            ConsistencyAssertions.assert_single_source_of_truth(observations)
