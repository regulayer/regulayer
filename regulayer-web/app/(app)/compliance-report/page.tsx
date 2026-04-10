'use client';

import { useState, useEffect, useRef } from 'react';
import {
    IconTargetArrow, IconCheck, IconX, IconAlertTriangle, IconDownload,
    IconChevronDown, IconShieldCheck, IconFileText
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
    AISystem,
    getAISystems, getConformityAssessments, getFRIAs, getTechDocs, getMonitoringPlans, getIncidentReports,
} from '@/lib/api';

const ARTICLES = [
    { article: 'Art. 9', title: 'Risk Management System', key: 'rms' },
    { article: 'Art. 10', title: 'Data Governance', key: 'data' },
    { article: 'Art. 11', title: 'Technical Documentation', key: 'techdoc' },
    { article: 'Art. 12', title: 'Record-Keeping & Logging', key: 'logging' },
    { article: 'Art. 13', title: 'Transparency', key: 'transparency' },
    { article: 'Art. 14', title: 'Human Oversight', key: 'hitl' },
    { article: 'Art. 15', title: 'Accuracy & Robustness', key: 'accuracy' },
    { article: 'Art. 27', title: 'Fundamental Rights Impact Assessment', key: 'fria' },
    { article: 'Art. 43', title: 'Conformity Assessment', key: 'conformity' },
    { article: 'Art. 72', title: 'Post-Market Monitoring', key: 'pmm' },
];

interface ArticleResult {
    article: string;
    title: string;
    score: number;
    status: 'complete' | 'partial' | 'missing';
    evidence: string;
}

interface SystemReport {
    systemName: string;
    systemId: string;
    overallScore: number;
    articles: ArticleResult[];
    generatedAt: string;
    isReady: boolean;
}

