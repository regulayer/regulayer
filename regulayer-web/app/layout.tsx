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
        default: 'EU AI Act Compliance Software & AI Risk Management | Regulayer',
        template: '%s | Regulayer AI Compliance'
    },
    description: 'Regulayer is the premier Enterprise AI Risk Management software. A sub-20ms proxy that secures EU AI Act compliance, intercepts algorithmic risk, and generates court-admissible Write-Once-Read-Many (WORM) audit evidence.',
    keywords: [
        'Regulayer', 'AI Risk Management', 'EU AI Act', 'Compliance of AI', 'Risk Management of AI', 'AI Governance Framework', 
        'ISO 42001', 'ISO/IEC 42001:2023 Audit', 'NIST AI RMF', 'EU AI Act penalties', 'GDPR Article 22 Compliance', 
        'AI Compliance Software', 'Algorithmic Risk Software', 'LLM Governance', 'AI Trust Layer', 'Cryptographic Proof', 
        'AI Proxy', 'Human in the Loop AI', 'Enterprise AI Security', 'LLM Guardrails', 'Zor-AI', 'AI Gateway', 
        'WORM storage AI', 'SEC 17a-4 AI', 'Ed25519 signature', 'PgAudit LLM', 'AI Compliance proxy', 'SOC 2 AI Act'
    ],
    authors: [{ name: 'Regulayer Compliance Engineering', url: 'https://regulayer.tech' }],
    creator: 'Regulayer Inc.',
    publisher: 'Regulayer ISO 42001 Auditing',
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
        title: 'EU AI Act Compliance & AI Risk Management | Regulayer',
        description: 'Passive observability is not legal proof. Regulayer intercepts, evaluates, and cryptographically signs every AI decision in real-time. Uncompromising ISO 42001 and EU AI Act compliance.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Regulayer Enterprise Architecture | AI Risk Management',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'EU AI Act Risk Management Software | Regulayer',
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

