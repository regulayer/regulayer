"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/* ───────────────────────── ICON COMPONENTS ───────────────────────── */

function ShieldIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    );
}

function BoltIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
    );
}

function EyeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function LockIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
    );
}

function ChartIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
    );
}

function CodeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
    );
}

/* ───────────────────────── FEATURES DATA ───────────────────────── */

const features = [
    {
        icon: ShieldIcon,
        title: "Cryptographic Proof",
        description: "Every AI decision is hashed, signed, and recorded on an immutable ledger. Tamper-proof verification that holds up in court.",
        gradient: "from-indigo-500 to-blue-600",
        glowColor: "rgba(99, 102, 241, 0.15)",
    },
    {
        icon: BoltIcon,
        title: "Real-time Guardrails",
        description: "Enforce governance policies before AI models act. Sub-millisecond policy evaluation with zero-latency decision recording.",
        gradient: "from-amber-500 to-orange-600",
        glowColor: "rgba(245, 158, 11, 0.15)",
    },
    {
        icon: EyeIcon,
        title: "Forensic Audit Trail",
        description: "Reconstruct complete decision chains with full context. Know exactly what your AI did, why, and when — for any point in time.",
        gradient: "from-emerald-500 to-teal-600",
        glowColor: "rgba(16, 185, 129, 0.15)",
    },
    {
        icon: LockIcon,
        title: "Enterprise Security",
        description: "SOC 2 Type II compliant infrastructure with end-to-end encryption. Your data never leaves your jurisdiction.",
        gradient: "from-purple-500 to-violet-600",
        glowColor: "rgba(168, 85, 247, 0.15)",
    },
    {
        icon: ChartIcon,
        title: "Compliance Dashboard",
        description: "One-click regulatory reports for EU AI Act, FDA, and SEC requirements. Always audit-ready, zero manual effort.",
        gradient: "from-rose-500 to-pink-600",
        glowColor: "rgba(244, 63, 94, 0.15)",
    },
    {
        icon: CodeIcon,
        title: "Developer-first SDK",
        description: "Three lines of code to start recording. Python, TypeScript, and Go SDKs with OpenTelemetry-compatible instrumentation.",
        gradient: "from-cyan-500 to-sky-600",
        glowColor: "rgba(6, 182, 212, 0.15)",
    },
];

const metrics = [
    { value: "50M+", label: "Decisions Recorded" },
    { value: "<1ms", label: "Verification Latency" },
    { value: "99.99%", label: "Uptime SLA" },
    { value: "SOC 2", label: "Certified" },
];

/* ───────────────────────── PAGE ───────────────────────── */

