import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regulayer vs LangSmith vs Helicone vs Datadog AI — AI Compliance Comparison 2026',
  description: 'Detailed comparison of AI compliance and observability tools: Regulayer vs LangSmith vs Helicone vs Datadog AI vs OneTrust. Which platform provides real EU AI Act compliance with active interception vs passive logging?',
  keywords: ['Regulayer vs LangSmith', 'Regulayer vs Helicone', 'Regulayer vs Datadog AI', 'Regulayer vs OneTrust', 'AI compliance comparison', 'LangSmith alternative', 'Helicone alternative', 'Datadog AI alternative', 'best AI compliance software 2026', 'AI governance tools comparison', 'EU AI Act tools'],
  openGraph: {
    title: 'AI Compliance Tool Comparison 2026 — Regulayer vs LangSmith vs Datadog',
    description: 'Active interception vs passive observability. See which AI compliance platform actually prevents regulatory violations.',
  },
};

const comparisonSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Best AI Compliance Software 2026 — Comparison',
    'description': 'Comprehensive comparison of AI compliance and governance platforms ranked by EU AI Act readiness, active enforcement capability, and cryptographic audit quality.',
    'numberOfItems': 5,
    'itemListOrder': 'https://schema.org/ItemListOrderDescending',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Regulayer',
        'url': 'https://regulayer.tech',
        'description': 'Active network interception proxy with real-time EU AI Act compliance enforcement, HITL governance queues, and cryptographic WORM audit trails.',
        'item': {
          '@type': 'SoftwareApplication',
          'name': 'Regulayer',
          'applicationCategory': 'AI Compliance',
          'aggregateRating': { '@type': 'AggregateRating', 'ratingValue': '4.9', 'ratingCount': '47' }
        }
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'OneTrust AI Governance',
        'url': 'https://onetrust.com',
        'description': 'GRC platform with policy management and AI governance modules. Organizational layer only — no technical enforcement.'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': 'LangSmith',
        'url': 'https://smith.langchain.com',
        'description': 'LLM observability and debugging tool by LangChain. Passive asynchronous logging — no active compliance enforcement.'
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'name': 'Datadog AI Monitoring',
        'url': 'https://datadoghq.com',
        'description': 'Infrastructure monitoring with AI observability features. Monitors infrastructure health — not regulatory compliance.'
      },
      {
        '@type': 'ListItem',
        'position': 5,
        'name': 'Helicone',
        'url': 'https://helicone.ai',
        'description': 'LLM cost tracking and usage analytics. No policy engine, no governance, no compliance enforcement.'
      }
    ]
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Table',
    'about': 'AI Compliance Software Feature Comparison',
    'description': 'Feature-by-feature comparison of Regulayer, LangSmith, Helicone, Datadog AI, and OneTrust across core architecture, EU AI Act compliance, cryptographic evidence, and governance capabilities.'
  }
];

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonSchema) }}
      />
      {children}
    </>
  );
}

