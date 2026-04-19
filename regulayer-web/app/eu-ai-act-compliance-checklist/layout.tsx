import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EU AI Act Compliance Checklist 2026 — Complete Enterprise Implementation Guide',
  description: 'The definitive EU AI Act compliance checklist for enterprises. Step-by-step guide to Article 9, 12, 14, 27, and 43 requirements. Free checklist for CISOs, CTOs, and compliance officers preparing for August 2026 enforcement.',
  keywords: ['EU AI Act compliance checklist', 'EU AI Act checklist 2026', 'EU AI Act requirements', 'AI Act compliance guide', 'EU AI Act Article 14 checklist', 'EU AI Act Article 12 requirements', 'AI compliance checklist', 'FRIA checklist', 'conformity assessment checklist', 'how to comply EU AI Act'],
  openGraph: {
    title: 'EU AI Act Compliance Checklist 2026 | Regulayer',
    description: 'Free step-by-step compliance checklist for the EU AI Act. Every article mapped, every requirement explained.',
  },
  other: {
    'article:published_time': '2024-12-01',
    'article:modified_time': new Date().toISOString().split('T')[0],
    'article:section': 'AI Compliance',
    'article:tag': 'EU AI Act, AI Compliance, ISO 42001, NIST AI RMF',
  }
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  'name': 'How to Comply with the EU AI Act Before August 2026',
  'description': 'Complete step-by-step enterprise compliance checklist covering AI system classification, Article 12 record-keeping, Article 14 human oversight, conformity assessments, and post-market monitoring.',
  'totalTime': 'P90D',
  'estimatedCost': { '@type': 'MonetaryAmount', 'currency': 'EUR', 'value': '0' },
  'tool': [
    { '@type': 'HowToTool', 'name': 'Regulayer AI Compliance Platform' },
    { '@type': 'HowToTool', 'name': 'EU AI Act Regulation Text (EU 2024/1689)' },
  ],
  'step': [
    {
      '@type': 'HowToStep',
      'position': 1,
      'name': 'Classify All AI Systems by Risk Level',
      'text': 'Inventory every AI system in your organization and classify each against the EU AI Act Annex III high-risk categories: biometrics, critical infrastructure, education, employment, essential services, law enforcement, migration, and justice.',
      'url': 'https://regulayer.tech/eu-ai-act-compliance-checklist#phase-1'
    },
    {
      '@type': 'HowToStep',
      'position': 2,
      'name': 'Implement Article 12 Automated Record-Keeping',
      'text': 'Deploy automated logging for every AI inference with cryptographic guarantees. Use SHA-256 hash chaining and Ed25519 digital signatures on WORM-compliant storage to create tamper-proof audit trails.',
      'url': 'https://regulayer.tech/eu-ai-act-compliance-checklist#phase-2'
    },
    {
      '@type': 'HowToStep',
      'position': 3,
      'name': 'Build Article 14 Human Oversight Mechanisms',
      'text': 'Design Human-in-the-Loop governance workflows with structured review queues. Define escalation procedures and ensure authorized personnel can immediately halt AI operations.',
      'url': 'https://regulayer.tech/eu-ai-act-compliance-checklist#phase-3'
    },
    {
      '@type': 'HowToStep',
      'position': 4,
      'name': 'Complete Conformity Assessment and Documentation',
      'text': 'Prepare Annex IV technical documentation, conduct a Fundamental Rights Impact Assessment under Article 27, generate the EU Declaration of Conformity, and register in the EU high-risk AI database.',
      'url': 'https://regulayer.tech/eu-ai-act-compliance-checklist#phase-4'
    },
    {
      '@type': 'HowToStep',
      'position': 5,
      'name': 'Establish Continuous Post-Market Monitoring',
      'text': 'Implement ongoing accuracy monitoring, define Article 62 serious incident reporting procedures, and automate periodic conformity assessment updates from operational telemetry.',
      'url': 'https://regulayer.tech/eu-ai-act-compliance-checklist#phase-5'
    }
  ]
};

export default function ChecklistLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      {children}
    </>
  );
}

