import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Regulayer - Provable AI Decisions',
    description: 'Cryptographic trust layer for AI systems. Auditable forever. Verified offline.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}
