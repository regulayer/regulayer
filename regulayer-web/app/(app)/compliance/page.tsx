'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { IconTargetArrow, IconCheck, IconX, IconAlertTriangle, IconChevronRight } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
    AISystem, ComplianceScore, ComplianceArticleScore,
    getAISystems, getConformityAssessments, getFRIAs, getTechDocs, getMonitoringPlans, getIncidentReports,
} from '@/lib/api';

const ENFORCEMENT_DATE = new Date('2026-08-02T00:00:00Z');

const ARTICLES = [
    { article: 'Art. 9', title: 'Risk Management System', key: 'rms' },
    { article: 'Art. 10', title: 'Data Governance', key: 'data' },
    { article: 'Art. 11', title: 'Technical Documentation', key: 'techdoc' },
    { article: 'Art. 12', title: 'Record-Keeping & Logging', key: 'logging' },
    { article: 'Art. 13', title: 'Transparency', key: 'transparency' },
    { article: 'Art. 14', title: 'Human Oversight', key: 'hitl' },
    { article: 'Art. 15', title: 'Accuracy & Robustness', key: 'accuracy' },
    { article: 'Art. 27', title: 'FRIA', key: 'fria' },
    { article: 'Art. 43', title: 'Conformity Assessment', key: 'conformity' },
    { article: 'Art. 72', title: 'Post-Market Monitoring', key: 'pmm' },
];

const EU_DB_CHECKLIST = [
    'AI system name and description',
    'Intended purpose statement',
    'Conformity assessment status',
    'CE marking declaration',
    'Provider contact information',
    'Member states of deployment',
    'FRIA completion status',
];

