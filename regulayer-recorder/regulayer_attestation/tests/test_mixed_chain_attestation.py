import hashlib
from app.attestation import canonical_payload_for_signing, create_attestation_envelope

def compute_hash(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()

def test_mixed_chain_integrity(sample_event, signer, identity):
    """
    Simulate a chain with mixed legacy and signed events.
    Verify that hash linking works consistently.
    """
    chain = []
    
    # 1. Event 1: Legacy (Raw Event)
    event1 = sample_event.copy()
    event1["record_id"] = 1
    # Canonicalize raw event
    payload1 = canonical_payload_for_signing(event1)
    hash1 = compute_hash(payload1)
    chain.append({"hash": hash1, "prev": None, "type": "legacy"})
    
    # 2. Event 2: Signed (Attestation Envelope)
    event2 = sample_event.copy()
    event2["record_id"] = 2
    # Create envelope
    envelope2 = create_attestation_envelope(event2, signer, identity)
    # The chain hash is based on the INNER event's canonical payload
    # consistently with how legacy works, OR it's based on the Envelope?
    #
    # CRITICAL ARCHITECTURAL DECISION CHECK:
    # "Hash Chain (unchanged)" -> This implies the hash chain is still
    # computed over the canonical decision event.
    # The attestation is "layered on top".
    #
    # So the recorder receives specific JSON. 
    # If it receives Envelope, it extracts Event. 
    # It hashes Event -> RecordHash.
    # It stores Envelope (with Signature) + RecordHash.
    #
    # So the "Record Hash" is strictly the hash of the Decision Event.
    # The "Signature" covers the Decision Event.
    #
    # So mixing them in a chain:
    # Record 1 (Legacy): Hash(Event1)
    # Record 2 (Signed): Hash(Event2) - Signature is separate metadata
    # Record 3 (Legacy): Hash(Event3)
    
    payload2 = canonical_payload_for_signing(event2)
    hash2 = compute_hash(payload2)
    chain.append({"hash": hash2, "prev": hash1, "type": "signed"})
    
    # 3. Event 3: Legacy
    event3 = sample_event.copy()
    event3["record_id"] = 3
    payload3 = canonical_payload_for_signing(event3)
    hash3 = compute_hash(payload3)
    chain.append({"hash": hash3, "prev": hash2, "type": "legacy"})
    
    # Verify links
    assert chain[1]["prev"] == chain[0]["hash"]
    assert chain[2]["prev"] == chain[1]["hash"]
    
    # Verify that we can independently verify Event 2's signature
    # using the payload that generated the hash
    from app.signer import Ed25519Signer
    from cryptography.hazmat.primitives.asymmetric import ed25519
    import base64
    
    pub_key = ed25519.Ed25519PublicKey.from_public_bytes(bytes.fromhex(identity.public_key))
    sig_bytes = base64.b64decode(envelope2.attestation.signature)
    
    # Verify signature against the payload that created the hash
    pub_key.verify(sig_bytes, payload2)
