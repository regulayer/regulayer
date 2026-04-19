import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — AI Compliance Software Plans & Enterprise AI Risk Management',
  description: 'Transparent pricing for Regulayer AI compliance software. Free tier for developers, Pro for production EU AI Act compliance, and custom Sovereign deployment for regulated enterprises requiring air-gapped AI risk management.',
  keywords: ['AI compliance pricing', 'EU AI Act software cost', 'AI risk management pricing', 'enterprise AI governance plans', 'HITL compliance cost', 'ISO 42001 software pricing', 'AI proxy pricing', 'Regulayer pricing'],
  openGraph: {
    title: 'Regulayer Pricing — AI Compliance & EU AI Act Risk Management Plans',
    description: 'Simple, transparent pricing for enterprise AI compliance. From free developer tier to custom sovereign deployments.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
