"use client";

import React, { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

function useReveal(t = 0.1) {
    const ref = useRef<HTMLDivElement>(null);
    const [v, setV] = useState(false);
    useEffect(() => { const el = ref.current; if (!el) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: t }); o.observe(el); return () => o.disconnect(); }, [t]);
    return { ref, v };
}

const plans = [
    { name: "Free", price: "$0", period: "/mo", desc: "For prototyping and small teams", features: ["1,000 decisions/mo", "Up to 2 team members", "7-day retention", "1 project", "Community support"], cta: "Get Started", highlight: false },
    { name: "Pro", price: "$99", period: "/mo", desc: "For compliance teams shipping to production", features: ["50,000 decisions/mo", "Up to 20 team members", "1-year retention", "Unlimited projects", "RBAC & SSO", "HITL Governance Queue", "Conformity Assessments"], cta: "Get Pro", highlight: true },
    { name: "Enterprise", price: "Custom", period: "", desc: "For regulated enterprises at scale", features: ["Unlimited decisions", "Unlimited team members", "Unlimited retention", "Dedicated infrastructure", "Automated FRIA Generation", "On-premise deployment", "Dedicated CSM", "SOC 2 Type II BAA"], cta: "Contact Sales", highlight: false },
];

export default function PricingPage() {
    const hero = useReveal();
    const cards = useReveal();

    return (
        <div className="min-h-screen bg-background text-foreground antialiased">
            <Navbar />

            <section ref={hero.ref} className="pt-36 pb-12 lg:pt-44 lg:pb-16 relative overflow-hidden">
                <div className="absolute inset-0 aurora-bg opacity-30" />
                {/* Warm ambient light */}
                <div className="warm-ray-top" />
                <div className="orb-amber" style={{ top: '10%', right: '20%', width: '300px', height: '300px' }} />
                <div className="orb-silver" style={{ bottom: '0', left: '15%', width: '250px', height: '250px' }} />
                <div className="cool-ray-left" />
                <div className={`container relative z-10 text-center transition-all duration-500 ${hero.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                    <p className="text-xs font-display font-semibold text-primary uppercase tracking-[0.2em] mb-4">Pricing</p>
                    <h1 className="font-display text-display max-w-md mx-auto mb-4">
                        Simple, <span className="gradient-text">transparent</span>
                    </h1>
                    <p className="text-base text-muted-foreground max-w-sm mx-auto">No hidden fees. Scale when you&apos;re ready.</p>
                </div>
            </section>

            <section ref={cards.ref} className="pb-20 lg:pb-28">
                <div className={`container max-w-4xl transition-all duration-500 ${cards.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                    <div className="grid md:grid-cols-3 gap-5">
                        {plans.map((p, i) => (
                            <div key={i} className={`rounded-2xl p-6 ${p.highlight ? "glass-strong glow-border" : "glass"} hover-lift flex flex-col`}>
                                <h3 className="font-display text-base font-semibold text-foreground">{p.name}</h3>
                                <p className="text-xs text-muted-foreground mb-4">{p.desc}</p>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="font-display text-3xl font-bold text-foreground">{p.price}</span>
                                    <span className="text-xs text-muted-foreground">{p.period}</span>
                                </div>
                                <ul className="space-y-2.5 mb-6 flex-1">
                                    {p.features.map((f, j) => (
                                        <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                                            <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={i === 2 ? "/contact" : "/signup"}>
                                    <Button variant={p.highlight ? "default" : "outline"} className={`w-full rounded-xl font-display ${p.highlight ? "shadow-glow-sm" : ""}`}>
                                        {p.cta} {p.highlight && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 glass rounded-2xl p-6 text-center">
                        <h3 className="font-display text-base font-semibold text-foreground mb-1">Need a custom plan?</h3>
                        <p className="text-sm text-muted-foreground mb-4">Dedicated infrastructure, on-premise deployment, and custom compliance templates.</p>
                        <Link href="/contact">
                            <Button variant="outline" className="rounded-xl font-display">Talk to Sales <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
