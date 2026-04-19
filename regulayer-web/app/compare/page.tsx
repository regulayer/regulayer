"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Check, X, Minus, ArrowRight, Shield, Eye, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const competitors = [
  { name: "Regulayer", type: "Active Interception Proxy", highlight: true },
  { name: "LangSmith", type: "Passive Observability" },
  { name: "Helicone", type: "Passive Logging" },
  { name: "Datadog AI", type: "Passive Monitoring" },
  { name: "OneTrust", type: "GRC Platform" },
];

const features = [
  {
    category: "Core Architecture",
    items: [
      { feature: "Active network interception (blocks bad outputs before delivery)", regulayer: true, langsmith: false, helicone: false, datadog: false, onetrust: false },
      { feature: "Sub-20ms synchronous proxy in inference path", regulayer: true, langsmith: false, helicone: false, datadog: false, onetrust: false },
      { feature: "LLM API monitoring and logging", regulayer: true, langsmith: true, helicone: true, datadog: true, onetrust: false },
      { feature: "Air-gapped VPC deployment (zero external calls)", regulayer: true, langsmith: false, helicone: false, datadog: false, onetrust: false },
      { feature: "PII scrubbing before data leaves network perimeter", regulayer: true, langsmith: false, helicone: false, datadog: false, onetrust: false },
    ]
  },
  {
    category: "EU AI Act Compliance",
    items: [
      { feature: "Article 12 — Automated record-keeping with tamper-proof audit trail", regulayer: true, langsmith: false, helicone: false, datadog: false, onetrust: "partial" },
      { feature: "Article 14 — Human-in-the-Loop governance queues", regulayer: true, langsmith: false, helicone: false, datadog: false, onetrust: "partial" },
      { feature: "Article 9 — Real-time AI risk management enforcement", regulayer: true, langsmith: false, helicone: false, datadog: false, onetrust: "partial" },
      { feature: "Automated Conformity Assessment generation", regulayer: true, langsmith: false, helicone: false, datadog: false, onetrust: "partial" },
      { feature: "Automated FRIA (Fundamental Rights Impact Assessment)", regulayer: true, langsmith: false, helicone: false, datadog: false, onetrust: "partial" },
    ]
  },
  {
    category: "Cryptographic Evidence",
    items: [
      { feature: "SHA-256 hash chaining (blockchain-grade immutability)", regulayer: true, langsmith: false, helicone: false, datadog: false, onetrust: false },
      { feature: "Ed25519 digital signatures on every audit record", regulayer: true, langsmith: false, helicone: false, datadog: false, onetrust: false },
      { feature: "WORM-compliant storage (SEC 17a-4)", regulayer: true, langsmith: false, helicone: false, datadog: false, onetrust: false },
      { feature: "Court-admissible forensic evidence generation", regulayer: true, langsmith: false, helicone: false, datadog: false, onetrust: false },
    ]
  },
  {
    category: "Governance & Operations",
    items: [
      { feature: "Real-time policy engine with configurable rules", regulayer: true, langsmith: false, helicone: false, datadog: "partial", onetrust: "partial" },
      { feature: "Slack/Teams integration for governance notifications", regulayer: true, langsmith: true, helicone: false, datadog: true, onetrust: true },
      { feature: "Multi-tenant organization management", regulayer: true, langsmith: true, helicone: true, datadog: true, onetrust: true },
      { feature: "ISO/IEC 42001:2023 report automation", regulayer: true, langsmith: false, helicone: false, datadog: false, onetrust: "partial" },
      { feature: "SOC 2 Type II audit readiness", regulayer: true, langsmith: true, helicone: false, datadog: true, onetrust: true },
    ]
  },
];

