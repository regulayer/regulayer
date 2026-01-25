"""
Public Blockchain Adapter

Implements time anchoring via public blockchains.
"""

from datetime import datetime
from typing import Literal

from ..models import TimeAnchor, AnchorType
from ..anchors import BaseAnchorAdapter, compute_anchoring_hash


class PublicBlockchainAdapter(BaseAnchorAdapter):
    """
    Public blockchain time anchoring.
    
    Uses Bitcoin, Ethereum, or other public blockchains
    to anchor a hash, proving existence before a block time.
    
    TRUST MODEL:
    - Blockchain immutability
    - Public verifiability
    - No central authority
    - Higher latency (block times)
    """
    
    def __init__(
        self,
        chain: Literal["bitcoin", "ethereum"] = "bitcoin"
    ):
        self.chain = chain
    
    async def anchor(self, record_hash: str) -> TimeAnchor:
        """
        Anchor to public blockchain.
        
        In production, this would:
        1. Create OP_RETURN transaction (Bitcoin)
        2. Or emit event on contract (Ethereum)
        3. Wait for confirmation
        4. Return transaction hash
        """
        anchoring_hash = compute_anchoring_hash(record_hash)
        timestamp = datetime.utcnow()
        
        return TimeAnchor(
            anchor_type=AnchorType.PUBLIC_BLOCKCHAIN,
            anchor_reference=f"{self.chain}:tx:placeholder",
            anchor_timestamp=timestamp,
            anchoring_hash=anchoring_hash,
            verification_hint=f"Verify on {self.chain} block explorer",
            raw_response=None
        )
    
    async def verify(self, anchor: TimeAnchor) -> bool:
        """
        Verify blockchain anchor.
        
        In production, this would:
        1. Fetch transaction
        2. Verify hash in OP_RETURN or event
        3. Check block timestamp
        4. Verify sufficient confirmations
        """
        return anchor.anchor_type == AnchorType.PUBLIC_BLOCKCHAIN


# Block explorers for verification hints
BLOCK_EXPLORERS = {
    "bitcoin": "https://blockstream.info/tx/",
    "ethereum": "https://etherscan.io/tx/",
}
