import json
from typing import Dict, Any

def canonicalize(data: Any) -> bytes:
    """
    Produce a canonical JSON representation.
    
    Must match regulayer-recorder logic exactly:
    - Sort keys
    - UTF-8 encoding
    - No whitespace separators
    - Ensure ASCII = False (allow unicode)
    """
    return json.dumps(
        data,
        sort_keys=True,
        ensure_ascii=False,
        separators=(',', ':')
    ).encode('utf-8')

def assert_canonical_integrity(original_bytes: bytes, parsed_data: Any) -> bool:
    """
    Verify that the data was already in canonical form.
    
    Round-trip check:
    1. Parse (already done to get parsed_data)
    2. Re-canonicalize
    3. Compare bytes
    
    Raises:
        ValueError: If mismatch found (implies tampering or non-canonical serialization)
    """
    re_canonical = canonicalize(parsed_data)
    
    if re_canonical != original_bytes:
        # In a real tool, we might show a diff, but for security we FAIL HARD.
        # We can optimize this comparison, but byte equality is strict.
        raise ValueError("Canonicalization mismatch: Input was not in strictly canonical form.")
        
    return True
