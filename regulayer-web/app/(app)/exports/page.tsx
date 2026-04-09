'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    IconDownload,
    IconFileAnalytics,
    IconLink,
    IconShieldCheck,
    IconChartBar,
    IconClock,
    IconCheck,
    IconX,
    IconTrash,
    IconLoader2,
    IconFileTypePdf,
    IconFileTypeJs,
    IconHistory,
    IconAlertCircle,
    IconArrowRight,
} from '@tabler/icons-react';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import api, {
    getExportHistory,
    addExportRecord,
    clearExportHistory,
    ExportRecord,
} from '@/lib/api';

/* -------- Report type definitions -------- */
interface ReportType {
    id: string;
    title: string;
    description: string;
    endpoint: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}

const reportTypes: ReportType[] = [
    {
        id: 'chain',
        title: 'Chain Integrity',
        description: 'Cryptographic hash‑chain verification proof',
        endpoint: '/v1/reports/chain/default',
        icon: IconLink,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
    },
    {
        id: 'governance',
        title: 'Governance Summary',
        description: 'Reviews, approvals & escalations',
        endpoint: '/v1/reports/governance',
        icon: IconFileAnalytics,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
    },
    {
        id: 'incidents',
        title: 'Incident Summary',
        description: 'Trust incidents and resolution status',
        endpoint: '/v1/reports/incidents',
        icon: IconShieldCheck,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
    },
    {
        id: 'usage',
        title: 'Usage Report',
        description: 'Decision volume, API calls & storage',
        endpoint: '/v1/reports/usage',
        icon: IconChartBar,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
    },
    {
        id: 'sla',
        title: 'SLA Report',
        description: 'Uptime, latency & queue times',
        endpoint: '/v1/reports/sla',
        icon: IconShieldCheck,
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500/10',
    },
];

/* -------- Stat card -------- */
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
    return (
        <GlazedCard className="p-5">
            <div className="flex items-center gap-3 mb-2">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', color)}>
                    <Icon size={18} className="text-current" />
                </div>
            </div>
            <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </GlazedCard>
    );
}

