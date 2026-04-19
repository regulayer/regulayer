import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Compliance Glossary — EU AI Act, ISO 42001, NIST AI RMF Terms Explained',
  description: 'Comprehensive glossary of AI compliance, AI risk management, and EU AI Act terminology. Understand HITL governance, WORM storage, ISO/IEC 42001:2023, NIST AI RMF, algorithmic bias, and more.',
  keywords: ['AI compliance glossary', 'EU AI Act terms', 'AI risk management definitions', 'ISO 42001 explained', 'NIST AI RMF glossary', 'HITL meaning', 'WORM storage meaning', 'AI governance terms'],
  openGraph: {
    title: 'AI Compliance Glossary | Regulayer',
    description: 'Every AI compliance and EU AI Act term explained. The definitive reference for enterprise AI governance.',
  },
};

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
