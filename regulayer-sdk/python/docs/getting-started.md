# Getting Started with Regulayer

## First Decision in 10 Minutes

### 1. Install the SDK

```bash
pip install regulayer==1.0.0
```

Verify installation:
```bash
sha256sum $(pip show regulayer -f | grep whl)
# Compare with https://sdk.regulayer.io/v1/sdk/python/1.0.0
```

### 2. Get Your API Key

1. Sign up at [regulayer.io](https://regulayer.io/signup)
2. Create a project
3. Copy your API key (starts with `rl_live_` or `rl_test_`)

### 3. Record Your First Decision

```python
from regulayer import configure, trace

# Configure once
configure(api_key="rl_live_xxxxx")

# Record a decision
with trace(
    system="loan_approval",
    risk_level="high",
    model_name="credit-model-v2"
) as t:
    t.set_input({"income": 50000, "credit_score": 720})
    t.set_output({"approved": True, "limit": 10000})
```

### 4. View in Dashboard

Go to `app.regulayer.io/dashboard` to see your decision.

### 5. Export & Verify

```bash
# Download proof bundle
curl -H "Authorization: Bearer rl_live_xxx" \
  https://api.regulayer.io/v1/export/proof/proj_xxx > proof.zip

# Verify offline
regulayer verify proof.zip
```

---

## Why This Works

### Why is input hashed?
> To prove it existed without revealing it.

### Why can't decisions be edited?
> Because history must remain provable.

### Why verify offline?
> Because trust must survive us.

---

## Next Steps

- [Python SDK Reference](/docs/python-sdk)
- [Error Handling](/docs/error-handling)
- [Trust Model](/docs/trust-faq)
