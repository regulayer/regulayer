"""
Regulayer Recorder - Cryptographic Operations representing the entire chain.
"""

import hashlib
from typing import List

def _hash_pair(left: str, right: str) -> str:
    """Hash two HEX strings together using SHA-256."""
    combined = bytes.fromhex(left) + bytes.fromhex(right)
    return hashlib.sha256(combined).hexdigest()

def generate_merkle_anchor(record_hashes: List[str]) -> str:
    """
    Generate a cryptographic Merkle Root from a sequence of record hashes.
    This creates an absolute proof of the chain's state that can be
    anchored to Ethereum, Arweave, or Bitcoin.
    """
    if not record_hashes:
        # Empty chain hash representation
        return hashlib.sha256(b"REGULAYER_EMPTY_CHAIN").hexdigest()
        
    leaves = [h for h in record_hashes]
    
    # Bottom-up pairing
    while len(leaves) > 1:
        next_level = []
        # Process in pairs
        for i in range(0, len(leaves), 2):
            left = leaves[i]
            # If odd number of leaves, duplicate the last one (standard Merkle behavior)
            right = leaves[i + 1] if i + 1 < len(leaves) else left
            next_level.append(_hash_pair(left, right))
            
        leaves = next_level
        
    return leaves[0]
