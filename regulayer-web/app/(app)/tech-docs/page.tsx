'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconFileText, IconPlus, IconChevronRight, IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { TechDocumentation, TechDocSection, AISystem, getTechDocs, saveTechDoc, getAISystems } from '@/lib/api';

const ANNEX_IV_TEMPLATE: Omit<TechDocSection, 'id'>[] = [
    { section_number: '1', title: 'General System Description', content: '', auto_populated: true, last_updated: '', completeness: 0 },
    { section_number: '2', title: 'System Architecture & Elements', content: '', auto_populated: false, last_updated: '', completeness: 0 },
    { section_number: '3', title: 'Development Process', content: '', auto_populated: false, last_updated: '', completeness: 0 },
    { section_number: '4', title: 'Monitoring & Control Interfaces', content: '', auto_populated: true, last_updated: '', completeness: 0 },
    { section_number: '5', title: 'Risk Management Documentation', content: '', auto_populated: true, last_updated: '', completeness: 0 },
    { section_number: '6', title: 'Validation & Testing', content: '', auto_populated: false, last_updated: '', completeness: 0 },
    { section_number: '7', title: 'Data Governance', content: '', auto_populated: false, last_updated: '', completeness: 0 },
    { section_number: '8', title: 'Logging Capabilities', content: '', auto_populated: true, last_updated: '', completeness: 0 },
    { section_number: '9', title: 'Instructions for Use', content: '', auto_populated: false, last_updated: '', completeness: 0 },
    { section_number: '10', title: 'Post-Market Monitoring Plan', content: '', auto_populated: true, last_updated: '', completeness: 0 },
];

export default function TechDocsPage() {
    const [docs, setDocs] = useState<TechDocumentation[]>([]);
    const [systems, setSystems] = useState<AISystem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedSystemId, setSelectedSystemId] = useState('');

    useEffect(() => {
        setDocs(getTechDocs());
        setSystems(getAISystems());
    }, []);

    const handleCreate = () => {
        const sys = systems.find(s => s.id === selectedSystemId);
        if (!sys) return;
        const now = new Date().toISOString();
        const sections = ANNEX_IV_TEMPLATE.map(s => ({
            ...s, id: crypto.randomUUID(), last_updated: now,
            content: s.section_number === '1' ? `# ${sys.name}\n\n**Version:** ${sys.version}\n**Provider:** ${sys.provider_name}\n**Intended Purpose:** ${sys.intended_purpose}\n**Description:** ${sys.description}\n**Risk Classification:** ${sys.risk_tier}\n**Deployment Date:** ${sys.deployment_date || 'Not yet deployed'}\n**Member States:** ${sys.member_states.join(', ') || 'Not specified'}` : '',
            completeness: s.section_number === '1' ? 100 : 0,
        }));
        const newDoc: TechDocumentation = {
            id: crypto.randomUUID(), system_id: sys.id, system_name: sys.name,
            sections, overall_completeness: Math.round(sections.reduce((a, s) => a + s.completeness, 0) / sections.length),
            created_at: now, updated_at: now,
        };
        saveTechDoc(newDoc);
        setDocs(getTechDocs());
        setShowModal(false);
        setSelectedSystemId('');
    };

    return (
        <div className="p-6 md:p-10 pb-20 space-y-6 text-foreground">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Technical Documentation</h1>
                    <p className="text-muted-foreground text-sm">Generate Annex IV compliant documentation — Article 11.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
                    <IconPlus size={16} /> New Documentation
                </button>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                {docs.length === 0 ? (
                    <div className="p-20 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4"><IconFileText size={32} /></div>
                        <h3 className="text-lg font-medium">No documentation yet</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm">Create technical documentation with auto-populated sections from Regulayer data.</p>
                        <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm"><IconPlus size={16} className="inline mr-1" /> New Documentation</button>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {docs.map(doc => (
                            <Link key={doc.id} href={`/tech-docs/${doc.id}`} className="flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors group">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><IconFileText size={20} className="text-primary" /></div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-foreground truncate">{doc.system_name || 'Unknown System'}</p>
                                        <p className="text-xs text-muted-foreground">{doc.sections.length} sections · {doc.sections.filter(s => s.auto_populated).length} auto-populated</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="w-32 hidden md:block">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1"><span>{doc.overall_completeness}%</span></div>
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all duration-500", doc.overall_completeness === 100 ? "bg-emerald-500" : "bg-primary")} style={{ width: `${doc.overall_completeness}%` }} />
                                        </div>
                                    </div>
                                    <IconChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
                        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">New Technical Documentation</h2><button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><IconX size={20} /></button></div>
                        <div>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Select AI System</label>
                            <select value={selectedSystemId} onChange={e => setSelectedSystemId(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                                <option value="">Choose a system...</option>
                                {systems.map(s => <option key={s.id} value={s.id}>{s.name} (v{s.version})</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                            <button onClick={handleCreate} disabled={!selectedSystemId} className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">Create Documentation</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
