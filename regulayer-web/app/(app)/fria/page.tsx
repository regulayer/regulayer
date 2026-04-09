'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconHeartHandshake, IconPlus, IconChevronRight, IconX, IconCheck, IconClock, IconSend, IconFileText } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { FRIAAssessment, AISystem, getFRIAs, saveFRIA, getAISystems } from '@/lib/api';

const FUNDAMENTAL_RIGHTS = [
    'Right to Human Dignity', 'Right to Non-Discrimination', 'Right to Privacy & Data Protection',
    'Freedom of Expression', 'Right to an Effective Remedy', 'Rights of the Child',
    'Workers\' Rights', 'Rights of Persons with Disabilities',
];

export default function FRIAPage() {
    const [frias, setFrias] = useState<FRIAAssessment[]>([]);
    const [systems, setSystems] = useState<AISystem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedSystemId, setSelectedSystemId] = useState('');

    useEffect(() => {
        setFrias(getFRIAs());
        setSystems(getAISystems());
    }, []);

    const handleCreate = () => {
        const sys = systems.find(s => s.id === selectedSystemId);
        if (!sys) return;
        const newFria: FRIAAssessment = {
            id: crypto.randomUUID(), system_id: sys.id, system_name: sys.name, status: 'draft',
            deployer_info: { org_name: '', contact_person: '', dpo_name: '', dpo_email: '' },
            system_description: { purpose: sys.intended_purpose || '', scope: '', affected_groups: [], scale_of_use: '' },
            rights_analysis: FUNDAMENTAL_RIGHTS.map(r => ({ right_name: r, risk_identified: false, risk_description: '', risk_severity: 'none', affected_groups: [] })),
            mitigation_measures: [], human_oversight_plan: '', monitoring_commitments: '',
            created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        };
        saveFRIA(newFria);
        setFrias(getFRIAs());
        setShowModal(false);
        setSelectedSystemId('');
    };

    const STATUS_STYLES: Record<string, { bg: string; label: string; icon: React.ReactNode }> = {
        draft: { bg: 'bg-secondary text-muted-foreground border-border', label: 'Draft', icon: <IconFileText size={12} /> },
        in_progress: { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20', label: 'In Progress', icon: <IconClock size={12} /> },
        complete: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', label: 'Complete', icon: <IconCheck size={12} /> },
        submitted: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20', label: 'Submitted', icon: <IconSend size={12} /> },
    };

    return (
        <div className="p-6 md:p-10 pb-20 space-y-6 text-foreground">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Fundamental Rights Impact Assessment</h1>
                    <p className="text-muted-foreground text-sm">Assess impact on fundamental rights before deploying high-risk AI — Article 27.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
                    <IconPlus size={16} /> New FRIA
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total FRIAs', value: frias.length, color: 'text-foreground bg-secondary' },
                    { label: 'Draft', value: frias.filter(f => f.status === 'draft').length, color: 'text-muted-foreground bg-secondary' },
                    { label: 'Complete', value: frias.filter(f => f.status === 'complete').length, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' },
                    { label: 'Submitted', value: frias.filter(f => f.status === 'submitted').length, color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10' },
                ].map(s => (
                    <div key={s.label} className="bg-card border border-border rounded-2xl shadow-card p-5 hover:shadow-glow-sm hover:-translate-y-1 transition-all duration-300">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</p>
                        <p className="text-2xl font-bold mt-1">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                {frias.length === 0 ? (
                    <div className="p-20 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4"><IconHeartHandshake size={32} /></div>
                        <h3 className="text-lg font-medium">No impact assessments yet</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm">Create a FRIA for high-risk AI systems before deployment, as required by Article 27.</p>
                        <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm"><IconPlus size={16} className="inline mr-1" /> New FRIA</button>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {frias.map(f => {
                            const style = STATUS_STYLES[f.status] || STATUS_STYLES.draft;
                            const risksFound = f.rights_analysis.filter(r => r.risk_identified).length;
                            return (
                                <Link key={f.id} href={`/fria/${f.id}`} className="flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors group">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><IconHeartHandshake size={20} className="text-primary" /></div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-foreground truncate">{f.system_name || 'Unknown System'}</p>
                                            <p className="text-xs text-muted-foreground">{risksFound > 0 ? `${risksFound} risk${risksFound > 1 ? 's' : ''} identified` : 'No risks identified'} · {new Date(f.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", style.bg)}>{style.icon} {style.label}</span>
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
                        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">New FRIA</h2><button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><IconX size={20} /></button></div>
                        <div>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Select AI System</label>
                            <select value={selectedSystemId} onChange={e => setSelectedSystemId(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                                <option value="">Choose a system...</option>
                                {systems.map(s => <option key={s.id} value={s.id}>{s.name} (v{s.version})</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                            <button onClick={handleCreate} disabled={!selectedSystemId} className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">Create FRIA</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
