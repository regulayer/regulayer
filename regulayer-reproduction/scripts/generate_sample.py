"""
Helper to generate a VALID bundle and key for testing the reproduction script.
"""
import json
import hashlib
import base64
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

def generate():
    # 1. Generate Key
    priv_key = ed25519.Ed25519PrivateKey.generate()
    pub_key = priv_key.public_key()
    
    # Save Key
    with open("../artifacts/valid_key.pem", "wb") as f:
        f.write(pub_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ))

    # 2. Create Payload
    payload = {"data": "This is a trustless proof."}
    canonical_payload = json.dumps(payload, sort_keys=True, separators=(',', ':')).encode('utf-8')
    payload_hash = hashlib.sha256(canonical_payload).hexdigest()
    
    # 3. Create Record
    record = {
        "proof_version": "1.0",
        "record_timestamp": "2026-01-01T00:00:00Z",
        "decision_id": "dec_valid_001",
        "previous_record_hash": "0" * 64,
        "canonical_payload_hash": payload_hash,
        "canonical_payload": payload
    }
    
    # 4. Hash Record (Construction: version|ts|id|prev|payload_hash)
    data_str = f"{record['proof_version']}|{record['record_timestamp']}|{record['decision_id']}|{record['previous_record_hash']}|{record['canonical_payload_hash']}"
    record_hash = hashlib.sha256(data_str.encode('utf-8')).hexdigest()
    record['record_hash'] = record_hash
    
    # 5. Sign
    signature = priv_key.sign(record_hash.encode('utf-8'))
    record['signature'] = {
        "key_id": "test_key_001",
        "value": base64.b64encode(signature).decode('utf-8')
    }
    
    # Save Bundle
    with open("../artifacts/valid_bundle.json", "w") as f:
        json.dump(record, f, indent=2)
        
    print("Generated artifacts/valid_bundle.json and artifacts/valid_key.pem")

if __name__ == "__main__":
    generate()
