'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconArrowLeft, IconUrgent, IconClock, IconSend, IconCheck, IconDownload } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { IncidentReportData, getIncidentReport, saveIncidentReport } from '@/lib/api';

const FORM_FIELDS = [
    { key: 'system_name', label: 'AI System Name', type: 'input' },
    { key: 'system_version', label: 'System Version', type: 'input' },
    { key: 'ce_marking_number', label: 'CE Marking Number (if applicable)', type: 'input' },
    { key: 'incident_date', label: 'Incident Date', type: 'date' },
    { key: 'incident_description', label: 'Incident Description', type: 'textarea' },
    { key: 'timeline_of_events', label: 'Timeline of Events', type: 'textarea' },
    { key: 'affected_individuals', label: 'Affected Individuals / Scope', type: 'textarea' },
    { key: 'scope_description', label: 'Geographic & Operational Scope', type: 'textarea' },
    { key: 'root_cause', label: 'Root Cause Analysis', type: 'textarea' },
    { key: 'causal_link_assessment', label: 'Causal Link Assessment', type: 'textarea' },
    { key: 'corrective_actions_taken', label: 'Corrective Actions Taken', type: 'textarea' },
    { key: 'corrective_actions_planned', label: 'Corrective Actions Planned', type: 'textarea' },
];

export default function IncidentReportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const reportId = params.reportId as string;
    const [report, setReport] = useState<IncidentReportData | null>(null);

    useEffect(() => {
        const r = getIncidentReport(reportId);
        if (!r) { router.push('/incident-report'); return; }
        setReport(r);
    }, [reportId, router]);

    if (!report) return <div className="p-20 flex items-center justify-center"><div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin" /></div>;

    const update = (changes: Partial<IncidentReportData>) => {
        const updated = { ...report, ...changes, updated_at: new Date().toISOString() };
        saveIncidentReport(updated);
        setReport(updated);
    };

    const updateForm = (key: string, value: string) => {
        update({ form_data: { ...report.form_data, [key]: value } });
    };

    const remaining = Math.max(0, Math.ceil((new Date(report.deadline_date).getTime() - Date.now()) / 86400000));
    const progress = Math.max(0, Math.min(100, ((report.deadline_days - remaining) / report.deadline_days) * 100));
    const barColor = remaining > report.deadline_days * 0.5 ? 'bg-emerald-500' : remaining > report.deadline_days * 0.25 ? 'bg-amber-500' : 'bg-red-500 animate-pulse';

    const handleSubmit = () => {
        const authority = prompt('Enter the market surveillance authority name:');
        if (!authority) return;
        update({ status: 'submitted', authority_name: authority, submission_date: new Date().toISOString() });
    };

    const handleExport = () => {
        const lines = FORM_FIELDS.map(f => `${f.label}: ${(report.form_data as Record<string, string>)[f.key] || 'N/A'}`).join('\n\n');
        const content = `SERIOUS INCIDENT REPORT — EU AI ACT ARTICLE 73\n${'='.repeat(50)}\n\nSeverity: ${report.severity.replace(/_/g, ' ').toUpperCase()}\nDeadline: ${report.deadline_days} days (${new Date(report.deadline_date).toLocaleDateString()})\nStatus: ${report.status}\n\n${lines}\n\nAuthority: ${report.authority_name || 'Not submitted'}\nSubmission Date: ${report.submission_date ? new Date(report.submission_date).toLocaleDateString() : 'Not submitted'}\n\nGenerated: ${new Date().toLocaleString()}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `incident-report-${report.id.slice(0, 8)}.txt`;
        document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); document.body.removeChild(a);
    };

    return (
        <div className="p-6 md:p-10 pb-20 space-y-6 text-foreground max-w-3xl">
            <Link href="/incident-report" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <IconArrowLeft size={16} /> Back to Reports
            </Link>

            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><IconUrgent size={22} className="text-red-500" /></div>
                    Incident Report — {report.system_name}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">{report.severity.replace(/_/g, ' ')} · {report.deadline_days}-day reporting deadline</p>
            </div>

            {/* Deadline Bar */}
            <div className={cn("border rounded-2xl p-5", remaining <= 2 ? "bg-red-50 border-red-200 dark:bg-red-500/5 dark:border-red-500/20" : "bg-card border-border")}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2"><IconClock size={16} /> Reporting Deadline</span>
                    <span className={cn("text-lg font-bold", remaining <= 2 ? "text-red-500 animate-pulse" : remaining <= 5 ? "text-amber-500" : "text-foreground")}>
                        {remaining} day{remaining !== 1 ? 's' : ''} remaining
                    </span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-500", barColor)} style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>Created: {new Date(report.created_at).toLocaleDateString()}</span>
                    <span>Due: {new Date(report.deadline_date).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status:</span>
                {(['draft', 'under_review', 'submitted'] as const).map(s => (
                    <button key={s} onClick={() => { if (s !== 'submitted') update({ status: s }); else handleSubmit(); }}
                        className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize",
                            report.status === s ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/30")}>
                        {s.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            {/* Form */}
            <div className="bg-card border border-border rounded-2xl shadow-card p-6 space-y-5">
                <h3 className="text-sm font-semibold">Incident Details</h3>
                {FORM_FIELDS.map(field => (
                    <div key={field.key}>
                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">{field.label}</label>
                        {field.type === 'textarea' ? (
                            <textarea value={(report.form_data as Record<string, string>)[field.key] || ''} onChange={e => updateForm(field.key, e.target.value)}
                                rows={3} placeholder={`Enter ${field.label.toLowerCase()}...`}
                                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                        ) : field.type === 'date' ? (
                            <input type="date" value={(report.form_data as Record<string, string>)[field.key] || ''} onChange={e => updateForm(field.key, e.target.value)}
                                className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        ) : (
                            <input type="text" value={(report.form_data as Record<string, string>)[field.key] || ''} onChange={e => updateForm(field.key, e.target.value)}
                                placeholder={`Enter ${field.label.toLowerCase()}...`}
                                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        )}
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground border border-border rounded-lg text-sm font-medium hover:bg-secondary/80 transition-all">
                    <IconDownload size={16} /> Export Report
                </button>
                <div className="flex gap-3">
                    {report.status !== 'submitted' && report.status !== 'acknowledged' && (
                        <button onClick={handleSubmit} className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all inline-flex items-center gap-1">
                            <IconSend size={14} /> Submit to Authority
                        </button>
                    )}
                    {report.status === 'submitted' && (
                        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg text-sm text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                            <IconCheck size={14} /> Submitted to {report.authority_name} on {report.submission_date ? new Date(report.submission_date).toLocaleDateString() : '—'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
