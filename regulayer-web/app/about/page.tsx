"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const values = [
    {
        title: "Integrity First",
        description: "We build systems that are mathematically impossible to tamper with. Our own infrastructure holds us to the same standard we set for our customers.",
        icon: "🛡️",
    },
    {
        title: "Radical Transparency",
        description: "Our architecture is open for inspection. We publish our verification methodology and welcome third-party audits at any time.",
        icon: "🔍",
    },
    {
        title: "Developer Empathy",
        description: "We remember what it's like to integrate yet another SaaS tool. That's why our SDK is three lines — not three hundred.",
        icon: "💻",
    },
    {
        title: "Accountability by Design",
        description: "We believe AI should be accountable the same way financial transactions are. Every decision deserves a receipt.",
        icon: "📋",
    },
];

const team = [
    { name: "Sancheet", role: "Founder & CEO", bio: "Building the trust layer for the AI age." },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <section className="pt-32 pb-24 md:pb-32">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <div className="max-w-3xl mb-20">
                        <p className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-3">
                            About
                        </p>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                            We&apos;re building the<br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                                trust layer for AI
                            </span>
                        </h1>
                        <p className="text-lg text-zinc-400 leading-relaxed">
                            AI makes millions of decisions every day. Most are invisible, unaudited, and irreversible. Regulayer changes that by providing cryptographic proof of every decision — creating accountability infrastructure for the AI era.
                        </p>
                    </div>

                    {/* Mission */}
                    <div className="grid md:grid-cols-2 gap-12 mb-24">
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Our Mission</h2>
                            <p className="text-2xl text-white font-medium leading-relaxed">
                                Make every AI decision provable, auditable, and accountable — so that trust isn&apos;t optional, it&apos;s guaranteed.
                            </p>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">The Problem</h2>
                            <p className="text-zinc-400 leading-relaxed">
                                As AI systems become more autonomous, the gap between what they do and what we can prove they did grows wider. Enterprises deploying AI agents face regulatory scrutiny, audit requirements, and liability risks — but lack the infrastructure to demonstrate compliance. Regulayer fills that gap with immutable, cryptographic proof.
                            </p>
                        </div>
                    </div>

                    {/* Values */}
                    <div className="mb-24">
                        <h2 className="text-2xl font-bold text-white mb-10">Our Values</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {values.map((value) => (
                                <div key={value.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 hover:border-white/[0.12] transition-all">
                                    <div className="text-3xl mb-4">{value.icon}</div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team */}
                    <div className="mb-24">
                        <h2 className="text-2xl font-bold text-white mb-10">Team</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {team.map((person) => (
                                <div key={person.name} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                                        <span className="text-white font-bold text-lg">{person.name[0]}</span>
                                    </div>
                                    <h3 className="text-base font-semibold text-white">{person.name}</h3>
                                    <p className="text-sm text-indigo-400 mb-2">{person.role}</p>
                                    <p className="text-sm text-zinc-500">{person.bio}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center py-16 border-t border-white/[0.06]">
                        <h2 className="text-3xl font-bold text-white mb-4">Join us</h2>
                        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                            We&apos;re looking for exceptional engineers and researchers who want to define how AI trust works.
                        </p>
                        <Link
                            href="mailto:careers@regulayer.com"
                            className="px-8 py-3.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/25"
                        >
                            View Open Positions
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
