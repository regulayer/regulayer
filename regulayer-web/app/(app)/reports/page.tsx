'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    IconDownload,
    IconShieldCheck,
    IconLink,
    IconInfoCircle,
    IconFileAnalytics,
    IconLoader2,
    IconChevronRight,
    IconAlertCircle
} from '@tabler/icons-react';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ReportOption {
    id: string;
    title: string;
    description: string;
    endpoint: string;
    icon: React.ElementType;
    color: string;
}

const reportOptions: ReportOption[] = [
    {
        id: 'system',
        title: 'System Trust Report',
        description: 'Static document describing Regulayer\'s trust architecture. Suitable for regulator briefings.',
        endpoint: '/v1/reports/system',
        icon: IconShieldCheck,
        color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/10'
    },
    {
        id: 'chain',
        title: 'Chain Integrity Report',
        description: 'Shows whether the historical record chain is intact with hash excerpts.',
        endpoint: '/v1/reports/chain/default',
        icon: IconLink,
        color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10'
    },
    {
        id: 'compliance',
        title: 'Compliance Summary',
        description: 'Aggregated view of all decisions and their automated policy check results.',
        endpoint: '/v1/reports/compliance',
        icon: IconFileAnalytics,
        color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/10'
    }
];

function ReportCard({ report }: { report: ReportOption }) {
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const downloadReport = async () => {
        setDownloading(true);
        setError(null);
        try {
            const token = localStorage.getItem('regulayer_token');
            // Check if endpoint is mock or real
            // For now, we simulate download if it's a mock
            if (report.endpoint.includes('compliance')) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                alert("Compliance report generation is simulated in this demo.");
                return;
            }

            const res = await fetch(`${API_URL}${report.endpoint}?format=json`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (!res.ok) {
                // If 404, might be missing backend route, handle gracefully for demo
                if (res.status === 404) {
                    throw new Error("Report template not found on server.");
                }
                throw new Error(`Failed to generate report: ${res.status}`);
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report.id}_report.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setDownloading(false);
        }
    };

    return (
        <GlazedCard className="group relative overflow-hidden transition-all hover:border-indigo-500/30">
            <div className="p-6 flex flex-col sm:flex-row gap-6">
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center shrink-0", report.color)}>
                    <report.icon size={28} />
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                        {report.title}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
                        {report.description}
                    </p>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mb-4 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                            <IconAlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            onClick={downloadReport}
                            disabled={downloading}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-zinc-500/10 dark:shadow-none"
                        >
                            {downloading ? <IconLoader2 className="animate-spin" size={18} /> : <IconDownload size={18} />}
                            {downloading ? 'Generating...' : 'Download JSON'}
                        </button>
                    </div>
                </div>
            </div>
        </GlazedCard>
    );
}

export default function ReportsPage() {
    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                        Reports & Analytics
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Generate trust and compliance reports for regulators and auditors.
                    </p>
                </div>
            </div>

            {/* Trust Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex gap-4">
                <IconInfoCircle className="text-amber-600 dark:text-amber-500 shrink-0" size={24} />
                <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-200">Verification Note</h4>
                    <p className="text-sm text-amber-800/80 dark:text-amber-500/80 mt-1">
                        Reports generated here document organizational process. For cryptographic proof of specific decisions, use the
                        <span className="font-mono mx-1 bg-amber-100 dark:bg-amber-900/40 px-1 rounded">regulayer-cli</span>
                        offline verification tool.
                    </p>
                </div>
            </div>

            {/* Report Options */}
            <div className="grid gap-6">
                {reportOptions.map((report) => (
                    <ReportCard key={report.id} report={report} />
                ))}
            </div>

            {/* Decision-specific Reports Link */}
            <GlazedCard className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10">
                <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Looking for specific decision proofs?</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        You can download evidence bundles for individual decisions from the Governance dashboard.
                    </p>
                </div>
                <Link
                    href="/governance"
                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium shadow-sm hover:shadow-md transition-all border border-zinc-200 dark:border-zinc-700 whitespace-nowrap"
                >
                    Go to Governance <IconChevronRight size={18} />
                </Link>
            </GlazedCard>
        </div>
    );
}
