"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const plans = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "For exploration and proof-of-concept.",
        features: [
            "1,000 decisions/month",
            "1 project",
            "7-day retention",
            "Community support",
            "Basic dashboard",
        ],
        cta: "Get Started",
        href: "/signup",
        highlight: false,
    },
    {
        name: "Pro",
        price: "$49",
        period: "/month",
        description: "For teams shipping AI to production.",
        features: [
            "100,000 decisions/month",
            "Unlimited projects",
            "1-year retention",
            "Priority support",
            "Advanced analytics",
            "Webhook integrations",
            "Compliance exports",
            "Team management",
        ],
        cta: "Start Free Trial",
        href: "/signup?plan=pro",
        highlight: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        description: "For organizations with regulatory requirements.",
        features: [
            "Unlimited decisions",
            "Unlimited projects",
            "Unlimited retention",
            "Dedicated support engineer",
            "SOC 2 attestation letters",
            "Custom SLAs (99.99%)",
            "On-premise deployment",
            "SSO & RBAC",
            "Audit API access",
        ],
        cta: "Contact Sales",
        href: "mailto:sales@regulayer.com",
        highlight: false,
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <section className="pt-32 pb-24 md:pb-32">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <p className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-3">
                            Pricing
                        </p>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                            Simple, transparent pricing
                        </h1>
                        <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                            Start free. Scale when you&apos;re ready. No hidden fees, no surprises.
                        </p>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative rounded-2xl border p-8 flex flex-col transition-all ${plan.highlight
                                        ? "border-indigo-500/40 bg-indigo-500/[0.03] shadow-2xl shadow-indigo-500/10"
                                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                                    }`}
                            >
                                {/* Popular Badge */}
                                {plan.highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-xs font-medium text-white">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                                    <p className="text-sm text-zinc-500">{plan.description}</p>
                                </div>

                                <div className="mb-8">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-sm text-zinc-500 ml-1">{plan.period}</span>
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-sm">
                                            <svg className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                            <span className="text-zinc-400">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={plan.href}
                                    className={`w-full text-center py-3 rounded-xl text-sm font-medium transition-all ${plan.highlight
                                            ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/25"
                                            : "border border-white/[0.1] text-zinc-300 hover:bg-white/[0.04] hover:border-white/[0.2]"
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* FAQ */}
                    <div className="max-w-2xl mx-auto mt-24">
                        <h2 className="text-2xl font-bold text-white text-center mb-10">Frequently asked questions</h2>
                        <div className="space-y-6">
                            {[
                                {
                                    q: "What counts as a decision?",
                                    a: "A decision is any AI action you record via our SDK — an inference call, a policy evaluation, a model selection, etc. Each record call counts as one decision.",
                                },
                                {
                                    q: "Can I switch plans anytime?",
                                    a: "Yes. Upgrade or downgrade anytime. When upgrading, you get immediate access. When downgrading, the change takes effect at the end of your billing cycle.",
                                },
                                {
                                    q: "Do you offer a free trial for Pro?",
                                    a: "Yes, every Pro plan starts with a 14-day free trial. No credit card required.",
                                },
                                {
                                    q: "What happens if I exceed my plan limits?",
                                    a: "We'll notify you before you hit the limit. Excess decisions are queued and recorded once you upgrade. We never drop data.",
                                },
                            ].map((faq) => (
                                <div key={faq.q} className="border-b border-white/[0.06] pb-6">
                                    <h3 className="text-base font-medium text-white mb-2">{faq.q}</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
