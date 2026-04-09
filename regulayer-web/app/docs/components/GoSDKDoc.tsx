"use client";
import React from "react";

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="bg-white border border-slate-200 p-4 rounded-lg overflow-x-auto"><code className="text-sm font-mono text-emerald-400">{children}</code></pre>
);

export default function GoSDKDoc() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Go SDK Reference</h1>
      <p className="text-lg text-slate-500 mb-8">The official Go SDK for recording AI decisions with Regulayer. Designed for high-throughput, low-latency production systems.</p>

      {/* Installation */}
      <h2>Installation</h2>
      <p>Add the SDK to your Go module:</p>
      <CodeBlock>{`go get github.com/regulayer/regulayer-sdk-go`}</CodeBlock>

      {/* Core Types */}
      <h2 className="mt-10">Core Types</h2>

      <h3>Config</h3>
      <p>Configuration struct for initializing the client.</p>
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
        <div className="bg-white/80 px-5 py-3 border-b border-slate-200">
          <code className="text-slate-500 font-mono text-sm font-bold">type Config struct</code>
        </div>
        <div className="p-5">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200">
              <th className="py-2 text-left text-xs uppercase text-slate-500 font-bold">Field</th>
              <th className="py-2 text-left text-xs uppercase text-slate-500 font-bold">Type</th>
              <th className="py-2 text-left text-xs uppercase text-slate-500 font-bold">Description</th>
            </tr></thead>
            <tbody className="divide-y divide-zinc-800/50">
              <tr><td className="py-2 font-mono text-xs text-cyan-400">APIKey</td><td className="py-2 text-xs text-slate-500 font-mono">string</td><td className="py-2 text-xs text-slate-600">Your Regulayer API key (required)</td></tr>
              <tr><td className="py-2 font-mono text-xs text-cyan-400">Endpoint</td><td className="py-2 text-xs text-slate-500 font-mono">string</td><td className="py-2 text-xs text-slate-600">API endpoint (default: https://api.regulayer.tech)</td></tr>
              <tr><td className="py-2 font-mono text-xs text-cyan-400">Demo</td><td className="py-2 text-xs text-slate-500 font-mono">bool</td><td className="py-2 text-xs text-slate-600">Enable demo mode (skips cryptographic persistence)</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <h3>Decision</h3>
      <p>The payload struct representing a single AI decision to record.</p>
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
        <div className="bg-white/80 px-5 py-3 border-b border-slate-200">
          <code className="text-slate-500 font-mono text-sm font-bold">type Decision struct</code>
        </div>
        <div className="p-5">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200">
              <th className="py-2 text-left text-xs uppercase text-slate-500 font-bold">Field</th>
              <th className="py-2 text-left text-xs uppercase text-slate-500 font-bold">Type</th>
              <th className="py-2 text-left text-xs uppercase text-slate-500 font-bold">Description</th>
            </tr></thead>
            <tbody className="divide-y divide-zinc-800/50">
              <tr><td className="py-2 font-mono text-xs text-cyan-400">DecisionID</td><td className="py-2 text-xs text-slate-500 font-mono">string</td><td className="py-2 text-xs text-slate-600">Custom UUID (auto-generated if empty)</td></tr>
              <tr><td className="py-2 font-mono text-xs text-cyan-400">System</td><td className="py-2 text-xs text-slate-500 font-mono">string</td><td className="py-2 text-xs text-slate-600">Name of the AI system</td></tr>
              <tr><td className="py-2 font-mono text-xs text-cyan-400">RiskLevel</td><td className="py-2 text-xs text-slate-500 font-mono">string</td><td className="py-2 text-xs text-slate-600">&quot;low&quot;, &quot;standard&quot;, &quot;high&quot; (default: &quot;standard&quot;)</td></tr>
              <tr><td className="py-2 font-mono text-xs text-cyan-400">ModelName</td><td className="py-2 text-xs text-slate-500 font-mono">string</td><td className="py-2 text-xs text-slate-600">ML model identifier</td></tr>
              <tr><td className="py-2 font-mono text-xs text-cyan-400">Input</td><td className="py-2 text-xs text-slate-500 font-mono">{`map[string]interface{}`}</td><td className="py-2 text-xs text-slate-600">Input payload sent to the model</td></tr>
              <tr><td className="py-2 font-mono text-xs text-cyan-400">Output</td><td className="py-2 text-xs text-slate-500 font-mono">{`map[string]interface{}`}</td><td className="py-2 text-xs text-slate-600">Output/response from the model</td></tr>
              <tr><td className="py-2 font-mono text-xs text-cyan-400">Metadata</td><td className="py-2 text-xs text-slate-500 font-mono">{`map[string]interface{}`}</td><td className="py-2 text-xs text-slate-600">Custom metadata (tokens, latency, etc.)</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Methods */}
      <h2 className="mt-10">Methods</h2>

      <h3><code className="text-slate-500">NewClient(config Config) (*Client, error)</code></h3>
      <p>Creates a new Regulayer client. Returns an error if the API key is missing. The client uses a pre-configured <code className="bg-slate-100 px-1 rounded text-slate-600">http.Client</code> with a 10-second timeout.</p>
      <CodeBlock>{`client, err := regulayer.NewClient(regulayer.Config{
  APIKey:  os.Getenv("REGULAYER_API_KEY"),
  Endpoint: "https://api.regulayer.tech", // optional
})
if err != nil {
  log.Fatal("Failed to init Regulayer:", err)
}`}</CodeBlock>

      <h3 className="mt-8"><code className="text-slate-500">client.RecordDecision(d Decision) error</code></h3>
      <p>Sends a decision to the Regulayer gateway. The SDK automatically:</p>
      <ul>
        <li>Generates a UUID v4 if <code className="bg-slate-100 px-1 rounded text-slate-600">DecisionID</code> is empty</li>
        <li>Computes SHA-256 hashes of <code className="bg-slate-100 px-1 rounded text-slate-600">Input</code> and <code className="bg-slate-100 px-1 rounded text-slate-600">Output</code></li>
        <li>Sets <code className="bg-slate-100 px-1 rounded text-slate-600">event_version: "2.0"</code> and timestamps</li>
        <li>Sends the payload with <code className="bg-slate-100 px-1 rounded text-slate-600">Authorization: Bearer</code> and <code className="bg-slate-100 px-1 rounded text-slate-600">X-Regulayer-Api-Key</code> headers</li>
      </ul>
      <CodeBlock>{`err := client.RecordDecision(regulayer.Decision{
  System:  "fraud-detector",
  ModelName: "gpt-4o",
  RiskLevel: "high",
  Input: map[string]interface{}{
    "transaction_id": "txn_98765",
    "amount":     2500.00,
    "description":  "Wire transfer to unknown account",
  },
  Output: map[string]interface{}{
    "risk_score": 0.92,
    "action":   "block",
    "explanation": "Flagged as potential fraud due to unusual pattern",
  },
  Metadata: map[string]interface{}{
    "latency_ms": 45,
    "model_temp": 0.0,
    "token_count": 312,
  },
})
if err != nil {
  log.Printf("Warning: Failed to record decision: %v", err)
}`}</CodeBlock>

      {/* Full Example */}
      <h2 className="mt-10">Complete Working Example</h2>
      <CodeBlock>{`package main

import (
  "fmt"
  "log"
  "os"

  regulayer "github.com/regulayer/regulayer-sdk-go"
)

func main() {
  // Initialize the client
  client, err := regulayer.NewClient(regulayer.Config{
    APIKey: os.Getenv("REGULAYER_API_KEY"),
  })
  if err != nil {
    log.Fatal(err)
  }

  // Simulate an AI decision
  prompt := "Summarize the quarterly earnings report"
  aiResponse := "Revenue increased 15% YoY to $4.2B..."

  // Record the decision
  err = client.RecordDecision(regulayer.Decision{
    System:  "financial-analyst-bot",
    ModelName: "gpt-4o",
    RiskLevel: "standard",
    Input:   map[string]interface{}{"prompt": prompt},
    Output:  map[string]interface{}{"response": aiResponse},
    Metadata: map[string]interface{}{
      "department": "finance",
      "user":    "analyst_42",
    },
  })

  if err != nil {
    log.Printf("Recording failed: %v", err)
  } else {
    fmt.Println("✓ Decision recorded to Regulayer")
  }
}`}</CodeBlock>

      <div className="bg-slate-700/5 border border-slate-700/20 rounded-lg p-4 my-4">
        <p className="text-xs text-slate-700/80"><strong>💡 Performance:</strong> The Go SDK uses a <code className="bg-slate-100 px-1 rounded">net/http</code> client with connection pooling. For high-throughput systems, you can reuse the same <code className="bg-slate-100 px-1 rounded">*Client</code> across goroutines — it is safe for concurrent use.</p>
      </div>

      {/* HTTP Wire Protocol */}
      <h2 className="mt-10">HTTP Wire Protocol</h2>
      <p>Under the hood, the Go SDK sends a <code className="bg-slate-100 px-1 rounded text-slate-600">POST /v1/decisions</code> request with the following headers:</p>
      <CodeBlock>{`POST /v1/decisions HTTP/1.1
Host: api.regulayer.tech
Authorization: Bearer rl_live_abc123...
X-Regulayer-Api-Key: rl_live_abc123...
X-Request-ID: <decision_uuid>
Content-Type: application/json

{
 "event_version": "2.0",
 "event_state": "completed",
 "decision_id": "...",
 "system_name": "...",
 "risk_level": "standard",
 "model_name": "gpt-4o",
 "input_hash": "<sha256>",
 "output_hash": "<sha256>",
 "input": { ... },
 "output": { ... },
 "metadata": { ... },
 "start_timestamp": "2026-02-23T12:00:00Z",
 "end_timestamp": "2026-02-23T12:00:00Z"
}`}</CodeBlock>
    </div>
  );
}
