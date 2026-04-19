"use client";

import React, { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AlertTriangle, ArrowRight, Calculator, Shield } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const violationTypes = [
  { id: "prohibited", label: "Prohibited AI Practice (Article 5)", description: "Social scoring, subliminal manipulation, real-time biometric ID in public", maxFine: 35_000_000, revenuePercent: 7 },
  { id: "high-risk", label: "High-Risk System Non-Compliance (Article 6-49)", description: "Deploying without conformity assessment, missing HITL, no audit trail", maxFine: 15_000_000, revenuePercent: 3 },
  { id: "transparency", label: "Transparency Violation (Article 50-52)", description: "Failing to disclose AI-generated content, deepfake non-labeling", maxFine: 7_500_000, revenuePercent: 1 },
  { id: "data-quality", label: "Data Governance Failure (Article 10)", description: "Biased training data, inadequate data management practices", maxFine: 15_000_000, revenuePercent: 3 },
  { id: "record-keeping", label: "Record-Keeping Failure (Article 12)", description: "No automatic logging, missing audit trail, tampered records", maxFine: 15_000_000, revenuePercent: 3 },
  { id: "false-info", label: "Providing False Information to Authorities", description: "Misleading notified bodies or market surveillance authorities", maxFine: 7_500_000, revenuePercent: 1 },
];

const companyTypes = [
  { id: "startup", label: "Startup (<€2M revenue)", revenue: 2_000_000 },
  { id: "scaleup", label: "Scale-up (€2M-€50M)", revenue: 25_000_000 },
  { id: "mid", label: "Mid-Market (€50M-€500M)", revenue: 250_000_000 },
  { id: "enterprise", label: "Enterprise (€500M-€5B)", revenue: 2_500_000_000 },
  { id: "mega", label: "Global Enterprise (€5B+)", revenue: 10_000_000_000 },
  { id: "custom", label: "Enter custom revenue", revenue: 0 },
];

