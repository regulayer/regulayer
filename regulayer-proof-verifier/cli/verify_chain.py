import os
import json
from typing import Dict, Any, List

from .errors import ErrorCode, VerificationError
from .verify import verify_proof_command

def verify_chain_command(proof_dir: str, strict: bool = False) -> Dict[str, Any]:
    """
    Verify a directory of proof bundles as a chain.
    
    Steps:
    1. Load all JSON files.
    2. Sort by record_id.
    3. Verify individual integrity.
    4. Verify hash links (previous_record_hash == predecessor's record_hash).
    5. (Strict mode) Verify no gaps.
    
    Returns summary dict on success.
    Raises VerificationError on failure.
    """
    # 1. Load all JSON files
    bundles = []
    for filename in os.listdir(proof_dir):
        if filename.endswith(".json"):
            filepath = os.path.join(proof_dir, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                bundles.append({"file": filename, "data": data})
            except json.JSONDecodeError as e:
                raise VerificationError(ErrorCode.INVALID_JSON, f"Invalid JSON in {filename}: {str(e)}")
    
    if len(bundles) == 0:
        raise VerificationError(ErrorCode.FILE_NOT_FOUND, f"No JSON files found in {proof_dir}")
    
    # 2. Sort by record_id
    try:
        bundles.sort(key=lambda b: b["data"]["record_id"])
    except KeyError:
        raise VerificationError(ErrorCode.SCHEMA_ERROR, "One or more bundles missing record_id")
    
    # 3. Verify individual integrity + chain links
    errors: List[str] = []
    previous_hash = None
    previous_id = None
    
    for bundle in bundles:
        data = bundle["data"]
        record_id = data.get("record_id")
        
        # 3a. Verify individual integrity (reuse verify logic)
        # We inline a simpler check here to avoid re-reading file
        # Just check hash and signature
        from crypto.canonicalizer import canonicalize
        from crypto.hasher import compute_hash
        from crypto.verifier import verify_signature
        
        canonical_bytes = canonicalize(data["canonical_event"])
        computed_hash = compute_hash(canonical_bytes)
        
        if computed_hash != data.get("record_hash"):
            errors.append(f"Record {record_id}: Hash mismatch")
            continue
        
        # Signature check
        attestation = data.get("attestation")
        if attestation:
            pub_key = attestation.get("public_key")
            sig = attestation.get("signature")
            if pub_key and sig:
                if not verify_signature(pub_key, sig, canonical_bytes):
                    errors.append(f"Record {record_id}: Invalid signature")
        
        # 3b. Chain Link Check
        if previous_hash is not None:
            if data.get("previous_record_hash") != previous_hash:
                errors.append(f"Record {record_id}: Broken chain link (expected prev={previous_hash[:16]}...)")
        
        # 3c. Strict Mode: Gap Check
        if strict and previous_id is not None:
            if record_id != previous_id + 1:
                errors.append(f"Record {record_id}: Gap detected (previous was {previous_id})")
        
        previous_hash = data.get("record_hash")
        previous_id = record_id
    
    if errors:
        raise VerificationError(ErrorCode.BROKEN_CHAIN, "; ".join(errors[:5]))  # Limit errors
    
    return {
        "status": "PASS",
        "total_records": len(bundles),
        "first_record_id": bundles[0]["data"]["record_id"],
        "last_record_id": bundles[-1]["data"]["record_id"]
    }
