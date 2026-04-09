"use client";
import React from "react";
import { KeyRound, Users, ShieldAlert, Check } from "lucide-react";

export default function AuthDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Authentication & Authorization</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        Regulayer secures your data through robust API Key authentication for programmatic access and Role-Based Access Control (RBAC) via SSO for human dashboard users.
      </p>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
        <KeyRound className="text-slate-500" />
        API Key Authentication
      </h2>
      <p className="text-slate-600 mb-4 leading-relaxed">
        All programmatic interactions with the Regulayer API from your application code must be authenticated using a heavily-permissioned API Key.
      </p>

      <div className="bg-white/50 border border-slate-200 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-slate-900 mb-4">Request Headers</h3>
        <p className="text-sm text-slate-500 mb-4">Include your API key using standard Bearer token authentication or via a custom header.</p>
        <div className="bg-white border border-slate-200 p-4 rounded-lg font-mono text-sm text-emerald-400 mb-2">
          Authorization: Bearer rl_live_abc123...
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-lg font-mono text-sm text-emerald-400">
          X-Regulayer-Api-Key: rl_live_abc123...
        </div>
      </div>

      <h3 className="text-xl font-semibold mt-8 mb-4">Live vs. Test Keys</h3>
      <p className="text-slate-600 mb-4">Regulayer uses prefixing to help infrastructure tools identify key types:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="border border-slate-200 rounded-lg p-5 bg-white/30">
          <code className="text-slate-500 font-bold mb-2 block">rl_live_*</code>
          <h4 className="font-medium text-slate-700 mb-2">Production Keys</h4>
          <p className="text-sm text-slate-500">Records decisions permanently in the cryptographic ledger. Immutable and auditable.</p>
        </div>
        <div className="border border-slate-200 rounded-lg p-5 bg-white/30 border-dashed">
          <code className="text-amber-400 font-bold mb-2 block">rl_test_*</code>
          <h4 className="font-medium text-slate-700 mb-2">Development Keys</h4>
          <p className="text-sm text-slate-500">Decisions are processed but intentionally bypass cryptographic persistence. Ideal for CI pipelines.</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 pt-8 border-t border-slate-200">
        <Users className="text-slate-500" />
        Human Access (RBAC)
      </h2>
      <p className="text-slate-600 mb-4 leading-relaxed">
        Access to the Governance Dashboard is governed by strict Role-Based Access Control. API keys inherit the permissions of the Project they belong to, ensuring logical separation.
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 mb-8">
        <table className="w-full text-sm text-left">
          <thead className="bg-white text-slate-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Capabilities</th>
              <th className="px-6 py-4">Ideal For</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 text-slate-600 bg-white/30">
            <tr>
              <td className="px-6 py-4 font-medium text-slate-900">Owner</td>
              <td className="px-6 py-4">Full access. Manage billing, delete organizations, invite Admins.</td>
              <td className="px-6 py-4">CTO, CISO</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-slate-900">Admin</td>
              <td className="px-6 py-4">Create projects, generate API keys, configure governance policies.</td>
              <td className="px-6 py-4">Engineering Leads</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-slate-900">Reviewer</td>
              <td className="px-6 py-4">Approve/Reject flagged AI decisions. Export compliance reports.</td>
              <td className="px-6 py-4">Compliance Staff, Legal</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-slate-900">Viewer</td>
              <td className="px-6 py-4">Read-only access to decisions and policies. Cannot modify anything.</td>
              <td className="px-6 py-4">Auditors</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 pt-8 border-t border-slate-200">
        <ShieldAlert className="text-slate-500" />
        Security Features
      </h2>
      <ul className="space-y-3 text-slate-500 list-disc list-inside ml-2">
        <li><strong>SAML SSO:</strong> Enterprise SSO via Okta, Azure AD, and Google Workspace.</li>
        <li><strong>Automatic Key Revocation:</strong> Leaked API keys pushed to public GitHub repositories are automatically detected and revoked within 30 seconds.</li>
        <li><strong>IP Allowlisting:</strong> Restrict API calls to specific corporate CIDR blocks.</li>
      </ul>
    </div>
  );
}
