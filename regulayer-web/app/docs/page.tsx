"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const docsSections = [
    {
        title: "Getting Started",
        items: [
            { label: "Introduction", href: "#introduction", active: true },
            { label: "Installation", href: "#installation" },
            { label: "Quick Start", href: "#quickstart" },
            { label: "Authentication", href: "#authentication" },
        ],
    },
    {
        title: "Core Concepts",
        items: [
            { label: "Decision Recording", href: "#recording" },
            { label: "Hash Chains", href: "#hash-chains" },
            { label: "Proof Verification", href: "#verification" },
            { label: "Projects & Scoping", href: "#projects" },
        ],
    },
    {
        title: "SDK Reference",
        items: [
            { label: "Python SDK", href: "#python" },
            { label: "TypeScript SDK", href: "#typescript" },
            { label: "Go SDK", href: "#go" },
            { label: "REST API", href: "#rest-api" },
        ],
    },
    {
        title: "Guides",
        items: [
            { label: "EU AI Act Compliance", href: "#eu-ai-act" },
            { label: "SOC 2 Integration", href: "#soc2" },
            { label: "Audit Trail Export", href: "#export" },
            { label: "Webhook Configuration", href: "#webhooks" },
        ],
    },
];

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-24">
                <div className="flex gap-12">
                    {/* Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pb-12">
                        <nav className="space-y-8">
                            {docsSections.map((section) => (
                                <div key={section.title}>
                                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                                        {section.title}
                                    </h4>
                                    <ul className="space-y-1">
                                        {section.items.map((item) => (
                                            <li key={item.label}>
                                                <a
                                                    href={item.href}
                                                    className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${item.active
                                                            ? "text-white bg-white/[0.06] font-medium"
                                                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                                                        }`}
                                                >
                                                    {item.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0 pb-24">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-zinc-600 mb-8">
                            <Link href="/" className="hover:text-zinc-400 transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-zinc-400">Documentation</span>
                        </div>

                        {/* Title */}
                        <h1 id="introduction" className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Documentation</h1>
                        <p className="text-lg text-zinc-400 mb-12 max-w-2xl">
                            Learn how to integrate Regulayer into your AI stack and start recording provable decisions in minutes.
                        </p>

                        {/* Overview Cards */}
                        <div className="grid md:grid-cols-3 gap-4 mb-16">
                            {[
                                { title: "Quick Start", desc: "Get up and running in 5 minutes", icon: "⚡" },
                                { title: "API Reference", desc: "Complete REST and SDK documentation", icon: "📖" },
                                { title: "Examples", desc: "Production-ready code samples", icon: "💻" },
                            ].map((card) => (
                                <div key={card.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all cursor-pointer group">
                                    <div className="text-2xl mb-3">{card.icon}</div>
                                    <h3 className="text-base font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors">{card.title}</h3>
                                    <p className="text-sm text-zinc-500">{card.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Installation Section */}
                        <section id="installation" className="mb-16">
                            <h2 className="text-2xl font-bold text-white mb-4">Installation</h2>
                            <p className="text-zinc-400 mb-6">Install the Regulayer SDK for your language of choice:</p>

                            <div className="space-y-4">
                                {[
                                    { lang: "Python", cmd: "pip install regulayer" },
                                    { lang: "TypeScript", cmd: "npm install @regulayer/sdk" },
                                    { lang: "Go", cmd: "go get github.com/regulayer/sdk-go" },
                                ].map((sdk) => (
                                    <div key={sdk.lang} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                                            <span className="text-xs text-zinc-500 font-medium">{sdk.lang}</span>
                                        </div>
                                        <pre className="p-4 font-mono text-sm text-indigo-400 overflow-x-auto">
                                            <code>{sdk.cmd}</code>
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Quick Start Section */}
                        <section id="quickstart" className="mb-16">
                            <h2 className="text-2xl font-bold text-white mb-4">Quick Start</h2>
                            <p className="text-zinc-400 mb-6">
                                Record your first AI decision in three steps:
                            </p>

                            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden mb-6">
                                <div className="flex items-center px-4 py-2 border-b border-white/[0.06]">
                                    <span className="text-xs text-zinc-500 font-medium">Python</span>
                                </div>
                                <pre className="p-6 font-mono text-sm overflow-x-auto">
                                    <code>
                                        <span className="text-purple-400">from</span> <span className="text-zinc-300">regulayer</span> <span className="text-purple-400">import</span> <span className="text-zinc-300">Regulayer</span>{"\n\n"}
                                        <span className="text-zinc-500"># Initialize the client</span>{"\n"}
                                        <span className="text-zinc-300">client</span> <span className="text-zinc-500">=</span> <span className="text-indigo-400">Regulayer</span><span className="text-zinc-500">(</span>{"\n"}
                                        {"    "}<span className="text-emerald-400">api_key</span><span className="text-zinc-500">=</span><span className="text-amber-400">{'"sk_live_your_key_here"'}</span><span className="text-zinc-500">,</span>{"\n"}
                                        {"    "}<span className="text-emerald-400">project</span><span className="text-zinc-500">=</span><span className="text-amber-400">{'"my-ai-agent"'}</span>{"\n"}
                                        <span className="text-zinc-500">)</span>{"\n\n"}
                                        <span className="text-zinc-500"># Record an AI decision with full context</span>{"\n"}
                                        <span className="text-zinc-300">proof</span> <span className="text-zinc-500">=</span> <span className="text-zinc-300">client</span><span className="text-zinc-500">.</span><span className="text-indigo-400">record</span><span className="text-zinc-500">(</span>{"\n"}
                                        {"    "}<span className="text-emerald-400">decision_type</span><span className="text-zinc-500">=</span><span className="text-amber-400">{'"model_inference"'}</span><span className="text-zinc-500">,</span>{"\n"}
                                        {"    "}<span className="text-emerald-400">model</span><span className="text-zinc-500">=</span><span className="text-amber-400">{'"gpt-4o"'}</span><span className="text-zinc-500">,</span>{"\n"}
                                        {"    "}<span className="text-emerald-400">input_hash</span><span className="text-zinc-500">=</span><span className="text-zinc-300">sha256</span><span className="text-zinc-500">(</span><span className="text-zinc-300">prompt</span><span className="text-zinc-500">),</span>{"\n"}
                                        {"    "}<span className="text-emerald-400">output_hash</span><span className="text-zinc-500">=</span><span className="text-zinc-300">sha256</span><span className="text-zinc-500">(</span><span className="text-zinc-300">response</span><span className="text-zinc-500">),</span>{"\n"}
                                        {"    "}<span className="text-emerald-400">metadata</span><span className="text-zinc-500">=</span><span className="text-zinc-500">{"{"}</span><span className="text-amber-400">{'"user_id"'}</span><span className="text-zinc-500">:</span> <span className="text-amber-400">{'"u_123"'}</span><span className="text-zinc-500">{"}"}</span>{"\n"}
                                        <span className="text-zinc-500">)</span>{"\n\n"}
                                        <span className="text-zinc-500"># Verify anytime</span>{"\n"}
                                        <span className="text-purple-400">assert</span> <span className="text-zinc-300">client</span><span className="text-zinc-500">.</span><span className="text-indigo-400">verify</span><span className="text-zinc-500">(</span><span className="text-zinc-300">proof</span><span className="text-zinc-500">.</span><span className="text-zinc-300">hash</span><span className="text-zinc-500">)</span><span className="text-zinc-500">.</span><span className="text-zinc-300">valid</span>
                                    </code>
                                </pre>
                            </div>

                            {/* Info Box */}
                            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.05] p-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-indigo-400 text-xs">i</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-300 font-medium mb-1">Cryptographic Guarantee</p>
                                        <p className="text-sm text-zinc-500">
                                            Each recorded decision is hashed into a chain. Tampering with any entry invalidates all subsequent proofs — making it mathematically impossible to alter history without detection.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Authentication Section */}
                        <section id="authentication" className="mb-16">
                            <h2 className="text-2xl font-bold text-white mb-4">Authentication</h2>
                            <p className="text-zinc-400 mb-6">
                                All API requests require an API key. You can generate keys from the <Link href="/api-keys" className="text-indigo-400 hover:underline">API Keys page</Link> in your dashboard.
                            </p>

                            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                                <h4 className="text-sm font-medium text-zinc-300 mb-3">Key Types</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <code className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-mono flex-shrink-0 mt-0.5">sk_live_</code>
                                        <p className="text-sm text-zinc-400">Production keys — decisions are recorded on your live ledger.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <code className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-xs font-mono flex-shrink-0 mt-0.5">sk_test_</code>
                                        <p className="text-sm text-zinc-400">Test keys — decisions are recorded but isolated. Perfect for development.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
}
