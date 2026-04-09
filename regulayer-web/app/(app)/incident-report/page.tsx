'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconUrgent, IconPlus, IconClock, IconAlertOctagon, IconAlertTriangle, IconHeartHandshake, IconChevronRight, IconX, IconCheck, IconSend } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { IncidentReportData, AISystem, getIncidentReports, saveIncidentReport, getAISystems } from '@/lib/api';

const SEVERITY_CONFIG = {
    death: { label: 'Death / Serious Health Damage', deadline: 10, icon: <IconAlertOctagon size={16} />, color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' },
    critical_infrastructure: { label: 'Critical Infrastructure Disruption', deadline: 2, icon: <IconAlertTriangle size={16} />, color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
    fundamental_rights: { label: 'Fundamental Rights Breach', deadline: 15, icon: <IconHeartHandshake size={16} />, color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' },
};

export default function IncidentReportPage() {
    const [reports, setReports] = useState<IncidentReportData[]>([]);
    const [systems, setSystems] = useState<AISystem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newSeverity, setNewSeverity] = useState<'death' | 'critical_infrastructure' | 'fundamental_rights'>('fundamental_rights');
    const [selectedSystemId, setSelectedSystemId] = useState('');

    useEffect(() => {
        setReports(getIncidentReports());
        setSystems(getAISystems());
    }, []);

    const handleCreate = () => {
        const sys = systems.find(s => s.id === selectedSystemId);
        if (!sys) return;
        const now = new Date();
        const deadline = new Date(now);
        deadline.setDate(deadline.getDate() + SEVERITY_CONFIG[newSeverity].deadline);
        const report: IncidentReportData = {
            id: crypto.randomUUID(), system_id: sys.id, system_name: sys.name,
            severity: newSeverity, deadline_days: SEVERITY_CONFIG[newSeverity].deadline,
            deadline_date: deadline.toISOString(), status: 'draft',
            form_data: { system_name: sys.name, system_version: sys.version, ce_marking_number: '', incident_description: '', incident_date: now.toISOString().split('T')[0], timeline_of_events: '', affected_individuals: '', scope_description: '', root_cause: '', causal_link_assessment: '', corrective_actions_taken: '', corrective_actions_planned: '' },
            authority_name: '', linked_incident_ids: [], created_at: now.toISOString(), updated_at: now.toISOString(),
        };
        saveIncidentReport(report);
        setReports(getIncidentReports());
        setShowModal(false);
        setSelectedSystemId('');
    };

    const getDaysRemaining = (deadline: string) => Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
    const getDeadlineProgress = (report: IncidentReportData) => {
        const remaining = getDaysRemaining(report.deadline_date);
        return Math.max(0, Math.min(100, ((report.deadline_days - remaining) / report.deadline_days) * 100));
    };

    const getBarColor = (report: IncidentReportData) => {
        const remaining = getDaysRemaining(report.deadline_date);
        const pct = remaining / report.deadline_days;
        if (pct > 0.5) return 'bg-emerald-500';
        if (pct > 0.25) return 'bg-amber-500';
        return 'bg-red-500 animate-pulse';
    };

    const STATUS_STYLES: Record<string, { bg: string; label: string }> = {
        draft: { bg: 'bg-secondary text-muted-foreground border-border', label: 'Draft' },
        under_review: { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20', label: 'Under Review' },
        submitted: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', label: 'Submitted' },
        acknowledged: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20', label: 'Acknowledged' },
    };

    const activeReports = reports.filter(r => r.status !== 'submitted' && r.status !== 'acknowledged');

    return (
        <div className="p-6 md:p-10 pb-20 space-y-6 text-foreground">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Incident Reporting</h1>
                    <p className="text-muted-foreground text-sm">Report serious incidents to EU market surveillance authorities — Article 73.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all shadow-sm">
                    <IconUrgent size={16} /> Report Incident
                </button>
            </div>

            {/* Active Deadline Alerts */}
            {activeReports.length > 0 && (
                <div className="space-y-3">
                    {activeReports.map(report => {
                        const remaining = getDaysRemaining(report.deadline_date);
                        const sev = SEVERITY_CONFIG[report.severity];
                        return (
                            <Link key={report.id} href={`/incident-report/${report.id}`}
                                className={cn("block border rounded-2xl p-5 hover:shadow-md transition-all", remaining <= 2 ? "bg-red-50 border-red-200 dark:bg-red-500/5 dark:border-red-500/20" : "bg-card border-border")}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {sev.icon}
                                        <span className="text-sm font-medium">{report.system_name}</span>
                                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", sev.color)}>{sev.label}</span>
                                    </div>
                                    <span className={cn("text-sm font-bold", remaining <= 2 ? "text-red-500 animate-pulse" : remaining <= 5 ? "text-amber-500" : "text-foreground")}>
                                        {remaining} day{remaining !== 1 ? 's' : ''} remaining
                                    </span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full transition-all duration-500", getBarColor(report))} style={{ width: `${getDeadlineProgress(report)}%` }} />
                                </div>
                                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                    <span>Created: {new Date(report.created_at).toLocaleDateString()}</span>
                                    <span>Deadline: {new Date(report.deadline_date).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Reports', value: reports.length, icon: <IconUrgent size={18} />, color: 'text-foreground bg-secondary' },
                    { label: 'Draft', value: reports.filter(r => r.status === 'draft').length, icon: <IconClock size={18} />, color: 'text-muted-foreground bg-secondary' },
                    { label: 'Submitted', value: reports.filter(r => r.status === 'submitted').length, icon: <IconSend size={18} />, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' },
                    { label: 'Overdue', value: reports.filter(r => getDaysRemaining(r.deadline_date) === 0 && r.status !== 'submitted' && r.status !== 'acknowledged').length, icon: <IconAlertOctagon size={18} />, color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10' },
                ].map(s => (
                    <div key={s.label} className="bg-card border border-border rounded-2xl shadow-card p-5 hover:shadow-glow-sm hover:-translate-y-1 transition-all duration-300">
                        <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center mb-2', s.color)}>{s.icon}</div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</p>
                        <p className="text-2xl font-bold mt-1">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* All Reports Table */}
            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                {reports.length === 0 ? (
                    <div className="p-20 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4"><IconUrgent size={32} /></div>
                        <h3 className="text-lg font-medium">No incident reports</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm">When serious incidents occur, report them here within the mandatory EU AI Act timelines.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-background border-b border-border">
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">System</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Severity</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deadline</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="text-right py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {reports.map(report => {
                                    const sev = SEVERITY_CONFIG[report.severity];
                                    const remaining = getDaysRemaining(report.deadline_date);
                                    const style = STATUS_STYLES[report.status] || STATUS_STYLES.draft;
                                    return (
                                        <tr key={report.id} className="hover:bg-secondary/50 transition-colors">
                                            <td className="py-3 px-5 font-medium">{report.system_name || 'Unknown'}</td>
                                            <td className="py-3 px-5"><span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", sev.color)}>{sev.icon} {report.deadline_days}d</span></td>
                                            <td className="py-3 px-5"><span className={cn("text-xs font-medium", remaining <= 2 ? "text-red-500" : "text-muted-foreground")}>{remaining}d remaining</span></td>
                                            <td className="py-3 px-5"><span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", style.bg)}>{style.label}</span></td>
                                            <td className="py-3 px-5 text-right">
                                                <Link href={`/incident-report/${report.id}`} className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                                                    Open <IconChevronRight size={14} />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-5">
                        <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-red-600">Report Serious Incident</h2><button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><IconX size={20} /></button></div>
                        <div>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Incident Severity</label>
                            <div className="space-y-2">
                                {(Object.entries(SEVERITY_CONFIG) as [keyof typeof SEVERITY_CONFIG, typeof SEVERITY_CONFIG[keyof typeof SEVERITY_CONFIG]][]).map(([key, config]) => (
                                    <button key={key} onClick={() => setNewSeverity(key)}
                                        className={cn("w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between",
                                            newSeverity === key ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                                        <div className="flex items-center gap-2">
                                            {config.icon}
                                            <span className="text-sm font-medium">{config.label}</span>
                                        </div>
                                        <span className="text-xs font-bold text-red-500">{config.deadline} days</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">AI System</label>
                            <select value={selectedSystemId} onChange={e => setSelectedSystemId(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                                <option value="">Choose a system...</option>
                                {systems.map(s => <option key={s.id} value={s.id}>{s.name} (v{s.version})</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                            <button onClick={handleCreate} disabled={!selectedSystemId} className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50">Create Report</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