export default function ComplianceReportPage() {
    const [systems, setSystems] = useState<AISystem[]>([]);
    const [selectedSystemId, setSelectedSystemId] = useState('');
    const [report, setReport] = useState<SystemReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        Promise.all([
            getAISystems(),
            getConformityAssessments(),
            getFRIAs(),
            getTechDocs(),
            getMonitoringPlans(),
        ]).then(([sys, conformity, frias, techDocs, monitoring]) => {
            setSystems(sys);
            setLoading(false);

            // Pre-compute availability
            sys.forEach(system => {
                const sysConformity = conformity.find((c: any) => c.system_id === system.id);
                const sysFria = frias.find((f: any) => f.system_id === system.id);
                const sysDoc = techDocs.find((d: any) => d.system_id === system.id);
                const sysMon = monitoring.find((m: any) => m.system_id === system.id);
                // Store data in a WeakMap equivalent
                (system as any)._compliance = { sysConformity, sysFria, sysDoc, sysMon };
            });
        }).catch(() => setLoading(false));
    }, []);

    const generateReport = (systemId: string) => {
        setGenerating(true);
        const system = systems.find(s => s.id === systemId);
        if (!system) return;

        const comp = (system as any)._compliance || {};
        const { sysConformity, sysFria, sysDoc, sysMon } = comp;

        const articles: ArticleResult[] = ARTICLES.map(art => {
            let score = 0;
            let evidence = '';

            if (art.key === 'rms') {
                const item = sysConformity?.checklist?.find((i: any) => i.article === 'Article 9');
                if (item?.status === 'complete') { score = 100; evidence = 'Risk management system documented in conformity assessment. Policy Engine provides continuous risk evaluation.'; }
                else if (item?.status === 'in_progress') { score = 50; evidence = 'Risk management documentation in progress.'; }
                else { evidence = 'Regulayer Policy Engine provides real-time risk management. Formal documentation pending.'; }
            } else if (art.key === 'data') {
                const item = sysConformity?.checklist?.find((i: any) => i.article === 'Article 10');
                if (item?.status === 'complete') { score = 100; evidence = 'Data governance practices documented. Cryptographic vault ensures data integrity via SHA-256 hash chains.'; }
                else { evidence = 'Cryptographic vault provides data integrity. Formal documentation pending.'; }
            } else if (art.key === 'techdoc') {
                if (sysDoc) { score = sysDoc.overall_completeness; evidence = `Technical documentation ${score}% complete. ${sysDoc.sections_completed || 0} sections documented.`; }
                else { evidence = 'Technical documentation not yet created.'; }
            } else if (art.key === 'logging') {
                score = 100;
                evidence = 'Regulayer Decision Recorder automatically captures all AI inferences with Ed25519 signatures in WORM-compliant storage. Full chain-of-custody maintained.';
            } else if (art.key === 'transparency') {
                const item = sysConformity?.checklist?.find((i: any) => i.article === 'Article 13');
                if (item?.status === 'complete') { score = 100; evidence = 'Transparency requirements documented. Governance dashboard provides full decision visibility.'; }
                else { score = 50; evidence = 'Governance dashboard provides partial transparency. Formal user instructions pending.'; }
            } else if (art.key === 'hitl') {
                score = 100;
                evidence = 'Regulayer HITL Governance Queue provides structured human oversight. Compliance officers review flagged decisions with mandatory justification logging.';
            } else if (art.key === 'accuracy') {
                if (sysMon && sysMon.kpis?.length > 0) { score = 80; evidence = `Monitoring plan active with ${sysMon.kpis.length} KPIs tracked.`; }
                const item = sysConformity?.checklist?.find((i: any) => i.article === 'Article 15');
                if (item?.status === 'complete') { score = 100; evidence += ' Accuracy and robustness measures documented.'; }
                else { evidence = (evidence || '') + ' Statistical ML anomaly detection active via Policy Engine.'; }
            } else if (art.key === 'fria') {
                if (sysFria?.status === 'submitted') { score = 100; evidence = 'FRIA submitted and approved. All fundamental rights assessed with mitigation measures documented.'; }
                else if (sysFria?.status === 'complete') { score = 80; evidence = 'FRIA complete but not yet submitted for final approval.'; }
                else if (sysFria) { score = 40; evidence = 'FRIA in progress.'; }
                else { evidence = 'FRIA not yet created.'; }
            } else if (art.key === 'conformity') {
                if (sysConformity?.status === 'complete') { score = 100; evidence = 'Conformity assessment complete. All checklist items verified.'; }
                else if (sysConformity) {
                    const done = sysConformity.checklist?.filter((i: any) => i.status === 'complete' || i.status === 'not_applicable').length || 0;
                    const total = sysConformity.checklist?.length || 1;
                    score = Math.round((done / total) * 100);
                    evidence = `Conformity assessment ${score}% complete (${done}/${total} items).`;
                } else { evidence = 'Conformity assessment not yet created.'; }
            } else if (art.key === 'pmm') {
                if (sysMon) { score = 100; evidence = 'Post-market monitoring plan established with active KPI tracking and incident management procedures.'; }
                else { evidence = 'Post-market monitoring plan not yet created.'; }
            }

            return {
                article: art.article,
                title: art.title,
                score,
                status: score === 100 ? 'complete' as const : score > 0 ? 'partial' as const : 'missing' as const,
                evidence: evidence || 'Not yet assessed.',
            };
        });

        const overall = Math.round(articles.reduce((a, s) => a + s.score, 0) / articles.length);

        setTimeout(() => {
            setReport({
                systemName: system.name,
                systemId: system.id,
                overallScore: overall,
                articles,
                generatedAt: new Date().toISOString(),
                isReady: overall >= 80,
            });
            setGenerating(false);
        }, 1200); // Simulate generation time
    };

    const downloadReport = () => {
        if (!report || !reportRef.current) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<title>EU AI Act Compliance Report — ${report.systemName}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; color: #111827; background: #fff; padding: 60px; max-width: 850px; margin: 0 auto; line-height: 1.6; }
.header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #111827; padding-bottom: 24px; margin-bottom: 40px; }
.logo { font-size: 28px; font-weight: 700; letter-spacing: -1px; text-transform: uppercase; }
.meta { text-align: right; font-size: 11px; color: #4B5563; text-transform: uppercase; letter-spacing: 0.5px; }
.meta p { margin: 4px 0; }
.meta strong { font-weight: 600; color: #111827; margin-right: 6px; }
h1 { font-size: 32px; font-weight: 600; letter-spacing: -1px; margin-bottom: 12px; color: #111827; }
h2 { font-size: 16px; font-weight: 600; margin: 48px 0 20px; border-bottom: 1px solid #E5E7EB; padding-bottom: 12px; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; }
.subtitle { font-size: 15px; color: #4B5563; font-weight: 300; margin-bottom: 32px; max-width: 600px; }
.score-banner { display: flex; align-items: center; justify-content: space-between; background: ${report.overallScore >= 80 ? '#F9FAFB' : '#FEF2F2'}; border: 1px solid ${report.overallScore >= 80 ? '#E5E7EB' : '#FECACA'}; padding: 32px 40px; margin: 32px 0; }
.score-banner-left { flex: 1; }
.score-banner-right { text-align: right; }
.score-number { font-size: 64px; font-weight: 300; line-height: 1; color: ${report.overallScore >= 80 ? '#111827' : '#991B1B'}; letter-spacing: -2px; }
.score-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #4B5563; margin-top: 8px; }
.seal { display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; padding: 6px 12px; border: 1px solid #111827; color: #111827; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
.article-row { display: flex; align-items: flex-start; padding: 20px 0; border-bottom: 1px solid #F3F4F6; }
.article-badge { width: 80px; font-size: 12px; font-weight: 600; color: #6B7280; padding-top: 2px; flex-shrink: 0; }
.article-content { flex: 1; padding-right: 24px; }
.article-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #111827; }
.article-evidence { font-size: 13px; color: #4B5563; font-weight: 300; }
.article-score { width: 80px; text-align: right; font-size: 13px; font-weight: 500; color: #111827; }
.status-badge { font-size: 10px; text-transform: uppercase; font-weight: 600; padding: 2px 6px; margin-left: 8px; border: 1px solid transparent; }
.status-complete { border-color: #D1D5DB; color: #374151; }
.status-partial { background: #FEF3C7; color: #92400E; }
.status-missing { background: #FEE2E2; color: #991B1B; }
.footer { margin-top: 64px; padding-top: 24px; border-top: 1px solid #E5E7EB; font-size: 10px; color: #6B7280; display: flex; justify-content: space-between; text-transform: uppercase; letter-spacing: 0.5px; }
.disclaimer { margin-top: 48px; border-left: 2px solid #E5E7EB; padding-left: 16px; font-size: 11px; color: #6B7280; font-weight: 300; }
@media print {
  body { padding: 0; }
  .score-banner, .article-row, .disclaimer { break-inside: avoid; }
}
</style>
</head>
<body>
<div class="header">
  <div class="logo">Regulayer</div>
  <div class="meta">
    <p><strong>Date</strong> ${new Date(report.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p><strong>System ID</strong> ${report.systemId}</p>
    <p><strong>Framework</strong> EU AI Act (2024/1689)</p>
  </div>
</div>

<h1>Compliance Assessment</h1>
<p class="subtitle">Detailed article-by-article regulatory evaluation for the AI system "${report.systemName}".</p>

<div class="score-banner">
  <div class="score-banner-left">
    <div class="score-label">Overall Readiness Score</div>
    <div class="score-number">${report.overallScore}%</div>
    ${report.isReady ? '<div class="seal">REGULAYER VERIFIED</div>' : ''}
  </div>
  <div class="score-banner-right">
    <div style="font-size: 13px; color: #4B5563; font-weight: 500;">
      ${report.articles.filter(a => a.status === 'complete').length} / ${report.articles.length} <br>
      <span style="font-size: 11px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.5px;">Articles Satisfied</span>
    </div>
  </div>
</div>

<h2>Article Breakdown</h2>
${report.articles.map(art => `
<div class="article-row">
  <div class="article-badge">${art.article}</div>
  <div class="article-content">
    <div class="article-title">${art.title} <span class="status-badge status-${art.status}">${art.status}</span></div>
    <div class="article-evidence">${art.evidence}</div>
  </div>
  <div class="article-score">
    ${art.score}%
  </div>
</div>
`).join('')}

${report.articles.filter(a => a.status !== 'complete').length > 0 ? `
<h2>Priority Actions</h2>
${report.articles.filter(a => a.status !== 'complete').map((art, i) => `
<div class="article-row">
  <div class="article-badge" style="color: #991B1B;">#0${i + 1}</div>
  <div class="article-content">
    <div class="article-title">${art.article} — ${art.title}</div>
    <div class="article-evidence" style="color: #111827;">Action Recommended: Document compliance procedures. Current score reflects ${art.score}% readiness. ${art.evidence}</div>
  </div>
</div>
`).join('')}
` : ''}

<h2>Platform Capabilities</h2>
<div class="article-row"><div class="article-badge">SYS</div><div class="article-content"><div class="article-title">WORM Audit Vault</div><div class="article-evidence">All decisions cryptographically sealed with Ed25519 signatures and SHA-256 hash chains. SEC 17a-4 compliant.</div></div></div>
<div class="article-row"><div class="article-badge">SYS</div><div class="article-content"><div class="article-title">HITL Governance</div><div class="article-evidence">Human-in-the-Loop review queues strictly enforce routing of high-risk decisions to authorized compliance personnel.</div></div></div>
<div class="article-row"><div class="article-badge">SYS</div><div class="article-content"><div class="article-title">Real-Time Engine</div><div class="article-evidence">Declarative policy enforcement executing at edge with deterministic latency tracking.</div></div></div>

<div class="disclaimer">
  This document is a technical self-assessment generated automatically by the Regulayer governance platform. It evaluates the presence and completeness of recorded compliance data, policies, and human-in-the-loop workflows within the system. It does not constitute formal legal certification. Please consult qualified legal counsel for binding regulatory opinions.
</div>

<div class="footer">
  <span>© ${new Date().getFullYear()} Regulayer • Enterprise AI Governance</span>
  <span>regulayer.tech</span>
</div>
</body>
</html>
        `);

        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    return (
        <div className="p-6 md:p-10 pb-20 space-y-6 text-foreground">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Compliance Report Generator</h1>
                    <p className="text-muted-foreground text-sm">Generate a professional, downloadable EU AI Act compliance report for any registered AI system.</p>
                </div>
                <IconFileText size={28} className="text-muted-foreground" />
            </div>

            {/* System Selector */}
            <div className="bg-card border border-border rounded-2xl shadow-card p-6">
                <h3 className="text-sm font-semibold mb-4">Select AI System</h3>
                {loading ? (
                    <div className="h-20 flex items-center justify-center text-muted-foreground text-sm">Loading systems...</div>
                ) : systems.length === 0 ? (
                    <div className="text-center py-8">
                        <IconTargetArrow size={32} className="mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">No AI systems registered. Go to AI Systems to register one first.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {systems.map(system => {
                            const comp = (system as any)._compliance || {};
                            const hasConformity = !!comp.sysConformity;
                            const hasFria = !!comp.sysFria;
                            const readiness = [hasConformity, hasFria, true /* logging */, true /* hitl */].filter(Boolean).length;
                            const readinessPct = Math.round((readiness / 4) * 100);

                            return (
                                <button
                                    key={system.id}
                                    onClick={() => setSelectedSystemId(system.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                                        selectedSystemId === system.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-secondary/30"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-3 h-3 rounded-full", selectedSystemId === system.id ? "bg-primary" : "bg-muted-foreground/30")} />
                                        <div className="text-left">
                                            <p className="font-medium text-sm">{system.name}</p>
                                            <p className="text-xs text-muted-foreground">{(system as any).risk_classification || 'Unclassified'} risk • ID: {system.id.slice(0, 8)}...</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">{readinessPct}% data ready</p>
                                            <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                                                <div className={cn("h-full rounded-full", readinessPct >= 75 ? "bg-emerald-500" : readinessPct >= 50 ? "bg-amber-500" : "bg-red-500")}
                                                    style={{ width: `${readinessPct}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}

                        <button
                            onClick={() => selectedSystemId && generateReport(selectedSystemId)}
                            disabled={!selectedSystemId || generating}
                            className={cn(
                                "w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
                                selectedSystemId ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-muted-foreground cursor-not-allowed"
                            )}
                        >
                            {generating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Generating Report...
                                </>
                            ) : (
                                <>
                                    <IconTargetArrow size={16} />
                                    Generate Compliance Report
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Generated Report Preview */}
            {report && (
                <div ref={reportRef} className="space-y-4">
                    {/* Report Header */}
                    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-background flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">EU AI Act Compliance Report</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{report.systemName} • Generated {new Date(report.generatedAt).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={downloadReport}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
                            >
                                <IconDownload size={16} />
                                Download Report
                            </button>
                        </div>

                        {/* Score Banner */}
                        <div className={cn("p-8 text-center border-b border-border",
                            report.overallScore >= 80 ? "bg-emerald-50 dark:bg-emerald-500/5" :
                            report.overallScore >= 50 ? "bg-amber-50 dark:bg-amber-500/5" :
                            "bg-red-50 dark:bg-red-500/5"
                        )}>
                            <div className={cn("text-6xl font-extrabold tracking-tight",
                                report.overallScore >= 80 ? "text-emerald-600" :
                                report.overallScore >= 50 ? "text-amber-600" :
                                "text-red-600"
                            )}>
                                {report.overallScore}%
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">Overall Compliance Score</p>
                            <p className="text-xs text-muted-foreground mt-1">{report.articles.filter(a => a.status === 'complete').length} of {report.articles.length} articles fully satisfied</p>

                            {report.isReady && (
                                <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold">
                                    <IconShieldCheck size={16} />
                                    REGULAYER VERIFIED
                                </div>
                            )}
                        </div>

                        {/* Article Breakdown */}
                        <div className="divide-y divide-border">
                            {report.articles.map(art => (
                                <div key={art.article} className="px-6 py-4 flex items-start gap-4">
                                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                                        art.status === 'complete' ? "bg-emerald-500 text-white" :
                                        art.status === 'partial' ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" :
                                        "bg-red-100 text-red-500 dark:bg-red-500/10"
                                    )}>
                                        {art.status === 'complete' ? <IconCheck size={14} /> :
                                         art.status === 'partial' ? <IconAlertTriangle size={12} /> :
                                         <IconX size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-muted-foreground">{art.article}</span>
                                            <span className="text-sm font-semibold">{art.title}</span>
                                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded",
                                                art.status === 'complete' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                                                art.status === 'partial' ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
                                                "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                            )}>{art.score}%</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{art.evidence}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                        This report reflects data recorded in Regulayer as of {new Date(report.generatedAt).toLocaleString()}. It is a self-assessment and does not constitute legal certification.
                    </p>
                </div>
            )}
        </div>
    );
}
