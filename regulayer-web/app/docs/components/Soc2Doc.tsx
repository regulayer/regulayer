"use client";
import React from "react";
import { ShieldCheck, Lock, Database, Eye } from "lucide-react";

export default function Soc2DocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">SOC 2 Type II Compliance</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        Regulayer&apos;s architecture is designed to satisfy all five SOC 2 Type II trust service criteria. This page documents how Regulayer maps to each criterion and how organizations can leverage the platform for their own SOC 2 compliance.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-10">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Regulayer itself undergoes annual SOC 2 Type II audits. For Enterprise customers, we provide a BAA (Business Associate Agreement) and our latest SOC 2 report upon request.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-6">Trust Service Criteria Mapping</h2>

      <div className="space-y-6 mb-10">
        <div className="border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Lock className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-800 text-lg">Security</h3>
          </div>
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">
            Protection of system resources against unauthorized access.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-500">
            <li>TLS 1.3 encryption for all external traffic</li>
            <li>Internal mTLS between microservices</li>
            <li>Rate limiting per API key and IP address</li>
            <li>RBAC with principle of least privilege (4 roles)</li>
            <li>API keys hashed with bcrypt at rest</li>
            <li>Per-tenant cryptographic isolation</li>
          </ul>
        </div>

        <div className="border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <h3 className="font-bold text-slate-800 text-lg">Availability</h3>
          </div>
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">
            System components are available for operation as committed.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-500">
            <li>Multi-service architecture with no single point of failure</li>
            <li>Active health monitoring and auto-recovery</li>
            <li>Incident management system with severity classification</li>
            <li>Public status page at <code className="bg-slate-100 px-1 rounded">/status</code></li>
            <li>Custom SLAs available on Enterprise plan</li>
          </ul>
        </div>

        <div className="border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-slate-800 text-lg">Processing Integrity</h3>
          </div>
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">
            System processing is complete, valid, accurate, and authorized.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-500">
            <li>SHA-256 hash chains prove decision integrity</li>
            <li>Ed25519 digital signatures for non-repudiation</li>
            <li>WORM storage prevents modification or deletion</li>
            <li>Chain Integrity Reports verify the entire audit trail</li>
            <li>Every governance action is cryptographically signed</li>
          </ul>
        </div>

        <div className="border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Lock className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-slate-800 text-lg">Confidentiality</h3>
          </div>
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">
            Information designated as confidential is protected as committed.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-500">
            <li>AES-256-GCM encryption at rest</li>
            <li>Zero-trust multi-tenancy</li>
            <li>Per-organization encryption keys</li>
            <li>Project-level data isolation</li>
            <li>Strict access controls via RBAC</li>
          </ul>
        </div>

        <div className="border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="w-5 h-5 text-cyan-500" />
            <h3 className="font-bold text-slate-800 text-lg">Privacy</h3>
          </div>
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">
            Personal information is collected, used, retained, and disposed of in conformity with commitments.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-500">
            <li>GDPR-ready data residency controls</li>
            <li>Data Processing Agreements (DPA) available</li>
            <li>Right to erasure supported (with audit trail retention)</li>
            <li>Configurable data retention periods by plan tier</li>
            <li>HIPAA BAA available on Enterprise plan</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">How Regulayer Supports Your SOC 2 Audit</h2>
      <p className="text-slate-500 mb-6 text-sm leading-relaxed">
        If your organization is pursuing SOC 2 compliance, Regulayer provides critical evidence:
      </p>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-500 mb-6">
        <li><strong>Immutable audit trails</strong> — Prove that AI decisions are recorded without tampering</li>
        <li><strong>HITL governance records</strong> — Demonstrate human oversight of automated systems</li>
        <li><strong>Access control logs</strong> — Show RBAC enforcement and API key management</li>
        <li><strong>Incident management</strong> — Document incident detection, classification, and resolution</li>
        <li><strong>Chain integrity reports</strong> — Independently verify processing integrity</li>
      </ul>
    </div>
  );
}
