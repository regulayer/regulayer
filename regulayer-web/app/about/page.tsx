"use client";

import React, { useRef, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TrustNetwork } from "@/components/ui/trust-network";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

function useReveal(t = 0.1) {
    const ref = useRef<HTMLDivElement>(null);
    const [v, setV] = useState(false);
    useEffect(() => { const el = ref.current; if (!el) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: t }); o.observe(el); return () => o.disconnect(); }, [t]);
    return { ref, v };
}

export default function AboutPage() {
    const hero = useReveal();
    const story = useReveal();
    const principles = useReveal();
    const cta = useReveal();

    return (
        <div className="min-h-screen bg-background text-foreground antialiased">
            <Navbar />

            {/* Hero */}
            <section ref={hero.ref} className="pt-36 pb-16 lg:pt-44 lg:pb-20 relative overflow-hidden">
                <div className="absolute inset-0 aurora-bg" />
                <div className="absolute inset-0 opacity-30">
                    <TrustNetwork nodeCount={25} interactive={false} />
                </div>
                <div className={`container relative z-10 max-w-3xl transition-all duration-500 ${hero.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                    <p className="text-xs font-display font-semibold text-primary uppercase tracking-[0.2em] mb-4">About</p>
                    <h1 className="font-display text-display mb-6 max-w-2xl">
                        Enterprise AI <span className="gradient-text">Governance Infrastructure</span>.
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                        Regulayer provides the compliance infrastructure layer that regulated enterprises need to deploy AI responsibly — with Human-in-the-Loop governance, automated conformity assessments, and immutable audit trails.
                    </p>
                </div>
            </section>

            {/* Story */}
            <section ref={story.ref} className="py-20 lg:py-28 dot-grid">
                <div className={`container max-w-3xl transition-all duration-500 ${story.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                    <div className="grid md:grid-cols-2 gap-14">
                        <div>
                            <h2 className="font-display text-headline mb-4">The challenge</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                AI systems make millions of consequential decisions daily — credit approvals, diagnostic triage, hiring assessments, content moderation. But the regulatory landscape is tightening fast. The EU AI Act mandates documented governance, fundamental rights assessments, and human oversight for high-risk applications.
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Most organizations lack the infrastructure to comply. When auditors request conformity documentation, teams scramble with spreadsheets. Governance remains manual, reactive, and fragmented.
                            </p>
                        </div>
                        <div>
                            <h2 className="font-display text-headline mb-4">Our approach</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                Regulayer is a purpose-built compliance gateway that sits transparently in your AI inference path. Every model request is intercepted, evaluated against organizational policy, and routed through Human-in-the-Loop governance queues when necessary.
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Automated Conformity Assessments, Fundamental Rights Impact Assessments (FRIA), and cryptographically sealed audit trails are generated continuously — not after the fact. <span className="text-foreground font-medium">Compliance by construction.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Principles */}
            <section ref={principles.ref} className="py-20 lg:py-28 relative">
                <div className="absolute inset-0 aurora-bg opacity-30" />
                <div className={`container relative z-10 max-w-3xl transition-all duration-500 ${principles.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                    <p className="text-xs font-display font-semibold text-primary uppercase tracking-[0.2em] mb-8">Engineering Principles</p>
                    <div className="space-y-6">
                        {[
                            { title: "Human oversight by default", desc: "Every high-risk AI decision can be routed to authorized compliance officers for manual review before reaching the end user." },
                            { title: "Regulatory-native design", desc: "EU AI Act articles, FRIA requirements, and conformity assessment criteria are mapped directly to system capabilities from day one." },
                            { title: "Zero-trust data residency", desc: "Every tenant gets isolated encryption keys, scoped RBAC policies, and dedicated project partitions with strict data sovereignty controls." },
                            { title: "Transparent integration", desc: "Deploy as a drop-in proxy for OpenAI, Anthropic, or any custom model endpoint. No code refactoring required." },
                        ].map((p, i) => (
                            <div key={i} className="glass rounded-xl p-6 hover-lift group">
                                <h3 className="font-display text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{p.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section ref={cta.ref} className="py-20 lg:py-28">
                <div className={`container max-w-xl text-center transition-all duration-500 ${cta.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                    <h2 className="font-display text-headline mb-4">
                        Want to <span className="gradient-text">build with us</span>?
                    </h2>
                    <p className="text-sm text-muted-foreground mb-8">
                        We&apos;re hiring engineers who care about accountability, cryptography, and shipping great infrastructure.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/contact">
                            <Button className="rounded-xl font-display shadow-glow-sm">
                                Get in Touch <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