function StatusIcon({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-emerald-500" />;
  if (value === "partial") return <Minus className="w-4 h-4 text-amber-500" />;
  return <X className="w-4 h-4 text-red-400" />;
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[hsl(30,60%,99%)] text-[hsl(15,45%,15%)] antialiased">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-16 lg:pt-44 lg:pb-20 border-b border-[hsl(15,30%,85%)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(hsl(15,45%,15%) 1px, transparent 1px), linear-gradient(90deg, hsl(15,45%,15%) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-5xl mx-auto px-6 lg:px-10 relative z-10">
          <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,30%,45%)] uppercase mb-6 block">Competitive Analysis</span>
          <h1 className="text-[clamp(2.2rem,4.5vw,4rem)] font-bold tracking-tight leading-[1.05] mb-6" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Why passive AI observability<br/>
            <span className="premium-serif-italic font-light text-[hsl(15,85%,58%)]">fails compliance.</span>
          </h1>
          <p className="text-[18px] text-[hsl(15,25%,45%)] leading-relaxed max-w-2xl font-light mb-8">
            LangSmith, Helicone, and Datadog AI are excellent observability tools. But observability is not compliance. Under the EU AI Act, logging a violation without stopping it is documented negligence. Here is exactly how Regulayer differs from every tool in the market.
          </p>

          {/* The Key Insight */}
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
            <div className="border border-red-200 bg-red-50/50 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-red-500" />
                <span className="text-[12px] font-mono text-red-600 uppercase tracking-wider font-bold">Passive Observability</span>
              </div>
              <p className="text-[14px] text-red-800 leading-relaxed">Copies AI output to a dashboard <strong>after</strong> it has been delivered to the user. If the AI hallucinates or discriminates, the damage is already done. The tool simply records your liability.</p>
            </div>
            <div className="border border-emerald-200 bg-emerald-50/50 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="text-[12px] font-mono text-emerald-700 uppercase tracking-wider font-bold">Active Interception</span>
              </div>
              <p className="text-[14px] text-emerald-800 leading-relaxed">Sits <strong>in the network path</strong> between your app and the LLM. Evaluates every response in real-time. Blocks violations before they reach the user. Liability is neutralized instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-10">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-[hsl(15,30%,85%)]">
                  <th className="text-left py-4 px-4 text-[13px] font-bold text-[hsl(15,30%,45%)] uppercase tracking-wider w-[35%]">Feature</th>
                  {competitors.map((c, i) => (
                    <th key={i} className={`text-center py-4 px-3 ${c.highlight ? "bg-[hsl(15,85%,58%,0.05)]" : ""}`}>
                      <div className={`text-[14px] font-bold ${c.highlight ? "text-[hsl(15,85%,58%)]" : "text-[hsl(15,45%,15%)]"}`} style={{ fontFamily: "var(--font-space-grotesk)" }}>{c.name}</div>
                      <div className="text-[10px] font-mono text-[hsl(15,30%,50%)] mt-1">{c.type}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((cat, ci) => (
                  <React.Fragment key={ci}>
                    <tr className="bg-[hsl(30,60%,97%)]">
                      <td colSpan={6} className="py-3 px-4 text-[11px] font-mono font-bold text-[hsl(15,85%,58%)] uppercase tracking-widest">{cat.category}</td>
                    </tr>
                    {cat.items.map((item, ii) => (
                      <tr key={ii} className="border-b border-[hsl(15,30%,92%)] hover:bg-white transition-colors">
                        <td className="py-3 px-4 text-[13px] text-[hsl(15,25%,35%)]">{item.feature}</td>
                        <td className={`text-center py-3 px-3 bg-[hsl(15,85%,58%,0.03)]`}><div className="flex justify-center"><StatusIcon value={item.regulayer} /></div></td>
                        <td className="text-center py-3 px-3"><div className="flex justify-center"><StatusIcon value={item.langsmith} /></div></td>
                        <td className="text-center py-3 px-3"><div className="flex justify-center"><StatusIcon value={item.helicone} /></div></td>
                        <td className="text-center py-3 px-3"><div className="flex justify-center"><StatusIcon value={item.datadog} /></div></td>
                        <td className="text-center py-3 px-3"><div className="flex justify-center"><StatusIcon value={item.onetrust} /></div></td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Deep Dive: Why Observability Fails */}
      <section className="py-16 lg:py-24 bg-[hsl(15,45%,15%)] text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold tracking-tight mb-12" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Why "AI Observability" is legally insufficient for the EU AI Act
          </h2>

          <div className="space-y-8">
            <article>
              <h3 className="text-[18px] font-bold mb-3 text-[hsl(15,85%,70%)]">1. LangSmith logs violations — it does not prevent them</h3>
              <p className="text-[15px] text-white/70 leading-[1.8]">LangSmith by LangChain is an excellent developer tool for debugging LLM chains, tracing prompt-completion flows, and evaluating model performance. However, LangSmith operates as an asynchronous sidecar — it receives a copy of the AI output after it has already been delivered to the user. If the model hallucinates a discriminatory decision, LangSmith will log it perfectly in your dashboard. In a regulatory investigation, that dashboard becomes evidence of documented negligence: you knew about the violation and had no mechanism to stop it.</p>
            </article>

            <article>
              <h3 className="text-[18px] font-bold mb-3 text-[hsl(15,85%,70%)]">2. Helicone optimizes cost — it does not enforce governance</h3>
              <p className="text-[15px] text-white/70 leading-[1.8]">Helicone is designed for LLM cost tracking, latency monitoring, and usage analytics. It provides excellent visibility into API spend and model performance metrics. But it has no policy engine, no governance queues, no human oversight workflows, and no cryptographic audit trail. It cannot intercept a violating response, cannot route a decision to a compliance officer, and cannot generate EU AI Act conformity documentation. Cost optimization and regulatory compliance are fundamentally different requirements.</p>
            </article>

            <article>
              <h3 className="text-[18px] font-bold mb-3 text-[hsl(15,85%,70%)]">3. Datadog AI monitors infrastructure — it does not manage regulatory risk</h3>
              <p className="text-[15px] text-white/70 leading-[1.8]">Datadog provides world-class application performance monitoring, infrastructure metrics, and log management. Their AI monitoring capabilities track model latency, error rates, and operational health. However, Datadog monitors the health of your AI infrastructure — not the compliance of your AI decisions. It cannot evaluate whether an LLM output violates Article 14 human oversight requirements, cannot generate ISO 42001 conformity assessments, and cannot provide WORM-compliant forensic evidence for regulatory proceedings.</p>
            </article>

            <article>
              <h3 className="text-[18px] font-bold mb-3 text-[hsl(15,85%,70%)]">4. OneTrust manages policies — it does not enforce them technically</h3>
              <p className="text-[15px] text-white/70 leading-[1.8]">OneTrust is a comprehensive Governance, Risk, and Compliance (GRC) platform with excellent policy management, privacy program administration, and risk assessment capabilities. They have added AI governance modules that help organizations document their AI systems. However, OneTrust operates at the organizational policy layer — not at the technical enforcement layer. It cannot intercept an AI inference in real-time, cannot block a biased output before delivery, and cannot cryptographically seal individual decision records with Ed25519 signatures. Regulayer provides the technical enforcement that makes OneTrust policies actually enforceable.</p>
            </article>
          </div>
        </div>
      </section>

      {/* FAQ Schema Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold tracking-tight mb-12" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {[
              { q: "Is Regulayer a replacement for LangSmith?", a: "No. Regulayer and LangSmith serve different purposes. LangSmith is an observability and debugging tool for LLM development. Regulayer is a compliance enforcement proxy that sits in the live inference path. Many teams use both: LangSmith during development for prompt engineering and debugging, and Regulayer in production for EU AI Act compliance, human oversight, and forensic audit trails." },
              { q: "Can I use Regulayer with Datadog?", a: "Yes. Regulayer complements Datadog rather than replacing it. Datadog monitors your infrastructure health and application performance. Regulayer monitors your AI decisions for regulatory compliance. Regulayer can export metrics and events to Datadog for unified operational dashboards while maintaining its own cryptographically sealed compliance records." },
              { q: "Why can't I just use OneTrust for AI compliance?", a: "OneTrust excels at policy documentation and privacy program management. However, OneTrust operates at the organizational layer — it helps you write policies. Regulayer operates at the technical enforcement layer — it ensures those policies are actually enforced on every AI inference. The EU AI Act requires both: documented policies AND technical enforcement mechanisms." },
              { q: "What makes Regulayer different from all AI observability tools?", a: "The fundamental architectural difference is synchronous vs asynchronous operation. Every AI observability tool (LangSmith, Helicone, Datadog) operates asynchronously — they receive copies of AI outputs after delivery. Regulayer operates synchronously — it sits directly in the network path and evaluates every AI output before it reaches the user. This is the difference between logging a violation and preventing one." },
            ].map((faq, i) => (
              <div key={i} className="border border-[hsl(15,30%,85%)] bg-white p-6 lg:p-8">
                <h3 className="text-[16px] font-bold mb-3 text-[hsl(15,45%,15%)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>{faq.q}</h3>
                <p className="text-[14px] text-[hsl(15,25%,40%)] leading-[1.8]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-[hsl(15,30%,85%)]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Stop logging violations.<br/><span className="font-light text-[hsl(15,25%,45%)]">Start preventing them.</span>
          </h2>
          <p className="text-[16px] text-[hsl(15,25%,45%)] mb-8 font-light">Deploy Regulayer in under 5 minutes. One SDK line. Full EU AI Act compliance.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[hsl(15,45%,15%)] text-white text-sm font-bold tracking-wide hover:bg-[hsl(15,85%,58%)] transition-colors">
              Start Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/docs" className="inline-flex items-center gap-2 px-8 py-3.5 border border-[hsl(15,30%,85%)] text-sm font-bold tracking-wide hover:bg-white transition-colors">
              Read the Docs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
