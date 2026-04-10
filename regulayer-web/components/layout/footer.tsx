"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { RegulayerLogo } from "@/components/ui/regulayer-logo";

const footerLinks = {
    Product: [
        { label: "Features", href: "/#features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Integrations", href: "/integrations" },
        { label: "System Status", href: "/status" },
    ],
    Resources: [
        { label: "Documentation", href: "/docs" },
        { label: "API Reference", href: "/docs/api" },
        { label: "Governance Docs", href: "/docs/governance" },
        { label: "Open Source", href: "https://github.com/regulayer" },
    ],
    Company: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Contact Sales", href: "/contact" },
    ],
    "Trust & Legal": [
        { label: "Trust Center", href: "/trust" },
        { label: "Security", href: "/security" },
        { label: "Business Continuity", href: "/trust/continuity" },
        { label: "Terms of Service", href: "/legal/terms" },
        { label: "Privacy Policy", href: "/legal/privacy" },
        { label: "Cookie Policy", href: "/legal/cookies" },
        { label: "DPA", href: "/legal/dpa" },
    ],
};

export function Footer() {

    return (
        <footer className="relative overflow-x-clip">
            {/* Fully transparent to use global shading */}
            <div className="relative">
                {/* Central glow */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 100%, hsla(15,85%,80%,0.15) 0%, transparent 70%)" }} />

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-4">
                    {/* Links */}
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-16">
                        <div className="max-w-xs">
                            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
                                <RegulayerLogo className="w-7 h-7 transition-transform duration-300 group-hover:scale-105" color="hsl(15,85%,58%)" />
                                <span className="text-[19px] font-bold tracking-[-0.04em] text-[hsl(15,45%,15%)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>Regulayer</span>
                            </Link>
                            <p className="text-base leading-relaxed tracking-wide mt-2 font-medium" style={{ color: "hsl(15,30%,40%)" }}>
                                Enterprise AI Compliance & Governance. <br />
                                Human-in-the-Loop oversight for every inference.
                            </p>
                        </div>

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
                            {Object.entries(footerLinks).map(([section, links]) => (
                                <div key={section}>
                                    <h4 className="text-sm font-semibold mb-4" style={{ color: "hsl(20,35%,15%)" }}>{section}</h4>
                                    <ul className="space-y-3">
                                        {links.map(l => (
                                            <li key={l.href}>
                                                <Link href={l.href} className="text-sm transition-colors duration-300" style={{ color: "hsl(20,12%,50%)" }}>{l.label}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Massive brand text */}
                    <div className="w-full flex justify-center mt-8 lg:mt-12 pointer-events-none relative z-0 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "50px" }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="text-[clamp(3rem,8vw,8rem)] font-light tracking-[0.2em] select-none overflow-hidden block uppercase" 
                            style={{ 
                                fontFamily: "var(--font-footer-display)",
                                color: "transparent",
                                WebkitTextStroke: "1px hsl(15,20%,80%)",
                                lineHeight: 1.2,
                                marginBottom: "-1rem",
                                opacity: 0.7
                            }}>
                            Regulayer
                        </motion.div>
                    </div>

                    {/* Bottom */}
                    <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid hsla(28,22%,80%,0.3)" }}>
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(15,40%,45%)" }}>
                            <span>© {new Date().getFullYear()} Regulayer Inc.</span>
                            <Link href="/status" className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" />
                                All systems operational
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <motion.a href="https://github.com/regulayer" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.15, y: -2 }}
                                className="transition-colors duration-300 p-1 hover:text-orange-500" style={{ color: "hsl(15,30%,45%)" }}>
                                <Github className="w-4 h-4" />
                            </motion.a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
