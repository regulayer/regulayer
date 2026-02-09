
import React from 'react';
import Link from 'next/link';

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-64 flex-shrink-0">
                    <nav className="sticky top-24 space-y-2">
                        <h3 className="font-semibold text-slate-900 mb-4 px-3">Legal</h3>
                        <Link
                            href="/legal/terms"
                            className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            href="/legal/privacy"
                            className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/legal/dpa"
                            className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                            Data Processing Addendum
                        </Link>
                        <Link
                            href="/legal/cookies"
                            className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                            Cookie Policy
                        </Link>
                        <div className="pt-4 mt-4 border-t border-slate-200">
                            <Link
                                href="/security"
                                className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                Security
                            </Link>
                        </div>
                    </nav>
                </aside>
                <main className="flex-1 min-w-0 prose prose-slate max-w-none">
                    {children}
                </main>
            </div>
        </div>
    );
}
