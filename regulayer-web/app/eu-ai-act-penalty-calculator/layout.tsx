import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EU AI Act Penalty Calculator 2026 — Calculate Your Fine Risk Instantly',
  description: 'Free EU AI Act penalty calculator. Estimate your organization\'s maximum fine under Article 71 based on revenue, AI system risk classification, and violation type. Calculate penalties up to €35 million or 7% of global turnover.',
  keywords: ['EU AI Act penalty calculator', 'EU AI Act fine calculator', 'AI Act penalty', 'EU AI Act Article 71 fine', 'AI compliance penalty', 'EU AI Act fine amount', 'how much is EU AI Act fine', 'AI regulation penalty calculator', 'GDPR vs AI Act penalty'],
  openGraph: {
    title: 'EU AI Act Penalty Calculator — How Much Could You Be Fined?',
    description: 'Calculate your maximum EU AI Act penalty instantly. Free tool for CISOs and compliance officers.',
  },
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
