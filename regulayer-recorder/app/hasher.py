"""
Regulayer Decision Recorder - Record Hashing & Chain Computation

SHA-256 hashing for records and hash chain computation.
"""

import hashlib
from typing import Optional


def hash_canonical_event(canonical_payload: str) -> str:
    """
    Compute SHA-256 hash of canonical event payload.
    
    Args:
        canonical_payload: Canonical JSON string
    
    Returns:
        SHA-256 hash as 64-character hex string
    """
    encoded = canonical_payload.encode('utf-8')
    return hashlib.sha256(encoded).hexdigest()


def compute_record_hash(canonical_payload: str) -> str:
    """
    Compute record hash (same as canonical_payload_hash).
    
    This is the primary identifier for the record in the chain.
    
    Args:
        canonical_payload: Canonical JSON string
    
    Returns:
        SHA-256 hash as 64-character hex string
    """
    return hash_canonical_event(canonical_payload)


def verify_chain_link(
    record_hash: str,
    previous_record_hash: Optional[str],
    stored_previous_hash: Optional[str]
) -> bool:
    """
    Verify that a record correctly links to the previous record.
    
    Args:
        record_hash: Current record's hash
        previous_record_hash: Hash this record claims as previous
        stored_previous_hash: Actual previous record's hash from database
    
    Returns:
        True if link is valid, False otherwise
    
    Rules:
        - First record: previous_record_hash must be None, stored_previous_hash must be None
        - Subsequent records: previous_record_hash must equal stored_previous_hash
    """
    # First record case
    if stored_previous_hash is None:
        return previous_record_hash is None
    
    # Subsequent records
    return previous_record_hash == stored_previous_hash


def verify_record_hash(canonical_payload: str, claimed_hash: str) -> bool:
    """
    Verify that a record's hash matches its canonical payload.
    
    Args:
        canonical_payload: Canonical JSON string
        claimed_hash: Claimed hash of the payload
    
    Returns:
        True if hash matches, False if tampered
    """
    actual_hash = hash_canonical_event(canonical_payload)
    return actual_hash == claimed_hash
