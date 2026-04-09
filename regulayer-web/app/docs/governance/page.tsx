"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowLeft, ShieldCheck, Zap, BookOpen, Code2, AlertTriangle, CheckCircle2, Brain } from "lucide-react";

const operatorDocs = [
  { op: "eq", desc: "Equals (case-insensitive for strings)", example: '"field": "risk_level", "operator": "eq", "value": "high"' },
  { op: "neq", desc: "Not equals (case-insensitive for strings)", example: '"field": "event_state", "operator": "neq", "value": "completed"' },
  { op: "contains", desc: "Substring match (case-insensitive)", example: '"field": "system_name", "operator": "contains", "value": "prod"' },
  { op: "in", desc: "Value exists in a list field", example: '"field": "tags", "operator": "in", "value": "pii"' },
  { op: "gt", desc: "Greater than (numeric)", example: '"field": "metadata.confidence", "operator": "gt", "value": "0.9"' },
  { op: "lt", desc: "Less than (numeric)", example: '"field": "metadata.confidence", "operator": "lt", "value": "0.5"' },
  { op: "gte", desc: "Greater than or equal (numeric)", example: '"field": "metadata.token_count", "operator": "gte", "value": "1000"' },
  { op: "lte", desc: "Less than or equal (numeric)", example: '"field": "metadata.latency_ms", "operator": "lte", "value": "200"' },
  { op: "llm_evaluate", desc: "Zero-shot semantic evaluation using LLaMA 3 via Groq", example: '"field": "output", "operator": "llm_evaluate", "value": "contains personally identifiable information"' },
];

const fieldDocs = [
  { field: "risk_level", type: "string", desc: 'Risk classification: "low", "medium", "high", "standard"' },
  { field: "event_state", type: "string", desc: 'Decision lifecycle state: "started", "pending", "completed", "failed", "rejected"' },
  { field: "system_name", type: "string", desc: "Name of the AI system that produced the decision" },
  { field: "model_name", type: "string", desc: "Name of the ML model used (e.g. gpt-4, llama-3)" },
  { field: "input", type: "dict", desc: "The full input payload sent to the AI model" },
  { field: "output", type: "dict", desc: "The full output/response from the AI model" },
  { field: "metadata", type: "dict", desc: "Custom metadata attached by the SDK (e.g. confidence, latency)" },
  { field: "metadata.confidence", type: "number", desc: "Nested field example — model confidence score" },
  { field: "metadata.token_count", type: "number", desc: "Nested field example — total tokens used" },
  { field: "tags", type: "list", desc: "Governance tags applied to the decision" },
  { field: "attestation_status", type: "string", desc: '"attested" if cryptographically signed, "legacy" otherwise' },
  { field: "review_state", type: "string", desc: 'Governance review state: "unreviewed", "approved", "flagged", "rejected"' },
];

const actionDocs = [
  { type: "require_approval", desc: "Flags the decision for manual human review before it can be marked as approved.", params: "None required" },
  { type: "set_review_state", desc: "Automatically sets the governance review state (e.g. flagged, under_review).", params: '{ "state": "flagged" }' },
  { type: "add_tag", desc: "Attaches a governance tag to the decision record for categorization.", params: '{ "tag": "pii-detected" }' },
  { type: "notify", desc: "Sends a notification via configured webhook or email channel.", params: '{ "channel": "slack", "message": "..." }' },
];

