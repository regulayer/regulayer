"use client";
import React from "react";
import { ShieldCheck, FileText, Users, AlertTriangle, CheckCircle2, BookOpen } from "lucide-react";

const CodeBlock = ({ children, title }: { children: string; title?: string }) => (
  <div className="bg-slate-900 rounded-lg overflow-hidden mb-4 border border-slate-700">
    {title && <div className="bg-slate-800 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700">{title}</div>}
    <pre className="p-4 overflow-x-auto"><code className="text-sm font-mono text-emerald-400">{children}</code></pre>
  </div>
);

export default function EuAiDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">EU AI Act Compliance with Regulayer</h1>
      <p className="text-lg text-slate-500 mb-6 leading-relaxed">
        The EU AI Act (Regulation 2024/1689) is the world&apos;s first comprehensive AI regulation. It imposes strict obligations on organizations deploying &quot;high-risk&quot; AI systems. This guide explains exactly how Regulayer maps to each requirement and how to achieve full compliance.
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-10">
        <p className="text-sm text-amber-800">
          <strong>Enforcement Timeline:</strong> The EU AI Act enters full enforcement in August 2026. Organizations must have documented governance, FRIA, conformity assessments, and human oversight mechanisms in place before deployment of high-risk AI systems.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-6">Article-by-Article Mapping</h2>
      <p className="text-slate-500 mb-6 text-sm leading-relaxed">
        Below is a detailed mapping of how Regulayer&apos;s capabilities satisfy each relevant EU AI Act article for high-risk AI systems.
      </p>

      <div className="space-y-6 mb-10">
        {[
          {
            article: "Article 9 — Risk Management System",
            requirement: "Providers must establish a continuous, iterative risk management system throughout the AI lifecycle.",
            regulayer: "Regulayer's Policy Engine continuously evaluates every AI decision against organizational risk policies. The Statistical ML Anomaly Detector tracks behavioral baselines and raises alerts when models drift outside acceptable parameters. Risk scores are recorded on every decision.",
            status: "✅ Fully Supported"
          },
          {
            article: "Article 10 — Data and Data Governance",
            requirement: "Training, validation, and testing data must be relevant, representative, and free of errors.",
            regulayer: "The cryptographic vault maintains a complete chain-of-custody for all data flowing through AI systems. SHA-256 hash chains prove data integrity. Every input/output pair is permanently recorded with provenance metadata.",
            status: "✅ Fully Supported"
          },
          {
            article: "Article 11 — Technical Documentation",
            requirement: "Detailed technical documentation must be maintained describing the AI system.",
            regulayer: "The Compliance API (POST /v1/orgs/{org_id}/compliance/tech-docs) provides structured storage for technical documentation. Organizations can create and maintain living documentation describing system architecture, evaluation metrics, and operational parameters.",
            status: "✅ Fully Supported"
          },
          {
            article: "Article 12 — Record-Keeping",
            requirement: "High-risk AI systems must automatically record logs of their operations.",
            regulayer: "The WORM-compliant Decision Recorder automatically captures every AI inference — inputs, outputs, timestamps, model versions, configuration parameters, and all human override actions. Records are cryptographically sealed and cannot be modified or deleted.",
            status: "✅ Fully Supported"
          },
          {
            article: "Article 13 — Transparency and Provision of Information",
            requirement: "Users must be informed that they are interacting with an AI system.",
            regulayer: "The Governance Dashboard provides complete transparency into AI decision-making. Every decision is inspectable, and the full audit trail (including HITL reviews) is accessible to authorized personnel. Compliance reports can be generated for regulators on demand.",
            status: "✅ Fully Supported"
          },
          {
            article: "Article 14 — Human Oversight",
            requirement: "High-risk AI systems must be designed to be overseen by natural persons.",
            regulayer: "The HITL Governance Queue directly satisfies this requirement. Policies with 'require_approval' actions route high-risk decisions to compliance officers who can approve, reject, or modify AI outputs before they reach end users. Every review action is signed and recorded.",
            status: "✅ Fully Supported"
          },
          {
            article: "Article 15 — Accuracy, Robustness, and Cybersecurity",
            requirement: "AI systems must achieve appropriate levels of accuracy, robustness, and security.",
            regulayer: "Statistical ML anomaly detection tracks model behavioral baselines. Ed25519 cryptographic signing prevents tampering. Zero-trust multi-tenant architecture ensures data integrity. AES-256-GCM encryption protects data at rest.",
            status: "✅ Fully Supported"
          },
          {
            article: "Article 27 — Fundamental Rights Impact Assessment (FRIA)",
            requirement: "Deployers of high-risk AI must conduct FRIAs before deployment.",
            regulayer: "The FRIA Generator (POST /v1/orgs/{org_id}/compliance/fria) provides structured assessment templates mapping directly to FRIA requirements. Assessments cover affected rights, impact likelihood/severity, mitigation measures, and residual risk levels.",
            status: "✅ Fully Supported"
          },
        ].map((item, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-6 hover:bg-white/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-bold text-slate-800">{item.article}</h3>
              <span className="text-xs font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded whitespace-nowrap">{item.status}</span>
            </div>
            <div className="mb-3">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Requirement</p>
              <p className="text-sm text-slate-500 leading-relaxed">{item.requirement}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">How Regulayer Satisfies This</p>
              <p className="text-sm text-slate-600 leading-relaxed">{item.regulayer}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">Step-by-Step: Achieving Full Compliance</h2>
      <p className="text-slate-500 mb-6 text-sm leading-relaxed">
        Follow these steps to make your AI system fully compliant with the EU AI Act using Regulayer:
      </p>

      <div className="space-y-6 mb-10">
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 flex-shrink-0 mt-1">1</div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Register Your AI Systems</h4>
            <p className="text-sm text-slate-500 mb-3">Document each AI system you deploy with its risk classification, intended purpose, and target population.</p>
            <CodeBlock title="API">{`POST /v1/orgs/{org_id}/compliance/ai-systems
{
  "name": "Customer Support Chatbot",
  "risk_classification": "high",
  "intended_purpose": "Automated customer query resolution",
  "deployment_region": "EU"
}`}</CodeBlock>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 flex-shrink-0 mt-1">2</div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Create a Fundamental Rights Impact Assessment (FRIA)</h4>
            <p className="text-sm text-slate-500 mb-3">For each high-risk system, assess potential impacts on fundamental rights and document mitigations.</p>
            <CodeBlock title="API">{`POST /v1/orgs/{org_id}/compliance/fria
{
  "ai_system_id": "uuid-of-system",
  "rights_assessed": [
    {
      "right": "Non-discrimination",
      "impact_likelihood": "medium",
      "impact_severity": "high",
      "mitigation_measures": ["Bias testing", "HITL review for flagged outputs"]
    }
  ],
  "overall_risk_level": "high"
}`}</CodeBlock>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 flex-shrink-0 mt-1">3</div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Configure Governance Policies</h4>
            <p className="text-sm text-slate-500 mb-3">Create policies that enforce your compliance requirements. Use &quot;require_approval&quot; for high-risk decisions.</p>
            <CodeBlock title="API">{`POST /v1/policies
{
  "name": "PII Detection Policy",
  "rules": [{ "field": "output_data.content", "operator": "semantic", "value": "Contains personal identifiable information" }],
  "action": "require_approval",
  "scope": "organization"
}`}</CodeBlock>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 flex-shrink-0 mt-1">4</div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Integrate Regulayer into Your AI Pipeline</h4>
            <p className="text-sm text-slate-500 mb-3">Use the SDK or proxy mode to route all AI inferences through Regulayer.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 flex-shrink-0 mt-1">5</div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Generate Conformity Assessment &amp; Technical Documentation</h4>
            <p className="text-sm text-slate-500 mb-3">Create a conformity assessment mapping each article to your compliance evidence. Upload technical documentation.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-sm flex-shrink-0 mt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Continuous Monitoring</h4>
            <p className="text-sm text-slate-500 mb-3">Regulayer continuously monitors all AI decisions, enforces policies, and generates compliance reports. Review the Governance Dashboard regularly and export reports for regulatory submissions.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 flex-shrink-0 mt-1">6</div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Download Your Compliance Report</h4>
            <p className="text-sm text-slate-500 mb-3">Navigate to <strong>Dashboard → Compliance Report</strong> to generate a professional, print-ready EU AI Act compliance report for any registered AI system. The report includes an article-by-article assessment with evidence statements, an overall compliance score, and priority actions. Systems that achieve ≥80% compliance receive the <strong>Regulayer Verified</strong> seal.</p>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-emerald-800 mb-1">Regulayer Verified Seal</h4>
            <p className="text-sm text-emerald-700 leading-relaxed">When your AI system achieves ≥80% compliance across all 10 assessed EU AI Act articles, the downloadable report includes the <strong>&quot;Regulayer Verified&quot;</strong> seal — a professional indicator that your system meets the platform&apos;s compliance threshold. This report is suitable for board presentations, regulatory submissions, and investor due diligence.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
