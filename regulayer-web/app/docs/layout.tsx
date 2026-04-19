import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation — AI Compliance SDK & EU AI Act Integration Guide',
  description: 'Complete developer documentation for integrating Regulayer AI compliance proxy. Python, Node.js & Go SDKs for EU AI Act Article 12 & 14 conformity, Human-in-the-Loop governance, and WORM audit trail implementation.',
  keywords: ['AI compliance SDK', 'EU AI Act integration', 'AI governance documentation', 'Human in the Loop SDK', 'HITL API', 'AI risk management API', 'ISO 42001 SDK', 'LLM proxy documentation', 'Regulayer docs'],
  openGraph: {
    title: 'Regulayer Documentation — AI Compliance SDK & EU AI Act Integration',
    description: 'Full developer documentation for the Regulayer AI compliance proxy. SDKs, API references, governance workflows, and conformity assessment automation.',
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
