"use client";
import React from "react";
import { ShieldCheck, Server, Eye, FileSignature } from "lucide-react";

export default function Soc2DocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">SOC 2 Type II Mapping</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        As your organization scales its AI initiatives, extending your SOC 2 perimeter to include LLM infrastructure is complex. Regulayer provides out-of-the-box satisfaction for crucial Trust Services Criteria, dramatically accelerating your audit readiness.
      </p>

      <h2 className="text-2xl font-semibold mb-6">Fulfilling the Trust Services Criteria</h2>

      <div className="space-y-6 mb-12">
        <div className="bg-white/40 border border-slate-200 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-700/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="flex items-center gap-3 mb-3 relative">
            <Server className="w-5 h-5 text-slate-500" />
            <h3 className="text-lg font-bold text-slate-900 m-0">CC7.1: System Monitoring & Anomaly Detection</h3>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed ml-8">
            <strong>The Control:</strong> The entity uses detection and monitoring procedures to identify changes to configurations that result in the introduction of new vulnerabilities, and susceptibilities to newly discovered vulnerabilities.
          </p>
          <div className="ml-8 mt-3 bg-slate-700/10 border border-slate-700/20 text-slate-700/90 text-sm p-3 rounded-lg">
            <strong>Regulayer's Solution:</strong> The Policy Engine continuously and autonomously monitors all AI decisions. High-risk outputs (like a model hallucinating PII) are instantly detected and trigger <code className="bg-slate-100 text-slate-500 px-1 rounded">decision.flagged</code> alerts via webhook for immediate SIEM ingestion.
          </div>
        </div>

        <div className="bg-white/40 border border-slate-200 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="flex items-center gap-3 mb-3 relative">
            <Eye className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-slate-900 m-0">CC8.1: Incident Identification & Remediation</h3>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed ml-8">
            <strong>The Control:</strong> The entity analyzes the design and operating effectiveness of its incident response procedures, including communication with internal and external parties.
          </p>
          <div className="ml-8 mt-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200/90 text-sm p-3 rounded-lg">
            <strong>Regulayer's Solution:</strong> The Governance Dashboard provides a structured "Pending Review" queue for compliance teams. The explicit act of a human clicking "Reject" or "Approve" with a required justification proves that remediation protocols exist and are actively exercised.
          </div>
        </div>

        <div className="bg-white/40 border border-slate-200 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="flex items-center gap-3 mb-3 relative">
            <FileSignature className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-slate-900 m-0">PI1.2: Information Logging & Audit Trails</h3>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed ml-8">
            <strong>The Control:</strong> The entity implements policies and procedures over the creation and maintenance of audit logs relevant to the collection, creation, use, and processing of personal information.
          </p>
          <div className="ml-8 mt-3 bg-brand-600/10 border border-amber-500/20 text-amber-200/90 text-sm p-3 rounded-lg">
            <strong>Regulayer's Solution:</strong> The Cryptographic Recorder hashes and signs every LLM payload, linking it to the previous hash. This produces an unbreakable, tamper-evident audit trail that proves to your SOC 2 auditor exactly what your system processed.
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg p-5">
        <ShieldCheck className="text-emerald-500 w-8 h-8 flex-shrink-0" />
        <div>
          <h4 className="text-slate-900 font-medium text-sm">Regulayer is SOC 2 Type II Certified</h4>
          <p className="text-slate-500 text-sm mt-1">To request a copy of our latest independent audit report, please go to the Trust Center dashboard or email <a href="mailto:security@regulayer.tech" className="text-slate-500 hover:text-slate-600">security@regulayer.tech</a>.</p>
        </div>
      </div>
    </div>
  );
}
