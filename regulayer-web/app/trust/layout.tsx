import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trust & Security Center — AI Compliance Security, SOC 2, GDPR & WORM Audit',
  description: 'Regulayer Trust Center: Zero-trust AI compliance architecture with WORM-compliant storage, Ed25519 cryptographic sealing, SOC 2 Type II audit trails, GDPR data residency, and HIPAA-capable enterprise deployment for AI risk management.',
  keywords: ['AI compliance security', 'SOC 2 AI audit', 'GDPR AI compliance', 'WORM storage AI', 'trust center AI', 'AI risk management security', 'EU AI Act security', 'cryptographic AI audit', 'Regulayer security'],
  openGraph: {
    title: 'Regulayer Trust & Security — SOC 2, GDPR & Cryptographic AI Compliance',
    description: 'Zero-trust architecture for AI governance. WORM storage, Ed25519 signing, SOC 2 Type II, GDPR compliance, and HIPAA-capable deployment.',
  },
};

export default function TrustLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