export default function Home() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            {/* ─── HERO ─── */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Mesh Background */}
                <div className="absolute inset-0 mesh-gradient" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-32 pb-20">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-xs font-medium text-zinc-400">
                            Now Generally Available
                        </span>
                    </div>

                    {/* Heading */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6">
                        <span className="text-white">Provable Trust</span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                            for Every AI Decision
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
                        Regulayer records cryptographic proof of every AI action — creating an immutable, auditable trail that regulators trust and enterprises require.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/signup"
                            className="w-full sm:w-auto px-8 py-3.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5"
                        >
                            Start Building — Free
                        </Link>
                        <Link
                            href="/docs"
                            className="w-full sm:w-auto px-8 py-3.5 text-sm font-medium text-zinc-300 border border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.03] rounded-xl transition-all hover:-translate-y-0.5"
                        >
                            Read Documentation
                        </Link>
                    </div>

                    {/* Code Preview */}
                    <div className="mt-16 max-w-2xl mx-auto">
                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/40">
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-white/10" />
                                    <div className="w-3 h-3 rounded-full bg-white/10" />
                                    <div className="w-3 h-3 rounded-full bg-white/10" />
                                </div>
                                <span className="text-xs text-zinc-600 ml-2 font-mono">app.py</span>
                            </div>
                            <pre className="p-6 text-sm font-mono text-left overflow-x-auto">
                                <code>
                                    <span className="text-zinc-500">{"# Three lines to cryptographic trust"}</span>{"\n"}
                                    <span className="text-purple-400">from</span>{" "}
                                    <span className="text-zinc-300">regulayer</span>{" "}
                                    <span className="text-purple-400">import</span>{" "}
                                    <span className="text-zinc-300">Regulayer</span>{"\n\n"}
                                    <span className="text-zinc-300">client</span>{" "}
                                    <span className="text-zinc-500">=</span>{" "}
                                    <span className="text-indigo-400">Regulayer</span>
                                    <span className="text-zinc-500">(</span>
                                    <span className="text-emerald-400">api_key</span>
                                    <span className="text-zinc-500">=</span>
                                    <span className="text-amber-400">{'"sk_live_..."'}</span>
                                    <span className="text-zinc-500">)</span>{"\n"}
                                    <span className="text-zinc-300">proof</span>{" "}
                                    <span className="text-zinc-500">=</span>{" "}
                                    <span className="text-zinc-300">client</span>
                                    <span className="text-zinc-500">.</span>
                                    <span className="text-indigo-400">record</span>
                                    <span className="text-zinc-500">(</span>
                                    <span className="text-zinc-300">decision</span>
                                    <span className="text-zinc-500">)</span>{"\n\n"}
                                    <span className="text-zinc-500">{"# proof.hash → 0x7f3a...c921"}</span>{"\n"}
                                    <span className="text-zinc-500">{"# proof.verified → True"}</span>{"\n"}
                                    <span className="text-zinc-500">{"# proof.timestamp → 2026-02-13T04:30:00Z"}</span>
                                </code>
                            </pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── METRICS BAR ─── */}
            <section className="border-y border-white/[0.06] bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {metrics.map((m) => (
                            <div key={m.label} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{m.value}</div>
                                <div className="text-sm text-zinc-500">{m.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FEATURES ─── */}
            <section id="features" className="py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-3">
                            Infrastructure
                        </p>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                            Everything you need for<br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                                AI governance
                            </span>
                        </h2>
                        <p className="text-zinc-400 max-w-xl mx-auto">
                            From recording decisions to generating compliance reports — Regulayer handles the hard parts so you can focus on building.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04]"
                                style={{
                                    transition: 'all 0.5s ease',
                                }}
                            >
                                {/* Hover Glow */}
                                <div
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{
                                        background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${feature.glowColor}, transparent 40%)`,
                                    }}
                                />

                                <div className="relative z-10">
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} mb-5 shadow-lg`}
                                        style={{ boxShadow: `0 8px 30px ${feature.glowColor}` }}
                                    >
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section className="py-24 md:py-32 border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-3">
                            How It Works
                        </p>
                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                            From integration to proof<br />
                            in under 5 minutes
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Integrate the SDK",
                                description: "Install our lightweight SDK and wrap your AI decision points. Python, TypeScript, and Go supported.",
                                code: "pip install regulayer",
                            },
                            {
                                step: "02",
                                title: "Record Decisions",
                                description: "Every AI action is cryptographically hashed and recorded with full context, inputs, and outputs.",
                                code: "client.record(decision)",
                            },
                            {
                                step: "03",
                                title: "Verify & Audit",
                                description: "Generate compliance reports, run forensic audits, and prove governance to any regulator or stakeholder.",
                                code: "client.verify(proof_hash)",
                            },
                        ].map((item) => (
                            <div key={item.step} className="relative">
                                <div className="text-6xl font-black text-white/[0.03] mb-4">{item.step}</div>
                                <h3 className="text-xl font-semibold text-white mb-3 -mt-6">{item.title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed mb-4">{item.description}</p>
                                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 font-mono text-sm text-indigo-400">
                                    {item.code}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── TESTIMONIAL / TRUST ─── */}
            <section className="py-24 md:py-32 border-t border-white/[0.06]">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] mb-8">
                        <span className="text-xs font-medium text-zinc-400">Trusted by engineering teams worldwide</span>
                    </div>
                    <blockquote className="text-2xl md:text-3xl font-medium text-white leading-relaxed mb-6">
                        &ldquo;Regulayer gave us the ability to prove our AI governance to auditors in minutes instead of weeks. It&apos;s the infrastructure layer we didn&apos;t know we needed.&rdquo;
                    </blockquote>
                    <div className="text-zinc-500 text-sm">
                        <span className="text-zinc-300 font-medium">VP of Engineering</span> — Fortune 500 Financial Services
                    </div>
                </div>
            </section>

            {/* ─── FINAL CTA ─── */}
            <section className="py-24 md:py-32 border-t border-white/[0.06]">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Ready to build trust into<br />your AI stack?
                    </h2>
                    <p className="text-zinc-400 max-w-lg mx-auto mb-8">
                        Join hundreds of teams using Regulayer to record, verify, and prove every AI decision.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/signup"
                            className="w-full sm:w-auto px-8 py-3.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            href="/pricing"
                            className="w-full sm:w-auto px-8 py-3.5 text-sm font-medium text-zinc-300 border border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.03] rounded-xl transition-all"
                        >
                            View Pricing
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
