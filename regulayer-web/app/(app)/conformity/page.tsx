'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconCertificate, IconPlus, IconCheck, IconClock, IconAlertTriangle, IconChevronRight, IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { ConformityAssessment, ConformityChecklistItem, AISystem, getConformityAssessments, saveConformityAssessment, getAISystems } from '@/lib/api';

const DEFAULT_CHECKLIST: Omit<ConformityChecklistItem, 'id'>[] = [
    { article: 'Article 9', title: 'Risk Management System', description: 'Establish, implement, document and maintain a risk management system throughout the AI system lifecycle.', status: 'not_started', evidence_notes: '', evidence_links: [] },
    { article: 'Article 10', title: 'Data Governance', description: 'Training, validation and testing data sets shall be subject to appropriate data governance and management practices.', status: 'not_started', evidence_notes: '', evidence_links: [] },
    { article: 'Article 11', title: 'Technical Documentation', description: 'Technical documentation shall be drawn up before the system is placed on the market and shall be kept up to date.', status: 'not_started', evidence_notes: '', evidence_links: [] },
    { article: 'Article 12', title: 'Record-Keeping & Logging', description: 'High-risk AI systems shall technically allow for automatic recording of events (logs) over the lifetime of the system.', status: 'not_started', evidence_notes: '', evidence_links: [] },
    { article: 'Article 13', title: 'Transparency & User Instructions', description: 'High-risk AI systems shall be designed to ensure their operation is sufficiently transparent to enable deployers to interpret the system output.', status: 'not_started', evidence_notes: '', evidence_links: [] },
    { article: 'Article 14', title: 'Human Oversight Measures', description: 'High-risk AI systems shall be designed to allow effective oversight by natural persons during use.', status: 'not_started', evidence_notes: '', evidence_links: [] },
    { article: 'Article 15', title: 'Accuracy, Robustness & Cybersecurity', description: 'High-risk AI systems shall be designed to achieve appropriate levels of accuracy, robustness, and cybersecurity.', status: 'not_started', evidence_notes: '', evidence_links: [] },
    { article: 'Article 17', title: 'Quality Management System', description: 'Providers shall put a quality management system in place that ensures compliance with the regulation.', status: 'not_started', evidence_notes: '', evidence_links: [] },
    { article: 'Article 72', title: 'Post-Market Monitoring Plan', description: 'Providers shall establish and document a post-market monitoring system proportionate to the nature of the AI technologies.', status: 'not_started', evidence_notes: '', evidence_links: [] },
];

export default function ConformityPage() {
    const [assessments, setAssessments] = useState<ConformityAssessment[]>([]);
    const [systems, setSystems] = useState<AISystem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedSystemId, setSelectedSystemId] = useState('');

    useEffect(() => {
        setAssessments(getConformityAssessments());
        setSystems(getAISystems());
    }, []);

    const handleCreate = () => {
        const sys = systems.find(s => s.id === selectedSystemId);
        if (!sys) return;
        const newAssessment: ConformityAssessment = {
            id: crypto.randomUUID(),
            system_id: sys.id,
            system_name: sys.name,
            status: 'not_started',
            checklist: DEFAULT_CHECKLIST.map(item => ({ ...item, id: crypto.randomUUID() })),
            ce_declaration_generated: false,
            assessment_type: 'internal',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        saveConformityAssessment(newAssessment);
        setAssessments(getConformityAssessments());
        setShowModal(false);
        setSelectedSystemId('');
    };

    const getProgress = (a: ConformityAssessment) => {
        const total = a.checklist.length;
        const done = a.checklist.filter(i => i.status === 'complete' || i.status === 'not_applicable').length;
        return total > 0 ? Math.round((done / total) * 100) : 0;
    };

    const statusStyles: Record<string, { bg: string; label: string }> = {
        not_started: { bg: 'bg-secondary text-muted-foreground border-border', label: 'Not Started' },
        in_progress: { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20', label: 'In Progress' },
        complete: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', label: 'Complete' },
        expired: { bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20', label: 'Expired' },
    };

    const totalPassed = assessments.filter(a => a.status === 'complete').length;
    const totalActive = assessments.filter(a => a.status === 'in_progress').length;

    return (
        <div className="p-6 md:p-10 pb-20 space-y-6 text-foreground">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Conformity Assessment</h1>
                    <p className="text-muted-foreground text-sm">Verify EU AI Act compliance for high-risk AI systems — Article 43.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
                    <IconPlus size={16} /> New Assessment
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: assessments.length, icon: <IconCertificate size={18} />, color: 'text-foreground bg-secondary' },
                    { label: 'Passed', value: totalPassed, icon: <IconCheck size={18} />, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' },
                    { label: 'Active', value: totalActive, icon: <IconClock size={18} />, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10' },
                    { label: 'Not Started', value: assessments.filter(a => a.status === 'not_started').length, icon: <IconAlertTriangle size={18} />, color: 'text-muted-foreground bg-secondary' },
                ].map(s => (
                    <div key={s.label} className="bg-card border border-border rounded-2xl shadow-card p-5 hover:shadow-glow-sm hover:-translate-y-1 transition-all duration-300">
                        <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center mb-2', s.color)}>{s.icon}</div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</p>
                        <p className="text-2xl font-bold mt-1">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                {assessments.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4"><IconCertificate size={32} /></div>
                        <h3 className="text-lg font-medium">No assessments yet</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm">Create a conformity assessment to begin verifying EU AI Act compliance for your AI systems.</p>
                        <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
                            <IconPlus size={16} className="inline mr-1" /> New Assessment
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {assessments.map(a => {
                            const progress = getProgress(a);
                            const style = statusStyles[a.status] || statusStyles.not_started;
                            return (
                                <Link key={a.id} href={`/conformity/${a.id}`} className="flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors group">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><IconCertificate size={20} className="text-primary" /></div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-foreground truncate">{a.system_name || 'Unknown System'}</p>
                                            <p className="text-xs text-muted-foreground">{a.assessment_type === 'internal' ? 'Internal Control' : 'Third-Party'} · Created {new Date(a.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="w-32 hidden md:block">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", style.bg)}>{style.label}</span>
                                        {a.ce_declaration_generated && <span className="text-emerald-500 text-xs font-semibold">CE ✓</span>}
                                        <IconChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">New Conformity Assessment</h2>
                            <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><IconX size={20} /></button>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Select AI System</label>
                            <select value={selectedSystemId} onChange={e => setSelectedSystemId(e.target.value)}
                                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                                <option value="">Choose a system...</option>
                                {systems.filter(s => s.risk_tier === 'high' || s.risk_tier === 'limited').map(s => (
                                    <option key={s.id} value={s.id}>{s.name} (v{s.version}) — {s.risk_tier} risk</option>
                                ))}
                                {systems.filter(s => s.risk_tier !== 'high' && s.risk_tier !== 'limited').map(s => (
                                    <option key={s.id} value={s.id}>{s.name} (v{s.version})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                            <button onClick={handleCreate} disabled={!selectedSystemId} className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">Create Assessment</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
