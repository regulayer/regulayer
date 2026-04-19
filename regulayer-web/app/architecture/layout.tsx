import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Architecture — AI Compliance Proxy Infrastructure & Microservice Topology',
  description: 'Deep technical architecture of Regulayer: 6 microservices powering real-time AI risk management. Ed25519 cryptographic signing, SHA-256 hash chaining, WORM-compliant storage, and Human-in-the-Loop governance pipelines for EU AI Act compliance.',
  keywords: ['AI compliance architecture', 'AI proxy infrastructure', 'EU AI Act microservices', 'cryptographic AI audit', 'WORM storage architecture', 'Ed25519 AI signing', 'SHA-256 hash chain', 'AI governance pipeline', 'Regulayer architecture'],
  openGraph: {
    title: 'Regulayer Architecture — AI Compliance Proxy & Cryptographic Audit Infrastructure',
    description: 'Complete technical registry of the Regulayer compliance gateway. Six microservices, zero single points of failure, governance-enforced at every layer.',
  },
};

export default function ArchitectureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
