# Interop Test Cases

## Purpose

Test cases that any implementation can run to verify interoperability.
These match the golden corpus in regulayer-reference/.

---

## Test Categories

### valid/

Test cases that should PASS verification:

| File | Description |
|------|-------------|
| `valid_genesis.json` | First record in chain |
| `valid_chained.json` | Correctly linked second record |

### invalid/

Test cases that should FAIL verification:

| File | Expected Failure |
|------|------------------|
| `tampered_hash.json` | Hash mismatch |
| `missing_attestation.json` | Missing required field |
| `broken_chain.json` | Non-genesis missing previous_hash |

### edge_cases/

Edge cases that may need special handling:

| File | Description |
|------|-------------|
| `minimal_fields.json` | Only required fields |
| `unicode_content.json` | Unicode and escape sequences |
| `legacy_schema.json` | Pre-attestation format |

---

## Running Tests

### Basic Test Loop

```python
import json
from verifier import verify_bundle

def run_tests(directory):
    results = {"pass": 0, "fail": 0}
    
    for category in ["valid", "invalid", "edge_cases"]:
        for file in glob(f"{directory}/{category}/*.json"):
            with open(file) as f:
                test_case = json.load(f)
            
            expected = test_case["expected_result"]
            bundle = test_case["bundle"]
            
            result = verify_bundle(bundle)
            
            if expected == "PASS" and result["valid"]:
                results["pass"] += 1
            elif expected == "FAIL" and not result["valid"]:
                results["pass"] += 1
            else:
                results["fail"] += 1
                print(f"FAIL: {file}")
    
    return results
```

### Expected Results

| Category | Expected |
|----------|----------|
| valid/* | All should PASS |
| invalid/* | All should FAIL (with correct reason) |
| edge_cases/* | Check notes in each file |

---

## Adding Test Cases

To add new test cases:

1. Create JSON file in appropriate category
2. Include `type` and `expected_result`
3. Include complete `bundle`
4. Add `description` and any notes

---

## Conformance

An implementation passes interop testing if:

- [x] All valid/ cases pass
- [x] All invalid/ cases fail
- [x] Edge cases handled appropriately
