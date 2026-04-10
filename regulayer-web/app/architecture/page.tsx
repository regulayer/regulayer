"use client";

import React, { useRef, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { ArrowRight, Shield, Lock, Cpu, Database, Activity, Globe, Layers, Zap, Eye, GitBranch, Hash, Server, ChevronRight } from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   REGULAYER ARCHITECTURE — THE COMPLETE TECHNICAL REGISTRY
   A world-class page covering: System Topology, Data Flow,
   Cryptographic Pipeline, Security Model, and Visionary Features.
   ══════════════════════════════════════════════════════════════ */

function useReveal(t = 0.1) {
    const ref = useRef<HTMLDivElement>(null);
    const [v, setV] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const o = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setV(true); o.disconnect(); }
        }, { threshold: t });
        o.observe(el);
        return () => o.disconnect();
    }, [t]);
    return { ref, v };
}

/* ── Data ──────────────────────────────────────────────── */

const services = [
    { name: "Ingestion Gateway", icon: Globe, port: "8000", desc: "TLS-terminated entry point. API key validation, rate limiting, and request routing to downstream microservices.", color: "hsl(15,85%,58%)" },
    { name: "Decision Recorder", icon: Database, port: "8001", desc: "Append-only WORM storage engine. Ed25519 signing, SHA-256 hash chaining, and sequence ordering.", color: "hsl(200,80%,55%)" },
    { name: "Governance Service", icon: Shield, port: "8002", desc: "Human-in-the-loop review queues, RBAC assignment, Slack Block-Kit dispatch, and AI reviewer integration.", color: "hsl(280,70%,60%)" },
    { name: "Policy Engine", icon: Cpu, port: "8003", desc: "Real-time rule evaluation, statistical ML anomaly detection, and automated Gate Mode interception.", color: "hsl(150,60%,45%)" },
    { name: "Control Plane", icon: Server, port: "8004", desc: "Organization management, billing, API key lifecycle, team RBAC, and multi-tenant project isolation.", color: "hsl(35,85%,55%)" },
    { name: "Incident Manager", icon: Activity, port: "8005", desc: "Critical incident tracking, severity classification, resolution workflows, and public status broadcasting.", color: "hsl(0,70%,55%)" },
];

const dataFlowSteps = [
    { step: "01", title: "Proxy Intercept", desc: "The Regulayer edge proxy captures AI model inputs, outputs, and metadata. Sensitive fields are hashed before any data leaves the client environment." },
    { step: "02", title: "Gateway Routing", desc: "The Ingestion Gateway validates the API key, enforces rate limits, injects org/project context headers, and fans-out to both the Recorder and Policy Engine." },
    { step: "03", title: "Policy Evaluation", desc: "The Policy Engine evaluates all active rules against EU AI Act thresholds. The ML Anomaly Detector tracks statistical baselines. Non-compliant decisions are blocked instantly." },
    { step: "04", title: "Cryptographic Sealing", desc: "The Recorder canonicalizes the payload, computes the SHA-256 hash, links it to the previous record's hash, and Ed25519-signs the entire block. WORM enforced." },
    { step: "05", title: "Governance Dispatch", desc: "If policies trigger require_approval or block actions, the Governance Service creates HITL review queues and fires rich Slack notifications to enterprise channels." },
    { step: "06", title: "Conformity Documentation", desc: "Periodically, all governance actions and audit data are compiled into automated Conformity Assessments and FRIA reports, ready for regulatory submission." },
];

const cryptoPrimitives = [
    { name: "Ed25519", category: "Signing", detail: "Elliptic curve digital signatures for non-repudiation. Every record is signed with the Recorder's private key. Verification is O(1) with the public key." },
    { name: "SHA-256", category: "Hashing", detail: "Cryptographic hash function producing 64-character hex digests. Used for record hashing, hash chain linking, and ZKP commitment generation." },
    { name: "Merkle Trees", category: "Anchoring", detail: "Binary hash trees that compress N record hashes into a single root. Enables O(log N) inclusion proofs and public blockchain anchoring." },
    { name: "ZKP Commitments", category: "Privacy", detail: "Salted SHA-256 commitments mask PII at the SDK edge. Auditors verify policy compliance without accessing the underlying plaintext data." },
];

const securityLayers = [
    { title: "Network Isolation", points: ["TLS 1.3 encryption in transit", "Internal mTLS between microservices", "Rate limiting per API key and IP"] },
    { title: "Data Protection", points: ["AES-256-GCM encryption at rest", "Per-tenant cryptographic key isolation", "Append-only WORM storage (no UPDATE/DELETE)"] },
    { title: "Access Control", points: ["Role-Based Access Control (RBAC)", "API key scoping per project", "Internal auth secrets for service-to-service"] },
    { title: "Compliance", points: ["SEC 17a-4 WORM compliance", "EU AI Act article mapping", "SOC 2 Type II audit trail", "GDPR-ready data residency"] },
];

