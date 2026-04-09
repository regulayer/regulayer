"use client";
import React from "react";
import Link from "next/link";
import { ShieldCheck, Database, Layers, Brain, Lock } from "lucide-react";

export default function IntroDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Introduction to Regulayer</h1>
      <p className="text-xl text-slate-500 leading-relaxed mb-10">
        Regulayer is the immutable trust and compliance layer for enterprise AI systems. It provides a drop-in SDK to cryptographically record and evaluate generative AI decisions in real-time, bridging the gap between rapid AI innovation and strict enterprise compliance.
      </p>

      <h2 className="text-2xl font-semibold mb-6">The Problem We Solve</h2>
      <p className="text-slate-600 mb-4 leading-relaxed">
        As enterprises deploy Large Language Models (LLMs) into production, they face a critical challenge: <strong>accountability</strong>. LLMs are non-deterministic. When an AI system makes a decision—whether it's approving a loan, generating medical advice, or structuring a financial instrument—organizations must be able to prove exactly what happened, when it happened, and why.
      </p>
      <p className="text-slate-600 mb-8 leading-relaxed">
        Without cryptographic proof, AI logs can be altered, making it impossible to satisfy auditors, defend against liability, or comply with emerging frameworks like the EU AI Act or SOC 2 criteria for automated systems.
      </p>

      <h2 className="text-2xl font-semibold mb-6">Core Architecture Concepts</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white/50 border border-slate-200 p-6 rounded-xl hover:bg-white transition-colors">
          <div className="w-12 h-12 bg-slate-700/10 rounded-lg flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">The Vault (Cryptographic Recorder)</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            A high-throughput, latency-optimized service that hashes, cryptographically signs, and permanently stores input/output pairs. It creates an immutable chain-of-custody, proving that an AI decision was not tampered with after the fact.
          </p>
        </div>

        <div className="bg-white/50 border border-slate-200 p-6 rounded-xl hover:bg-white transition-colors">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
            <Brain className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Policy Engine & Semantic Evaluation</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Evaluates recorded decisions asynchronously against organizational policies (e.g., PII detection, jailbreak prevention, toxicity). Utilizes zero-shot LLaMA 3 evaluations to understand the semantic meaning of AI outputs, not just keyword matching.
          </p>
        </div>

        <div className="bg-white/50 border border-slate-200 p-6 rounded-xl hover:bg-white transition-colors">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
            <Layers className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Governance Dashboard</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            An enterprise interface designed for Risk and Compliance teams. It provides a structured "Human-in-the-Loop" workflow to review flagged decisions, conduct audits, and export SOC 2 / EU AI Act compliant reports.
          </p>
        </div>

        <div className="bg-white/50 border border-slate-200 p-6 rounded-xl hover:bg-white transition-colors">
          <div className="w-12 h-12 bg-brand-600/10 rounded-lg flex items-center justify-center mb-4">
            <Database className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">The Control Plane</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            The central orchestration layer managing APIs, authentication (RBAC), organization settings, projects, and billing. It ensures logical separation of tenants and enforces strict access boundaries.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6">Designed for the Enterprise</h2>
      <ul className="space-y-4 mb-8">
        <li className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-slate-500 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-700 block mb-1">Zero-Latency Overhead (Async Processing)</strong>
            <span className="text-slate-500 text-sm">Regulayer's recording and policy evaluation occur asynchronously. Your application's critical path and user experience are never blocked waiting for compliance checks.</span>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-slate-500 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-700 block mb-1">Framework Agnostic</strong>
            <span className="text-slate-500 text-sm">Whether you use OpenAI, Anthropic, local open-source models, LangChain, or custom inference servers, Regulayer records the final input/output payload regardless of the underlying LLM.</span>
          </div>
        </li>
      </ul>

      <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-8">
        <div />
        <button
          onClick={() => {
            const qs = document.querySelector('button[aria-label="Quickstart Guide"]') || document.evaluate("//button[contains(text(), 'Quickstart Guide')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (qs) (qs as HTMLElement).click();
          }}
          className="text-sm bg-slate-800 hover:bg-slate-900 text-slate-900 px-5 py-2.5 rounded-lg transition font-medium">
          Next: Quickstart Guide →
        </button>
      </div>
    </div>
  );
}
