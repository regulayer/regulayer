import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Regulayer — Enterprise AI Governance & Compliance Infrastructure Company',
  description: 'Regulayer builds the compliance infrastructure layer that regulated enterprises need to deploy AI responsibly. Human-in-the-Loop governance, automated conformity assessments, and immutable audit trails for EU AI Act and ISO 42001.',
  keywords: ['about Regulayer', 'AI governance company', 'enterprise AI compliance', 'EU AI Act company', 'AI risk management startup', 'HITL governance', 'ISO 42001 company', 'AI compliance infrastructure'],
  openGraph: {
    title: 'About Regulayer — Enterprise AI Governance Infrastructure',
    description: 'Purpose-built compliance gateway for EU AI Act. Human-in-the-Loop governance, cryptographic audit trails, and automated conformity assessments.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
