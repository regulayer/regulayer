"use client";
import React from "react";

const CodeBlock = ({ children, title }: { children: string; title?: string }) => (
  <div className="bg-slate-900 rounded-lg overflow-hidden mb-4 border border-slate-700">
    {title && <div className="bg-slate-800 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700">{title}</div>}
    <pre className="p-4 overflow-x-auto"><code className="text-sm font-mono text-emerald-400">{children}</code></pre>
  </div>
);

export default function GoSDKDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Go SDK Reference</h1>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-amber-800">
          <strong>🚧 Early Access:</strong> The Go SDK is currently in beta. The API surface is stable but may undergo minor changes before GA release. For production use, we recommend the Python SDK or direct REST API integration.
        </p>
      </div>

      <p className="text-lg text-slate-500 mb-8 leading-relaxed">
        The official Go SDK for recording and governing AI decisions with Regulayer. Designed for high-performance, concurrent Go applications with zero-allocation hot paths.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Installation</h2>
      <CodeBlock title="Terminal">go get github.com/regulayer/regulayer-go@latest</CodeBlock>

      <h2 className="text-2xl font-semibold mb-4 mt-10">Configuration</h2>
      <p className="text-slate-500 text-sm mb-4 leading-relaxed">
        The Go SDK supports configuration via functional options or environment variables.
      </p>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">Env Variable</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr><td className="px-4 py-2 font-mono text-xs text-cyan-600">REGULAYER_API_KEY</td><td className="px-4 py-2 text-xs text-slate-500">Your project API key (required)</td></tr>
            <tr><td className="px-4 py-2 font-mono text-xs text-cyan-600">REGULAYER_ENDPOINT</td><td className="px-4 py-2 text-xs text-slate-500">API endpoint (default: https://api.regulayer.tech)</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold mb-4 mt-10">Client Initialization</h2>
      <CodeBlock title="main.go">{`package main

import (
    "context"
    "log"
    regulayer "github.com/regulayer/regulayer-go"
)

func main() {
    // Option 1: Auto-detect from environment
    client, err := regulayer.NewClient()
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Option 2: Explicit configuration
    client, err := regulayer.NewClient(
        regulayer.WithAPIKey("rl_live_abc123..."),
        regulayer.WithEndpoint("https://api.regulayer.tech"),
    )
}`}</CodeBlock>

      <h2 className="text-2xl font-semibold mb-4 mt-10">Recording Decisions</h2>
      <CodeBlock title="Recording">{`ctx := context.Background()

result, err := client.Record(ctx, &regulayer.Decision{
    Input:      map[string]interface{}{"prompt": "Approve loan for $50k"},
    Output:     map[string]interface{}{"decision": "approved", "amount": 50000},
    Model:      "gpt-4",
    SystemName: "loan-approval-agent",
    Metadata: map[string]interface{}{
        "customer_id": "C-12345",
        "risk_score":  0.23,
    },
    Tags: []string{"financial", "high-value"},
})
if err != nil {
    log.Printf("Recording failed: %v", err)
    return
}

log.Printf("Decision ID: %s", result.DecisionID)
log.Printf("Hash: %s", result.RecordHash)`}</CodeBlock>

      <h2 className="text-2xl font-semibold mb-4 mt-10">Middleware Integration</h2>
      <p className="text-slate-500 text-sm mb-4 leading-relaxed">
        For HTTP servers, the Go SDK provides middleware that automatically intercepts and records AI-related request/response pairs:
      </p>
      <CodeBlock title="HTTP Middleware">{`import "github.com/regulayer/regulayer-go/middleware"

// Wrap your AI handler with the Regulayer middleware
mux.Handle("/api/chat", middleware.Trace(client, "gpt-4", "chat-api")(chatHandler))`}</CodeBlock>

      <h2 className="text-2xl font-semibold mb-4 mt-10">Error Handling</h2>
      <CodeBlock title="Errors">{`import "errors"

result, err := client.Record(ctx, decision)
if err != nil {
    var authErr *regulayer.AuthError
    var rateErr *regulayer.RateLimitError

    switch {
    case errors.As(err, &authErr):
        log.Fatal("Invalid API key")
    case errors.As(err, &rateErr):
        log.Printf("Rate limited, retry after %ds", rateErr.RetryAfter)
    default:
        log.Printf("Recording error: %v", err)
    }
}`}</CodeBlock>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-xs text-blue-800">
          <strong>💡 Concurrency:</strong> The Go SDK client is safe for concurrent use. All internal state is protected with sync primitives. Create one client at startup and share it across goroutines.
        </p>
      </div>
    </div>
  );
}
