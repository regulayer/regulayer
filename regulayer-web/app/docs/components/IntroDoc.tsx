"use client";
import React from "react";
import Link from "next/link";
import { ShieldCheck, Database, Layers, Brain, Lock, Users, FileText, Download } from "lucide-react";

export default function IntroDocComponent() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
      
      {/* Editorial Header */}
      <div className="mb-12 border-b border-[hsl(15,30%,85%)] pb-10">
        <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,85%,58%)] uppercase mb-4 block font-bold">Documentation / Core Overview</span>
        <h1 className="text-[clamp(2.5rem,4vw,3.5rem)] font-bold tracking-tight leading-[1.1] text-[hsl(15,45%,15%)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Introduction to Regulayer.
        </h1>
        <p className="text-[18px] text-[hsl(15,30%,45%)] leading-relaxed mt-6 max-w-3xl font-light">
          Regulayer is not an observability tool. It is the Enterprise Cryptographic Governance Gateway. We sit transparently between your application and your LLM to physically enforce compliance policies and inject Human-in-the-Loop oversight in real-time.
        </p>
      </div>

      {/* Download AI Brain CTA */}
      <div className="bg-[hsl(15,45%,15%)] text-white rounded-[4px] p-8 mb-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-xl border border-[hsl(15,45%,25%)]">
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative z-10 w-full md:w-2/3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-[hsl(15,85%,58%)]" />
            <h3 className="text-[16px] font-bold tracking-wide">Train your AI on Regulayer</h3>
          </div>
          <p className="text-[13px] text-white/70 leading-relaxed font-light">
            We have compressed the entire Regulayer technical schema, architecture, and API spec into a single structured fine-tuning document. Download it and feed it to Claude, ChatGPT, or Cursor to instantly generate compliant proxy integration code.
          </p>
        </div>
        <div className="relative z-10 w-full md:w-auto flex-shrink-0">
          <a
            href="/regulayer-complete-knowledge-base.txt"
            download="regulayer-complete-knowledge-base.txt"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[hsl(15,85%,58%)] text-white font-bold text-[13px] rounded-[3px] hover:bg-white hover:text-[hsl(15,85%,58%)] transition-colors w-full tracking-wide uppercase"
          >
            <Download className="w-4 h-4" /> Download .txt File
          </a>
        </div>
      </div>

      {/* The Core Problem */}
      <h2 className="text-[24px] font-bold text-[hsl(15,45%,15%)] mb-6" style={{ fontFamily: "var(--font-space-grotesk)" }}>The Compliance Ultimatum</h2>
      <div className="bg-[hsl(30,60%,99%)] border border-[hsl(15,30%,85%)] rounded-[4px] p-6 mb-16">
        <p className="text-[15px] font-light text-[hsl(15,30%,40%)] mb-4 leading-relaxed">
          The <strong>EU AI Act</strong> mandates extreme traceability for high-risk AI deployments. "We use LangSmith" is not a legal defense. When a regulator asks why an autonomous agent made a specific decision, enterprises historically scramble with fragmented, alterable logs.
        </p>
        <p className="text-[15px] font-light text-[hsl(15,30%,40%)] leading-relaxed">
          Regulayer fixes this at the foundation. We provide the cryptographic infrastructure to satisfy EU AI Act Articles 11, 12, and 14 mathematically. Through a simple proxy integration, we make AI accountability tamper-proof. 
        </p>
      </div>

      {/* Architecture Cards Grid */}
      <h2 className="text-[24px] font-bold text-[hsl(15,45%,15%)] mb-8" style={{ fontFamily: "var(--font-space-grotesk)" }}>Core Infrastructure Modules</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {/* Card 1 */}
        <div className="bg-white border border-[hsl(15,30%,85%)] p-8 rounded-[4px] hover:border-[hsl(15,45%,15%)] transition-colors duration-300 group">
          <div className="w-10 h-10 border border-[hsl(15,30%,85%)] bg-[hsl(30,60%,99%)] rounded-[3px] flex items-center justify-center mb-6 group-hover:bg-[hsl(15,45%,15%)] transition-colors">
            <Lock className="w-4 h-4 text-[hsl(15,30%,45%)] group-hover:text-white" />
          </div>
          <h3 className="text-[17px] font-bold text-[hsl(15,45%,15%)] mb-3">Zero-Latency Proxy Gateway</h3>
          <p className="text-[13px] text-[hsl(15,30%,45%)] font-light leading-relaxed">
            A hardened edge proxy that intercepts your exact request-response pairs. Regulayer sits directly in your API pathway before the payload hits OpenAI, acting as the absolute source of truth.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-[hsl(15,30%,85%)] p-8 rounded-[4px] hover:border-[hsl(15,45%,15%)] transition-colors duration-300 group">
          <div className="w-10 h-10 border border-[hsl(15,30%,85%)] bg-[hsl(30,60%,99%)] rounded-[3px] flex items-center justify-center mb-6 group-hover:bg-[hsl(15,45%,15%)] transition-colors">
            <Users className="w-4 h-4 text-[hsl(15,30%,45%)] group-hover:text-white" />
          </div>
          <h3 className="text-[17px] font-bold text-[hsl(15,45%,15%)] mb-3">HITL Governance Execution</h3>
          <p className="text-[13px] text-[hsl(15,30%,45%)] font-light leading-relaxed">
            If an inference violates policy, the HTTP response is physically halted mid-stream (Gate Mode), forcing the payload into a human reviewer queue for manual approval before the end-user receives it.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-[hsl(15,30%,85%)] p-8 rounded-[4px] hover:border-[hsl(15,45%,15%)] transition-colors duration-300 group">
          <div className="w-10 h-10 border border-[hsl(15,30%,85%)] bg-[hsl(30,60%,99%)] rounded-[3px] flex items-center justify-center mb-6 group-hover:bg-[hsl(15,45%,15%)] transition-colors">
            <Database className="w-4 h-4 text-[hsl(15,30%,45%)] group-hover:text-white" />
          </div>
          <h3 className="text-[17px] font-bold text-[hsl(15,45%,15%)] mb-3">Ed25519 Cryptographic Vault</h3>
          <p className="text-[13px] text-[hsl(15,30%,45%)] font-light leading-relaxed">
            Every prompt, LLM response, human override, and governance action is cryptographically signed and historically chained in our SEC 17a-4 WORM compliant ledger. Absolute non-repudiation.
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-[hsl(15,30%,85%)] p-8 rounded-[4px] hover:border-[hsl(15,45%,15%)] transition-colors duration-300 group">
          <div className="w-10 h-10 border border-[hsl(15,30%,85%)] bg-[hsl(30,60%,99%)] rounded-[3px] flex items-center justify-center mb-6 group-hover:bg-[hsl(15,45%,15%)] transition-colors">
            <FileText className="w-4 h-4 text-[hsl(15,30%,45%)] group-hover:text-white" />
          </div>
          <h3 className="text-[17px] font-bold text-[hsl(15,45%,15%)] mb-3">Automated EU AI Act Reporting</h3>
          <p className="text-[13px] text-[hsl(15,30%,45%)] font-light leading-relaxed">
            We continuously synthesize the ledger data to instantly generate required regulatory PDFs, including your Technical Conformity Assessments and Fundamental Rights Impact Assessments (FRIA).
          </p>
        </div>
      </div>

      {/* Next Button */}
      <div className="mt-12 flex pt-6 border-t border-[hsl(15,30%,85%)] justify-between items-center">
        <div></div>
        <button
          onClick={() => {
            const qs = document.querySelector('button[aria-label="Quickstart Guide"]') || document.evaluate("//button[contains(text(), 'Quickstart Guide')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (qs) (qs as HTMLElement).click();
          }}
          className="text-[13px] font-bold uppercase tracking-wide bg-[hsl(15,45%,15%)] hover:bg-[hsl(15,85%,58%)] text-white px-6 py-3.5 rounded-[3px] transition-colors shadow-md"
        >
          Next: Quickstart Guide →
        </button>
      </div>
    </div>
  );
}
