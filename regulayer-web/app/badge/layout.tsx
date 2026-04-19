import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EU AI Act Compliance Badge — Free Embeddable Trust Mark for Your Website',
  description: 'Add the Regulayer EU AI Act compliance badge to your website. Free embeddable SVG trust mark showing your AI system is governed, audited, and compliant. 5 badge variants available.',
  keywords: ['EU AI Act compliance badge', 'AI compliance badge', 'AI trust badge', 'EU AI Act certified', 'AI governance badge', 'compliance trust mark', 'Regulayer badge'],
};

export default function BadgeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
