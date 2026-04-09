"use client";
import React from "react";

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="bg-white border border-slate-200 p-4 rounded-lg overflow-x-auto"><code className="text-sm font-mono text-emerald-400">{children}</code></pre>
);

export default function NodeSDKDoc() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Node.js SDK</h1>

      <div className="bg-brand-600/5 border border-amber-500/20 rounded-xl p-6 mb-8 text-center">
        <div className="w-14 h-14 rounded-full bg-brand-600/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚧</span>
        </div>
        <h3 className="text-xl font-semibold text-amber-300 mb-2">Coming Soon</h3>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">The Node.js SDK is currently in active development and will be available in Q2 2026. It will support both CommonJS and ESM, TypeScript-first, and have full feature parity with the Python SDK.</p>
      </div>

      <h2>Planned API Preview</h2>
      <p>Below is the target API interface. The final implementation may differ slightly.</p>

      <h3 className="mt-6">Installation (planned)</h3>
      <CodeBlock>{`npm install @regulayer/sdk
# or
yarn add @regulayer/sdk`}</CodeBlock>

      <h3 className="mt-6">Client Initialization</h3>
      <CodeBlock>{`import { Regulayer } from '@regulayer/sdk';

const client = new Regulayer({
 apiKey: process.env.REGULAYER_API_KEY,
 projectId: process.env.REGULAYER_PROJECT_ID,
 environment: 'production', // 'production' | 'staging' | 'development'
});`}</CodeBlock>

      <h3 className="mt-6">Recording a Decision</h3>
      <CodeBlock>{`import OpenAI from 'openai';

const openai = new OpenAI();

async function chat(prompt: string) {
 const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: prompt }],
 });

 const output = response.choices[0].message.content;

 // Record the decision
 await client.record({
  input: { prompt },
  output: { response: output },
  model: 'gpt-4o',
  systemName: 'support-bot',
  metadata: {
   tokens: response.usage?.total_tokens,
   userId: 'usr_12345',
  },
 });

 return output;
}`}</CodeBlock>

      <h3 className="mt-6">Middleware Pattern (Express.js)</h3>
      <CodeBlock>{`import express from 'express';
import { regulayerMiddleware } from '@regulayer/sdk/express';

const app = express();

// Automatically records all AI decisions routed through this middleware
app.use('/api/ai', regulayerMiddleware({
 client,
 extractInput: (req) => req.body,
 extractOutput: (res) => res.locals.aiResponse,
}));`}</CodeBlock>

      <h3 className="mt-6">TypeScript Support</h3>
      <p>The SDK will ship with full TypeScript definitions out of the box:</p>
      <CodeBlock>{`interface RecordOptions {
 input: string | Record<string, unknown>;
 output: string | Record<string, unknown>;
 model: string;
 systemName?: string;
 riskLevel?: 'low' | 'standard' | 'high';
 metadata?: Record<string, unknown>;
 decisionId?: string;
}

interface RecordConfirmation {
 decisionId: string;
 recordId: number;
 recordHash: string;
 serverTimestamp: string;
}`}</CodeBlock>

      <div className="bg-slate-700/5 border border-slate-700/20 rounded-lg p-4 mt-6">
        <p className="text-xs text-slate-700/80"><strong>📧 Early Access:</strong> Interested in beta testing the Node.js SDK? Contact us at <a href="mailto:sdk@regulayer.tech" className="text-slate-500 hover:underline">sdk@regulayer.tech</a> to join the early access program.</p>
      </div>
    </div>
  );
}
