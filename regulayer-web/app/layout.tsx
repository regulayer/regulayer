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
            <body className="antialiased flex flex-col min-h-screen">
                <div className="bg-amber-100 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs font-mono text-center">
                    <span className="font-bold">NOTICE:</span> Regulayer verifies cryptographic integrity, not real-world timestamps or AI safety relative to human values.
                </div>
                <div className="flex-1">
                    {children}
                </div>
            </body>
        </html>
    );
}
