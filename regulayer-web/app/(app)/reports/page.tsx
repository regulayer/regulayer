'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    IconDownload,
    IconShieldCheck,
    IconLink,
    IconInfoCircle,
    IconFileAnalytics,
    IconLoader2,
    IconChevronRight,
    IconAlertCircle,
    IconChartBar,
    IconClock,
    IconArrowRight,
} from '@tabler/icons-react';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import api, {
    getGovernanceReport,
    getIncidentsReport,
    getUsageReport,
    getSlaReport,
    GovernanceReport,
    IncidentsReport,
    UsageReport,
    SlaReport,
    addExportRecord,
} from '@/lib/api';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    RadialBarChart, RadialBar,
} from 'recharts';

/* -------- Report card definitions -------- */
interface ReportOption {
    id: string;
    title: string;
    description: string;
    endpoint: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}

const reportOptions: ReportOption[] = [
    {
        id: 'chain',
        title: 'Chain Integrity Report',
        description: 'Cryptographic proof that the historical record chain is intact with hash excerpts and verification status.',
        endpoint: '/v1/reports/chain/default',
        icon: IconLink,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
    },
    {
        id: 'governance',
        title: 'Governance Summary',
        description: 'Complete overview of all governance reviews, approvals, rejections, and escalations.',
        endpoint: '/v1/reports/governance',
        icon: IconFileAnalytics,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
    },
    {
        id: 'incidents',
        title: 'Incident Summary',
        description: 'All trust incidents, their severity, resolution status, and linked decision records.',
        endpoint: '/v1/reports/incidents',
        icon: IconShieldCheck,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
    },
    {
        id: 'usage',
        title: 'Usage Report',
        description: 'Decision volume, API calls, storage usage, and rate limit metrics over the billing period.',
        endpoint: '/v1/reports/usage',
        icon: IconChartBar,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
    },
    {
        id: 'sla',
        title: 'SLA Report',
        description: 'Service level agreement compliance — uptime, latency percentiles, and governance response times.',
        endpoint: '/v1/reports/sla',
        icon: IconShieldCheck,
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500/10',
    },
];

/* -------- Report card component -------- */
function ReportCard({ report }: { report: ReportOption }) {
    const [downloading, setDownloading] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const downloadFile = async (format: 'json' | 'pdf') => {
        const isPdf = format === 'pdf';
        isPdf ? setDownloadingPdf(true) : setDownloading(true);
        setError(null);
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

            // Track in export history
            addExportRecord({
                report_type: report.id,
                report_title: report.title,
                format,
                status: 'completed',
                file_size_estimate: isPdf ? '~250 KB' : '~12 KB',
            });
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to generate report. The endpoint may not be available yet.');
            }
            addExportRecord({
                report_type: report.id,
                report_title: report.title,
                format,
                status: 'failed',
            });
        } finally {
            isPdf ? setDownloadingPdf(false) : setDownloading(false);
        }
    };

    return (
        <GlazedCard className="group relative overflow-hidden transition-all hover:shadow-lg">
            <div className="p-6 flex flex-col sm:flex-row gap-6">
                <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center shrink-0', report.bgColor)}>
                    <report.icon size={28} className={report.color} />
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-2">
                        {report.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                        {report.description}
                    </p>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mb-4 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-100 dark:border-red-500/20">
                            <IconAlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => downloadFile('json')}
                            disabled={downloading}
                            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg font-medium hover:bg-secondary disabled:opacity-50 transition-all shadow-sm"
                        >
                            {downloading ? <IconLoader2 className="animate-spin" size={18} /> : <IconDownload size={18} />}
                            {downloading ? 'Generating...' : 'Download JSON'}
                        </button>
                        <button
                            onClick={() => downloadFile('pdf')}
                            disabled={downloadingPdf}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 disabled:opacity-50 transition-all shadow-sm"
                        >
                            {downloadingPdf ? <IconLoader2 className="animate-spin" size={18} /> : <IconFileAnalytics size={18} />}
                            {downloadingPdf ? 'Generating...' : 'Download PDF'}
                        </button>
                    </div>
                </div>
            </div>
        </GlazedCard>
    );
}

