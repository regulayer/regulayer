"use client";
import React from "react";
import Link from "next/link";
import { Terminal, Key, Code, Database, CheckCircle2, Shield, Download } from "lucide-react";

const CodeBlock = ({ children, title }: { children: string; title?: string }) => (
  <div className="bg-slate-900 rounded-lg overflow-hidden mb-4 border border-slate-700">
    {title && <div className="bg-slate-800 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700">{title}</div>}
    <pre className="p-4 overflow-x-auto"><code className="text-sm font-mono text-emerald-400">{children}</code></pre>
  </div>
);

export default function QuickstartDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Quickstart Guide</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        Get Regulayer integrated into your AI application in under 5 minutes. This guide walks you through creating a project, obtaining an API key, installing the SDK, and recording your first governed AI decision.
      </p>

      {/* Download CTA (compact) */}
      <a
        href="/regulayer-complete-knowledge-base.txt"
        download="regulayer-complete-knowledge-base.txt"
        className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
      >
        <Download className="w-3.5 h-3.5" /> Download complete knowledge base for AI assistants
      </a>

      <div className="space-y-12">
        {/* Step 0 */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-8 h-8 bg-slate-700/10 border border-slate-700/20 text-slate-500 rounded-full flex items-center justify-center font-bold">0</div>
          <div className="ml-12">
            <h3 className="text-xl font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Shield size={20} className="text-slate-500" />
              Create Your Organization &amp; Project
            </h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              After signing up at <strong>regulayer.tech/signup</strong>, you&apos;ll be guided through creating your organization. Then create your first project — projects provide logical isolation for different AI applications (e.g., &quot;Customer Support Bot - Production&quot;).
            </p>
            <ol className="list-decimal list-inside text-sm text-slate-500 space-y-2 bg-white/50 p-4 rounded-lg border border-slate-200 mb-4">
              <li>Sign up or log in at <strong>regulayer.tech</strong></li>
              <li>Create your organization (e.g., &quot;Acme Corp&quot;)</li>
              <li>Navigate to <strong>Projects</strong> → <strong>Create Project</strong></li>
              <li>Name your project (e.g., &quot;Customer Support Bot&quot;)</li>
            </ol>
          </div>
        </div>

        {/* Step 1 */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-8 h-8 bg-slate-700/10 border border-slate-700/20 text-slate-500 rounded-full flex items-center justify-center font-bold">1</div>
          <div className="ml-12">
            <h3 className="text-xl font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Key size={20} className="text-slate-500" />
              Create an API Key
            </h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              API keys authenticate your application and are scoped to a specific project. Each key is shown only once during creation — store it securely.
            </p>
            <ol className="list-decimal list-inside text-sm text-slate-500 space-y-2 bg-white/50 p-4 rounded-lg border border-slate-200 mb-4">
              <li>Navigate to <strong>API Keys</strong> in the sidebar</li>
              <li>Click <strong>Create API Key</strong></li>
              <li>Select the target project (e.g., &quot;Customer Support Bot&quot;)</li>
              <li>Name your key (e.g., &quot;Production Gateway Key&quot;)</li>
              <li>Copy the generated key (format: <code className="bg-slate-100 px-1 rounded text-emerald-600">rl_live_...</code>)</li>
            </ol>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800"><strong>Important:</strong> The secret key is displayed only once during creation. If you lose it, you must generate a new key and update your application.</p>
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
              Install the official Regulayer Python SDK. Go and Node.js SDKs are in development.
            </p>

            <CodeBlock title="Terminal">pip install regulayer</CodeBlock>

            <p className="text-xs text-slate-400 mb-4">Set your API key as an environment variable:</p>
            <CodeBlock title="Environment">export REGULAYER_API_KEY="rl_live_your_key_here"</CodeBlock>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-8 h-8 bg-slate-700/10 border border-slate-700/20 text-slate-500 rounded-full flex items-center justify-center font-bold">3</div>
          <div className="ml-12">
            <h3 className="text-xl font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Code size={20} className="text-slate-500" />
              Initialize and Integrate
            </h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              Initialize the Regulayer client and wrap your AI calls with the <code>@trace()</code> decorator. This automatically intercepts inputs/outputs, evaluates policies, and records the decision in the cryptographic vault.
            </p>

            <CodeBlock title="app.py">{`import openai
from regulayer import Regulayer

# Initialize (auto-reads REGULAYER_API_KEY from environment)
client = Regulayer()

# The @trace decorator governs every call to this function
@client.trace(model="gpt-4", system_name="customer-support-agent")
def generate_response(user_query: str) -> str:
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": user_query}]
    )
    return response.choices[0].message.content

# This call is intercepted, policy-evaluated, and recorded
answer = generate_response("How do I reset my account?")
print(answer)`}</CodeBlock>

            <h4 className="text-base font-semibold text-slate-700 mb-3 mt-6">Alternative: Manual Recording</h4>
            <p className="text-slate-500 text-sm mb-4">For custom pipelines where the decorator doesn&apos;t fit:</p>
            <CodeBlock title="manual_recording.py">{`decision = client.decisions.record(
    input_data={"role": "user", "content": "Approve loan for $50,000"},
    output_data={"decision": "approved", "amount": 50000},
    model="gpt-4-turbo",
    system_name="loan-approval-agent",
    metadata={"customer_id": "C-12345", "risk_score": 0.23},
    tags=["financial", "high-value"]
)

print(f"Decision ID: {decision.id}")
print(f"Hash: {decision.hash}")
print(f"Status: {decision.status}")`}</CodeBlock>
          </div>
        </div>

        {/* Step 4 */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold">
            <CheckCircle2 size={16} />
          </div>
          <div className="ml-12">
            <h3 className="text-xl font-semibold text-slate-700 mb-3">
              You&apos;re Governed!
            </h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              Every AI call through Regulayer is now:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-500 space-y-2 mb-6">
              <li><strong>Policy-evaluated</strong> against your organization&apos;s compliance rules</li>
              <li><strong>Cryptographically sealed</strong> with Ed25519 signatures in the audit vault</li>
              <li><strong>Visible</strong> in the Governance Dashboard for HITL review</li>
              <li><strong>Reportable</strong> — contributing to automated Conformity Assessments and FRIA</li>
            </ul>

            <div className="bg-white/50 border border-slate-200 rounded-lg p-5">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Next Steps:</h4>
              <ul className="space-y-3">
                <li>
                  <span className="text-slate-600 text-sm font-medium"> Create your first governance policy</span>
                  <p className="text-xs text-slate-500 mt-1">Define rules that automatically flag PII, toxicity, bias, or domain-specific violations.</p>
                </li>
                <li>
                  <span className="text-slate-600 text-sm font-medium"> Set up HITL governance</span>
                  <p className="text-xs text-slate-500 mt-1">Configure policies with &quot;require_approval&quot; to route high-risk decisions to compliance officers.</p>
                </li>
                <li>
                  <span className="text-slate-600 text-sm font-medium">📄 Generate EU AI Act documentation</span>
                  <p className="text-xs text-slate-500 mt-1">Register your AI system, create a FRIA, and generate Conformity Assessments.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
