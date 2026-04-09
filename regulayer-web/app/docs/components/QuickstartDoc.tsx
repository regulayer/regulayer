"use client";
import React from "react";
import Link from "next/link";
import { Terminal, Key, Code, Database, CheckCircle2 } from "lucide-react";

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="bg-white border border-slate-200 p-4 rounded-lg overflow-x-auto"><code className="text-sm font-mono text-emerald-400">{children}</code></pre>
);

export default function QuickstartDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Quickstart Guide</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        Get Regulayer integrated into your AI application in under 5 minutes. This guide walks you through obtaining an API key, installing the SDK, and recording your first cryptographically secure AI decision.
      </p>

      <div className="space-y-12">
        {/* Step 1 */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-8 h-8 bg-slate-700/10 border border-slate-700/20 text-slate-500 rounded-full flex items-center justify-center font-bold">1</div>
          <div className="ml-12">
            <h3 className="text-xl font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Key size={20} className="text-slate-500" />
              Obtain an API Key
            </h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              Before your application can communicate with Regulayer, you need an API key. This key authenticates your requests and maps them to your specific project.
            </p>
            <ol className="list-decimal list-inside text-sm text-slate-500 space-y-2 bg-white/50 p-4 rounded-lg border border-slate-200 mb-4">
              <li>Log in to the Regulayer Dashboard.</li>
              <li>Navigate to <strong>API Keys</strong> in the sidebar.</li>
              <li>Click <strong>Create Secret Key</strong>.</li>
              <li>Name your key (e.g., "Production Core Service").</li>
              <li>Copy the generated key (it will look like <code className="bg-slate-100 px-1 rounded text-emerald-400">rl_live_...</code>). Store it securely.</li>
            </ol>
            <div className="bg-brand-600/5 border border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-200/80"><strong>Important:</strong> You will only be shown the secret key once. If you lose it, you must generate a new one.</p>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-8 h-8 bg-slate-700/10 border border-slate-700/20 text-slate-500 rounded-full flex items-center justify-center font-bold">2</div>
          <div className="ml-12">
            <h3 className="text-xl font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Terminal size={20} className="text-slate-500" />
              Install the SDK
            </h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              Install the official Regulayer package into your project using your preferred package manager.
            </p>

            {/* Tabs simulation */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-4">
              <div className="flex border-b border-slate-200 bg-white/50 px-2 pt-2">
                <div className="px-4 py-2 text-sm font-medium text-slate-500 border-b-2 border-slate-700">Python</div>
                <div className="px-4 py-2 text-sm font-medium text-slate-500">Go (Planned)</div>
                <div className="px-4 py-2 text-sm font-medium text-slate-500">Node.js (Planned)</div>
              </div>
              <div className="p-4">
                <CodeBlock>pip install regulayer</CodeBlock>
              </div>
            </div>
            <p className="text-xs text-slate-500">For Go and Node.js SDKs, please check the SDK Reference pages for early access instructions.</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-8 h-8 bg-slate-700/10 border border-slate-700/20 text-slate-500 rounded-full flex items-center justify-center font-bold">3</div>
          <div className="ml-12">
            <h3 className="text-xl font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Code size={20} className="text-slate-500" />
              Initialize the Client
            </h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              Initialize the Regulayer client in your application. We recommend setting the API key as an environment variable (`REGULAYER_API_KEY`) so the client can automatically pick it up.
            </p>

            <CodeBlock>{`import os
from regulayer import Regulayer

# Automatically loads REGULAYER_API_KEY from environment
client = Regulayer()

# Or construct explicitly
# client = Regulayer(api_key="rl_live_your_key_here")`}</CodeBlock>
          </div>
        </div>

        {/* Step 4 */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-8 h-8 bg-slate-700/10 border border-slate-700/20 text-slate-500 rounded-full flex items-center justify-center font-bold">4</div>
          <div className="ml-12">
            <h3 className="text-xl font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Database size={20} className="text-slate-500" />
              Wrap your LLM Calls
            </h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              The easiest way to secure your AI application is using the <code>@trace()</code> decorator (in Python). It automatically intercepts the input arguments and the return output of your function, packaging them into a cryptographically secured decision.
            </p>

            <CodeBlock>{`import openai

# Add the trace decorator with metadata about the system
@client.trace(model="gpt-4", system_name="customer-support-agent")
def generate_response(user_query: str) -> str:
  response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": user_query}]
  )
  return response.choices[0].message.content

# During this call, the prompt and the LLM's answer are hashed, 
# signed, and immutably recorded in Regulayer.
answer = generate_response("How do I reset my account?")`}</CodeBlock>
          </div>
        </div>

        {/* Step 5 */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold">
            <CheckCircle2 size={16} />
          </div>
          <div className="ml-12">
            <h3 className="text-xl font-semibold text-slate-700 mb-3">
              You're all set!
            </h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              Every time <code>generate_response()</code> is executed, the transaction is cryptographically secured, audited, and instantly viewable in the Regulayer Governance dashboard.
            </p>

            <div className="bg-white/50 border border-slate-200 rounded-lg p-5">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Next Steps:</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/docs" className="text-slate-500 text-sm hover:underline font-medium">Read the Python SDK Reference</Link>
                  <p className="text-xs text-slate-500 mt-1">Learn how to manually record decisions and attach complex metadata.</p>
                </li>
                <li>
                  <Link href="/governance/rules" className="text-slate-500 text-sm hover:underline font-medium">Build your first Governance Policy</Link>
                  <p className="text-xs text-slate-500 mt-1">Set up automated LLaMA 3 semantic checks for PII or toxicity on your new data stream.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
