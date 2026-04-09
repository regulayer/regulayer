"use client";
import React from "react";
import { CopyCheck, FileBarChart, HardDrive, ShieldCheck, Scale } from "lucide-react";

export default function ReportsDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Compliance & Audit Reports</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        Regulayer provides one-click generation of PDF, CSV, and secure JSON reports designed specifically for external auditors, legal discovery (E-Discovery), and executive risk committees.
      </p>

      <h2 className="text-2xl font-semibold mb-6">Available Artifacts</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white/50 border border-slate-200 rounded-xl p-6 hover:bg-white transition-colors">
          <div className="w-12 h-12 bg-slate-700/10 rounded-lg flex items-center justify-center mb-4">
            <CopyCheck className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Chain Integrity Proofs</h3>
          <p className="text-sm text-slate-500 mb-3 leading-relaxed">
            A detailed JSON export containing the signed hash chain for a given time period or specific decision UUID.
          </p>
          <p className="text-xs text-slate-500">
            <strong>Use Case:</strong> Proving to regulators or opposing counsel that an AI log file was not altered, deleted, or fabricated retroactively.
          </p>
        </div>

        <div className="bg-white/50 border border-slate-200 rounded-xl p-6 hover:bg-white transition-colors">
          <div className="w-12 h-12 bg-brand-600/10 rounded-lg flex items-center justify-center mb-4">
            <FileBarChart className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Incident & Policy Summaries</h3>
          <p className="text-sm text-slate-500 mb-3 leading-relaxed">
            Aggregate PDF reports detailing all flagged decisions over a quarter, broken down by policy violation type, AI system, and risk level.
          </p>
          <p className="text-xs text-slate-500">
            <strong>Use Case:</strong> Board presentations, quarterly risk reviews, and identifying problematic AI models driving up compliance costs.
          </p>
        </div>

        <div className="bg-white/50 border border-slate-200 rounded-xl p-6 hover:bg-white transition-colors">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Governance Audit Ledger</h3>
          <p className="text-sm text-slate-500 mb-3 leading-relaxed">
            A CSV/PDF export tracking human actions in the dashboard. Shows exactly which compliance officer logged in, viewed a flagged decision, and marked it Approved/Rejected.
          </p>
          <p className="text-xs text-slate-500">
            <strong>Use Case:</strong> Fulfilling SOC 2 access and monitoring controls; proving the "Human-in-the-Loop" workflow is actively utilized.
          </p>
        </div>

        <div className="bg-white/50 border border-slate-200 rounded-xl p-6 hover:bg-white transition-colors">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
            <HardDrive className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Full Payload Bulk Export</h3>
          <p className="text-sm text-slate-500 mb-3 leading-relaxed">
            Export the raw inputs, outputs, and metadata for every recorded decision within a specific date range as flat JSON files or Parquet.
          </p>
          <p className="text-xs text-slate-500">
            <strong>Use Case:</strong> Ingesting historical production traffic into Snowflake/Databricks for custom analytics or retraining internal foundation models.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 pt-6 border-t border-slate-200">
        <Scale className="text-amber-400" />
        Legal Defensibility
      </h2>
      <p className="text-slate-600 leading-relaxed">
        Regulayer reports are designed specifically with legal defensibility in mind. Because every artifact ties back to the immutable hash chain, the records adhere to the highest standards of digital evidence. If your AI system is subpoenaed for generating unauthorized financial advice or biased hiring decisions, Regulayer provides undeniable proof of the model's exact behavior at the time of the incident.
      </p>
    </div>
  );
}