export default function PenaltyCalculatorPage() {
  const [selectedViolation, setSelectedViolation] = useState(violationTypes[0].id);
  const [selectedCompany, setSelectedCompany] = useState(companyTypes[0].id);
  const [customRevenue, setCustomRevenue] = useState("");
  const [aiSystems, setAiSystems] = useState("1");
  const [affectedUsers, setAffectedUsers] = useState("1000");

  const violation = violationTypes.find(v => v.id === selectedViolation)!;
  const company = companyTypes.find(c => c.id === selectedCompany)!;

  const result = useMemo(() => {
    const revenue = selectedCompany === "custom" ? parseFloat(customRevenue) || 0 : company.revenue;
    const revenuePenalty = revenue * (violation.revenuePercent / 100);
    const maxPenalty = Math.max(revenuePenalty, violation.maxFine);
    const systemMultiplier = Math.min(parseInt(aiSystems) || 1, 50);
    const userMultiplier = parseInt(affectedUsers) || 1000;

    // Aggravation factors
    let severity = "Standard";
    let severityColor = "hsl(35,85%,50%)";
    if (userMultiplier > 100000 && systemMultiplier > 5) { severity = "Critical"; severityColor = "hsl(0,70%,50%)"; }
    else if (userMultiplier > 10000 || systemMultiplier > 3) { severity = "High"; severityColor = "hsl(15,85%,58%)"; }

    return { revenue, revenuePenalty, maxPenalty, severity, severityColor, systemMultiplier };
  }, [selectedViolation, selectedCompany, customRevenue, aiSystems, affectedUsers, violation, company]);

  const formatCurrency = (n: number) => {
    if (n >= 1_000_000_000) return `€${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `€${(n / 1_000).toFixed(0)}K`;
    return `€${n.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-[hsl(30,60%,99%)] text-[hsl(15,45%,15%)] antialiased">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-12 lg:pt-44 lg:pb-16 border-b border-[hsl(15,30%,85%)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(hsl(15,45%,15%) 1px, transparent 1px), linear-gradient(90deg, hsl(15,45%,15%) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-4xl mx-auto px-6 lg:px-10 relative z-10">
          <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,30%,45%)] uppercase mb-6 block">Free Interactive Tool</span>
          <h1 className="text-[clamp(2.2rem,4.5vw,3.5rem)] font-bold tracking-tight leading-[1.05] mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            EU AI Act penalty<br/>
            <span className="premium-serif-italic font-light text-[hsl(15,85%,58%)]">calculator.</span>
          </h1>
          <p className="text-[18px] text-[hsl(15,25%,45%)] leading-relaxed max-w-2xl font-light">
            Estimate your organization&apos;s maximum fine under EU AI Act Article 71. Based on your revenue, AI system classification, and violation type.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-5 gap-8">

            {/* Inputs */}
            <div className="lg:col-span-3 space-y-8">

              {/* Violation Type */}
              <div>
                <label className="text-[11px] font-mono text-[hsl(15,30%,50%)] uppercase tracking-wider block mb-3 font-bold">1. Violation Type</label>
                <div className="space-y-2">
                  {violationTypes.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedViolation(v.id)}
                      className={`w-full text-left p-4 border transition-all ${selectedViolation === v.id
                        ? "border-[hsl(15,85%,58%)] bg-[hsl(15,85%,58%,0.05)]"
                        : "border-[hsl(15,30%,85%)] bg-white hover:border-[hsl(15,30%,75%)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-bold">{v.label}</span>
                        <span className="text-[11px] font-mono text-red-600">Up to {v.revenuePercent}% or €{v.maxFine / 1_000_000}M</span>
                      </div>
                      <p className="text-[12px] text-[hsl(15,30%,50%)] mt-1">{v.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Size */}
              <div>
                <label className="text-[11px] font-mono text-[hsl(15,30%,50%)] uppercase tracking-wider block mb-3 font-bold">2. Organization Size</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {companyTypes.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCompany(c.id)}
                      className={`p-3 text-center border transition-all text-[13px] ${selectedCompany === c.id
                        ? "border-[hsl(15,85%,58%)] bg-[hsl(15,85%,58%,0.05)] font-bold"
                        : "border-[hsl(15,30%,85%)] bg-white hover:border-[hsl(15,30%,75%)]"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                {selectedCompany === "custom" && (
                  <input
                    type="number"
                    placeholder="Enter annual revenue in EUR"
                    value={customRevenue}
                    onChange={e => setCustomRevenue(e.target.value)}
                    className="mt-3 w-full border border-[hsl(15,30%,85%)] bg-white p-3 text-[14px] focus:border-[hsl(15,85%,58%)] outline-none"
                  />
                )}
              </div>

              {/* AI Systems */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-mono text-[hsl(15,30%,50%)] uppercase tracking-wider block mb-3 font-bold">3. Number of AI Systems</label>
                  <input
                    type="number" min="1" max="999"
                    value={aiSystems}
                    onChange={e => setAiSystems(e.target.value)}
                    className="w-full border border-[hsl(15,30%,85%)] bg-white p-3 text-[14px] focus:border-[hsl(15,85%,58%)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[hsl(15,30%,50%)] uppercase tracking-wider block mb-3 font-bold">4. Affected Users</label>
                  <input
                    type="number" min="1"
                    value={affectedUsers}
                    onChange={e => setAffectedUsers(e.target.value)}
                    className="w-full border border-[hsl(15,30%,85%)] bg-white p-3 text-[14px] focus:border-[hsl(15,85%,58%)] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Result Card */}
            <div className="lg:col-span-2">
              <motion.div
                key={`${selectedViolation}-${selectedCompany}-${customRevenue}-${aiSystems}-${affectedUsers}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="sticky top-24 border-2 border-[hsl(15,45%,15%)] bg-[hsl(15,45%,15%)] text-white p-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Calculator className="w-5 h-5 text-[hsl(15,85%,70%)]" />
                  <span className="text-[11px] font-mono text-[hsl(15,85%,70%)] uppercase tracking-wider font-bold">Estimated Maximum Penalty</span>
                </div>

                <div className="text-[48px] font-bold tracking-tight leading-none mb-2" style={{ fontFamily: "var(--font-space-grotesk)", color: "hsl(15,85%,65%)" }}>
                  {formatCurrency(result.maxPenalty)}
                </div>
                <p className="text-[13px] text-white/50 mb-8">Maximum fine under EU AI Act Article 71</p>

                <div className="space-y-4 border-t border-white/10 pt-6">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-white/60">Revenue-based ({violation.revenuePercent}%)</span>
                    <span className="font-bold">{formatCurrency(result.revenuePenalty)}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-white/60">Fixed maximum</span>
                    <span className="font-bold">{formatCurrency(violation.maxFine)}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-white/60">Applied (whichever is higher)</span>
                    <span className="font-bold text-[hsl(15,85%,70%)]">{formatCurrency(result.maxPenalty)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] border-t border-white/10 pt-4">
                    <span className="text-white/60">Risk severity</span>
                    <span className="font-bold px-2 py-0.5 text-[11px]" style={{ background: result.severityColor, color: "white" }}>{result.severity}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-[12px] text-white/40 mb-4">Avoid this penalty entirely with automated compliance:</p>
                  <Link href="/signup" className="flex items-center justify-center gap-2 w-full py-3 bg-[hsl(15,85%,58%)] text-white text-[13px] font-bold hover:bg-[hsl(15,85%,50%)] transition-colors">
                    Deploy Regulayer Free <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Context: GDPR vs AI Act */}
      <section className="py-16 border-t border-[hsl(15,30%,85%)]">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <h2 className="text-[24px] font-bold tracking-tight mb-8" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            EU AI Act penalties compared to GDPR
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-[hsl(15,30%,85%)]">
                  <th className="text-left py-3 px-4 text-[12px] font-mono text-[hsl(15,30%,50%)] uppercase">Regulation</th>
                  <th className="text-left py-3 px-4 text-[12px] font-mono text-[hsl(15,30%,50%)] uppercase">Maximum Fixed Fine</th>
                  <th className="text-left py-3 px-4 text-[12px] font-mono text-[hsl(15,30%,50%)] uppercase">Revenue %</th>
                  <th className="text-left py-3 px-4 text-[12px] font-mono text-[hsl(15,30%,50%)] uppercase">Enforcement</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[hsl(15,30%,90%)]">
                  <td className="py-3 px-4 text-[14px] font-bold text-red-600">EU AI Act (Prohibited)</td>
                  <td className="py-3 px-4 text-[14px] font-bold">€35,000,000</td>
                  <td className="py-3 px-4 text-[14px]">7%</td>
                  <td className="py-3 px-4 text-[14px]">August 2026</td>
                </tr>
                <tr className="border-b border-[hsl(15,30%,90%)]">
                  <td className="py-3 px-4 text-[14px] font-bold text-orange-600">EU AI Act (High-Risk)</td>
                  <td className="py-3 px-4 text-[14px] font-bold">€15,000,000</td>
                  <td className="py-3 px-4 text-[14px]">3%</td>
                  <td className="py-3 px-4 text-[14px]">August 2026</td>
                </tr>
                <tr className="border-b border-[hsl(15,30%,90%)]">
                  <td className="py-3 px-4 text-[14px] font-bold text-blue-600">GDPR (Maximum)</td>
                  <td className="py-3 px-4 text-[14px] font-bold">€20,000,000</td>
                  <td className="py-3 px-4 text-[14px]">4%</td>
                  <td className="py-3 px-4 text-[14px]">Active since 2018</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[14px] text-[hsl(15,25%,45%)] mt-6 leading-[1.8]">
            The EU AI Act&apos;s highest penalty tier (€35M / 7%) <strong>exceeds GDPR&apos;s maximum penalty</strong> by 75%. Unlike GDPR, the AI Act applies to any organization deploying AI systems that affect EU citizens — regardless of where the organization is headquartered. This creates global extraterritorial enforcement jurisdiction, meaning US, UK, Indian, and Singaporean companies serving EU customers are equally liable.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[hsl(15,45%,15%)] text-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <Shield className="w-12 h-12 text-[hsl(15,85%,65%)] mx-auto mb-4" />
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Don&apos;t wait for the fine.
          </h2>
          <p className="text-[16px] text-white/70 mb-8">Deploy Regulayer today and automate full EU AI Act compliance before the August 2026 deadline.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[hsl(15,85%,58%)] text-white text-sm font-bold hover:bg-[hsl(15,85%,50%)] transition-colors">
              Start Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/eu-ai-act-compliance-checklist" className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/20 text-sm font-bold hover:bg-white/10 transition-colors">
              View Full Checklist
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
