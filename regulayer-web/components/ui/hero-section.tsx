"use client";
import React from "react";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlazedCard } from "@/components/ui/glazed-card";
import { IconShieldCheck, IconLock, IconBolt } from "@tabler/icons-react";
import Link from "next/link";

export function HeroSection() {
    return (
        <AuroraBackground className="min-h-screen">
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
                    </span>
                    <span className="text-xs font-medium text-amber-100 uppercase tracking-wider">v2.4 Now Live</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 max-w-4xl mx-auto leading-tight"
                >
                    The Trust Layer for the <br />
                    <span className="text-amber-400">AI Age</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-6 text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto"
                >
                    Regulayer provides the cryptographic proof and governance infrastructure needed to deploy AI agents with confidence. Verify everything.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link href="/signup">
                        <button className="px-8 py-3 rounded-full bg-brand-600 text-black font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-brand-600/20">
                            Start Building Trust
                        </button>
                    </Link>
                    <Link href="/docs">
                        <button className="px-8 py-3 rounded-full bg-neutral-800 text-slate-900 border border-neutral-700 hover:bg-neutral-700 transition-colors">
                            Read the Docs
                        </button>
                    </Link>
                </motion.div>

                {/* Trust Proof Visualization */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mt-20 w-full max-w-5xl"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <GlazedCard className="border-amber-500/20 bg-brand-600/5">
                            <IconShieldCheck className="w-10 h-10 text-amber-500 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Cryptographic Proof</h3>
                            <p className="text-sm text-neutral-400">Every decision recorded on an immutable ledger.</p>
                        </GlazedCard>
                        <GlazedCard className="border-cyan-500/20 bg-cyan-500/5">
                            <IconBolt className="w-10 h-10 text-cyan-500 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Real-time Guardrails</h3>
                            <p className="text-sm text-neutral-400">Enforce policy before models act.</p>
                        </GlazedCard>
                        <GlazedCard className="border-slate-400/20 bg-slate-500/5">
                            <IconLock className="w-10 h-10 text-slate-500 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Enterprise Security</h3>
                            <p className="text-sm text-neutral-400">SOC2 compliant infrastructure.</p>
                        </GlazedCard>
                    </div>
                </motion.div>
            </div>
        </AuroraBackground>
    );
}
