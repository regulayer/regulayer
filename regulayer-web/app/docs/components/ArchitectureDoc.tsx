"use client";
import React from "react";
import { Globe, Database, Shield, Cpu, Server, Activity, ArrowRight } from "lucide-react";

export default function ArchitectureDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Architecture Overview</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        Regulayer is a distributed microservice platform built for enterprise-grade reliability, cryptographic integrity, and regulatory compliance. This page documents the complete system topology, data flow, and security architecture.
      </p>

      <h2 className="text-2xl font-semibold mb-6">System Topology</h2>
      <p className="text-slate-500 mb-6 text-sm leading-relaxed">
        Regulayer consists of six purpose-built microservices, connected by an API gateway that handles TLS termination, routing, and rate limiting. Each service has a single responsibility and can scale independently.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Globe, name: "API Gateway", port: "8100", desc: "TLS-terminated entry point. API key validation, rate limiting, CORS, and request routing to downstream services.", color: "text-orange-500" },
          { icon: Server, name: "Control Plane", port: "8000", desc: "Central orchestration: organization management, billing (Stripe), API key lifecycle, RBAC, project isolation, and the compliance API.", color: "text-amber-500" },
          { icon: Database, name: "Decision Recorder", port: "8001", desc: "Append-only WORM vault. Ed25519 signing, SHA-256 hash chains, sequence ordering, and immutable decision storage.", color: "text-blue-500" },
          { icon: Shield, name: "Governance Service", port: "8002", desc: "HITL review queues, RBAC-scoped reviewer assignment, Slack dispatch, annotations, evidence bundles, and decision timelines.", color: "text-purple-500" },
          { icon: Cpu, name: "Policy Engine", port: "8003", desc: "Real-time rule evaluation: keyword matching, regex, numeric thresholds, semantic analysis (LLaMA 3), and ML anomaly detection.", color: "text-green-500" },
          { icon: Activity, name: "Reports Service", port: "8005", desc: "Compliance reporting: chain integrity verification, governance summaries, incident reports, usage analytics, and SLA metrics.", color: "text-red-500" },
        ].map((service, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-5 hover:bg-white/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <service.icon className={`w-5 h-5 ${service.color}`} />
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">:{service.port}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-700 mb-2">{service.name}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{service.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">Data Flow Pipeline</h2>
      <p className="text-slate-500 mb-6 text-sm leading-relaxed">
        Every AI decision follows a six-step pipeline from proxy interception to conformity documentation:
      </p>

      <div className="space-y-0 mb-10">
        {[
          { step: "01", title: "Proxy Interception", desc: "The Regulayer edge proxy captures the AI model input (prompt), output (response), and all metadata. Sensitive fields can be hashed before leaving the client environment." },
          { step: "02", title: "Gateway Routing", desc: "The API Gateway validates the API key, checks rate limits, resolves organization/project context, and fans out the payload to the Decision Recorder and Policy Engine simultaneously." },
          { step: "03", title: "Policy Evaluation", desc: "The Policy Engine evaluates the decision against all active policies (keyword, semantic, numeric, regex rules). Non-compliant decisions trigger FLAG, BLOCK, or REQUIRE_APPROVAL actions." },
          { step: "04", title: "Cryptographic Sealing", desc: "The Decision Recorder canonicalizes the payload, computes a SHA-256 hash, links it to the previous record's hash (chain), and signs the entire block with Ed25519. WORM enforced." },
          { step: "05", title: "Governance Dispatch", desc: "If any policy triggers REQUIRE_APPROVAL, the decision enters the HITL governance queue. Slack notifications are dispatched to configured channels. Compliance officers review, approve, or reject." },
          { step: "06", title: "Conformity Documentation", desc: "All governance actions, human reviews, and decision metadata are continuously compiled into structured data for automated Conformity Assessments, FRIA reports, and regulatory submissions." },
        ].map((step, i) => (
          <div key={i} className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-orange-400 flex items-center justify-center text-[11px] font-mono font-bold text-orange-500 flex-shrink-0 bg-white z-10">
                {step.step}
              </div>
              {i < 5 && <div className="w-px flex-1 bg-slate-200 min-h-[30px]" />}
            </div>
            <div className="pb-8">
              <h3 className="text-sm font-bold text-slate-700 mb-1">{step.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">Technology Stack</h2>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">Layer</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">Technology</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              ["Backend Services", "Python 3.11, FastAPI, Pydantic v2"],
              ["Database", "PostgreSQL 15 with pgAudit extension"],
              ["Frontend", "Next.js 14, React 18, TypeScript, Recharts"],
              ["Auth", "Clerk (SSO, OAuth, MFA) + Custom RBAC"],
              ["Payments", "Stripe (Subscriptions, Invoicing)"],
              ["Containerization", "Docker, Docker Compose"],
              ["API Gateway", "Caddy (TLS, reverse proxy, rate limiting)"],
              ["Cryptography", "Ed25519 (signing), SHA-256 (hashing), AES-256-GCM (encryption at rest)"],
            ].map(([layer, tech], i) => (
              <tr key={i}>
                <td className="px-4 py-3 font-medium text-slate-700">{layer}</td>
                <td className="px-4 py-3 text-slate-500">{tech}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
