"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-[hsl(30,60%,99%)]">
            <Navbar />
            <main className="pt-40 pb-32">
                <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                        <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[hsl(15,30%,55%)] block mb-8">
                            Careers
                        </span>
                        <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-[-0.04em] text-[hsl(15,45%,15%)] leading-[0.9] mb-8" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                            Build the trust<br/>
                            <span className="premium-serif-italic font-light text-[hsl(15,85%,58%)]">infrastructure.</span>
                        </h1>
                        <p className="text-[18px] text-[hsl(15,30%,45%)] leading-[1.7] font-light max-w-lg mx-auto mb-12">
                            We're a small, deeply technical team building cryptographic
                            accountability for generative AI. No open roles right now,
                            but we're always looking for exceptional people.
                        </p>
                        <div className="w-full max-w-md mx-auto border border-[hsl(15,30%,88%)] rounded-none p-8 bg-white">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Mail className="w-4 h-4 text-[hsl(15,30%,55%)]" />
                                <p className="text-[13px] text-[hsl(15,30%,50%)]">Reach out with your work.</p>
                            </div>
                            <a href="mailto:careers@regulayer.com" className="inline-flex items-center gap-2 text-[13px] font-bold text-[hsl(15,45%,15%)] hover:text-[hsl(15,85%,58%)] transition-colors">
                                careers@regulayer.com <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
