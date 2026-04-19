import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Compliance Use Cases — Banking, Healthcare, Insurance & Government',
  description: 'How enterprises across banking, healthcare, insurance, and government use Regulayer for EU AI Act compliance, AI risk management, and automated conformity assessments. Real-world use cases for Human-in-the-Loop AI governance.',
  keywords: ['AI compliance banking', 'AI compliance healthcare', 'AI risk management insurance', 'EU AI Act government', 'AI governance use cases', 'HITL finance', 'AI compliance fintech', 'algorithmic bias lending', 'AI audit healthcare'],
  openGraph: {
    title: 'AI Compliance Use Cases | Regulayer',
    description: 'Enterprise AI compliance across banking, healthcare, insurance, and government. Real-world EU AI Act implementation.',
  },
};

export default function UseCasesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
