"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ShieldCheck, Lock, Fingerprint, FileCheck, CheckCircle2, Server, Key, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function TrustCenterPage() {
    return (
        <div className="min-h-screen bg-background text-slate-900 font-sans selection:bg-brand-100 overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-16 lg:pt-48 lg:pb-24 border-b border-slate-200 relative">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-auto h-[200px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="container px-6 mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Trust & Security Center
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-500"
                    >
                        Security is engineered <br />into every layer.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-slate-500 max-w-2xl mx-auto mb-10"
                    >
                        Regulayer operates on a zero-trust architecture. Your AI governance data is protected with cryptographic sealing, strict RBAC isolation, and rigorous compliance controls designed for regulated industries.
                    </motion.p>
                </div>
            </section>

            {/* Core Pillars */}
            <section className="py-24 relative">
                <div className="container px-6 mx-auto max-w-6xl">
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Core Security Pillars</h2>
                        <p className="text-slate-500 max-w-2xl">Our architecture enforces data integrity, organizational isolation, and regulatory compliance at every level of the stack.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Fingerprint,
                                title: "Immutable Audit Vault",
                                desc: "Every AI inference, human override, and governance action is cryptographically signed with Ed25519 and archived into a tamper-proof, append-only vault. Modification after ingestion is mathematically impossible."
                            },
                            {
                                icon: Lock,
                                title: "WORM-Compliant Storage",
                                desc: "Decision records are persisted to Write-Once-Read-Many (WORM) storage. Records cannot be modified or deleted before the mandatory retention period expires — not even by Regulayer engineers."
                            },
                            {
                                icon: EyeOff,
                                title: "Enterprise Data Residency",
                                desc: "Strict logical and cryptographic separation between organizations. Each tenant operates within dedicated project partitions with independently scoped encryption keys and access policies."
                            },
                            {
                                icon: Key,
                                title: "Key & Secret Management",
                                desc: "API keys are hashed at rest using bcrypt with high work factors. Secrets are displayed exactly once during creation. Project-scoped keys ensure granular access control across teams."
                            },
                            {
                                icon: Server,
                                title: "High Availability",
                                desc: "Multi-region deployment with active health monitoring ensures maximum uptime. Distributed microservice architecture eliminates single points of failure across the governance pipeline."
                            },
                            {
                                icon: ShieldCheck,
                                title: "Continuous Security Assurance",
                                desc: "Automated vulnerability scanning, dependency auditing, and regular penetration testing secure the infrastructure. RBAC and SSO enforcement provide granular organizational access control."
                            }
                        ].map((pillar, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="bg-white border border-slate-200 rounded-2xl p-8 hover:border-emerald-500/30 transition-colors group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
                                    <pillar.icon className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-3">{pillar.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{pillar.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Compliance Section */}
            <section className="py-24 bg-white border-y border-slate-200">
                <div className="container px-6 mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight mb-6">Compliance & Certifications</h2>
                            <p className="text-slate-500 leading-relaxed mb-8">
                                Regulayer is built to satisfy the most stringent international compliance requirements.
                                We continuously monitor our controls and undergo independent third-party audits.
                            </p>

                            <ul className="space-y-6">
                                {[
                                    { title: "SOC 2 Type II", status: "Audited Annually" },
                                    { title: "GDPR Compliant", status: "DPA Available" },
                                    { title: "EU AI Act Conformity", status: "Automated Assessments" },
                                    { title: "HIPAA Capable", status: "BAA Available on Enterprise" }
                                ].map((cert, i) => (
                                    <li key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/50 border border-slate-200">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <FileCheck className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-700">{cert.title}</h4>
                                            <span className="text-sm text-slate-500">{cert.status}</span>
                                        </div>
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent blur-3xl opacity-50" />
                            <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-8 relative z-10 shadow-2xl">
                                <h3 className="text-xl font-bold mb-4">Request Compliance Reports</h3>
                                <p className="text-sm text-slate-500 mb-6">
                                    Enterprise customers and prospects under NDA can request access to our latest SOC 2 Type II report and penetration test results.
                                </p>
                                <button className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all bg-white hover:bg-slate-200 text-slate-900 shadow-xl">
                                    Request Access
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
