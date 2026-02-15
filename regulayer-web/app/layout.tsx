import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Regulayer — Provable Trust for AI',
    description: 'The cryptographic trust layer for AI systems. Record, verify, and prove every AI decision with immutable proof.',
};

import Providers from './providers';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="antialiased">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