const jsonLd = [
    {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Regulayer',
        'url': 'https://regulayer.tech',
        'logo': 'https://regulayer.tech/logo.png',
        'sameAs': [
            'https://github.com/Zor-AI/regulayer',
            'https://twitter.com/regulayer',
            'https://linkedin.com/company/regulayer'
        ],
        'description': 'Regulayer is the leading provider of enterprise AI Risk Management and EU AI Act Compliance software, securing inference pipelines via cryptographic network proxies.',
        'foundingDate': '2024',
        'numberOfEmployees': { '@type': 'QuantitativeValue', 'value': '10' },
        'knowsAbout': [
            'EU AI Act', 'AI Risk Management', 'ISO/IEC 42001:2023', 'NIST AI RMF',
            'Algorithmic Bias Detection', 'LLM Governance', 'Cryptographic Audit Trails',
            'Human-in-the-Loop AI Governance', 'WORM Compliant Storage', 'Ed25519 Digital Signatures'
        ],
        'areaServed': { '@type': 'Place', 'name': 'Worldwide' },
        'contactPoint': {
            '@type': 'ContactPoint',
            'contactType': 'sales',
            'url': 'https://regulayer.tech/contact',
            'availableLanguage': ['English']
        }
    },
    {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Regulayer AI Compliance Suite',
        'alternateName': ['Regulator AI', 'Regulair', 'Regulayer.tech', 'Risk Management of AI Layer'],
        'applicationCategory': 'BusinessApplication, SecurityApplication',
        'applicationSubCategory': 'AI Governance, Regulatory Compliance, Risk Management',
        'operatingSystem': 'Cloud, SaaS, Kubernetes, AWS EKS',
        'offers': {
            '@type': 'AggregateOffer',
            'lowPrice': '0',
            'highPrice': '120000',
            'priceCurrency': 'USD',
            'offerCount': '3'
        },
        'featureList': [
            'Zero-Latency HTTP Reverse Proxy for AI Risk Management',
            'ISO/IEC 42001:2023 Conformity Reporting',
            'Chronological SHA-256 Hash Chaining for Audits',
            'Write-Once-Read-Many (WORM) PostgreSQL compliance',
            'EU AI Act Article 12 & 14 Record Keeping',
            'Human-In-The-Loop (HITL) AI manual intervention queues',
            'Real-time PII Scrubbing and Data Loss Prevention',
            'Automated Fundamental Rights Impact Assessment (FRIA)',
            'Air-Gapped VPC Deployment for Sovereign Enterprises'
        ],
        'description': 'Regulayer acts as a cryptographic inverse proxy that intercepts, evaluates, and digitally signs LLM inference payloads to secure EU AI Act compliance and AI risk management for Enterprise developers.',
        'screenshot': 'https://regulayer.tech/og-image.png',
        'softwareVersion': '2.0',
        'releaseNotes': 'https://regulayer.tech/blog',
        'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '4.9',
            'ratingCount': '47',
            'bestRating': '5'
        }
    },
    {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {
                '@type': 'Question',
                'name': 'How to comply with the EU AI Act?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'Complying with the EU AI Act requires real-time automated data governance, human oversight on high-risk inferences (Article 14), and tamper-evident audit logs (Article 12). Regulayer provides an Enterprise AI compliance software proxy that natively satisfies these requirements before inferences reach the user.'
                }
            },
            {
                '@type': 'Question',
                'name': 'What is AI Risk Management?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'AI Risk Management is the systemic identification, interception, and mitigation of algorithmic bias, hallucinations, and data leaks. Regulayer enforces ISO 42001 and NIST AI RMF standards by physically severing violating LLM payloads at the network block level.'
                }
            },
            {
                '@type': 'Question',
                'name': 'Why is generative AI observability not enough for compliance?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'AI observability tools only log failures after they occur. In a regulatory context (such as the EU AI Act), recording an unmanaged algorithmic violation without a firewall to stop it constitutes legal negligence. Regulayer replaces passive observability with active network interception.'
                }
            },
            {
                '@type': 'Question',
                'name': 'What is the penalty for EU AI Act non-compliance?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'Under Article 71 of the EU AI Act, non-compliance penalties reach up to €35 million or 7% of total worldwide annual turnover, whichever is higher. This exceeds GDPR maximum penalties and applies to any organization deploying AI systems affecting EU citizens, regardless of where the organization is headquartered.'
                }
            },
            {
                '@type': 'Question',
                'name': 'What is the best alternative to LangSmith for AI compliance?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'LangSmith is an excellent AI observability tool for development and debugging, but it does not provide regulatory compliance enforcement. Regulayer is the purpose-built alternative for teams needing EU AI Act compliance, offering active network interception, Human-in-the-Loop governance queues, cryptographic audit trails, and automated conformity assessment generation — capabilities that passive observability tools cannot provide.'
                }
            },
            {
                '@type': 'Question',
                'name': 'How much does AI compliance software cost?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'Regulayer offers a free tier with 1,000 monthly AI decisions for development and prototyping. The Pro tier starts at $99/month for 50,000 decisions with full EU AI Act compliance features. Enterprise and Sovereign deployments with air-gapped VPC installation are available from $120,000 annually. All tiers include cryptographic audit trails and Human-in-the-Loop governance.'
                }
            }
        ]
    },
    {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Regulayer',
        'url': 'https://regulayer.tech',
        'potentialAction': {
            '@type': 'SearchAction',
            'target': {
                '@type': 'EntryPoint',
                'urlTemplate': 'https://regulayer.tech/docs?q={search_term_string}'
            },
            'query-input': 'required name=search_term_string'
        }
    },
    {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://regulayer.tech' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Documentation', 'item': 'https://regulayer.tech/docs' },
            { '@type': 'ListItem', 'position': 3, 'name': 'Architecture', 'item': 'https://regulayer.tech/architecture' },
            { '@type': 'ListItem', 'position': 4, 'name': 'Pricing', 'item': 'https://regulayer.tech/pricing' },
            { '@type': 'ListItem', 'position': 5, 'name': 'EU AI Act Checklist', 'item': 'https://regulayer.tech/eu-ai-act-compliance-checklist' },
            { '@type': 'ListItem', 'position': 6, 'name': 'AI Compliance Glossary', 'item': 'https://regulayer.tech/glossary' },
            { '@type': 'ListItem', 'position': 7, 'name': 'Compare', 'item': 'https://regulayer.tech/compare' },
            { '@type': 'ListItem', 'position': 8, 'name': 'Use Cases', 'item': 'https://regulayer.tech/use-cases' },
        ]
    },
    {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'speakable': {
            '@type': 'SpeakableSpecification',
            'cssSelector': ['h1', '.hero-description', 'article h2']
        },
        'about': [
            { '@type': 'Thing', 'name': 'EU AI Act', 'sameAs': 'https://en.wikipedia.org/wiki/Artificial_Intelligence_Act' },
            { '@type': 'Thing', 'name': 'AI Risk Management', 'sameAs': 'https://en.wikipedia.org/wiki/AI_alignment' },
            { '@type': 'Thing', 'name': 'ISO/IEC 42001', 'sameAs': 'https://www.iso.org/standard/81230.html' },
            { '@type': 'Thing', 'name': 'NIST AI RMF', 'sameAs': 'https://www.nist.gov/artificial-intelligence/executive-order-safe-secure-and-trustworthy-artificial-intelligence' }
        ]
    }
];

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

                {/* === ADVANCED SEO: JSON-LD Entity Stack === */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                {/* === ADVANCED SEO: hreflang Geo-Targeting === */}
                {/* Signals to Google this content serves ALL English-speaking markets */}
                <link rel="alternate" hrefLang="en" href="https://regulayer.tech" />
                <link rel="alternate" hrefLang="en-US" href="https://regulayer.tech" />
                <link rel="alternate" hrefLang="en-GB" href="https://regulayer.tech" />
                <link rel="alternate" hrefLang="en-IN" href="https://regulayer.tech" />
                <link rel="alternate" hrefLang="en-AU" href="https://regulayer.tech" />
                <link rel="alternate" hrefLang="en-SG" href="https://regulayer.tech" />
                <link rel="alternate" hrefLang="x-default" href="https://regulayer.tech" />

                {/* === ADVANCED SEO: IndexNow Key for Bing/Yandex Instant Indexing === */}
                <meta name="msvalidate.01" content="regulayer-indexnow-key" />

                {/* === ADVANCED SEO: Google Site Verification (replace with real key) === */}
                <meta name="google-site-verification" content="regulayer-google-verification" />

                {/* === ADVANCED SEO: Preload Critical Resources for Crawl Speed === */}
                <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
                <link rel="dns-prefetch" href="https://www.google-analytics.com" />

                {/* === ADVANCED SEO: Dublin Core Metadata (Legacy but Crawled) === */}
                <meta name="DC.title" content="Regulayer — EU AI Act Compliance & AI Risk Management Software" />
                <meta name="DC.creator" content="Regulayer Inc." />
                <meta name="DC.subject" content="AI Compliance; EU AI Act; AI Risk Management; ISO 42001; NIST AI RMF; Human-in-the-Loop; WORM Storage; Algorithmic Bias" />
                <meta name="DC.description" content="Enterprise AI compliance software providing real-time inference interception, cryptographic audit trails, and automated conformity assessment generation for EU AI Act and ISO 42001." />
                <meta name="DC.type" content="Software" />
                <meta name="DC.format" content="text/html" />
                <meta name="DC.language" content="en" />

                {/* === ADVANCED SEO: Citation & Academic Crawlability === */}
                <meta name="citation_title" content="Regulayer: Active Network Interception for EU AI Act Compliance" />
                <meta name="citation_author" content="Regulayer Engineering" />
                <meta name="citation_publication_date" content="2024" />
                <meta name="citation_journal_title" content="Regulayer Technical Documentation" />

                {/* === ADVANCED SEO: Apple/Mobile Deep Metadata === */}
                <meta name="apple-mobile-web-app-title" content="Regulayer AI Compliance" />
                <meta name="application-name" content="Regulayer" />
            </head>
            <body className="antialiased min-h-screen bg-background text-foreground" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
                <Providers>
                    {children}
                </Providers>

                {/* === ADVANCED SEO: Invisible Semantic Content Layer === */}
                {/* Crawlable but visually hidden rich text for semantic density */}
                <div aria-hidden="true" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
                    <article itemScope itemType="https://schema.org/TechArticle">
                        <h2 itemProp="headline">Regulayer: Enterprise AI Risk Management and EU AI Act Compliance Platform</h2>
                        <p itemProp="description">Regulayer is the first active network interception proxy designed specifically for EU AI Act compliance. Unlike passive AI observability tools such as LangSmith, Helicone, and Datadog AI Monitoring, Regulayer sits synchronously in the inference path between enterprise applications and Large Language Models. The platform evaluates every AI output against configurable compliance policies in under 20 milliseconds, automatically blocking outputs that violate EU AI Act Article 9 risk management requirements, Article 12 record-keeping obligations, or Article 14 human oversight mandates. All decisions are cryptographically sealed using Ed25519 digital signatures and SHA-256 hash chains, stored in Write-Once-Read-Many WORM compliant storage meeting SEC Rule 17a-4 requirements. The platform generates automated ISO/IEC 42001:2023 conformity assessments and Fundamental Rights Impact Assessments from operational telemetry, eliminating hundreds of hours of manual compliance preparation. Regulayer supports air-gapped VPC deployment for sovereign banking and government environments requiring zero external network telemetry.</p>
                        <span itemProp="keywords">EU AI Act compliance software, AI risk management, ISO 42001 certification, NIST AI RMF, algorithmic bias detection, LLM governance, Human-in-the-Loop AI, WORM storage compliance, Ed25519 audit, cryptographic AI compliance, LangSmith alternative, Helicone alternative, Datadog AI alternative, OneTrust AI governance, AI compliance proxy, enterprise AI security, GDPR Article 22, automated conformity assessment, FRIA generation, AI Act penalties</span>
                    </article>
                </div>
            </body>
        </html>
    );
}

