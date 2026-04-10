"use client";
import React from "react";
import { Key, Shield, Users, Lock } from "lucide-react";

const CodeBlock = ({ children, title }: { children: string; title?: string }) => (
  <div className="bg-slate-900 rounded-lg overflow-hidden mb-4 border border-slate-700">
    {title && <div className="bg-slate-800 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700">{title}</div>}
    <pre className="p-4 overflow-x-auto"><code className="text-sm font-mono text-emerald-400">{children}</code></pre>
  </div>
);

export default function AuthDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Authentication &amp; Authorization</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        Regulayer uses a two-layer security model: Clerk for user authentication (identity verification) and a custom RBAC system for authorization (permission enforcement).
      </p>

      <h2 className="text-2xl font-semibold mb-6">Authentication Methods</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-slate-700">API Key Authentication</h3>
          </div>
          <p className="text-sm text-slate-500 mb-3 leading-relaxed">
            For programmatic access (SDK, proxy, CI/CD pipelines). API keys are scoped to specific projects and support granular scopes.
          </p>
          <CodeBlock title="HTTP Header">X-API-Key: rl_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</CodeBlock>
          <div className="text-xs text-slate-400 space-y-1">
            <p><strong>Format:</strong> <code className="bg-slate-100 px-1 rounded">rl_live_</code> prefix + 32 random characters</p>
            <p><strong>Scopes:</strong> INGEST (send decisions), READ (query decisions)</p>
            <p><strong>Storage:</strong> Hashed with bcrypt at rest (shown once on creation)</p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-700">JWT Bearer Authentication</h3>
          </div>
          <p className="text-sm text-slate-500 mb-3 leading-relaxed">
            For dashboard and web app access. JWTs are issued by Clerk after successful login and include user identity, organization, and role claims.
          </p>
          <CodeBlock title="HTTP Header">Authorization: Bearer eyJhbGciOiJSUzI1NiIs...</CodeBlock>
          <div className="text-xs text-slate-400 space-y-1">
            <p><strong>Provider:</strong> Clerk</p>
            <p><strong>Supports:</strong> Email/password, OAuth (Google, GitHub), SSO (Enterprise)</p>
            <p><strong>MFA:</strong> Available on Pro and Enterprise plans</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">Role-Based Access Control (RBAC)</h2>
      <p className="text-slate-500 mb-6 text-sm leading-relaxed">
        Every user in an organization is assigned one of four roles. Roles determine what actions a user can perform across all organization resources.
      </p>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">Role</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">Permissions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-4 py-3 font-bold text-slate-700">Owner</td>
              <td className="px-4 py-3 text-slate-500">Full access. Delete org, manage billing, invite members, manage all projects, create/revoke API keys, governance reviews.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-bold text-slate-700">Admin</td>
              <td className="px-4 py-3 text-slate-500">Manage projects, API keys, policies, governance reviews. Cannot delete org or manage billing.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-bold text-slate-700">Member</td>
              <td className="px-4 py-3 text-slate-500">View dashboard, review governance queue, submit annotations. Cannot create projects or manage API keys.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-bold text-slate-700">Viewer</td>
              <td className="px-4 py-3 text-slate-500">Read-only access to dashboard and reports. Cannot perform any write operations.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">API Key Lifecycle</h2>

      <div className="space-y-4 mb-10">
        <div className="flex gap-4 items-start">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0 mt-1">1</div>
          <div>
            <p className="text-sm text-slate-600"><strong>Create:</strong> Navigate to Dashboard → API Keys → Create API Key. Select a project and name the key.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0 mt-1">2</div>
          <div>
            <p className="text-sm text-slate-600"><strong>Copy:</strong> The secret key is displayed exactly once. Copy and store it in a secure secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault).</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0 mt-1">3</div>
          <div>
            <p className="text-sm text-slate-600"><strong>Use:</strong> Set <code className="bg-slate-100 px-1 rounded">REGULAYER_API_KEY</code> as an environment variable. The SDK auto-detects it.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-500 flex-shrink-0 mt-1">4</div>
          <div>
            <p className="text-sm text-slate-600"><strong>Revoke:</strong> Delete the key from the dashboard. This is immediate and permanent — all requests using this key will fail instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
