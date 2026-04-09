import { Outfit, Space_Grotesk, Lilita_One, Syne } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const lilitaOne = Lilita_One({ weight: '400', subsets: ['latin'], variable: '--font-lilita' });
const footerDisplay = Syne({ subsets: ['latin'], variable: '--font-footer-display' });

export const metadata: Metadata = {
    title: 'Regulayer — Provable Trust for AI',
    description: 'The cryptographic trust layer for AI systems. Record, verify, and prove every AI decision with immutable proof.',
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
            </head>
            <body className="antialiased min-h-screen bg-background text-foreground" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
