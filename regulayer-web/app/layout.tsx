import { Outfit, Space_Grotesk, Lilita_One, Syne } from 'next/font/google';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import Providers from './providers';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const lilitaOne = Lilita_One({ weight: '400', subsets: ['latin'], variable: '--font-lilita' });
const footerDisplay = Syne({ subsets: ['latin'], variable: '--font-footer-display' });

export const viewport: Viewport = {
    themeColor: '#FF6F3C',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export const metadata: Metadata = {
    metadataBase: new URL('https://regulayer.tech'),
    title: {
        default: 'Regulayer | The Enterprise Cryptographic Trust Layer for AI',
        template: '%s | Regulayer Enterprise'
    },
    description: 'Regulayer is the definitive zero-latency reverse proxy and human-in-the-loop governance engine for EU AI Act compliance. Secure, intercept, and cryptographically seal LLM inference.',
    keywords: [
        'Regulayer', 'Regulator AI', 'Regulair', 'AI Compliance', 'EU AI Act', 'LLM Governance', 'AI Trust Layer', 
        'Cryptographic Proof', 'AI Proxy', 'Human in the Loop AI', 'Enterprise AI Security', 'LLM Guardrails', 
        'Zor-AI', 'AI Gateway', 'WORM storage AI', 'SEC 17a-4 AI', 'Ed25519 signature', 'PgAudit LLM', 
        'Zero latency proxy', 'AI output intercept', 'LLM prompt injection defense', 'Data loss prevention OpenAI',
        'Semantic thresholding', 'LLaMA-3 anomaly detection', 'AI Compliance proxy', 'ISO 42001', 'SOC 2 AI Act'
    ],
    authors: [{ name: 'Regulayer Engineering', url: 'https://regulayer.tech' }],
    creator: 'Regulayer Inc.',
    publisher: 'Regulayer',
    formatDetection: { email: false, address: false, telephone: false },
    robots: { 
        index: true, 
        follow: true, 
        nocache: false,
        googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } 
    },
    alternates: {
        canonical: 'https://regulayer.tech',
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://regulayer.tech',
        siteName: 'Regulayer',
        title: 'Regulayer | The Cryptographic Trust Layer for AI',
        description: 'Passive observability is not legal proof. Regulayer intercepts, evaluates, and cryptographically signs every AI decision in real-time. Uncompromising EU AI Act compliance.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Regulayer Enterprise Architecture',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Regulayer | Enterprise AI Compliance',
        description: 'The cryptographic trust layer for LLMs. Block AI drift mid-flight.',
        images: ['/og-image.png'],
        creator: '@regulayer',
    },
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
        ],
        apple: [
            { url: '/apple-touch-icon.png' }
        ]
    }
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Regulayer',
    'alternateName': ['Regulator AI', 'Regulair', 'Regulayer.tech', 'Zor-AI Regulayer', 'Regulation Layer AI'],
    'applicationCategory': 'BusinessApplication, SecurityApplication',
    'operatingSystem': 'Cloud, SaaS, Kubernetes, AWS EKS',
    'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
    },
    'featureList': [
        'Zero-Latency HTTP Reverse Proxy',
        'Cryptographic Non-Repudiation with Ed25519',
        'Chronological SHA-256 Hash Chaining',
        'Write-Once-Read-Many (WORM) PostgreSQL compliance',
        'EU AI Act Article 12 & 14 Record Keeping',
        'Human-In-The-Loop (HITL) manual intervention queues',
        'Semantic Policy Engine parsing LLaMA-based anomalies',
        'Regex and Keyword filtering for Datadog / LangSmith'
    ],
    'description': 'Regulayer acts as a cryptographic inverse proxy that intercepts, evaluates, and digitally signs LLM inference payloads to secure EU AI Act compliance for Enterprise developers.',
    'url': 'https://regulayer.tech',
    'publisher': {
        '@type': 'Organization',
        'name': 'Regulayer',
        'url': 'https://regulayer.tech',
        'logo': 'https://regulayer.tech/logo.png',
        'sameAs': [
            'https://github.com/Zor-AI/regulayer'
        ]
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning className={`scroll-smooth ${outfit.variable} ${spaceGrotesk.variable} ${lilitaOne.variable} ${footerDisplay.variable}`}>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                {/* JSON-LD Structured Data Injection */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className="antialiased min-h-screen bg-background text-foreground" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