/* ======== MAIN PAGE ======== */
export default function ExportsPage() {
    const [history, setHistory] = useState<ExportRecord[]>([]);
    const [downloading, setDownloading] = useState<Record<string, boolean>>({});

    const refreshHistory = useCallback(() => {
        setHistory(getExportHistory());
    }, []);

    useEffect(() => {
        refreshHistory();
    }, [refreshHistory]);

    /* ----- download handler ----- */
    const handleExport = async (report: ReportType, format: 'json' | 'pdf') => {
        const key = `${report.id}_${format}`;
        setDownloading((d) => ({ ...d, [key]: true }));

        try {
            const res = await api.get(`${report.endpoint}?format=${format}`, {
                responseType: 'blob',
            });

            const blob = res.data;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report.id}_report_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Track in history
            addExportRecord({
                report_type: report.id,
                report_title: report.title,
                format,
                status: 'completed',
                file_size_estimate: format === 'pdf' ? '~250 KB' : '~12 KB',
            });
            refreshHistory();
        } catch (err) {
            addExportRecord({
                report_type: report.id,
                report_title: report.title,
                format,
                status: 'failed',
            });
            refreshHistory();
        } finally {
            setDownloading((d) => ({ ...d, [key]: false }));
        }
    };

    const handleClearHistory = () => {
        clearExportHistory();
        refreshHistory();
    };

    /* ----- stats ----- */
    const totalExports = history.length;
    const completedExports = history.filter((e) => e.status === 'completed').length;
    const failedExports = history.filter((e) => e.status === 'failed').length;
    const jsonExports = history.filter((e) => e.format === 'json').length;
    const pdfExports = history.filter((e) => e.format === 'pdf').length;
    const uniqueReports = new Set(history.map((e) => e.report_type)).size;

    return (
        <div className="p-6 md:p-10 pb-20 space-y-8 text-foreground">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Exports</h1>
                    <p className="text-muted-foreground mt-1">
                        Download compliance reports and track your export history.
                    </p>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={handleClearHistory}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg border border-red-200 dark:border-red-500/20 transition-colors"
                    >
                        <IconTrash size={16} /> Clear History
                    </button>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard label="Total Exports" value={totalExports} icon={IconDownload} color="bg-primary/10 text-primary" />
                <StatCard label="Completed" value={completedExports} icon={IconCheck} color="bg-emerald-500/10 text-emerald-500" />
                <StatCard label="Failed" value={failedExports} icon={IconX} color="bg-red-500/10 text-red-500" />
                <StatCard label="JSON Exports" value={jsonExports} icon={IconFileTypeJs} color="bg-blue-500/10 text-blue-500" />
                <StatCard label="PDF Exports" value={pdfExports} icon={IconFileTypePdf} color="bg-orange-500/10 text-orange-500" />
                <StatCard label="Report Types" value={`${uniqueReports} / ${reportTypes.length}`} icon={IconFileAnalytics} color="bg-violet-500/10 text-violet-500" />
            </div>

            {/* Quick Export */}
            <GlazedCard className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-1">Quick Export</h2>
                <p className="text-sm text-muted-foreground mb-6">
                    Generate and download compliance reports in JSON or PDF format.
                </p>

                <div className="grid gap-3">
                    {reportTypes.map((report) => (
                        <div
                            key={report.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', report.bgColor)}>
                                    <report.icon size={20} className={report.color} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-foreground">{report.title}</h3>
                                    <p className="text-xs text-muted-foreground">{report.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 ml-auto sm:ml-0">
                                <button
                                    onClick={() => handleExport(report, 'json')}
                                    disabled={downloading[`${report.id}_json`]}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-secondary transition-colors disabled:opacity-50"
                                >
                                    {downloading[`${report.id}_json`] ? (
                                        <IconLoader2 className="animate-spin" size={14} />
                                    ) : (
                                        <IconFileTypeJs size={14} className="text-blue-500" />
                                    )}
                                    JSON
                                </button>
                                <button
                                    onClick={() => handleExport(report, 'pdf')}
                                    disabled={downloading[`${report.id}_pdf`]}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
                                >
                                    {downloading[`${report.id}_pdf`] ? (
                                        <IconLoader2 className="animate-spin" size={14} />
                                    ) : (
                                        <IconFileTypePdf size={14} className="text-orange-300" />
                                    )}
                                    PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </GlazedCard>

            {/* Export History Table */}
            <GlazedCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <IconHistory className="text-primary" size={20} /> Export History
                    </h2>
                    <span className="text-xs text-muted-foreground">
                        {history.length} record{history.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                            <IconDownload size={28} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-1">No exports yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Use the Quick Export section above to generate your first compliance report.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left">
                                    <th className="pb-3 font-medium text-muted-foreground">Report</th>
                                    <th className="pb-3 font-medium text-muted-foreground">Format</th>
                                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                                    <th className="pb-3 font-medium text-muted-foreground">Size</th>
                                    <th className="pb-3 font-medium text-muted-foreground text-right">Exported</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {history.slice(0, 25).map((record, idx) => (
                                        <motion.tr
                                            key={record.id}
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="border-b border-border/50 last:border-0"
                                        >
                                            <td className="py-3 pr-4">
                                                <span className="font-medium text-foreground">{record.report_title}</span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className={cn(
                                                    'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                                                    record.format === 'json'
                                                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                        : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                                )}>
                                                    {record.format === 'json' ? <IconFileTypeJs size={12} /> : <IconFileTypePdf size={12} />}
                                                    {record.format.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className={cn(
                                                    'inline-flex items-center gap-1 text-xs font-medium',
                                                    record.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                                )}>
                                                    {record.status === 'completed' ? <IconCheck size={12} /> : <IconAlertCircle size={12} />}
                                                    {record.status === 'completed' ? 'Completed' : 'Failed'}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-muted-foreground text-xs">
                                                {record.file_size_estimate || '—'}
                                            </td>
                                            <td className="py-3 text-right text-muted-foreground text-xs">
                                                <span className="inline-flex items-center gap-1">
                                                    <IconClock size={12} />
                                                    {new Date(record.exported_at).toLocaleString()}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        {history.length > 25 && (
                            <p className="text-xs text-muted-foreground mt-4 text-center">
                                Showing 25 of {history.length} exports.
                            </p>
                        )}
                    </div>
                )}
            </GlazedCard>
        </div>
    );
}
