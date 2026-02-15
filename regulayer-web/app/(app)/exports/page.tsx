'use client';

import { useState, useEffect } from 'react';
import {
    IconDownload,
    IconFileDescription,
    IconShieldLock,
    IconChevronDown,
    IconCopy,
    IconCheck,
    IconLock,
    IconAlertTriangle,
    IconLoader2
} from '@tabler/icons-react';
import { getMe } from '@/lib/api';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// Types
// ============================================================

interface Export {
    id: string;
    type: 'proof_bundle' | 'governance_report' | 'trust_report' | 'submission_package';
    name: string;
    createdAt: string;
    size: string;
    hash?: string;
}

// Mock Data (replace with API when available)
const MOCK_EXPORTS: Export[] = [
    {
        id: 'exp_12345678',
        type: 'proof_bundle',
        name: 'Weekly Decision Proof Bundle',
        createdAt: new Date().toISOString(),
        size: '1.2 GB',
        hash: '0x8f...2a1b'
    },
    {
        id: 'exp_87654321',
        type: 'governance_report',
        name: 'Q1 Governance Compliance Report',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        size: '4.5 MB',
    }
];

// ============================================================
// Export Type Badge
// ============================================================

function ExportTypeBadge({ type }: { type: string }) {
    const styles = {
        proof_bundle: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        governance_report: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        trust_report: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        submission_package: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    };

    // @ts-ignore
    const s = styles[type] || 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border", s)}>
            {type.replace(/_/g, ' ')}
        </span>
    );
}

// ============================================================
// Export Row
// ============================================================

function ExportRow({ exp }: { exp: Export }) {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const copyHash = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!exp.hash) return;
        navigator.clipboard.writeText(exp.hash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
            <div
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <IconFileDescription size={20} />
                    </div>
                    <div>
                        <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{exp.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-zinc-500">{new Date(exp.createdAt).toLocaleDateString()}</span>
                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                            <span className="text-xs text-zinc-500 font-mono">{exp.size}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <ExportTypeBadge type={exp.type} />
                    <button className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                        <IconDownload size={18} />
                    </button>
                    <IconChevronDown
                        size={16}
                        className={cn("text-zinc-400 transition-transform duration-300", expanded && "rotate-180")}
                    />
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-zinc-50/50 dark:bg-black/20"
                    >
                        <div className="p-4 pl-[72px] grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <h5 className="text-xs font-semibold text-zinc-500 uppercase mb-1">Export ID</h5>
                                <code className="text-zinc-700 dark:text-zinc-300 font-mono">{exp.id}</code>
                            </div>
                            {exp.hash && (
                                <div>
                                    <h5 className="text-xs font-semibold text-zinc-500 uppercase mb-1">Cryptographic Hash</h5>
                                    <div className="flex items-center gap-2">
                                        <IconLock size={12} className="text-emerald-500" />
                                        <code className="text-zinc-700 dark:text-zinc-300 font-mono">{exp.hash}</code>
                                        <button
                                            onClick={copyHash}
                                            className="ml-auto text-zinc-400 hover:text-indigo-500"
                                        >
                                            {copied ? <IconCheck size={14} className="text-emerald-500" /> : <IconCopy size={14} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================================
// Main Exports Page
// ============================================================

export default function ExportsPage() {
    const [loading, setLoading] = useState(true);
    const [hasOrg, setHasOrg] = useState(false);

    useEffect(() => {
        checkOrg();
    }, []);

    const checkOrg = async () => {
        try {
            const me = await getMe();
            if (me.data?.org) {
                setHasOrg(true);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-indigo-500 animate-spin" />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                        Exports & Reports
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Cryptographic proof bundles and compliance reports.
                    </p>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
                    <IconDownload size={18} />
                    New Export
                </button>
            </div>

            <GlazedCard className="overflow-hidden">
                {!hasOrg ? (
                    <div className="p-12 text-center text-zinc-500">
                        Need an organization to view exports.
                    </div>
                ) : (
                    <div>
                        {MOCK_EXPORTS.map(exp => (
                            <ExportRow key={exp.id} exp={exp} />
                        ))}
                    </div>
                )}
            </GlazedCard>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex gap-4">
                <IconAlertTriangle className="text-amber-600 dark:text-amber-500 shrink-0" size={24} />
                <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-200">Retention Policy</h4>
                    <p className="text-sm text-amber-800/80 dark:text-amber-500/80 mt-1">
                        Exported files are available for download for 30 days. Cryptographic hashes are permanent and can be verified offline using the Regulayer CLI tool.
                    </p>
                </div>
            </div>
        </div>
    );
}