export default function GovernanceDocsPage() {
  return (
    <div className="min-h-screen bg-background text-slate-900 font-sans selection:bg-brand-100">
      <Navbar />

      <div className="pt-24 pb-20 max-w-4xl mx-auto px-6">
        {/* Breadcrumb */}
        <Link href="/docs" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-500 transition mb-8">
          <ArrowLeft size={14} /> Back to Documentation
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-700/10 border border-slate-700/20 flex items-center justify-center">
              <ShieldCheck size={20} className="text-slate-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Governance Policy Engine</h1>
          </div>
          <p className="text-slate-500 text-lg leading-relaxed max-w-2xl">
            Define declarative rules that automatically evaluate every AI decision recorded through Regulayer.
            Policies can flag, block, or route decisions based on metadata, risk scores, and even semantic content analysis powered by LLaMA 3.
          </p>
        </div>

        {/* Quick Start */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-amber-400" />
            <h2 className="text-xl font-semibold">Quick Start</h2>
          </div>
          <div className="bg-white/50 border border-slate-200 rounded-xl p-6 space-y-4">
            <p className="text-slate-600 text-sm">
              Create a policy by navigating to <Link href="/governance/rules" className="text-slate-500 hover:underline">Governance → Rules</Link> and
              clicking <strong>"New Rule"</strong>. Switch to <strong>JSON mode</strong> for full control over condition operators and action types.
            </p>
            <div className="bg-background rounded-lg p-4 overflow-x-auto border border-slate-200">
              <pre className="text-sm font-mono text-emerald-400 whitespace-pre">{`{
 "name": "Block Toxic Content",
 "description": "Flag outputs containing harmful language for human review",
 "applies_to": ["all"],
 "conditions": [
  {
   "field": "output",
   "operator": "llm_evaluate",
   "value": "contains toxic, harmful, or discriminatory language"
  }
 ],
 "actions": [
  { "type": "require_approval" }
 ]
}`}</pre>
            </div>
            <div className="flex items-start gap-2 bg-brand-600/5 border border-amber-500/20 rounded-lg p-3">
              <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-200/80">
                The <code className="bg-slate-100 px-1 rounded">llm_evaluate</code> operator requires a valid <code className="bg-slate-100 px-1 rounded">GROQ_API_KEY</code> in your environment.
                Without it, semantic rules will silently return <code className="bg-slate-100 px-1 rounded">false</code>.
              </p>
            </div>
          </div>
        </section>

        {/* Schema */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={18} className="text-cyan-400" />
            <h2 className="text-xl font-semibold">Policy Schema</h2>
          </div>
          <div className="bg-white/50 border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-white/80">
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Field</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Required</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {[
                  { f: "name", t: "string", r: "Yes", d: "Human-readable policy name" },
                  { f: "description", t: "string", r: "No", d: "Explanation of what this policy does" },
                  { f: "enabled", t: "boolean", r: "No", d: "Whether this policy is active (default: true)" },
                  { f: "applies_to", t: "string[]", r: "No", d: 'System names to match. Use ["all"] for all systems' },
                  { f: "conditions", t: "Condition[]", r: "Yes", d: "Array of conditions (AND logic — all must match)" },
                  { f: "actions", t: "Action[]", r: "Yes", d: "Actions to execute when all conditions match" },
                ].map(row => (
                  <tr key={row.f} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4"><code className="text-slate-500 text-xs bg-slate-700/10 px-1.5 py-0.5 rounded">{row.f}</code></td>
                    <td className="py-2.5 px-4 text-xs text-slate-500 font-mono">{row.t}</td>
                    <td className="py-2.5 px-4 text-xs">{row.r === "Yes" ? <span className="text-amber-400">Required</span> : <span className="text-slate-500">Optional</span>}</td>
                    <td className="py-2.5 px-4 text-xs text-slate-600">{row.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Operators */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <h2 className="text-xl font-semibold">Condition Operators</h2>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Each condition evaluates a <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">field</code> against a <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">value</code> using one of the following operators:
          </p>
          <div className="space-y-3">
            {operatorDocs.map(op => (
              <div key={op.op} className="bg-white/50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <code className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{op.op}</code>
                  <span className="text-sm text-slate-600">{op.desc}</span>
                </div>
                <div className="bg-background rounded-lg px-3 py-2 border border-slate-200">
                  <code className="text-xs font-mono text-slate-500">{"{ "}{op.example}{" }"}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LLM Evaluate Deep Dive */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={18} className="text-slate-500" />
            <h2 className="text-xl font-semibold">Semantic Evaluation (llm_evaluate)</h2>
          </div>
          <div className="bg-white/50 border border-slate-200 rounded-xl p-6 space-y-4">
            <p className="text-slate-600 text-sm leading-relaxed">
              The <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">llm_evaluate</code> operator sends the field content to
              <strong className="text-slate-900"> LLaMA 3 (8B)</strong> via the Groq API for zero-shot semantic analysis. The LLM is asked a simple YES/NO question
              based on your condition value.
            </p>

            <h3 className="text-sm font-semibold text-slate-700 mt-4">How it works</h3>
            <ol className="list-decimal list-inside text-sm text-slate-500 space-y-1.5 pl-2">
              <li>The evaluator resolves the <code className="bg-slate-100 px-1 rounded">field</code> from the decision payload</li>
              <li>If the field is a <strong>dict</strong>, all nested string values are extracted and concatenated</li>
              <li>A prompt is constructed: <em>"Evaluate if this text meets the condition: [your value]"</em></li>
              <li>LLaMA 3 responds with YES or NO at <code className="bg-slate-100 px-1 rounded">temperature: 0</code></li>
              <li>If YES → condition matches → policy actions are triggered</li>
            </ol>

            <h3 className="text-sm font-semibold text-slate-700 mt-4">Example conditions</h3>
            <div className="bg-background rounded-lg p-4 border border-slate-200 space-y-2">
              <p className="text-xs font-mono text-slate-500">{"// Detect PII in AI outputs"}</p>
              <p className="text-xs font-mono text-emerald-400">{`{ "field": "output", "operator": "llm_evaluate", "value": "contains SSNs, phone numbers, or email addresses" }`}</p>
              <p className="text-xs font-mono text-slate-500 mt-3">{"// Detect financial advice"}</p>
              <p className="text-xs font-mono text-emerald-400">{`{ "field": "output", "operator": "llm_evaluate", "value": "provides financial investment advice or stock recommendations" }`}</p>
              <p className="text-xs font-mono text-slate-500 mt-3">{"// Detect toxic language"}</p>
              <p className="text-xs font-mono text-emerald-400">{`{ "field": "output", "operator": "llm_evaluate", "value": "contains hate speech, profanity, or discriminatory language" }`}</p>
            </div>

            <div className="flex items-start gap-2 bg-slate-700/5 border border-slate-700/20 rounded-lg p-3 mt-4">
              <BookOpen size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-700/80">
                <strong>Performance:</strong> Each <code className="bg-slate-100 px-1 rounded">llm_evaluate</code> call adds ~500ms–2s latency (Groq inference).
                This runs asynchronously after the decision is recorded, so it does <strong>not</strong> block your AI system's response to the end user.
              </p>
            </div>
          </div>
        </section>

        {/* Available Fields */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="-zinc-400" />
            <h2 className="text-xl font-semibold">Available Fields</h2>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Use <strong>dot-notation</strong> for nested fields (e.g. <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">metadata.confidence</code>).
            The evaluator recursively traverses the decision payload to resolve the value.
          </p>
          <div className="bg-white/50 border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-white/80">
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Field Path</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {fieldDocs.map(f => (
                  <tr key={f.field} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4"><code className="text-xs text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded font-mono">{f.field}</code></td>
                    <td className="py-2.5 px-4 text-xs text-slate-500 font-mono">{f.type}</td>
                    <td className="py-2.5 px-4 text-xs text-slate-600">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Actions */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-amber-400" />
            <h2 className="text-xl font-semibold">Action Types</h2>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            When all conditions of a policy match, the following actions are dispatched asynchronously:
          </p>
          <div className="space-y-3">
            {actionDocs.map(a => (
              <div key={a.type} className="bg-white/50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <code className="text-sm font-bold text-amber-400 bg-brand-600/10 px-2 py-0.5 rounded">{a.type}</code>
                  <span className="text-sm text-slate-600">{a.desc}</span>
                </div>
                <div className="bg-background rounded-lg px-3 py-2 border border-slate-200">
                  <code className="text-xs font-mono text-slate-500">Parameters: {a.params}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Full Example */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={18} className="text-slate-500" />
            <h2 className="text-xl font-semibold">Complete Examples</h2>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">1. Flag high-risk decisions for review</h3>
              <div className="bg-background rounded-xl p-4 border border-slate-200">
                <pre className="text-xs font-mono text-emerald-400 whitespace-pre">{`{
 "name": "High Risk Auto-Flag",
 "description": "Require human approval for all high-risk AI decisions",
 "applies_to": ["all"],
 "conditions": [
  { "field": "risk_level", "operator": "eq", "value": "high" }
 ],
 "actions": [
  { "type": "require_approval" }
 ]
}`}</pre>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">2. Detect PII with LLM semantic analysis</h3>
              <div className="bg-background rounded-xl p-4 border border-slate-200">
                <pre className="text-xs font-mono text-emerald-400 whitespace-pre">{`{
 "name": "Data Exfiltration Prevention",
 "description": "Uses LLaMA 3 to detect PII in AI outputs",
 "applies_to": ["all"],
 "conditions": [
  {
   "field": "output",
   "operator": "llm_evaluate",
   "value": "contains personally identifiable information such as SSNs, phone numbers, email addresses, or financial account numbers"
  }
 ],
 "actions": [
  { "type": "require_approval" }
 ]
}`}</pre>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">3. Multi-condition policy with numeric threshold</h3>
              <div className="bg-background rounded-xl p-4 border border-slate-200">
                <pre className="text-xs font-mono text-emerald-400 whitespace-pre">{`{
 "name": "Low Confidence + High Token Usage",
 "description": "Flag decisions with low confidence and excessive token usage",
 "applies_to": ["production-chatbot"],
 "conditions": [
  { "field": "metadata.confidence", "operator": "lt", "value": "0.7" },
  { "field": "metadata.token_count", "operator": "gt", "value": "2000" }
 ],
 "actions": [
  { "type": "require_approval" },
  { "type": "add_tag", "parameters": { "tag": "low-confidence" } }
 ]
}`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-emerald-400" />
            <h2 className="text-xl font-semibold">How Governance Evaluation Works</h2>
          </div>
          <div className="bg-white/50 border border-slate-200 rounded-xl p-6">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-700/20 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <p>Your AI system records a decision via the SDK → <strong>Recorder</strong> stores it in the immutable chain.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-700/20 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <p>The Recorder emits a <code className="bg-slate-100 px-1 rounded text-slate-700">DECISION_RECORDED</code> event (async, non-blocking).</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-700/20 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <p>The <strong>Policy Engine</strong> receives the event and evaluates all enabled policies against the decision payload.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-700/20 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                <p>If any policy matches, its actions are dispatched (e.g. flagging for review, adding tags, sending notifications).</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                <p><strong>Key guarantee:</strong> Policy evaluation never blocks the AI response. It runs entirely in the background.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-slate-200 pt-8 flex items-center justify-between">
          <Link href="/docs" className="text-sm text-slate-500 hover:text-slate-500 transition flex items-center gap-1.5">
            <ArrowLeft size={14} /> Back to Docs
          </Link>
          <Link href="/governance/rules" className="text-sm bg-slate-800 hover:bg-slate-900 text-slate-900 px-4 py-2 rounded-lg transition font-medium">
            Create a Rule →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
