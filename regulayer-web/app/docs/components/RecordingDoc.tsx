"use client";
import React from "react";
import { Link2, Lock, ShieldAlert, CheckCircle, Search } from "lucide-react";

export default function RecordingDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Cryptographic Recording</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        The absolute core of Regulayer is the Recorder module. When a generative AI decision is made in your application, Regulayer creates an immutable, cryptographically verifiable record of the event.
      </p>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
        <Link2 className="text-slate-500" />
        The Hash Chain Ledger
      </h2>
      <p className="text-slate-600 mb-4 leading-relaxed">
        We do not just store AI inputs and outputs in a database. We construct a cryptographic hash chain—a lightweight blockchain-style ledger specific to your organization. This approach guarantees <strong>tamper-evident auditing</strong>.
      </p>

      <div className="bg-white/50 border border-slate-200 rounded-xl p-8 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-700/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <h3 className="font-semibold text-slate-900 mb-4">How Hash Chaining Works</h3>
        <ol className="space-y-6 relative border-l border-slate-300 ml-4 py-2">
          <li className="pl-8 relative">
            <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-slate-100 border-2 border-slate-700" />
            <h4 className="text-slate-700 font-medium mb-1">Payload Serialization</h4>
            <p className="text-sm text-slate-500">The raw JSON input, output, and metadata are combined into a fixed, deterministic string representation.</p>
          </li>
          <li className="pl-8 relative">
            <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-slate-100 border-2 border-slate-700" />
            <h4 className="text-slate-700 font-medium mb-1">Concatenation with Prior Hash</h4>
            <p className="text-sm text-slate-500">The current payload is concatenated with the <code className="bg-slate-100 px-1 rounded text-emerald-400">record_hash</code> of the immediately preceding decision in your organization's ledger.</p>
          </li>
          <li className="pl-8 relative">
            <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-slate-100 border-2 border-slate-700" />
            <h4 className="text-slate-700 font-medium mb-1">SHA-256 Hashing</h4>
            <p className="text-sm text-slate-500">The concatenated string is run through the SHA-256 algorithm to produce the new <code className="bg-slate-100 px-1 rounded text-slate-500">record_hash</code>.</p>
          </li>
        </ol>
      </div>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
        <ShieldAlert className="text-slate-500" />
        Proving Tamper Resistance
      </h2>
      <p className="text-slate-600 mb-6 leading-relaxed">
        If a developer, rogue employee, or attacker attempts to alter a historical prompt or response directly in the Regulayer database (e.g., to cover up an AI failure), the tampering is instantly mathematically exposed.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="text-emerald-500 w-5 h-5" />
            <h4 className="font-semibold text-emerald-400">Valid State</h4>
          </div>
          <p className="text-sm text-emerald-200/70 mb-3">A third-party auditor downloads your dataset and recalculates the hash chain sequentially from Event #1 to Event #1,000,000.</p>
          <code className="block w-full bg-emerald-950/50 p-2 rounded text-xs text-emerald-300 overflow-x-auto whitespace-nowrap">Calc Hash #500 == Stored Hash #500</code>
        </div>

        <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-6 relative">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="text-rose-500 w-5 h-5" />
            <h4 className="font-semibold text-rose-400">Tampered State</h4>
          </div>
          <p className="text-sm text-rose-200/70 mb-3">Someone alters the LLM response text in Event #500. Event #500's computed hash now changes. Since Event #501's hash strictly depends on Event #500's hash, #501 evaluates as invalid. The entire chain breaks, proving tampering occurred.</p>
          <code className="block w-full bg-rose-950/50 p-2 rounded text-xs text-rose-300 overflow-x-auto whitespace-nowrap">Calc Hash #501 != Stored Hash #501</code>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
        <Search className="text-slate-500" />
        Data Retention & E-Discovery
      </h2>
      <p className="text-slate-600 mb-4 leading-relaxed">
        Live environment decisions (<code className="bg-slate-100 px-1 rounded text-cyan-400">environment: production</code>) are retained indefinitely. Your organization can issue precise E-Discovery queries during legal proceedings to retrieve exactly what an AI agent "saw" and "said" on a specific date, mathematically proving the output.
      </p>
    </div>
  );
}
