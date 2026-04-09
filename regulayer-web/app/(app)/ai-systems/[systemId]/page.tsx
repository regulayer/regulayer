'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    IconArrowLeft, IconCpu, IconShieldCheck, IconAlertOctagon,
    IconAlertTriangle, IconCircleCheck, IconCircleDashed,
    IconChevronRight, IconCheck, IconMapPin, IconCalendar,
    IconBuildingFactory2, IconTarget, IconInfoCircle,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { AISystem, RiskTier, AnnexCategory, LifecycleStatus, getAISystem, saveAISystem } from '@/lib/api';

const ANNEX_III_CATEGORIES: { value: AnnexCategory; label: string; description: string; examples: string }[] = [
    { value: 'biometric', label: '1. Biometric Identification & Categorisation', description: 'Remote biometric ID, categorisation of sensitive attributes, emotion recognition', examples: 'Facial recognition, fingerprint matching, emotion detection in interviews' },
    { value: 'critical_infrastructure', label: '2. Critical Infrastructure', description: 'Safety components in digital infrastructure, transport, energy, water supply', examples: 'Traffic management AI, power grid optimization, water quality monitoring' },
    { value: 'education', label: '3. Education & Vocational Training', description: 'Access determination, learning evaluation, student behavior monitoring', examples: 'Automated grading, admission screening, proctoring systems' },
    { value: 'employment', label: '4. Employment & Worker Management', description: 'Recruitment, promotion/termination decisions, task allocation, performance monitoring', examples: 'CV screening, interview scoring, productivity monitoring' },
    { value: 'essential_services', label: '5. Essential Private & Public Services', description: 'Public benefits eligibility, credit scoring, insurance risk assessment', examples: 'Loan approval AI, healthcare triage, social benefit assessment' },
    { value: 'law_enforcement', label: '6. Law Enforcement', description: 'Risk assessments, crime analysis, evidence reliability, re-offending prediction', examples: 'Predictive policing, recidivism scoring, evidence analysis' },
    { value: 'migration', label: '7. Migration, Asylum & Border Control', description: 'Visa/asylum assessment, border security, document verification', examples: 'Visa screening, asylum claim assessment, border surveillance' },
    { value: 'justice', label: '8. Administration of Justice', description: 'Legal research assistance, fact/law interpretation, dispute resolution', examples: 'Legal recommendation engines, judicial decision support' },
];

const LIFECYCLE_OPTIONS: { value: LifecycleStatus; label: string }[] = [
    { value: 'development', label: 'Development' },
    { value: 'testing', label: 'Testing' },
    { value: 'deployed', label: 'Deployed' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'retired', label: 'Retired' },
];

const EU_MEMBER_STATES = [
    'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands',
    'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
];

