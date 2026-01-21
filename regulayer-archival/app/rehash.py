"""
Regulayer Archival - Rehash Logic (Crypto Agility)

Re-hash without rewriting facts.
Original record hash stays immutable.
New hashes are layered on top, never replacing originals.
"""

import hashlib
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from .models import SecondaryHash


class RehashEngine:
    """
    Computes secondary hashes for crypto agility.
    
    CRITICAL RULES:
    - Original hashes are NEVER modified
    - Secondary hashes are LAYERED on top
    - This is for future-proofing, not replacement
    """
    
    SUPPORTED_ALGORITHMS = {
        "SHA3-256": hashlib.sha3_256,
        "SHA3-512": hashlib.sha3_512,
        "BLAKE2b": lambda: hashlib.blake2b(digest_size=64),
        "BLAKE2s": lambda: hashlib.blake2s(digest_size=32),
    }
    
    def compute_secondary_hash(
        self,
        decision_id: UUID,
        record_id: int,
        original_hash: str,
        canonical_payload: bytes,
        algorithm: str = "SHA3-512"
    ) -> SecondaryHash:
        """
        Compute a secondary hash using a modern algorithm.
        
        Args:
            decision_id: The decision being rehashed
            record_id: The record ID
            original_hash: The immutable original hash
            canonical_payload: The canonical payload bytes
            algorithm: Which algorithm to use
            
        Returns:
            SecondaryHash with both original and new hash
        """
        if algorithm not in self.SUPPORTED_ALGORITHMS:
            raise ValueError(f"Unsupported algorithm: {algorithm}")
        
        # Compute new hash
        hasher = self.SUPPORTED_ALGORITHMS[algorithm]()
        hasher.update(canonical_payload)
        new_hash = f"{algorithm.lower()}:{hasher.hexdigest()}"
        
        return SecondaryHash(
            decision_id=decision_id,
            record_id=record_id,
            original_hash=original_hash,
            original_algorithm="SHA-256",
            secondary_hash=new_hash,
            secondary_algorithm=algorithm,
            computed_at=datetime.now(timezone.utc),
            rationale=(
                f"Secondary {algorithm} hash computed for algorithm agility. "
                "Original SHA-256 hash remains the authoritative reference. "
                "This hash provides future-proofing if SHA-256 is deprecated."
            )
        )
    
    def batch_rehash(
        self,
        records: list,
        algorithm: str = "SHA3-512"
    ) -> list[SecondaryHash]:
        """
        Compute secondary hashes for multiple records.
        
        Useful for periodic future-proofing operations.
        """
        results = []
        for record in records:
            secondary = self.compute_secondary_hash(
                decision_id=record["decision_id"],
                record_id=record["record_id"],
                original_hash=record["original_hash"],
                canonical_payload=record["canonical_payload"],
                algorithm=algorithm
            )
            results.append(secondary)
        return results
    
    def verify_secondary_hash(
        self,
        secondary_hash: SecondaryHash,
        canonical_payload: bytes
    ) -> bool:
        """
        Verify a secondary hash against the payload.
        
        This is used when the original algorithm may be deprecated.
        """
        algorithm = secondary_hash.secondary_algorithm
        
        if algorithm not in self.SUPPORTED_ALGORITHMS:
            return False
        
        hasher = self.SUPPORTED_ALGORITHMS[algorithm]()
        hasher.update(canonical_payload)
        computed = f"{algorithm.lower()}:{hasher.hexdigest()}"
        
        return computed == secondary_hash.secondary_hash
    
    def get_recommended_algorithm(self) -> str:
        """
        Get the currently recommended algorithm for secondary hashes.
        
        This will evolve as cryptographic standards change.
        """
        # As of 2026, SHA3-512 is the recommended future-proof option
        return "SHA3-512"
    
    def explain_algorithm_choice(self, algorithm: str) -> str:
        """
        Explain why a specific algorithm is recommended.
        """
        explanations = {
            "SHA3-512": (
                "SHA3-512 is a NIST-approved hash function from the SHA-3 family. "
                "It uses a different construction (Keccak) than SHA-2, making it "
                "resistant to any potential SHA-2 weaknesses. Recommended for "
                "long-term archival where 20+ year verification is required."
            ),
            "SHA3-256": (
                "SHA3-256 provides 256-bit security using the Keccak construction. "
                "Suitable for most archival purposes."
            ),
            "BLAKE2b": (
                "BLAKE2b is a fast, secure hash function. While not NIST-approved, "
                "it is widely used and considered secure. Good for supplementary hashing."
            ),
            "BLAKE2s": (
                "BLAKE2s is optimized for 32-bit platforms. Similar security to BLAKE2b."
            ),
        }
        return explanations.get(algorithm, "No explanation available.")


# Global rehash engine instance
rehash_engine = RehashEngine()
