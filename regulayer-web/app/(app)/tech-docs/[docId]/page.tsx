'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconArrowLeft, IconFileText, IconSparkles, IconCheck, IconCircleDashed, IconEdit, IconDownload } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { TechDocumentation, TechDocSection, getTechDoc, saveTechDoc } from '@/lib/api';

export default function TechDocDetailPage() {
    const params = useParams();
    const router = useRouter();
    const docId = params.docId as string;
    const [doc, setDoc] = useState<TechDocumentation | null>(null);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        getTechDoc(docId).then(d => {
            if (!d) { router.push('/tech-docs'); return; }
            setDoc(d);
            if (d.sections.length > 0) setActiveSection(d.sections[0].id);
        }).catch(() => router.push('/tech-docs'));
    }, [docId, router]);

    if (!doc) return <div className="p-20 flex items-center justify-center"><div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin" /></div>;

    const updateSection = (sectionId: string, updates: Partial<TechDocSection>) => {
        const sections = doc.sections.map(s => s.id === sectionId ? {
            ...s, ...updates, last_updated: new Date().toISOString(),
            completeness: (updates.content !== undefined ? (updates.content.trim().length > 50 ? 100 : updates.content.trim().length > 0 ? 50 : 0) : s.completeness),
        } : s);
        const overall = Math.round(sections.reduce((a, s) => a + s.completeness, 0) / sections.length);
        const updated = { ...doc, sections, overall_completeness: overall, updated_at: new Date().toISOString() };
        saveTechDoc(updated);
        setDoc(updated);
    };

    const current = doc.sections.find(s => s.id === activeSection);

    const handleExport = () => {
        const content = doc.sections.map(s => `## ${s.section_number}. ${s.title}\n\n${s.content || '_No content_'}\n`).join('\n---\n\n');
        const blob = new Blob([`# Technical Documentation — ${doc.system_name}\n\nGenerated: ${new Date().toLocaleDateString()}\nRegulation: EU AI Act (2024/1689) Article 11, Annex IV\n\n---\n\n${content}`], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `tech-doc-${doc.system_name?.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); document.body.removeChild(a);
    };

    return (
        <div className="p-6 md:p-10 pb-20 space-y-6 text-foreground">
            <Link href="/tech-docs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <IconArrowLeft size={16} /> Back to Documentation
            </Link>

            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><IconFileText size={22} className="text-primary" /></div>
                        {doc.system_name} — Technical Documentation
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Annex IV compliant · {doc.sections.length} sections · {doc.overall_completeness}% complete</p>
                </div>
                <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground border border-border rounded-lg text-sm font-medium hover:bg-secondary/80 transition-all">
                    <IconDownload size={16} /> Export
                </button>
            </div>

            {/* Overall Progress */}
            <div className="bg-card border border-border rounded-2xl shadow-card p-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Overall Completeness</span>
                    <span className="text-lg font-bold">{doc.overall_completeness}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-500", doc.overall_completeness === 100 ? "bg-emerald-500" : "bg-primary")} style={{ width: `${doc.overall_completeness}%` }} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-6">
                {/* Sidebar — Section List */}
                <div className="space-y-1">
                    {doc.sections.map(section => (
                        <button key={section.id} onClick={() => { setActiveSection(section.id); setEditMode(false); }}
                            className={cn("w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2",
                                activeSection === section.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground")}>
                            <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                                section.completeness === 100 ? "bg-emerald-500 text-white" :
                                section.completeness > 0 ? "bg-amber-500/20 text-amber-600" : "bg-secondary text-muted-foreground")}>
                                {section.completeness === 100 ? <IconCheck size={10} /> : section.section_number}
                            </span>
                            <span className="truncate">{section.title}</span>
                            {section.auto_populated && <IconSparkles size={12} className={cn("shrink-0", activeSection === section.id ? "text-primary-foreground/70" : "text-amber-500")} />}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                {current && (
                    <div className="bg-card border border-border rounded-2xl shadow-card p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">§{current.section_number}. {current.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    {current.auto_populated && <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"><IconSparkles size={12} /> Auto-populated</span>}
                                    <span className="text-xs text-muted-foreground">Last updated: {current.last_updated ? new Date(current.last_updated).toLocaleDateString() : 'Never'}</span>
                                    <span className={cn("text-xs font-medium", current.completeness === 100 ? "text-emerald-500" : current.completeness > 0 ? "text-amber-500" : "text-muted-foreground")}>
                                        {current.completeness}% complete
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setEditMode(!editMode)}
                                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all inline-flex items-center gap-1",
                                    editMode ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/30")}>
                                <IconEdit size={12} /> {editMode ? 'Preview' : 'Edit'}
                            </button>
                        </div>
                        <div className="min-h-[300px]">
                            {editMode ? (
                                <textarea value={current.content} onChange={e => updateSection(current.id, { content: e.target.value })}
                                    placeholder={`Write content for "${current.title}"...\n\nUse markdown formatting for headers, lists, and emphasis.`}
                                    className="w-full h-[400px] bg-secondary border border-border rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed" />
                            ) : (
                                <div className="prose prose-sm max-w-none">
                                    {current.content ? (
                                        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans bg-transparent border-none p-0 shadow-none">{current.content}</pre>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-center">
                                            <IconCircleDashed size={32} className="text-muted-foreground mb-2" />
                                            <p className="text-muted-foreground">No content yet. Click Edit to start writing.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
