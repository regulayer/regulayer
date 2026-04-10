"use client";
import React from "react";

const CodeBlock = ({ children, title }: { children: string; title?: string }) => (
  <div className="bg-slate-900 rounded-lg overflow-hidden mb-4 border border-slate-700">
    {title && <div className="bg-slate-800 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700">{title}</div>}
    <pre className="p-4 overflow-x-auto"><code className="text-sm font-mono text-emerald-400">{children}</code></pre>
  </div>
);

export default function RecordingDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Cryptographic Recording</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        Every AI decision processed by Regulayer is cryptographically sealed into an immutable audit vault. This page explains the hashing, signing, and chain-linking mechanisms that make Regulayer records tamper-proof.
      </p>

      <h2 className="text-2xl font-semibold mb-6">How Recording Works</h2>
      <p className="text-slate-500 mb-6 text-sm leading-relaxed">
        When a decision arrives at the Decision Recorder, it undergoes a four-step cryptographic sealing process:
      </p>

      <ol className="list-decimal list-inside space-y-4 text-sm text-slate-600 mb-10 bg-white border border-slate-200 p-6 rounded-xl">
        <li><strong>Canonicalization:</strong> The input, output, metadata, and timestamp are serialized into a deterministic JSON string (sorted keys, no whitespace). This ensures the same data always produces the same hash.</li>
        <li><strong>Payload Hashing:</strong> The canonicalized string is hashed with <strong>SHA-256</strong>, producing a 64-character hex digest. This hash uniquely identifies the decision content.</li>
        <li><strong>Chain Linking:</strong> The payload hash is concatenated with the previous record&apos;s chain hash to form: <code className="bg-slate-100 px-1 rounded">chain_hash = SHA-256(payload_hash + previous_chain_hash)</code>. This creates an immutable linked chain — modifying any historical record breaks all subsequent hashes.</li>
        <li><strong>Digital Signing:</strong> The chain hash is signed with an <strong>Ed25519</strong> private key. This signature proves the record was created by an authorized Regulayer service and has not been tampered with.</li>
      </ol>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">Record Structure</h2>
      <CodeBlock title="Example Record">{`{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "sequence_number": 12345,
  "organization_id": "org-uuid",
  "project_id": "project-uuid",
  "model": "gpt-4",
  "system_name": "customer-support-agent",
  "input_data": { "role": "user", "content": "Approve loan for $50k" },
  "output_data": { "decision": "approved", "amount": 50000 },
  "metadata": { "customer_id": "C-12345", "risk_score": 0.23 },
  "tags": ["financial", "high-value"],
  "payload_hash": "a3f8c2d1...64 hex chars",
  "previous_hash": "b4e9d3e2...64 hex chars",
  "chain_hash": "c5f0e4f3...64 hex chars",
  "signature": "Ed25519 signature bytes (base64)",
  "status": "recorded",
  "created_at": "2026-04-10T05:30:00.000Z"
}`}</CodeBlock>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">WORM Compliance</h2>
      <p className="text-slate-500 mb-4 text-sm leading-relaxed">
        The vault operates in <strong>Write-Once, Read-Many (WORM)</strong> mode:
      </p>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-500 mb-6">
        <li>Records can <strong>only be appended</strong> — no UPDATE or DELETE operations exist</li>
        <li>Retention periods are enforced by plan tier (Free: 7 days, Pro: 1 year, Enterprise: unlimited)</li>
        <li>Even Regulayer engineers cannot modify or delete records before retention expires</li>
        <li>Architecture satisfies <strong>SEC 17a-4</strong> requirements for financial record retention</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">Verification</h2>
      <p className="text-slate-500 mb-4 text-sm leading-relaxed">
        Any record can be independently verified by an auditor:
      </p>
      <ol className="list-decimal list-inside space-y-2 text-sm text-slate-500 mb-6">
        <li>Recompute the SHA-256 hash from the original input/output/metadata</li>
        <li>Verify the chain link: <code className="bg-slate-100 px-1 rounded">chain_hash == SHA-256(payload_hash + previous_chain_hash)</code></li>
        <li>Verify the Ed25519 signature using Regulayer&apos;s published public key</li>
      </ol>
      <p className="text-slate-500 text-sm leading-relaxed">
        Use the <strong>Chain Integrity Report</strong> (<code className="bg-slate-100 px-1 rounded">GET /v1/reports/chain/default</code>) to automatically verify the entire hash chain for your organization.
      </p>
    </div>
  );
}
