"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Send, Mail, Clock } from "lucide-react";

function useReveal(t = 0.1) {
    const ref = useRef<HTMLDivElement>(null);
    const [v, setV] = useState(false);
    useEffect(() => { const el = ref.current; if (!el) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: t }); o.observe(el); return () => o.disconnect(); }, [t]);
    return { ref, v };
}

export default function ContactPage() {
    const hero = useReveal();
    const form = useReveal();
    const [data, setData] = useState({ name: "", email: "", company: "", message: "", type: "general" });
    const [sent, setSent] = useState(false);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSent(true); };

    const inputCls = "w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-200";

    return (
        <div className="min-h-screen bg-background text-foreground antialiased">
            <Navbar />

            <section ref={hero.ref} className="pt-36 pb-10 lg:pt-44 lg:pb-14 relative">
                <div className="absolute inset-0 aurora-bg opacity-20" />
                <div className={`container relative z-10 text-center transition-all duration-500 ${hero.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                    <p className="text-xs font-display font-semibold text-primary uppercase tracking-[0.2em] mb-4">Contact</p>
                    <h1 className="font-display text-display mb-4">Talk to the <span className="gradient-text">team</span></h1>
                    <p className="text-base text-muted-foreground max-w-sm mx-auto">Engineering questions, enterprise deployments, or custom integrations.</p>
                </div>
            </section>

            <section ref={form.ref} className="pb-20 lg:pb-28">
                <div className={`container max-w-3xl transition-all duration-500 ${form.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                    <div className="grid lg:grid-cols-[220px_1fr] gap-8">
                        <div className="space-y-4">
                            <div className="glass rounded-xl p-5 hover-lift">
                                <Mail className="w-4 h-4 text-primary mb-3" />
                                <h3 className="text-sm font-display font-semibold text-foreground mb-1">Email</h3>
                                <a href="mailto:hello@regulayer.com" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200">hello@regulayer.com</a>
                            </div>
                            <div className="glass rounded-xl p-5 hover-lift">
                                <Clock className="w-4 h-4 text-primary mb-3" />
                                <h3 className="text-sm font-display font-semibold text-foreground mb-1">Response time</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">Under 24 hours. Enterprise inquiries are prioritized.</p>
                            </div>
                        </div>

                        <div className="glass rounded-2xl p-6">
                            {sent ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                        <Send className="w-4 h-4 text-primary" />
                                    </div>
                                    <h3 className="font-display text-base font-semibold text-foreground mb-1">Message sent</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs">We&apos;ll review your inquiry and respond within 24 hours.</p>
                                    <button onClick={() => setSent(false)} className="mt-4 text-xs text-muted-foreground hover:text-primary transition-colors duration-200">Send another</button>
                                </div>
                            ) : (
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {["General", "Enterprise", "Engineering", "Support"].map(t => (
                                            <button key={t} type="button" onClick={() => setData(d => ({ ...d, type: t.toLowerCase() }))}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all duration-200 ${data.type === t.toLowerCase() ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-display font-medium text-foreground">Name</label>
                                            <input type="text" required placeholder="Jane Mitchell" value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} className={inputCls} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-display font-medium text-foreground">Email</label>
                                            <input type="email" required placeholder="jane@company.com" value={data.email} onChange={e => setData(d => ({ ...d, email: e.target.value }))} className={inputCls} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-display font-medium text-foreground">Company</label>
                                        <input type="text" placeholder="Acme Corp" value={data.company} onChange={e => setData(d => ({ ...d, company: e.target.value }))} className={inputCls} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-display font-medium text-foreground">Message</label>
                                        <textarea required rows={4} placeholder="Describe your requirements..." value={data.message} onChange={e => setData(d => ({ ...d, message: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-200 resize-none" />
                                    </div>
                                    <Button type="submit" className="w-full rounded-xl font-display shadow-glow-sm">
                                        Send Message <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