/* -------- Metric stat component -------- */
function MetricStat({ label, value, icon: Icon, color, subtext }: {
    label: string; value: string | number; icon: React.ElementType; color: string; subtext?: string;
}) {
    return (
        <GlazedCard className="p-5">
            <div className="flex items-center gap-3 mb-2">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', color)}>
                    <Icon size={18} className="text-current" />
                </div>
            </div>
            <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            {subtext && <p className="text-[10px] text-muted-foreground mt-0.5">{subtext}</p>}
        </GlazedCard>
    );
}

/* -------- Custom pie tooltip -------- */
const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
                <p className="font-semibold text-foreground">{payload[0].name}</p>
                <p className="text-muted-foreground">{payload[0].value} decisions</p>
            </div>
        );
    }
    return null;
};

/* ======== MAIN PAGE ======== */
export default function ReportsPage() {
    const [govReport, setGovReport] = useState<GovernanceReport | null>(null);
    const [incidentsReport, setIncidentsReport] = useState<IncidentsReport | null>(null);
    const [usageReport, setUsageReport] = useState<UsageReport | null>(null);
    const [slaReport, setSlaReport] = useState<SlaReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const fetchReportData = async () => {
            try {
                const [gov, inc, usage, sla] = await Promise.allSettled([
                    getGovernanceReport(),
                    getIncidentsReport(),
                    getUsageReport(),
                    getSlaReport(),
                ]);
                if (gov.status === 'fulfilled') setGovReport(gov.value.data);
                if (inc.status === 'fulfilled') setIncidentsReport(inc.value.data);
                if (usage.status === 'fulfilled') setUsageReport(usage.value.data);
                if (sla.status === 'fulfilled') setSlaReport(sla.value.data);
            } catch (err) {
                console.error('Failed to load report data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
        const intervalId = setInterval(fetchReportData, 15000);
        return () => clearInterval(intervalId);
    }, []);

    /* --- Chart data --- */
    const govPieData = govReport
        ? [
            { name: 'Approved', value: govReport.approved, color: '#10b981' },
            { name: 'Rejected', value: govReport.rejected, color: '#ef4444' },
            { name: 'Escalations', value: govReport.escalations, color: '#f59e0b' },
        ]
        : [];

    const slaBarData = slaReport
        ? [
            { name: 'Uptime %', value: slaReport.uptime_percentage, fill: '#10b981' },
            { name: 'P95 Latency (ms)', value: slaReport.p95_latency_ms, fill: '#6366f1' },
            { name: 'Queue Time (min)', value: slaReport.governance_queue_time_avg_minutes, fill: '#f59e0b' },
        ]
        : [];

    const incidentBarData = incidentsReport
        ? [
            { name: 'Active', value: incidentsReport.active_incidents, fill: '#ef4444' },
            { name: 'Resolved', value: incidentsReport.resolved_incidents, fill: '#10b981' },
        ]
        : [];

    return (
        <div className="p-6 md:p-10 pb-20 space-y-8 text-foreground">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Reports & Analytics
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Generate trust and compliance reports for regulators and auditors.
                    </p>
                </div>
                <Link
                    href="/exports"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg transition-colors"
                >
                    <IconDownload size={16} /> View Exports
                    <IconArrowRight size={14} />
                </Link>
            </div>

            {/* Report Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricStat
                    label="Total Flagged"
                    value={govReport?.total_flagged ?? '—'}
                    icon={IconFileAnalytics}
                    color="bg-indigo-500/10 text-indigo-500"
                    subtext={govReport?.period}
                />
                <MetricStat
                    label="Decisions Recorded"
                    value={usageReport ? usageReport.decisions_recorded.toLocaleString() : '—'}
                    icon={IconChartBar}
                    color="bg-amber-500/10 text-amber-500"
                />
                <MetricStat
                    label="Uptime"
                    value={slaReport ? `${slaReport.uptime_percentage}%` : '—'}
                    icon={IconShieldCheck}
                    color="bg-emerald-500/10 text-emerald-500"
                />
                <MetricStat
                    label="Avg Queue Time"
                    value={slaReport ? `${slaReport.governance_queue_time_avg_minutes} min` : '—'}
                    icon={IconClock}
                    color="bg-cyan-500/10 text-cyan-500"
                />
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Governance Breakdown - Pie */}
                <GlazedCard className="p-6">
                    <h3 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
                        <IconFileAnalytics className="text-indigo-500" size={18} />
                        Governance Breakdown
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                        {govReport?.period || 'Trailing 30 Days'} — {govReport?.total_flagged ?? 0} total reviews
                    </p>
                    <div className="h-[220px] w-full">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <IconLoader2 className="animate-spin text-muted-foreground" size={24} />
                            </div>
                        ) : govPieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={govPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {govPieData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={(value: string) => (
                                            <span className="text-xs text-muted-foreground">{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                No governance data available
                            </div>
                        )}
                    </div>
                </GlazedCard>

                {/* SLA Metrics - Bar */}
                <GlazedCard className="p-6">
                    <h3 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
                        <IconShieldCheck className="text-emerald-500" size={18} />
                        SLA Performance
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                        Key performance indicators
                    </p>
                    <div className="h-[220px] w-full">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <IconLoader2 className="animate-spin text-muted-foreground" size={24} />
                            </div>
                        ) : slaBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={slaBarData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                        width={110}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        }}
                                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                        {slaBarData.map((entry, i) => (
                                            <Cell key={i} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                No SLA data available
                            </div>
                        )}
                    </div>
                </GlazedCard>

                {/* Incident Status - Bar */}
                <GlazedCard className="p-6">
                    <h3 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
                        <IconAlertCircle className="text-red-500" size={18} />
                        Incident Status
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                        MTTR: {incidentsReport ? `${incidentsReport.mean_time_to_resolution_hours}h` : '—'}
                    </p>
                    <div className="h-[220px] w-full">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <IconLoader2 className="animate-spin text-muted-foreground" size={24} />
                            </div>
                        ) : incidentBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={incidentBarData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        }}
                                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                                        {incidentBarData.map((entry, i) => (
                                            <Cell key={i} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                No incident data available
                            </div>
                        )}
                    </div>
                </GlazedCard>
            </div>

            {/* Trust Verification Banner */}
            <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex gap-4">
                <IconInfoCircle className="text-amber-600 dark:text-amber-400 shrink-0" size={24} />
                <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-300">Verification Note</h4>
                    <p className="text-sm text-amber-800/80 dark:text-amber-400/70 mt-1 mb-3">
                        Reports generated here document organizational process. For cryptographic proof of specific decisions, use the
                        <span className="font-mono mx-1 bg-amber-100 dark:bg-amber-500/10 px-1 rounded">regulayer-cli</span>
                        offline verification tool.
                    </p>
                    <a
                        href="/regulayer-verify.py"
                        download="regulayer-verify.py"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <IconDownload size={16} />
                        Download Offline Tool (.py)
                    </a>
                </div>
            </div>

            {/* Report Options */}
            <div className="grid gap-6">
                {reportOptions.map((report) => (
                    <ReportCard key={report.id} report={report} />
                ))}
            </div>

            {/* Decision-specific Reports Link */}
            <GlazedCard className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">Looking for specific decision proofs?</h3>
                    <p className="text-muted-foreground text-sm">
                        You can download evidence bundles for individual decisions from the Governance dashboard.
                    </p>
                </div>
                <Link
                    href="/governance"
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-lg font-medium shadow-sm hover:shadow-md hover:bg-slate-700 transition-all whitespace-nowrap"
                >
                    Go to Governance <IconChevronRight size={18} />
                </Link>
            </GlazedCard>
        </div>
    );
}
