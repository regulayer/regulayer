'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconArrowLeft, IconCheck, IconClock, IconX, IconCircleDashed, IconCertificate, IconDownload, IconInfoCircle } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { ConformityAssessment, ConformityChecklistItem, getConformityAssessment, saveConformityAssessment } from '@/lib/api';

const STATUS_OPTS: { value: ConformityChecklistItem['status']; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'not_started', label: 'Not Started', icon: <IconCircleDashed size={14} />, color: 'text-muted-foreground' },
    { value: 'in_progress', label: 'In Progress', icon: <IconClock size={14} />, color: 'text-amber-500' },
    { value: 'complete', label: 'Complete', icon: <IconCheck size={14} />, color: 'text-emerald-500' },
    { value: 'not_applicable', label: 'N/A', icon: <IconX size={14} />, color: 'text-muted-foreground' },
];

export default function ConformityDetailPage() {
    const params = useParams();
    const router = useRouter();
    const assessmentId = params.assessmentId as string;
    const [assessment, setAssessment] = useState<ConformityAssessment | null>(null);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    useEffect(() => {
        getConformityAssessment(assessmentId).then(a => {
            if (!a) { router.push('/conformity'); return; }
            setAssessment(a);
        }).catch(() => router.push('/conformity'));
    }, [assessmentId, router]);

    if (!assessment) return <div className="p-20 flex items-center justify-center"><div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin" /></div>;

    const updateChecklist = (itemId: string, updates: Partial<ConformityChecklistItem>) => {
        const updatedChecklist = assessment.checklist.map(item =>
            item.id === itemId ? { ...item, ...updates, ...(updates.status === 'complete' ? { completed_at: new Date().toISOString() } : {}) } : item
        );
        const doneCount = updatedChecklist.filter(i => i.status === 'complete' || i.status === 'not_applicable').length;
        const newStatus = doneCount === updatedChecklist.length ? 'complete' : doneCount > 0 ? 'in_progress' : 'not_started';
        const updated: ConformityAssessment = { ...assessment, checklist: updatedChecklist, status: newStatus, updated_at: new Date().toISOString(), ...(newStatus === 'complete' ? { completed_at: new Date().toISOString() } : {}) };
        saveConformityAssessment(updated);
        setAssessment(updated);
    };

    const progress = Math.round((assessment.checklist.filter(i => i.status === 'complete' || i.status === 'not_applicable').length / assessment.checklist.length) * 100);

    const handleGenerateCE = () => {
        const updated = { ...assessment, ce_declaration_generated: true, updated_at: new Date().toISOString() };
        saveConformityAssessment(updated);
        setAssessment(updated);
        alert('EU Declaration of Conformity generated! In production, this would create a downloadable PDF document with provider details, system identification, and conformity reference.');
    };

    return (
        <div className="p-6 md:p-10 pb-20 space-y-6 text-foreground max-w-4xl">
            <Link href="/conformity" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <IconArrowLeft size={16} /> Back to Assessments
            </Link>

            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><IconCertificate size={22} className="text-primary" /></div>
                        {assessment.system_name || 'Conformity Assessment'}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">{assessment.assessment_type === 'internal' ? 'Internal Control' : 'Third-Party Assessment'} · {assessment.checklist.length} requirements</p>
                </div>
            </div>

            {/* Progress */}
            <div className="bg-card border border-border rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Overall Progress</h3>
                    <span className="text-2xl font-bold text-foreground">{progress}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-500", progress === 100 ? "bg-emerald-500" : "bg-primary")} style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{assessment.checklist.filter(i => i.status === 'complete').length} complete · {assessment.checklist.filter(i => i.status === 'in_progress').length} in progress · {assessment.checklist.filter(i => i.status === 'not_started').length} remaining</span>
                    {progress === 100 && !assessment.ce_declaration_generated && (
                        <button onClick={handleGenerateCE} className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors inline-flex items-center gap-1">
                            <IconDownload size={14} /> Generate CE Declaration
                        </button>
                    )}
                    {assessment.ce_declaration_generated && <span className="text-emerald-500 font-semibold">CE Declaration Generated ✓</span>}
                </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
                {assessment.checklist.map(item => {
                    const isExpanded = expandedItem === item.id;
                    const statusOpt = STATUS_OPTS.find(o => o.value === item.status) || STATUS_OPTS[0];
                    return (
                        <div key={item.id} className={cn("bg-card border rounded-2xl shadow-card overflow-hidden transition-all",
                            item.status === 'complete' ? "border-emerald-200 dark:border-emerald-500/20" : "border-border")}>
                            <button onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shrink-0",
                                        item.status === 'complete' ? "bg-emerald-500 border-emerald-500 text-white" :
                                        item.status === 'in_progress' ? "bg-amber-500/20 border-amber-500 text-amber-500" :
                                        "bg-secondary border-border text-muted-foreground")}>
                                        {item.status === 'complete' ? <IconCheck size={14} /> : <span className="text-[10px] font-bold">{item.article.replace('Article ', '')}</span>}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground">{item.article} — {item.title}</p>
                                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                    </div>
                                </div>
                                <span className={cn("text-xs font-medium shrink-0 ml-3 inline-flex items-center gap-1", statusOpt.color)}>
                                    {statusOpt.icon} {statusOpt.label}
                                </span>
                            </button>
                            {isExpanded && (
                                <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                                    <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-lg p-3 flex gap-2">
                                        <IconInfoCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                        <p className="text-xs text-amber-800 dark:text-amber-300">{item.description}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Status</label>
                                        <div className="flex gap-2">
                                            {STATUS_OPTS.map(opt => (
                                                <button key={opt.value} onClick={() => updateChecklist(item.id, { status: opt.value })}
                                                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all inline-flex items-center gap-1",
                                                        item.status === opt.value ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/30")}>
                                                    {opt.icon} {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Evidence Notes</label>
                                        <textarea value={item.evidence_notes} onChange={e => updateChecklist(item.id, { evidence_notes: e.target.value })}
                                            placeholder="Describe how this requirement is met, link to relevant documentation..." rows={3}
                                            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
