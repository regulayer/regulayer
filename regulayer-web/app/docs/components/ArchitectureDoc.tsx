"use client";
import React from "react";
import { Globe, Database, Shield, Cpu, Server, Activity, ArrowRight } from "lucide-react";

export default function ArchitectureDocComponent() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
      
      {/* Editorial Header */}
      <div className="mb-12 border-b border-[hsl(15,30%,85%)] pb-10">
        <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,85%,58%)] uppercase mb-4 block font-bold">Documentation / Engineering</span>
        <h1 className="text-[clamp(2.5rem,4vw,3.5rem)] font-bold tracking-tight leading-[1] text-[hsl(15,45%,15%)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          System Architecture.
        </h1>
        <p className="text-[18px] text-[hsl(15,30%,45%)] leading-relaxed mt-6 max-w-3xl font-light">
          Regulayer is a zero-latency distributed microservice platform built for enterprise-grade throughput, cryptographic integrity, and EU AI Act compliance. It intercepts layer-7 transit without adding meaningful latency overhead.
        </p>
      </div>

      <h2 className="text-[20px] font-bold text-[hsl(15,45%,15%)] mb-6" style={{ fontFamily: "var(--font-space-grotesk)" }}>Network Topology</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
        {[
          { icon: Globe, name: "SaaS Gateway", port: "8080", desc: "The public edge proxy. Handles TLS termination, multi-tenant API key validation, quota enforcement, and exact byte-for-byte forwarding.", color: "text-[hsl(15,85%,58%)]" },
          { icon: Server, name: "Control Plane", port: "8000", desc: "Configuration hub. Orchestrates organization accounts, RBAC, API keys, billing webhooks (Stripe), and tenant isolation logic.", color: "text-[hsl(15,45%,15%)]" },
          { icon: Database, name: "Cryptographic Recorder", port: "8000", desc: "The immutable vault. Re-hashes the payload via SHA-256 and chains it using Ed25519 signatures. Guarantees non-repudiation.", color: "text-[hsl(15,30%,45%)]" },
          { icon: Shield, name: "Governance Engine", port: "8002", desc: "Human-in-The-Loop execution environment. Holds suspended inference requests while awaiting manual clearance from compliance officers.", color: "text-[hsl(15,85%,58%)]" },
          { icon: Cpu, name: "Policy Engine", port: "8000", desc: "Deterministic & semantic rule execution. Evaluates output payload for PII, context bounds, or custom triggers before letting it transit.", color: "text-[hsl(15,45%,15%)]" },
          { icon: Activity, name: "Reports Aggregator", port: "8003", desc: "Compliance PDF generation factory. Transpiles raw crypto-audits into board-ready EU AI Act Conformity Assessments automatically.", color: "text-[hsl(15,30%,45%)]" },
        ].map((service, i) => (
          <div key={i} className="bg-[hsl(30,60%,99%)] border border-[hsl(15,30%,85%)] rounded-[3px] p-6 hover:border-[hsl(15,85%,58%)] transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 rounded-[2px] bg-white border border-[hsl(15,30%,85%)] flex items-center justify-center">
                <service.icon className={`w-4 h-4 ${service.color}`} />
              </div>
              <span className="text-[10px] font-mono font-bold text-[hsl(15,30%,60%)]">:{service.port}</span>
            </div>
            <h3 className="text-[15px] font-bold text-[hsl(15,45%,15%)] mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>{service.name}</h3>
            <p className="text-[12px] text-[hsl(15,30%,45%)] leading-relaxed font-light">{service.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-[20px] font-bold text-[hsl(15,45%,15%)] mb-8 border-t border-[hsl(15,30%,85%)] pt-10" style={{ fontFamily: "var(--font-space-grotesk)" }}>Inference Request Lifecycle</h2>

      <div className="space-y-0 mb-16 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[hsl(15,85%,58%)] before:to-[hsl(15,30%,85%)]">
        {[
          { step: "01", title: "Proxy Interception", desc: "App sends OpenAI request to Gateway URL. Gateway intercepts prompt payload before it ever reaches OpenAI." },
          { step: "02", title: "Vendor Dispatch", desc: "Gateway securely connects to OpenAI over TLS, executing the inference and fetching the AI response payload." },
          { step: "03", title: "Policy Evaluation", desc: "Before returning the AI response to the App, the Policy Engine inspects the output. If compliant, proceed. If non-compliant, halt transit." },
          { step: "04", title: "Governance Wait (Conditional)", desc: "If flagged for manual review, the HTTP request enters a 202 Accepted long-polling state while a human officer reviews it in the Dashboard." },
          { step: "05", title: "Cryptographic Sealing", desc: "The Recorder canonicalizes the prompt+response pair, chains the previous hash, signs with Ed25519, and commits to the SEC 17a-4 compliant database." },
          { step: "06", title: "Transit Return", desc: "The App receives the exact byte-for-byte AI response, completely unaware that a massive compliance suite fired underneath the proxy." },
        ].map((step, i) => (
          <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Timeline dot */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-[3px] border-white bg-[hsl(15,85%,58%)] shadow-md text-white font-mono text-[13px] font-bold z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              {step.step}
            </div>
            {/* Content card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 bg-white border border-[hsl(15,30%,85%)] rounded-[3px] shadow-sm my-4 hover:border-[hsl(15,45%,15%)] transition-colors">
              <h3 className="font-bold text-[15px] mb-2 text-[hsl(15,45%,15%)]">{step.title}</h3>
              <p className="text-[13px] text-[hsl(15,30%,45%)] font-light leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