export default function CompliancePage() {
    const [systems, setSystems] = useState<AISystem[]>([]);
    const [selectedSystemId, setSelectedSystemId] = useState<string>('');
    const [scores, setScores] = useState<ComplianceScore[]>([]);

    useEffect(() => {
        const sys = getAISystems();
        setSystems(sys);
        if (sys.length > 0) setSelectedSystemId(sys[0].id);

        // Compute scores
        const conformity = getConformityAssessments();
        const frias = getFRIAs();
        const techDocs = getTechDocs();
        const monitoring = getMonitoringPlans();

        const computed: ComplianceScore[] = sys.map(system => {
            const sysConformity = conformity.find(c => c.system_id === system.id);
            const sysFria = frias.find(f => f.system_id === system.id);
            const sysDoc = techDocs.find(d => d.system_id === system.id);
            const sysMon = monitoring.find(m => m.system_id === system.id);

            const articleScores: ComplianceArticleScore[] = ARTICLES.map(art => {
                let score = 0;
                const gaps: string[] = [];

                if (art.key === 'conformity') {
                    if (sysConformity?.status === 'complete') score = 100;
                    else if (sysConformity) {
                        const done = sysConformity.checklist.filter(i => i.status === 'complete' || i.status === 'not_applicable').length;
                        score = Math.round((done / sysConformity.checklist.length) * 100);
                        gaps.push('Complete all conformity checklist items');
                    } else {
                        gaps.push('Create a conformity assessment');
                    }
                } else if (art.key === 'fria') {
                    if (sysFria?.status === 'submitted') score = 100;
                    else if (sysFria?.status === 'complete') score = 80;
                    else if (sysFria) { score = 40; gaps.push('Complete and submit FRIA'); }
                    else { gaps.push('Create a FRIA'); }
                } else if (art.key === 'techdoc') {
                    if (sysDoc) score = sysDoc.overall_completeness;
                    if (score < 100) gaps.push('Complete all technical documentation sections');
                } else if (art.key === 'pmm') {
                    if (sysMon) score = 100;
                    else gaps.push('Set up a post-market monitoring plan');
                } else if (art.key === 'logging') {
                    score = 100; // Regulayer provides this inherently
                } else if (art.key === 'hitl') {
                    score = 100; // Governance queue provides this
                } else if (art.key === 'rms') {
                    const item = sysConformity?.checklist.find(i => i.article === 'Article 9');
                    if (item?.status === 'complete') score = 100;
                    else if (item?.status === 'in_progress') { score = 50; gaps.push('Complete risk management documentation'); }
                    else { score = 0; gaps.push('Document risk management system in conformity assessment'); }
                } else if (art.key === 'data') {
                    const item = sysConformity?.checklist.find(i => i.article === 'Article 10');
                    if (item?.status === 'complete') score = 100;
                    else { score = 0; gaps.push('Document data governance practices'); }
                } else if (art.key === 'transparency') {
                    const item = sysConformity?.checklist.find(i => i.article === 'Article 13');
                    if (item?.status === 'complete') score = 100;
                    else { score = 0; gaps.push('Provide transparency and user instructions'); }
                } else if (art.key === 'accuracy') {
                    if (sysMon && sysMon.kpis.length > 0) score = 80;
                    const item = sysConformity?.checklist.find(i => i.article === 'Article 15');
                    if (item?.status === 'complete') score = 100;
                    else gaps.push('Document accuracy and robustness measures');
                }

                return {
                    article: art.article, title: art.title, score,
                    status: score === 100 ? 'complete' : score > 0 ? 'partial' : 'missing',
                    gaps,
                };
            });

            const overall = Math.round(articleScores.reduce((a, s) => a + s.score, 0) / articleScores.length);

            // EU Database checklist
            const regChecklist = EU_DB_CHECKLIST.map(item => {
                let complete = false;
                if (item.includes('name')) complete = !!system.name && !!system.description;
                if (item.includes('purpose')) complete = !!system.intended_purpose;
                if (item.includes('Conformity')) complete = sysConformity?.status === 'complete';
                if (item.includes('CE')) complete = !!sysConformity?.ce_declaration_generated;
                if (item.includes('Provider')) complete = !!system.provider_name;
                if (item.includes('Member')) complete = system.member_states.length > 0;
                if (item.includes('FRIA')) complete = sysFria?.status === 'complete' || sysFria?.status === 'submitted';
                return { item, complete: !!complete };
            });

            return {
                system_id: system.id, system_name: system.name, overall_percentage: overall,
                article_scores: articleScores, eu_database_ready: regChecklist.every(r => r.complete),
                registration_checklist: regChecklist, last_calculated: new Date().toISOString(),
            };
        });

        setScores(computed);
    }, []);

    const daysUntilEnforcement = Math.max(0, Math.ceil((ENFORCEMENT_DATE.getTime() - Date.now()) / 86400000));
    const selectedScore = scores.find(s => s.system_id === selectedSystemId);
    const orgScore = scores.length > 0 ? Math.round(scores.reduce((a, s) => a + s.overall_percentage, 0) / scores.length) : 0;

    const allGaps = useMemo(() => {
        if (!selectedScore) return [];
        return selectedScore.article_scores.filter(a => a.gaps.length > 0).flatMap(a => a.gaps.map(g => ({ article: a.article, gap: g, href: getArticleLink(a.article) })));
    }, [selectedScore]);

    return (
        <div className="p-6 md:p-10 pb-20 space-y-6 text-foreground">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">EU AI Act Compliance</h1>
                <p className="text-muted-foreground text-sm">Your organization's readiness for the August 2, 2026 enforcement date.</p>
            </div>

            {/* Countdown + Org Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={cn("bg-card border rounded-2xl shadow-card p-6 flex flex-col items-center justify-center text-center",
                    daysUntilEnforcement <= 30 ? "border-red-200 dark:border-red-500/20" : "border-border")}>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Days Until Enforcement</p>
                    <div className={cn("text-5xl font-bold tracking-tight", daysUntilEnforcement <= 30 ? "text-red-500 animate-pulse" : daysUntilEnforcement <= 60 ? "text-amber-500" : "text-primary")}>
                        {daysUntilEnforcement}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">August 2, 2026</p>
                    <p className="text-xs text-muted-foreground mt-2">Regulation (EU) 2024/1689</p>
                </div>
                <div className="bg-card border border-border rounded-2xl shadow-card p-6 flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Organization Readiness</p>
                    <div className="relative w-28 h-28">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                            <circle cx="50" cy="50" r="42" fill="none" stroke={orgScore >= 80 ? '#10b981' : orgScore >= 50 ? '#f59e0b' : '#ef4444'}
                                strokeWidth="8" strokeDasharray={`${orgScore * 2.64} 264`} strokeLinecap="round" className="transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold">{orgScore}%</span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{systems.length} system{systems.length !== 1 ? 's' : ''} registered</p>
                </div>
            </div>

            {/* Per-System Scores */}
            {scores.length > 0 && (
                <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border bg-background">
                        <h3 className="text-sm font-semibold">Per-System Compliance</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {scores.map(score => (
                            <button key={score.system_id} onClick={() => setSelectedSystemId(score.system_id)}
                                className={cn("w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors", selectedSystemId === score.system_id && "bg-secondary/30")}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                                        score.overall_percentage >= 80 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" :
                                        score.overall_percentage >= 50 ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" :
                                        "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400")}>
                                        {score.overall_percentage}%
                                    </div>
                                    <div className="text-left min-w-0">
                                        <p className="font-medium text-foreground truncate">{score.system_name}</p>
                                        <p className="text-xs text-muted-foreground">{score.article_scores.filter(a => a.status === 'complete').length}/{ARTICLES.length} articles complete</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="w-24 hidden md:block">
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all duration-500",
                                                score.overall_percentage >= 80 ? "bg-emerald-500" : score.overall_percentage >= 50 ? "bg-amber-500" : "bg-red-500")}
                                                style={{ width: `${score.overall_percentage}%` }} />
                                        </div>
                                    </div>
                                    {score.eu_database_ready && <span className="text-xs text-emerald-500 font-semibold">EU DB ✓</span>}
                                    <IconChevronRight size={16} className="text-muted-foreground" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Article Breakdown for selected system */}
            {selectedScore && (
                <>
                    <div className="bg-card border border-border rounded-2xl shadow-card p-5">
                        <h3 className="text-sm font-semibold mb-4">Article Breakdown — {selectedScore.system_name}</h3>
                        <div className="space-y-2">
                            {selectedScore.article_scores.map(art => (
                                <div key={art.article} className="flex items-center gap-3">
                                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                                        art.status === 'complete' ? "bg-emerald-500 text-white" :
                                        art.status === 'partial' ? "bg-amber-500/20 text-amber-600" :
                                        "bg-red-500/10 text-red-500")}>
                                        {art.status === 'complete' ? <IconCheck size={12} /> : art.status === 'partial' ? <IconAlertTriangle size={10} /> : <IconX size={12} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-muted-foreground w-14 shrink-0">{art.article}</span>
                                            <span className="text-sm font-medium truncate">{art.title}</span>
                                        </div>
                                    </div>
                                    <div className="w-20 shrink-0">
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all",
                                                art.score === 100 ? "bg-emerald-500" : art.score > 0 ? "bg-amber-500" : "bg-red-500")}
                                                style={{ width: `${art.score}%` }} />
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium w-10 text-right">{art.score}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Priority Actions */}
                    {allGaps.length > 0 && (
                        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
                            <h3 className="text-sm font-semibold mb-3">Priority Actions</h3>
                            <div className="space-y-2">
                                {allGaps.slice(0, 8).map((gap, i) => (
                                    <Link key={i} href={gap.href}
                                        className="flex items-center gap-3 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors group">
                                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{gap.gap}</p>
                                            <p className="text-xs text-muted-foreground">{gap.article}</p>
                                        </div>
                                        <IconChevronRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* EU Database Registration */}
                    <div className="bg-card border border-border rounded-2xl shadow-card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold">EU Database Registration Checklist</h3>
                            <span className="text-xs text-muted-foreground">{selectedScore.registration_checklist.filter(r => r.complete).length}/{selectedScore.registration_checklist.length} complete</span>
                        </div>
                        <div className="space-y-2">
                            {selectedScore.registration_checklist.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-2">
                                    <div className={cn("w-5 h-5 rounded flex items-center justify-center shrink-0",
                                        item.complete ? "bg-emerald-500 text-white" : "border-2 border-border")}>
                                        {item.complete && <IconCheck size={12} />}
                                    </div>
                                    <span className={cn("text-sm", item.complete ? "text-foreground" : "text-muted-foreground")}>{item.item}</span>
                                </div>
                            ))}
                        </div>
                        {selectedScore.eu_database_ready && (
                            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                <IconCheck size={16} /> This system is ready for EU Database registration
                            </div>
                        )}
                    </div>
                </>
            )}

            {systems.length === 0 && (
                <div className="bg-card border border-border rounded-2xl shadow-card p-20 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4"><IconTargetArrow size={32} /></div>
                    <h3 className="text-lg font-medium">No AI systems registered</h3>
                    <p className="text-muted-foreground mt-1 max-w-sm">Register AI systems in the AI Systems page to begin tracking compliance.</p>
                    <Link href="/ai-systems" className="mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90">Go to AI Systems</Link>
                </div>
            )}
        </div>
    );
}

function getArticleLink(article: string): string {
    const map: Record<string, string> = {
        'Art. 9': '/conformity', 'Art. 10': '/conformity', 'Art. 11': '/tech-docs',
        'Art. 12': '/audit', 'Art. 13': '/conformity', 'Art. 14': '/governance',
        'Art. 15': '/monitoring', 'Art. 27': '/fria', 'Art. 43': '/conformity', 'Art. 72': '/monitoring',
    };
    return map[article] || '/compliance';
}