export default function AISystemDetailPage() {
    const params = useParams();
    const router = useRouter();
    const systemId = params.systemId as string;
    const [system, setSystem] = useState<AISystem | null>(null);
    const [wizardStep, setWizardStep] = useState(0); // 0=metadata, 1=annex I, 2=annex III, 3=exemptions, 4=result

    // Wizard answers
    const [isAnnexIProduct, setIsAnnexIProduct] = useState<boolean | null>(null);
    const [selectedAnnexIII, setSelectedAnnexIII] = useState<AnnexCategory>('none');
    const [hasExemption, setHasExemption] = useState<boolean | null>(null);
    const [showStatesDropdown, setShowStatesDropdown] = useState(false);

    useEffect(() => {
        const s = getAISystem(systemId);
        if (!s) { router.push('/ai-systems'); return; }
        setSystem(s);
        if (s.risk_tier !== 'unclassified') {
            setWizardStep(4);
            setSelectedAnnexIII(s.annex_category);
        }
    }, [systemId, router]);

    if (!system) return (
        <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin" />
        </div>
    );

    const updateSystem = (updates: Partial<AISystem>) => {
        const updated = { ...system, ...updates, updated_at: new Date().toISOString() };
        saveAISystem(updated);
        setSystem(updated);
    };

    const computeRiskTier = (annex1: boolean | null, annex3: AnnexCategory, exempt: boolean | null): { tier: RiskTier; rationale: string } => {
        if (annex1) return { tier: 'high', rationale: 'This AI system is a safety component of a product covered by EU harmonised legislation (Annex I). It is classified as HIGH RISK under Article 6(1).' };
        if (annex3 !== 'none') {
            if (exempt) return { tier: 'limited', rationale: `This system falls under Annex III category "${ANNEX_III_CATEGORIES.find(c => c.value === annex3)?.label}" but qualifies for the Article 6(3) exemption as it performs a narrow procedural task or improves human activity outcomes without significantly influencing decisions.` };
            return { tier: 'high', rationale: `This AI system falls under Annex III category "${ANNEX_III_CATEGORIES.find(c => c.value === annex3)?.label}" and is classified as HIGH RISK under Article 6(2).` };
        }
        return { tier: 'minimal', rationale: 'This AI system does not fall under Annex I regulated products or any Annex III high-risk category. It is classified as MINIMAL RISK with no specific obligations under the EU AI Act.' };
    };

    const handleCompleteClassification = (annex1: boolean | null, annex3: AnnexCategory, exempt: boolean | null) => {
        const result = computeRiskTier(annex1, annex3, exempt);
        updateSystem({ risk_tier: result.tier, annex_category: annex3, classification_rationale: result.rationale });
        setWizardStep(4);
    };

    const RISK_ICON: Record<RiskTier, React.ReactNode> = {
        unacceptable: <IconAlertOctagon size={24} className="text-red-600" />,
        high: <IconAlertOctagon size={24} className="text-red-500" />,
        limited: <IconAlertTriangle size={24} className="text-amber-500" />,
        minimal: <IconCircleCheck size={24} className="text-emerald-500" />,
        unclassified: <IconCircleDashed size={24} className="text-muted-foreground" />,
    };

    const RISK_BG: Record<RiskTier, string> = {
        unacceptable: 'bg-red-50 border-red-200 dark:bg-red-500/5 dark:border-red-500/20',
        high: 'bg-red-50 border-red-200 dark:bg-red-500/5 dark:border-red-500/20',
        limited: 'bg-amber-50 border-amber-200 dark:bg-amber-500/5 dark:border-amber-500/20',
        minimal: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-500/20',
        unclassified: 'bg-secondary border-border',
    };

    return (
        <div className="p-6 md:p-10 pb-20 space-y-6 text-foreground max-w-4xl">
            {/* Back */}
            <Link href="/ai-systems" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <IconArrowLeft size={16} /> Back to Registry
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><IconCpu size={22} className="text-primary" /></div>
                        {system.name}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">v{system.version} · {system.provider_name || 'Unknown provider'}</p>
                </div>
                {RISK_ICON[system.risk_tier]}
            </div>

            {/* System Metadata Card */}
            <div className="bg-card border border-border rounded-2xl shadow-card p-6 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Intended Purpose</label>
                        <p className="text-sm text-foreground">{system.intended_purpose || <span className="italic text-muted-foreground">Not specified</span>}</p>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Description</label>
                        <p className="text-sm text-foreground">{system.description || <span className="italic text-muted-foreground">Not specified</span>}</p>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Lifecycle Status</label>
                        <select value={system.lifecycle_status} onChange={e => updateSystem({ lifecycle_status: e.target.value as LifecycleStatus })}
                            className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm">
                            {LIFECYCLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Deployment Date</label>
                        <input type="date" value={system.deployment_date || ''} onChange={e => updateSystem({ deployment_date: e.target.value })}
                            className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm" />
                    </div>
                </div>
                {/* Member States */}
                <div>
                    <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">
                        <IconMapPin size={12} className="inline mr-1" /> EU Member States of Deployment
                    </label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {system.member_states.map(state => (
                            <span key={state} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                                {state} <button onClick={() => updateSystem({ member_states: system.member_states.filter(s => s !== state) })} className="hover:text-red-500">×</button>
                            </span>
                        ))}
                        <div className="relative">
                            <button onClick={() => setShowStatesDropdown(!showStatesDropdown)} className="px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded-full border border-border hover:border-primary/30 transition-colors">+ Add</button>
                            {showStatesDropdown && (
                                <div className="absolute z-10 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto w-48">
                                    {EU_MEMBER_STATES.filter(s => !system.member_states.includes(s)).map(state => (
                                        <button key={state} onClick={() => { updateSystem({ member_states: [...system.member_states, state] }); setShowStatesDropdown(false); }}
                                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-secondary transition-colors">{state}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Classification Wizard */}
            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-background">
                    <h3 className="text-sm font-semibold text-foreground">Risk Classification — EU AI Act Article 6</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Step-by-step classification per Annex I and Annex III criteria</p>
                </div>

                {wizardStep === 4 && system.risk_tier !== 'unclassified' ? (
                    /* Result */
                    <div className="p-6 space-y-4">
                        <div className={cn("p-5 rounded-xl border", RISK_BG[system.risk_tier])}>
                            <div className="flex items-center gap-3 mb-3">
                                {RISK_ICON[system.risk_tier]}
                                <div>
                                    <p className="text-lg font-bold capitalize">{system.risk_tier} Risk</p>
                                    <p className="text-xs text-muted-foreground">Classification complete</p>
                                </div>
                            </div>
                            <p className="text-sm">{system.classification_rationale}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setWizardStep(1); setIsAnnexIProduct(null); setSelectedAnnexIII('none'); setHasExemption(null); }}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline">Reclassify</button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        {/* Step indicators */}
                        <div className="flex items-center gap-2">
                            {['Annex I', 'Annex III', 'Exemptions'].map((label, i) => (
                                <div key={label} className="flex items-center gap-2">
                                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                                        wizardStep > i + 1 ? "bg-emerald-500 border-emerald-500 text-white" :
                                        wizardStep === i + 1 ? "bg-primary border-primary text-primary-foreground" :
                                        "bg-secondary border-border text-muted-foreground")}>
                                        {wizardStep > i + 1 ? <IconCheck size={14} /> : i + 1}
                                    </div>
                                    <span className={cn("text-xs font-medium", wizardStep === i + 1 ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                                    {i < 2 && <div className={cn("w-8 h-0.5 rounded", wizardStep > i + 1 ? "bg-emerald-500" : "bg-border")} />}
                                </div>
                            ))}
                        </div>

                        {/* Step 1: Annex I */}
                        {wizardStep <= 1 && (
                            <div className="space-y-4">
                                <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
                                    <div className="flex gap-3">
                                        <IconInfoCircle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <p className="text-sm font-medium text-amber-900 dark:text-amber-300">Annex I — Regulated Products</p>
                                            <p className="text-xs text-amber-800/70 dark:text-amber-400/70 mt-1">Is this AI system a safety component of, or itself, a product covered by EU harmonised legislation (e.g., medical devices, automotive, machinery, toys, lifts, personal protective equipment)?</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {[{ val: true, label: 'Yes — Annex I applies' }, { val: false, label: 'No — Not an Annex I product' }].map(opt => (
                                        <button key={String(opt.val)} onClick={() => { setIsAnnexIProduct(opt.val); if (opt.val) { handleCompleteClassification(opt.val, selectedAnnexIII, hasExemption); } else { setWizardStep(2); } }}
                                            className={cn("flex-1 p-4 rounded-xl border-2 text-sm font-medium transition-all text-left",
                                                isAnnexIProduct === opt.val ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Annex III Categories */}
                        {wizardStep === 2 && (
                            <div className="space-y-4">
                                <p className="text-sm font-medium">Does this AI system fall into any of these Annex III high-risk categories?</p>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                    {ANNEX_III_CATEGORIES.map(cat => (
                                        <button key={cat.value} onClick={() => setSelectedAnnexIII(cat.value)}
                                            className={cn("w-full text-left p-4 rounded-xl border-2 transition-all",
                                                selectedAnnexIII === cat.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                                            <p className="text-sm font-medium">{cat.label}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                                            <p className="text-xs text-muted-foreground/60 mt-1 italic">Examples: {cat.examples}</p>
                                        </button>
                                    ))}
                                    <button onClick={() => setSelectedAnnexIII('none')}
                                        className={cn("w-full text-left p-4 rounded-xl border-2 transition-all",
                                            selectedAnnexIII === 'none' ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                                        <p className="text-sm font-medium">None of the above</p>
                                        <p className="text-xs text-muted-foreground mt-1">This system does not fall into any Annex III category</p>
                                    </button>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <button onClick={() => setWizardStep(1)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
                                    <button onClick={() => { if (selectedAnnexIII === 'none') { handleCompleteClassification(isAnnexIProduct, 'none', hasExemption); } else { setWizardStep(3); } }}
                                        className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all">
                                        Continue →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Article 6(3) Exemptions */}
                        {wizardStep === 3 && (
                            <div className="space-y-4">
                                <div className="bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-4">
                                    <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300">Article 6(3) — Exemption Check</p>
                                    <p className="text-xs text-indigo-800/70 dark:text-indigo-400/70 mt-1">Even though this system falls under Annex III, it may be exempt from high-risk classification if it meets ALL of these criteria:</p>
                                    <ul className="text-xs text-indigo-800/70 dark:text-indigo-400/70 mt-2 space-y-1 list-disc ml-4">
                                        <li>Performs a narrow procedural task</li>
                                        <li>Improves the result of a previously completed human activity</li>
                                        <li>Does not materially influence decision-making (human retains full discretion)</li>
                                        <li>Is intended to be preparatory to an assessment that is relevant for the use cases listed in Annex III</li>
                                    </ul>
                                </div>
                                <p className="text-sm font-medium">Does this system qualify for the Article 6(3) exemption?</p>
                                <div className="flex gap-3">
                                    {[{ val: true, label: 'Yes — Exempt (narrow/preparatory task)' }, { val: false, label: 'No — Full high-risk classification applies' }].map(opt => (
                                        <button key={String(opt.val)} onClick={() => setHasExemption(opt.val)}
                                            className={cn("flex-1 p-4 rounded-xl border-2 text-sm font-medium transition-all text-left",
                                                hasExemption === opt.val ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between pt-2">
                                    <button onClick={() => setWizardStep(2)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
                                    <button onClick={() => handleCompleteClassification(isAnnexIProduct, selectedAnnexIII, hasExemption)} disabled={hasExemption === null}
                                        className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50">
                                        Complete Classification
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Links */}
            {system.risk_tier !== 'unclassified' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Conformity Assessment', desc: 'Start conformity assessment for this system', href: '/conformity', icon: <IconShieldCheck size={20} /> },
                        { label: 'FRIA', desc: 'Fundamental Rights Impact Assessment', href: '/fria', icon: <IconTarget size={20} /> },
                        { label: 'Technical Documentation', desc: 'Generate Annex IV documentation', href: '/tech-docs', icon: <IconBuildingFactory2 size={20} /> },
                    ].map(link => (
                        <Link key={link.label} href={link.href}
                            className="bg-card border border-border rounded-2xl shadow-card p-5 hover:shadow-glow-sm hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground mb-3 group-hover:text-primary transition-colors">{link.icon}</div>
                            <h4 className="text-sm font-semibold">{link.label}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                            <span className="text-xs text-primary mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Open <IconChevronRight size={12} /></span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
