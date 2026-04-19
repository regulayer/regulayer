import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — AI Compliance Insights, EU AI Act Analysis & Governance Engineering',
  description: 'Engineering deep dives, EU AI Act compliance framework analyses, AI risk management strategies, and essays on the future of enterprise AI governance from the Regulayer team.',
  keywords: ['AI compliance blog', 'EU AI Act analysis', 'AI governance insights', 'AI risk management blog', 'ISO 42001 analysis', 'HITL governance blog', 'LLM compliance articles', 'Regulayer blog'],
  openGraph: {
    title: 'Regulayer Blog — AI Compliance & EU AI Act Governance Insights',
    description: 'Engineering deep dives, compliance framework analyses, and essays on enterprise AI governance.',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
