"use client";
import React from "react";
import { Scale, Globe, FileStack, AlertTriangle } from "lucide-react";

export default function EuAiDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">EU AI Act Readiness</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        The European Union's AI Act imposes stringent legal requirements on developers and deployers of "High-Risk" AI systems. Failure to comply can result in fines up to 35M EUR or 7% of global annual turnover. Regulayer is purpose-built to automate compliance with the Act's most demanding technical articles.
      </p>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
        <Scale className="text-slate-500" />
        Article 12: Record-Keeping
      </h2>
      <div className="bg-white/50 border border-slate-200 p-6 rounded-xl mb-8">
        <blockquote className="border-l-4 border-slate-400 pl-4 text-slate-600 text-sm italic mb-4">
          "High-risk AI systems shall technically allow for the automatic recording of events ('logs') over the duration of the life cycle of the system."
        </blockquote>
        <p className="text-slate-500 text-sm leading-relaxed mb-4">
          <strong>The Challenge:</strong> Building infrastructure capable of logging millions of massive language model JSON payloads daily is expensive. Ensuring those logs cannot be secretly modified is harder.
        </p>
        <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-4 rounded-lg">
          <FileStack className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-emerald-100/80 text-sm">
            <strong>Regulayer's Solution:</strong> We provide turnkey, automatic cryptographic recording. By dropping in the <code className="bg-emerald-950 px-1 border border-emerald-900 rounded">@trace</code> decorator, your AI system instantly generates tamper-proof logs guaranteed to satisfy Article 12 assessment thresholds for the entire lifespan of your models.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 pt-4">
        <AlertTriangle className="text-amber-400" />
        Article 14: Human Oversight
      </h2>
      <div className="bg-white/50 border border-slate-200 p-6 rounded-xl mb-10">
        <blockquote className="border-l-4 border-slate-400 pl-4 text-slate-600 text-sm italic mb-4">
          "High-risk AI systems shall be designed and developed in such a way... that they can be effectively overseen by natural persons during the period in which the AI system is in use."
        </blockquote>
        <p className="text-slate-500 text-sm leading-relaxed mb-4">
          <strong>The Challenge:</strong> It is impossible for a human to review every single LLM chat message. "Oversight" requires an intelligent routing system that separates benign traffic from risky traffic.
        </p>
        <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-4 rounded-lg">
          <Globe className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-100/80 text-sm">
            <strong>Regulayer's Solution:</strong> The combination of the automated Policy Engine (which flags risky decisions) and the Governance Dashboard (which forces a human compliance officer to explicitly review, justify, and approve/reject flagged traffic) provides exact, documentable proof of "Human-in-the-Loop" oversight as legally mandated.
          </p>
        </div>
      </div>

      <div className="bg-slate-700/10 border border-slate-700/20 rounded-xl p-6 text-center">
        <h3 className="text-slate-600 font-semibold mb-2">Conformity Assessments</h3>
        <p className="text-sm text-slate-700/70 max-w-2xl mx-auto">
          When applying for CE marking or preparing technical documentation for a Notified Body, you can dramatically accelerate the process by exporting the underlying cryptographic ledgers and governance rules from your Regulayer Dashboard as part of your application.
        </p>
      </div>
    </div>
  );
}
