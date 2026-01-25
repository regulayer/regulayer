"""
Regulayer Temporal Proof - Assertions

Validates strict temporal invariants for historical proofs.
"""

class TemporalAssertionError(Exception):
    pass

class TemporalAssertions:
    
    @staticmethod
    def assert_result_stability(baseline_result: str, current_result: str):
        """
        Invariant: Verification result must not change over time.
        """
        if baseline_result != current_result:
             raise TemporalAssertionError(
                 f"Stability Violated: Baseline={baseline_result}, Current={current_result}"
             )

    @staticmethod
    def assert_key_independence(verification_result: str):
        """
        Invariant: Verification must succeed even if key is rotated/archived.
        """
        if verification_result != "valid":
             raise TemporalAssertionError(
                 f"Key Independence Failed: Verification failed ({verification_result}) likely due to key rotation"
             )

    @staticmethod
    def assert_incident_non_retroactivity(verification_result: str, incident_time: str, record_time: str):
        """
        Invariant: Incidents after record creation do not invalidate record.
        """
        if verification_result != "valid":
             raise TemporalAssertionError(
                 f"Incident Retroactivity Violated: Record from {record_time} failed verification despite incident being later ({incident_time})"
             )

    @staticmethod
    def assert_offline_sufficiency(verification_result: str, network_status: str):
        """
        Invariant: Must verify valid even if offline.
        """
        if network_status == "disconnected" and verification_result != "valid":
             raise TemporalAssertionError(
                 f"Offline Sufficiency Failed: Verification failed in disconnected state"
             )
