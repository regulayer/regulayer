# @regulayer/sdk (Node.js)

Record provable AI decisions with tamper-detectable audit trails.

## Install

```bash
npm install @regulayer/sdk
```

## Quick Start

```ts
import { createClient } from '@regulayer/sdk';

const client = createClient({
  apiKey: 'rl_...', // from dashboard
});

// Record a decision
const result = await client.recordDecision({
  system: 'loan-approval',
  input: { applicant_id: '123', income: 50000 },
  output: { approved: true, amount: 25000 },
  riskLevel: 'high',
});

console.log('Hash:', result.record_hash);
// → "a3f2c8..."

// Verify it later
const check = await client.verifyDecision(result.decision_id);
console.log('Valid:', check.record_valid);
// → true
```

## API

### `createClient(options)`

| Option     | Type    | Default                         |
|------------|---------|----------------------------------|
| `apiKey`   | string  | **required**                     |
| `endpoint` | string  | `https://api.regulayer.tech`     |
| `demo`     | boolean | `false`                          |
| `timeout`  | number  | `10000`                          |

### `client.recordDecision(decision)`

Records an AI decision with cryptographic proof.

### `client.verifyDecision(decisionId)`

Verifies the integrity of a recorded decision.

### `client.getDecision(decisionId)`

Retrieves a previously recorded decision.

### `client.verifyChain()`

Verifies the full decision hash chain integrity.

## Error Handling

```ts
import { AuthenticationError, QuotaExceededError } from '@regulayer/sdk';

try {
  await client.recordDecision({ ... });
} catch (err) {
  if (err instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (err instanceof QuotaExceededError) {
    console.error('Decision limit reached');
  }
}
```

## License

MIT