/* ── Page ──────────────────────────────────────────────── */

export default function ArchitecturePage() {
    const hero = useReveal();
    const topology = useReveal();
    const flow = useReveal();
    const crypto = useReveal();
    const security = useReveal();
    const cta = useReveal();

    return (
        <div className="min-h-screen bg-[hsl(30,60%,99%)] text-[hsl(15,45%,15%)] antialiased">
            <Navbar />

            {/* ═══════════ HERO ═══════════ */}
            <section ref={hero.ref} className="pt-36 pb-20 lg:pt-44 lg:pb-28 relative overflow-hidden border-b border-[hsl(15,30%,85%)]">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(hsl(15,45%,15%) 1px, transparent 1px), linear-gradient(90deg, hsl(15,45%,15%) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                <div className={`max-w-5xl mx-auto px-6 lg:px-10 relative z-10 transition-all duration-700 ${hero.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                    <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,30%,45%)] uppercase mb-6 block">System Architecture &amp; Technical Registry</span>
                    <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-tight leading-[1.05] mb-8" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                        The Compliance<br />Gateway Pipeline.
                    </h1>
                    <p className="text-[18px] text-[hsl(15,25%,45%)] leading-relaxed max-w-2xl font-light">
                        A complete technical overview of Regulayer&apos;s distributed microservice architecture — from proxy interception to conformity documentation. 
                        Six purpose-built services, zero single points of failure, governance-enforced at every layer.
                    </p>
                    <div className="flex gap-4 mt-10">
                        <Link href="/docs/api" className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(15,45%,15%)] text-white text-sm font-bold tracking-wide hover:bg-[hsl(15,85%,58%)] transition-colors">
                            API Documentation <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/docs" className="inline-flex items-center gap-2 px-6 py-3 border border-[hsl(15,30%,85%)] text-sm font-bold tracking-wide hover:bg-white transition-colors">
                            SDK Quick Start <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════ SERVICE TOPOLOGY ═══════════ */}
            <section ref={topology.ref} className="py-24 lg:py-32 border-b border-[hsl(15,30%,85%)]">
                <div className={`max-w-7xl mx-auto px-6 lg:px-10 transition-all duration-700 ${topology.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 pb-8 border-b border-[hsl(15,30%,85%)]">
                        <div>
                            <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,30%,45%)] uppercase mb-4 block">Service Topology</span>
                            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-tight leading-[1.1]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                                Six microservices.<br /><span className="font-light text-[hsl(15,25%,45%)]">Zero single points of failure.</span>
                            </h2>
                        </div>
                        <span className="text-[11px] font-mono text-[hsl(15,30%,50%)] bg-[hsl(30,60%,97%)] border border-[hsl(15,30%,85%)] px-3 py-1.5">TOPOLOGY_MAP :: v5.2</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-[hsl(15,30%,85%)] bg-[hsl(15,30%,85%)]" style={{ gap: "1px" }}>
                        {services.map((s, i) => (
                            <div key={i} className="bg-white hover:bg-[hsl(30,60%,99%)] transition-colors p-8 flex flex-col group">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                                        <s.icon className="w-5 h-5" style={{ color: s.color }} />
                                    </div>
                                    <span className="text-[10px] font-mono text-[hsl(15,30%,50%)] border border-[hsl(15,30%,85%)] px-2 py-0.5">:{s.port}</span>
                                </div>
                                <h3 className="text-[16px] font-bold mb-2 tracking-tight group-hover:text-[hsl(15,85%,58%)] transition-colors" style={{ fontFamily: "var(--font-space-grotesk)" }}>{s.name}</h3>
                                <p className="text-[13px] text-[hsl(15,25%,45%)] leading-relaxed font-light flex-1">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ DATA FLOW PIPELINE ═══════════ */}
            <section ref={flow.ref} className="py-24 lg:py-32 bg-[hsl(30,40%,96%)] border-b border-[hsl(15,30%,85%)]">
                <div className={`max-w-5xl mx-auto px-6 lg:px-10 transition-all duration-700 ${flow.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                    <div className="mb-16 pb-8 border-b border-[hsl(15,30%,85%)]">
                        <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,85%,58%)] uppercase mb-4 block">Data Flow Registry</span>
                        <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-tight leading-[1.1] text-[hsl(15,45%,15%)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                            From Proxy to Conformity Report.<br /><span className="font-light text-[hsl(15,25%,45%)]">The complete governance lifecycle.</span>
                        </h2>
                    </div>

                    <div className="space-y-0">
                        {dataFlowSteps.map((s, i) => (
                            <div key={i} className="flex gap-8 group">
                                {/* Vertical line */}
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full border-2 border-[hsl(15,85%,58%)] flex items-center justify-center text-[11px] font-mono font-bold text-[hsl(15,85%,58%)] flex-shrink-0 bg-[hsl(30,40%,96%)] z-10">
                                        {s.step}
                                    </div>
                                    {i < dataFlowSteps.length - 1 && <div className="w-px flex-1 bg-[hsl(15,30%,85%)] min-h-[40px]" />}
                                </div>
                                {/* Content */}
                                <div className="pb-10">
                                    <h3 className="text-[16px] font-bold mb-2 tracking-tight text-[hsl(15,45%,15%)] group-hover:text-[hsl(15,85%,58%)] transition-colors" style={{ fontFamily: "var(--font-space-grotesk)" }}>{s.title}</h3>
                                    <p className="text-[14px] text-[hsl(15,25%,45%)] leading-relaxed font-light">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ CRYPTOGRAPHIC PRIMITIVES ═══════════ */}
            <section ref={crypto.ref} className="py-24 lg:py-32 border-b border-[hsl(15,30%,85%)]">
                <div className={`max-w-7xl mx-auto px-6 lg:px-10 transition-all duration-700 ${crypto.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 pb-8 border-b border-[hsl(15,30%,85%)]">
                        <div>
                            <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,30%,45%)] uppercase mb-4 block">Cryptographic Primitives</span>
                            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-tight leading-[1.1]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                                Mathematical guarantees.<br /><span className="font-light text-[hsl(15,25%,45%)]">Not promises — proofs.</span>
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cryptoPrimitives.map((p, i) => (
                            <div key={i} className="border border-[hsl(15,30%,85%)] p-8 hover:bg-white transition-colors group">
                                <div className="flex items-center gap-3 mb-4">
                                    <Hash className="w-5 h-5 text-[hsl(15,85%,58%)]" />
                                    <h3 className="text-[18px] font-bold tracking-tight group-hover:text-[hsl(15,85%,58%)] transition-colors" style={{ fontFamily: "var(--font-space-grotesk)" }}>{p.name}</h3>
                                    <span className="text-[10px] font-mono text-[hsl(15,30%,50%)] border border-[hsl(15,30%,85%)] px-2 py-0.5 ml-auto">{p.category}</span>
                                </div>
                                <p className="text-[14px] text-[hsl(15,25%,45%)] leading-relaxed font-light">{p.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ SECURITY MODEL ═══════════ */}
            <section ref={security.ref} className="py-24 lg:py-32 border-b border-[hsl(15,30%,85%)]">
                <div className={`max-w-7xl mx-auto px-6 lg:px-10 transition-all duration-700 ${security.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                    <div className="mb-16 pb-8 border-b border-[hsl(15,30%,85%)]">
                        <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,30%,45%)] uppercase mb-4 block">Security Model</span>
                        <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-tight leading-[1.1]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                            Defense in depth.<br /><span className="font-light text-[hsl(15,25%,45%)]">Four independent security layers.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-[hsl(15,30%,85%)] bg-[hsl(15,30%,85%)]" style={{ gap: "1px" }}>
                        {securityLayers.map((layer, i) => (
                            <div key={i} className="bg-white p-6 flex flex-col">
                                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[hsl(15,30%,85%)]">
                                    <Lock className="w-4 h-4 text-[hsl(15,85%,58%)]" />
                                    <h3 className="text-[14px] font-bold tracking-tight uppercase" style={{ fontFamily: "var(--font-space-grotesk)" }}>{layer.title}</h3>
                                </div>
                                <ul className="space-y-3 flex-1">
                                    {layer.points.map((point, j) => (
                                        <li key={j} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(15,85%,58%)] mt-1.5 flex-shrink-0" />
                                            <span className="text-[13px] text-[hsl(15,25%,45%)] leading-snug font-light">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ FINAL CTA ═══════════ */}
            <section ref={cta.ref} className="py-24 lg:py-32">
                <div className={`max-w-2xl mx-auto px-6 lg:px-10 text-center transition-all duration-700 ${cta.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                    <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-tight leading-[1.1] mb-6" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                        Ready to deploy<br /><span className="font-light text-[hsl(15,25%,45%)]">compliant AI governance?</span>
                    </h2>
                    <p className="text-[16px] text-[hsl(15,25%,45%)] leading-relaxed font-light mb-10 max-w-lg mx-auto">
                        Connect your AI systems to Regulayer in minutes. Every inference governed, every decision auditable, every report automated.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[hsl(15,45%,15%)] text-white text-sm font-bold tracking-wide hover:bg-[hsl(15,85%,58%)] transition-colors">
                            Start Free <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 border border-[hsl(15,30%,85%)] text-sm font-bold tracking-wide hover:bg-white transition-colors">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
