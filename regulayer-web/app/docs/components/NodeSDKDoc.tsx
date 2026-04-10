"use client";
import React from "react";

const CodeBlock = ({ children, title }: { children: string; title?: string }) => (
  <div className="bg-slate-900 rounded-lg overflow-hidden mb-4 border border-slate-700">
    {title && <div className="bg-slate-800 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700">{title}</div>}
    <pre className="p-4 overflow-x-auto"><code className="text-sm font-mono text-emerald-400">{children}</code></pre>
  </div>
);

export default function NodeSDKDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Node.js SDK Reference</h1>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-amber-800">
          <strong>🚧 Coming Soon:</strong> The Node.js SDK is in active development. Expected GA release: Q3 2026. In the meantime, you can integrate with Regulayer using the REST API directly or the Python SDK.
        </p>
      </div>

      <p className="text-lg text-slate-500 mb-8 leading-relaxed">
        The official Node.js/TypeScript SDK for recording and governing AI decisions with Regulayer. Built with TypeScript for full type safety and designed for both server-side Node.js and edge runtime compatibility.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Installation (Preview)</h2>
      <CodeBlock title="Terminal">npm install @regulayer/sdk</CodeBlock>
      <p className="text-xs text-slate-400 mb-6">or with yarn/pnpm:</p>
      <CodeBlock title="Terminal">{`yarn add @regulayer/sdk
# or
pnpm add @regulayer/sdk`}</CodeBlock>

      <h2 className="text-2xl font-semibold mb-4 mt-10">Client Initialization</h2>
      <CodeBlock title="index.ts">{`import { Regulayer } from '@regulayer/sdk';

// Option 1: Auto-detect from environment (REGULAYER_API_KEY)
const client = new Regulayer();

// Option 2: Explicit configuration
const client = new Regulayer({
  apiKey: 'rl_live_abc123...',
  endpoint: 'https://api.regulayer.tech', // Optional
});`}</CodeBlock>

      <h2 className="text-2xl font-semibold mb-4 mt-10">Recording Decisions</h2>
      <CodeBlock title="Async Recording">{`const result = await client.record({
  input: { role: 'user', content: 'Approve loan for $50k' },
  output: { decision: 'approved', amount: 50000 },
  model: 'gpt-4',
  systemName: 'loan-approval-agent',
  metadata: {
    customerId: 'C-12345',
    riskScore: 0.23,
  },
  tags: ['financial', 'high-value'],
});

console.log('Decision ID:', result.decisionId);
console.log('Hash:', result.recordHash);`}</CodeBlock>

      <h2 className="text-2xl font-semibold mb-4 mt-10">Trace Wrapper</h2>
      <p className="text-slate-500 text-sm mb-4 leading-relaxed">
        The <code className="bg-slate-100 px-1 rounded">trace()</code> wrapper automatically intercepts function inputs/outputs:
      </p>
      <CodeBlock title="Trace Function">{`import OpenAI from 'openai';

const openai = new OpenAI();

const tracedChat = client.trace(
  async (userMessage: string) => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: userMessage }],
    });
    return response.choices[0].message.content;
  },
  { model: 'gpt-4', systemName: 'support-bot' }
);

// Every call is automatically recorded
const answer = await tracedChat('How do I reset my password?');`}</CodeBlock>

      <h2 className="text-2xl font-semibold mb-4 mt-10">Express Middleware</h2>
      <CodeBlock title="Express.js">{`import express from 'express';
import { regulayerMiddleware } from '@regulayer/sdk/express';

const app = express();

// Automatically records AI decisions from /api/chat
app.post('/api/chat', regulayerMiddleware(client, {
  model: 'gpt-4',
  systemName: 'chat-api',
}), chatHandler);`}</CodeBlock>

      <h2 className="text-2xl font-semibold mb-4 mt-10">Error Handling</h2>
      <CodeBlock title="Error Types">{`import {
  RegulayerAuthError,
  RegulayerRateLimitError,
  RegulayerNetworkError,
} from '@regulayer/sdk';

try {
  await client.record(decision);
} catch (error) {
  if (error instanceof RegulayerAuthError) {
    console.error('Invalid API key');
  } else if (error instanceof RegulayerRateLimitError) {
    console.error(\`Rate limited. Retry after \${error.retryAfter}s\`);
  } else if (error instanceof RegulayerNetworkError) {
    console.error('Gateway unreachable — decision buffered');
  }
}`}</CodeBlock>

      <h2 className="text-2xl font-semibold mb-4 mt-10 border-t border-slate-200 pt-8">REST API Alternative</h2>
      <p className="text-slate-500 text-sm mb-4 leading-relaxed">
        While the Node.js SDK is in preview, you can integrate directly with the Regulayer REST API using any HTTP client:
      </p>
      <CodeBlock title="Direct REST API (fetch)">{`const response = await fetch('https://api.regulayer.tech/v1/decisions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.REGULAYER_API_KEY!,
  },
  body: JSON.stringify({
    input_data: { role: 'user', content: 'Hello' },
    output_data: { role: 'assistant', content: 'Hi there!' },
    model: 'gpt-4',
    system_name: 'chat-bot',
    metadata: { session_id: 'abc123' },
  }),
});

const result = await response.json();
console.log('Recorded:', result.id);`}</CodeBlock>
    </div>
  );
}
