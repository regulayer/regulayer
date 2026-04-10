"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const integrations = [
    { name: "OpenAI", protocol: "REST API", desc: "GPT-4, GPT-4o, o1 and all chat/completion models." },
    { name: "Anthropic", protocol: "REST API", desc: "Claude 3.5 Sonnet, Claude 3 Opus, and Haiku models." },
    { name: "Google AI", protocol: "REST API", desc: "Gemini Pro, Gemini Ultra, and PaLM models." },
    { name: "AWS Bedrock", protocol: "SDK Hook", desc: "All foundation models via the Bedrock runtime." },
    { name: "Azure OpenAI", protocol: "SDK Hook", desc: "Microsoft-hosted OpenAI deployments." },
    { name: "LangChain", protocol: "Callback", desc: "Native callback handler for all chain types." },
    { name: "LlamaIndex", protocol: "Callback", desc: "Instrumentation module for query engines." },
    { name: "Hugging Face", protocol: "REST API", desc: "Inference API and Inference Endpoints." },
];

export default function IntegrationsPage() {
    return (
        <div className="min-h-screen bg-[hsl(30,60%,99%)]">
            <Navbar />
            <main className="pt-40 pb-32">
                <div className="max-w-5xl mx-auto px-6 lg:px-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl mb-16">
                        <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[hsl(15,30%,55%)] block mb-8">
                            Integrations
                        </span>
                        <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-[-0.04em] text-[hsl(15,45%,15%)] leading-[0.9] mb-8" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                            Works with your<br/>
                            <span className="premium-serif-italic font-light text-[hsl(15,85%,58%)]">entire stack.</span>
                        </h1>
                        <p className="text-[18px] text-[hsl(15,30%,45%)] leading-[1.7] font-light">
                            Regulayer deploys as a transparent proxy gateway in front of your AI providers. Integrate with any LLM
                            using a single proxy configuration — governance and compliance applied automatically.
                        </p>
                    </motion.div>

                    {/* Integration Directory */}
                    <div className="border-t border-[hsl(15,30%,88%)]">
                        {integrations.map((item, i) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 + i * 0.05, duration: 0.6 }}
                                className="flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-[hsl(15,30%,90%)] gap-3"
                            >
                                <div className="flex items-baseline gap-4">
                                    <span className="text-[18px] font-bold text-[hsl(15,45%,15%)] tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                                        {item.name}
                                    </span>
                                    <span className="text-[11px] font-mono tracking-wider text-[hsl(15,30%,60%)] uppercase">
                                        {item.protocol}
                                    </span>
                                </div>
                                <p className="text-[13px] text-[hsl(15,30%,50%)] font-light md:text-right max-w-sm">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6"
                    >
                        <p className="text-[14px] text-[hsl(15,30%,50%)]">
                            Don't see your provider? Regulayer works with any HTTP-based LLM endpoint.
                        </p>
                        <Link href="/docs" className="inline-flex items-center gap-2 text-[13px] font-bold text-[hsl(15,45%,15%)] hover:text-[hsl(15,85%,58%)] transition-colors whitespace-nowrap">
                            Read the integration docs <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
