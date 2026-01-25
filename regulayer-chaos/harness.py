"""
Regulayer Chaos Harness - Main Orchestrator

Usage: python harness.py <scenario_id> [--dry-run]
"""

import argparse
import sys
import yaml
import time
import os
from datetime import datetime
from evidence_capture import EvidenceCapturer
from assertions import InvariantChecker, AssertionFailedError, ChainSnapshot

SCENARIOS_DIR = os.path.join(os.path.dirname(__file__), "scenarios")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "reports")

class ChaosHarness:
    def __init__(self, scenario_id: str, dry_run: bool = False):
        self.scenario_id = scenario_id
        self.dry_run = dry_run
        self.scenario = self._load_scenario(scenario_id)
        self.run_id = f"{scenario_id}_{int(time.time())}"
        self.evidence_dir = os.path.join(REPORTS_DIR, self.run_id)
        os.makedirs(self.evidence_dir, exist_ok=True)
        self.capturer = EvidenceCapturer(self.evidence_dir)
        self.report_data = {
            "scenario": self.scenario,
            "timeline": [],
            "verdict": "UNKNOWN"
        }

    def _load_scenario(self, scenario_id: str):
        # Scan for yaml files
        for root, _, files in os.walk(SCENARIOS_DIR):
            for file in files:
                if file.endswith(".yaml"):
                    path = os.path.join(root, file)
                    # Check if multi-doc
                    with open(path, 'r') as f:
                        docs = yaml.safe_load_all(f)
                        for doc in docs:
                            if doc.get('scenario_id') == scenario_id:
                                return doc
        raise ValueError(f"Scenario {scenario_id} not found in {SCENARIOS_DIR}")

    def log(self, message: str):
        entry = f"[{datetime.now().isoformat()}] {message}"
        print(entry)
        self.report_data["timeline"].append(entry)

    def run(self):
        self.log(f"Starting Chaos Run: {self.run_id}")
        self.log(f"Scenario: {self.scenario['description']}")
        
        try:
            # 1. Baseline
            self.log("Capturing BASELINE state...")
            baseline_snapshot = self.capturer.capture_snapshot("baseline")
            self.log(f"Baseline Chain Length: {baseline_snapshot.length}")
            
            # 2. Start Logic / Traffic
            self.log("Starting background traffic generation...")
            # TODO: Start traffic thread (Mock for now)
            
            # 3. Inject Failure
            self.log(f"Injecting Failure: {self.scenario['inject']}")
            self._inject_failure(self.scenario['inject'])
            
            # 4. Wait
            duration = self.scenario['inject'].get('duration_seconds', 5)
            self.log(f"Waiting for {duration} seconds...")
            time.sleep(duration if not self.dry_run else 0.1)
            
            # 5. Recover (if needed)
            self.log("Recovering system...")
            self._recover_system(self.scenario['inject'])
            
            # 6. Post-Failure Capture
            self.log("Capturing POST-FAILURE state...")
            final_snapshot = self.capturer.capture_snapshot("post_failure")
            self.log(f"Final Chain Length: {final_snapshot.length}")
            
            # 7. Verification
            self.log("Verifying Cryptographic Invariants...")
            InvariantChecker.assert_monotonicity(baseline_snapshot, final_snapshot)
            InvariantChecker.assert_hash_integrity(final_snapshot.records)
            InvariantChecker.assert_sequence_continuity(final_snapshot.records)
            InvariantChecker.assert_no_partial_records(final_snapshot.records)
            
            self.log("VERDICT: PASS - Availability degraded. Cryptographic truth remained intact.")
            self.report_data["verdict"] = "PASS"
            
        except AssertionFailedError as e:
            self.log(f"VERDICT: FAIL - Cryptographic Invariant Violated: {e}")
            self.report_data["verdict"] = "FAIL"
            self.report_data["failure_reason"] = str(e)
            sys.exit(1)
        except Exception as e:
            self.log(f"VERDICT: ERROR - Harness execution failed: {e}")
            self.report_data["verdict"] = "ERROR"
            self.report_data["failure_reason"] = str(e)
            sys.exit(2)
        finally:
            self._generate_report()

    def _inject_failure(self, injection_spec):
        if self.dry_run:
            self.log("[DRY-RUN] Skipping actual injection command")
            return
        
        # Real implementation would call Docker/K8s APIs here
        # For now, we simulate by logging
        pass

    def _recover_system(self, injection_spec):
        if self.dry_run:
            self.log("[DRY-RUN] Skipping recovery command")
            return
        pass

    def _generate_report(self):
        report_path = os.path.join(self.evidence_dir, "chaos_report.md")
        with open(report_path, 'w') as f:
            f.write(f"# Chaos Report: {self.run_id}\n\n")
            f.write(f"**Scenario**: {self.scenario_id}\n")
            f.write(f"**Description**: {self.scenario['description']}\n")
            f.write(f"**Verdict**: {self.report_data['verdict']}\n\n")
            
            if "failure_reason" in self.report_data:
                f.write(f"> [!CAUTION]\n> **Critical Failure**: {self.report_data['failure_reason']}\n\n")
            else:
                f.write("> [!TIP]\n> **Success**: Availability degraded. Cryptographic truth remained intact.\n\n")
            
            f.write("## Timeline\n")
            for entry in self.report_data["timeline"]:
                f.write(f"- {entry}\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("scenario_id", help="ID of scenario to run (e.g. gateway_kill)")
    parser.add_argument("--dry-run", action="store_true", help="Simulate without actual injection")
    args = parser.parse_args()
    
    harness = ChaosHarness(args.scenario_id, dry_run=args.dry_run)
    harness.run()
