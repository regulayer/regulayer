'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FileText,
    Download,
    Shield,
    Link as LinkIcon,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ReportOption {
    id: string;
    title: string;
    description: string;
    endpoint: string;
    icon: React.ReactNode;
}

const reportOptions: ReportOption[] = [
    {
        id: 'system',
        title: 'System Trust Report',
        description: 'Static document describing Regulayer\'s trust architecture. Suitable for regulator briefings.',
        endpoint: '/v1/reports/system',
        icon: <Shield className="w-6 h-6" />
    },
    {
        id: 'chain',
        title: 'Chain Integrity Report',
        description: 'Shows whether the historical record chain is intact with hash excerpts.',
        endpoint: '/v1/reports/chain/default',
        icon: <LinkIcon className="w-6 h-6" />
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
            const res = await fetch(`${API_URL}${report.endpoint}?format=json`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (!res.ok) {
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
        } catch (err: any) {
            setError(err.message);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
                    {report.icon}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{report.title}</h3>
                    <p className="text-slate-500 text-sm mb-4">{report.description}</p>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={downloadReport}
                        disabled={downloading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
                    >
                        <Download className="w-4 h-4" />
                        {downloading ? 'Generating...' : 'Download JSON'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ReportsPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                    <p className="text-slate-600">Generate trust and compliance reports for regulators and auditors.</p>
                </div>

                {/* Trust Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <strong>Note:</strong> Reports are generated from pre-verified data. They document organizational process
                        and do not constitute independent cryptographic verification. For verification, use the offline proof tools.
                    </div>
                </div>

                {/* Report Options */}
                <div className="space-y-4">
                    {reportOptions.map((report) => (
                        <ReportCard key={report.id} report={report} />
                    ))}
                </div>

                {/* Decision-specific Reports */}
                <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
                    <h2 className="font-semibold text-slate-900 mb-2">Decision-Specific Reports</h2>
                    <p className="text-slate-500 text-sm mb-4">
                        To generate a trust report for a specific decision, navigate to the decision in the
                        <Link href="/governance" className="text-primary-600 hover:underline mx-1">Governance</Link>
                        section and use the "Download Evidence Bundle" option.
                    </p>
                </div>
            </div>
        </div>
    );
}
