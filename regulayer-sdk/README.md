# Regulayer SDK

Record provable AI decisions with tamper-detectable audit trails.

## Installation

```bash
pip install regulayer
```

## Quick Start

### 1. Configure the SDK
```python
from regulayer import configure, trace

configure(api_key="rl_live_your_api_key")
```

### 2. Record a Decision
```python
with trace(
    system="loan_approval",
    risk_level="high",
    model_name="credit-model-v2"
) as t:
    t.set_input({"income": 50000, "credit_score": 720})
    t.set_output({"approved": True, "limit": 1000})
```

## Documentation

For full documentation, visit [docs.regulayer.tech](https://docs.regulayer.tech/python).
