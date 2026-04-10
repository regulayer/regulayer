"use client";
import React from "react";
import Link from "next/link";
import { ShieldCheck, Database, Layers, Brain, Lock, Users, FileText, Download } from "lucide-react";

export default function IntroDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Introduction to Regulayer</h1>
      <p className="text-xl text-slate-500 leading-relaxed mb-10">
        Regulayer is the Enterprise AI Governance &amp; Compliance platform. It deploys as a transparent proxy gateway that intercepts every AI inference in real-time, enforces corporate and regulatory policies, routes high-risk decisions to Human-in-the-Loop (HITL) governance queues, and automatically generates EU AI Act Conformity Assessments, FRIA reports, and cryptographically sealed audit trails.
      </p>

      {/* Download Knowledge Base CTA */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-6 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold mb-1"> Download Complete Knowledge Base</h3>
          <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
            Download a comprehensive text file containing every detail about Regulayer — architecture, API endpoints, SDK usage, compliance guides, pricing, and more. Feed it to any AI assistant for instant expert-level Regulayer knowledge.
          </p>
        </div>
        <a
          href="/regulayer-complete-knowledge-base.txt"
          download="regulayer-complete-knowledge-base.txt"
          className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 font-bold text-sm rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap flex-shrink-0"
        >
          <Download className="w-4 h-4" /> Download (.txt)
        </a>
      </div>

      <h2 className="text-2xl font-semibold mb-6">The Problem We Solve</h2>
      <p className="text-slate-600 mb-4 leading-relaxed">
        As enterprises deploy Large Language Models (LLMs) into production, they face a critical compliance challenge. The <strong>EU AI Act</strong> (effective August 2026) mandates documented governance, fundamental rights impact assessments, human oversight, and comprehensive audit trails for high-risk AI systems. Most organizations lack the infrastructure to comply.
      </p>
      <p className="text-slate-600 mb-8 leading-relaxed">
        When regulators or auditors ask &quot;show me your governance processes,&quot; most teams scramble with spreadsheets and fragmented logs. Regulayer provides the complete infrastructure to satisfy these requirements through a single integration point.
      </p>

      <h2 className="text-2xl font-semibold mb-6">Core Architecture</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white/50 border border-slate-200 p-6 rounded-xl hover:bg-white transition-colors">
          <div className="w-12 h-12 bg-slate-700/10 rounded-lg flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Proxy Interception Gateway</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            A transparent edge proxy that captures the complete request-response pair from any AI provider (OpenAI, Anthropic, Google, etc.) with minimal latency impact. Every inference is intercepted and evaluated against organizational policy before reaching the end user.
          </p>
        </div>

        <div className="bg-white/50 border border-slate-200 p-6 rounded-xl hover:bg-white transition-colors">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">HITL Governance Queue</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Ambiguous or high-risk AI decisions are dynamically routed to designated compliance officers for manual review. Reviewers can approve, reject, annotate, or escalate — every action is cryptographically recorded in the immutable audit trail.
          </p>
        </div>

        <div className="bg-white/50 border border-slate-200 p-6 rounded-xl hover:bg-white transition-colors">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Automated Compliance Documentation</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Conformity Assessments, FRIA reports, Technical Documentation, and Monitoring Plans are generated continuously from your AI telemetry — not after the fact. Board-ready compliance reports available on demand.
          </p>
        </div>

        <div className="bg-white/50 border border-slate-200 p-6 rounded-xl hover:bg-white transition-colors">
          <div className="w-12 h-12 bg-brand-600/10 rounded-lg flex items-center justify-center mb-4">
            <Database className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Cryptographic Audit Vault</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Every AI inference, human override, and governance action is cryptographically signed (Ed25519) and archived into a tamper-proof, WORM-compliant vault. SHA-256 hash chains ensure mathematical integrity of the entire decision history.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6">Designed for Regulated Enterprise</h2>
      <ul className="space-y-4 mb-8">
        <li className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-slate-500 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-700 block mb-1">EU AI Act Native Compliance</strong>
            <span className="text-slate-500 text-sm">Regulayer maps directly to EU AI Act Articles 9-15 and Article 27. Conformity Assessments, FRIA, and Technical Documentation are generated automatically from your governance data. Generate a professional, downloadable compliance report for any registered AI system — systems achieving ≥80% receive the <strong>Regulayer Verified</strong> seal.</span>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-slate-500 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-700 block mb-1">Framework Agnostic Integration</strong>
            <span className="text-slate-500 text-sm">Whether you use OpenAI, Anthropic, local open-source models, LangChain, or custom inference servers, Regulayer governs the final input/output payload regardless of the underlying AI provider.</span>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-slate-500 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-700 block mb-1">Zero-Trust Multi-Tenancy</strong>
            <span className="text-slate-500 text-sm">Strict cryptographic separation between organizations and projects. RBAC with four roles (Owner, Admin, Member, Viewer). API keys scoped to individual projects.</span>
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
          className="text-sm bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg transition font-medium">
          Next: Quickstart Guide →
        </button>
      </div>
    </div>
  );
}
