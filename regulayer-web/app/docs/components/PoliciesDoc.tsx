"use client";
import React from "react";

const CodeBlock = ({ children, title }: { children: string; title?: string }) => (
  <div className="bg-slate-900 rounded-lg overflow-hidden mb-4 border border-slate-700">
    {title && <div className="bg-slate-800 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700">{title}</div>}
    <pre className="p-4 overflow-x-auto"><code className="text-sm font-mono text-emerald-400">{children}</code></pre>
  </div>
);

export default function PoliciesDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Policy Engine</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        The Policy Engine evaluates every AI decision in real-time against a set of declarative rules. Policies can automatically flag, block, or route decisions for human review based on content, metadata, or semantic analysis.
      </p>

      <h2 className="text-2xl font-semibold mb-6">Creating a Policy</h2>
      <CodeBlock title="POST /v1/policies">{`{
  "name": "PII Detection Policy",
  "description": "Flag outputs containing personal identifiable information",
  "rules": [
    {
      "field": "output_data.content",
      "operator": "semantic",
      "value": "Contains personal identifiable information such as SSN, email, phone, or address"
    }
  ],
  "action": "require_approval",
  "scope": "organization",
  "enabled": true
}`}</CodeBlock>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">Supported Operators</h2>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">Operator</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">Description</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              ["contains", "String includes substring", '"output contains social security"'],
              ["not_contains", "String excludes substring", '"output must not contain profanity"'],
              ["equals", "Exact string match", '"model equals gpt-4"'],
              ["regex", "Regular expression match", '"output matches /\\b\\d{3}-\\d{2}-\\d{4}\\b/"'],
              ["gt / gte / lt / lte", "Numeric comparison", '"metadata.risk_score gt 0.8"'],
              ["semantic", "AI-powered semantic analysis (LLaMA 3)", '"Discusses financial advice without disclaimer"'],
            ].map(([op, desc, example], i) => (
              <tr key={i}>
                <td className="px-4 py-3 font-mono text-xs text-orange-500">{op}</td>
                <td className="px-4 py-3 text-slate-600">{desc}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">Available Actions</h2>
      <div className="space-y-4 mb-10">
        {[
          { action: "allow", color: "bg-green-50 border-green-200 text-green-800", desc: "Decision passes normally. No intervention. This is the default when no policy matches." },
          { action: "flag", color: "bg-yellow-50 border-yellow-200 text-yellow-800", desc: "Decision is marked with a flag for awareness. It proceeds normally but appears highlighted in the dashboard for compliance review." },
          { action: "require_approval", color: "bg-orange-50 border-orange-200 text-orange-800", desc: "Decision is routed to the HITL Governance Queue. A compliance officer must approve or reject it before the response reaches the end user (in proxy mode)." },
          { action: "block", color: "bg-red-50 border-red-200 text-red-800", desc: "Decision is blocked immediately. In proxy mode, the response is replaced with a governance-approved fallback message. The blocked decision is still recorded in the audit vault." },
        ].map((item, i) => (
          <div key={i} className={`border rounded-lg p-4 ${item.color}`}>
            <span className="font-mono text-sm font-bold">{item.action}</span>
            <p className="text-sm mt-1 opacity-80">{item.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">Policy Evaluation Order</h2>
      <ol className="list-decimal list-inside space-y-2 text-sm text-slate-500 mb-6">
        <li>All active policies are evaluated <strong>in parallel</strong> against the decision</li>
        <li>The <strong>most restrictive action wins</strong>: block &gt; require_approval &gt; flag &gt; allow</li>
        <li>Multiple policies can trigger on the same decision — all are recorded</li>
        <li>Organization-scoped policies apply to all projects; project-scoped policies apply only to their project</li>
      </ol>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">Example Policies</h2>

      <h3 className="text-lg font-semibold mb-3 text-slate-700">Toxicity Detection</h3>
      <CodeBlock>{`{
  "name": "Toxicity Guard",
  "rules": [{ "field": "output_data.content", "operator": "semantic", "value": "Contains toxic, hateful, or discriminatory language" }],
  "action": "block"
}`}</CodeBlock>

      <h3 className="text-lg font-semibold mb-3 text-slate-700">High-Value Financial Decision</h3>
      <CodeBlock>{`{
  "name": "High-Value Approval Gate",
  "rules": [{ "field": "metadata.amount", "operator": "gt", "value": 100000 }],
  "action": "require_approval"
}`}</CodeBlock>

      <h3 className="text-lg font-semibold mb-3 text-slate-700">Jailbreak Attempt Detection</h3>
      <CodeBlock>{`{
  "name": "Jailbreak Detector",
  "rules": [{ "field": "input_data.content", "operator": "semantic", "value": "Attempts to bypass safety instructions or system prompt" }],
  "action": "flag"
}`}</CodeBlock>
    </div>
  );
}
