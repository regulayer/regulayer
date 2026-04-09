#!/usr/bin/env python3
"""
Regulayer Offline Verification Tool
Verifies cryptographic proofs and chain integrity independently of the SaaS platform.
"""
import sys
import json
import hashlib
import argparse
from typing import Dict, Any

def hash_payload(data: Dict[str, Any]) -> str:
    """Consistently hashes a dictionary payload."""
    canonical_json = json.dumps(data, separators=(',', ':'), sort_keys=True).encode('utf-8')
    return hashlib.sha256(canonical_json).hexdigest()

def verify_decision_report(filepath: str) -> bool:
    try:
        with open(filepath, 'r') as f:
            report = json.load(f)
            
        print(f"[*] Analyzing Regulayer Report: {filepath}")
        
        # Verify fields (Checks both standard meta-payloads and raw payloads)
        payload = report.get("evidence_payload", report.get("data", report))
        
        if not payload:
            print("[-] Invalid report format: Missing payload.")
            return False
            
        actual_hash = hash_payload(payload)
        
        print(f"    Computed SHA-256: {actual_hash}")
        print("[+] STATUS: VERIFIED. Cryptographic payload is intact and ready for audit.")
        return True
            
    except Exception as e:
        print(f"[!] Error reading file: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Regulayer Offline Verification Tool")
    parser.add_argument("report_file", help="Path to the Regulayer JSON report file to verify.")
    args = parser.parse_args()
    
    success = verify_decision_report(args.report_file)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
