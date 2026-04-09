"use client";
import React from "react";
import Link from "next/link";
import { Brain, Regex, AlertTriangle, FileText } from "lucide-react";

export default function PoliciesDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Policy Enforcements</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        Regulayer Policies act as the automated compliance layer for your AI traffic. They allow you to programmatically define what constitutes a "flagged" or "high-risk" decision across your organization without modifying your core application code.
      </p>

      <h2 className="text-2xl font-semibold mb-6">How Policies Work</h2>
      <p className="text-slate-600 mb-6 leading-relaxed">
        Whenever a decision is successfully recorded to the Regulayer Vault, it is simultaneously dispatched to the asynchronous Governance Engine. The engine evaluates the payload against all <strong>Active</strong> policies configured in your dashboard.
      </p>

      <div className="bg-white/50 border border-slate-200 rounded-xl p-6 mb-10">
        <h3 className="font-semibold text-slate-900 mb-4">Policy Evaluation Outcomes</h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-emerald-500/20 text-emerald-400 w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">✓</div>
            <div>
              <strong className="text-slate-700 block">Pass (Compliant)</strong>
              <span className="text-sm text-slate-500">The decision violates no active policies. No further action is required.</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-rose-500/20 text-rose-400 w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs text-bold">!</div>
            <div>
              <strong className="text-slate-700 block">Flagged (Non-Compliant / High Risk)</strong>
              <span className="text-sm text-slate-500">The decision tripped one or more policy conditions. It is immediately routed to the Governance Dashboard for human review, and a webhook event is optionally fired.</span>
            </div>
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mb-6 pt-6 border-t border-slate-200">Available Detection Methods</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {/* Semantic Analysis */}
        <div className="border border-slate-200 bg-white/40 rounded-xl p-6 flex flex-col h-full hover:bg-white transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 m-0">Semantic Analysis</h3>
            <div className="w-10 h-10 rounded-lg bg-slate-700/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-slate-500" />
            </div>
          </div>
          <p className="text-sm text-slate-500 flex-grow mb-4 leading-relaxed">
            Evaluates the "meaning" of the prompt or generated text using zero-shot LLaMA 3 analysis via the `llm_evaluate` operator. Ideal for detecting toxicity, jailbreak attempts, or complex conceptual constraints.
          </p>
          <div className="bg-background p-3 rounded-lg border border-slate-200">
            <code className="text-xs text-amber-400 break-all font-mono block mb-1">"field": "output"</code>
            <code className="text-xs text-slate-500 break-all font-mono block mb-1">"operator": "llm_evaluate"</code>
            <code className="text-xs text-slate-600 break-all font-mono block">"value": "contains unauthorized financial advice"</code>
          </div>
        </div>

        {/* Pattern Matching */}
        <div className="border border-slate-200 bg-white/40 rounded-xl p-6 flex flex-col h-full hover:bg-white transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 m-0">Regex & Exact Match</h3>
            <div className="w-10 h-10 rounded-lg bg-brand-600/10 flex items-center justify-center">
              <Regex className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-sm text-slate-500 flex-grow mb-4 leading-relaxed">
            Deterministic operators for structured data validation. Use these to enforce allow/deny lists, validate JSON schemas, or check numeric values (e.g., flagging decisions where confidence is too low).
          </p>
          <div className="bg-background p-3 rounded-lg border border-slate-200">
            <code className="text-xs text-amber-400 break-all font-mono block mb-1">"field": "metadata.confidence"</code>
            <code className="text-xs text-slate-500 break-all font-mono block mb-1">"operator": "lt"</code>
            <code className="text-xs text-slate-600 break-all font-mono block">"value": 0.85</code>
          </div>
        </div>
      </div>

      <div className="bg-slate-700/5 border border-slate-700/20 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Deep Dive: Governance Policy Syntax</h3>
          <p className="text-sm text-slate-500">Read our dedicated deep dive on the JSON policy schema, all supported operators, actions, and complex configuration examples.</p>
        </div>
        <Link href="/docs/governance" className="flex-shrink-0 bg-slate-800 hover:bg-slate-900 text-slate-900 px-5 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap">
          View Policy Syntax Docs &rarr;
        </Link>
      </div>
    </div>
  );
}
