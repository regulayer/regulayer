'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    IconArrowLeft, IconHeartHandshake, IconCheck, IconChevronRight,
    IconShieldCheck, IconAlertTriangle, IconSend,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { FRIAAssessment, FRIARightAssessment, FRIAMitigation, getFRIA, saveFRIA } from '@/lib/api';

const STEPS = ['Deployer Info', 'System Description', 'Rights Analysis', 'Mitigation', 'Review & Submit'];

const SEVERITY_STYLES: Record<string, string> = {
    none: 'bg-secondary text-muted-foreground',
    low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    medium: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    high: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    critical: 'bg-red-600 text-white',
};

export default function FRIADetailPage() {
    const params = useParams();
    const router = useRouter();
    const friaId = params.friaId as string;
    const [fria, setFria] = useState<FRIAAssessment | null>(null);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const f = getFRIA(friaId);
        if (!f) { router.push('/fria'); return; }
        setFria(f);
    }, [friaId, router]);

    if (!fria) return <div className="p-20 flex items-center justify-center"><div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin" /></div>;

    const update = (changes: Partial<FRIAAssessment>) => {
        const updated = { ...fria, ...changes, updated_at: new Date().toISOString() };
        saveFRIA(updated);
        setFria(updated);
    };

    const updateDeployer = (key: string, value: string) => update({ deployer_info: { ...fria.deployer_info, [key]: value } });
    const updateSysDesc = (key: string, value: string) => update({ system_description: { ...fria.system_description, [key]: value } });

    const updateRight = (rightName: string, changes: Partial<FRIARightAssessment>) => {
        const updated = fria.rights_analysis.map(r => r.right_name === rightName ? { ...r, ...changes } : r);
        update({ rights_analysis: updated });
    };

    const addMitigation = (rightName: string) => {
        const m: FRIAMitigation = { right_name: rightName, measure_description: '', implementation_status: 'planned', responsible_person: '' };
        update({ mitigation_measures: [...fria.mitigation_measures, m] });
    };

    const updateMitigation = (index: number, changes: Partial<FRIAMitigation>) => {
        const updated = fria.mitigation_measures.map((m, i) => i === index ? { ...m, ...changes } : m);
        update({ mitigation_measures: updated });
    };

    const handleComplete = () => update({ status: 'complete' });
    const handleSubmit = () => {
        const authorityName = prompt('Enter the name of the market surveillance authority:');
        if (!authorityName) return;
        update({ status: 'submitted', authority_submission: { submitted_at: new Date().toISOString(), authority_name: authorityName, reference_number: `FRIA-${Date.now().toString(36).toUpperCase()}` } });
    };

    const risksIdentified = fria.rights_analysis.filter(r => r.risk_identified);

    return (
        <div className="p-6 md:p-10 pb-20 space-y-6 text-foreground max-w-4xl">
            <Link href="/fria" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <IconArrowLeft size={16} /> Back to FRIAs
            </Link>

            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><IconHeartHandshake size={22} className="text-primary" /></div>
                    FRIA — {fria.system_name || 'Assessment'}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Fundamental Rights Impact Assessment per EU AI Act Article 27</p>
            </div>

            {/* Step Navigation */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {STEPS.map((label, i) => (
                    <button key={label} onClick={() => setStep(i)}
                        className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                            step === i ? "bg-primary text-primary-foreground" :
                            "bg-secondary text-muted-foreground hover:text-foreground")}>
                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                        {label}
                    </button>
                ))}
            </div>

            {/* Step 0: Deployer Info */}
            {step === 0 && (
                <div className="bg-card border border-border rounded-2xl shadow-card p-6 space-y-4">
                    <h3 className="text-sm font-semibold">Deployer Information</h3>
                    {[
                        { label: 'Organisation Name', key: 'org_name', placeholder: 'Your organisation name' },
                        { label: 'Contact Person', key: 'contact_person', placeholder: 'Full name of responsible person' },
                        { label: 'Data Protection Officer', key: 'dpo_name', placeholder: 'DPO full name' },
                        { label: 'DPO Email', key: 'dpo_email', placeholder: 'dpo@example.com' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">{f.label}</label>
                            <input type={f.key === 'dpo_email' ? 'email' : 'text'} value={(fria.deployer_info as Record<string, string>)[f.key] || ''} onChange={e => updateDeployer(f.key, e.target.value)}
                                placeholder={f.placeholder} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                    ))}
                    <div className="flex justify-end pt-2"><button onClick={() => setStep(1)} className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 inline-flex items-center gap-1">Next <IconChevronRight size={14} /></button></div>
                </div>
            )}

            {/* Step 1: System Description */}
            {step === 1 && (
                <div className="bg-card border border-border rounded-2xl shadow-card p-6 space-y-4">
                    <h3 className="text-sm font-semibold">System Description</h3>
                    <div>
                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Purpose</label>
                        <textarea value={fria.system_description.purpose} onChange={e => updateSysDesc('purpose', e.target.value)}
                            placeholder="What does this system do?" rows={3} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Scope of Deployment</label>
                        <textarea value={fria.system_description.scope} onChange={e => updateSysDesc('scope', e.target.value)}
                            placeholder="Geographic scope, number of users, operational context..." rows={3} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Scale of Use</label>
                        <input type="text" value={fria.system_description.scale_of_use} onChange={e => updateSysDesc('scale_of_use', e.target.value)}
                            placeholder="e.g., 10,000 decisions/month, 50 users" className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div className="flex justify-between pt-2">
                        <button onClick={() => setStep(0)} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
                        <button onClick={() => setStep(2)} className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 inline-flex items-center gap-1">Next <IconChevronRight size={14} /></button>
                    </div>
                </div>
            )}

            {/* Step 2: Rights Analysis */}
            {step === 2 && (
                <div className="space-y-3">
                    <div className="bg-card border border-border rounded-2xl shadow-card p-4">
                        <p className="text-sm font-medium">Assess impact on each fundamental right. Identify risks and their severity.</p>
                        <p className="text-xs text-muted-foreground mt-1">{risksIdentified.length} of {fria.rights_analysis.length} rights have identified risks</p>
                    </div>
                    {fria.rights_analysis.map(right => (
                        <div key={right.right_name} className={cn("bg-card border rounded-2xl shadow-card p-5 space-y-3 transition-all",
                            right.risk_identified ? "border-red-200 dark:border-red-500/20" : "border-border")}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {right.risk_identified ? <IconAlertTriangle size={16} className="text-red-500" /> : <IconShieldCheck size={16} className="text-emerald-500" />}
                                    <h4 className="text-sm font-medium">{right.right_name}</h4>
                                </div>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <span className="text-xs text-muted-foreground">Risk identified</span>
                                    <button onClick={() => updateRight(right.right_name, { risk_identified: !right.risk_identified, risk_severity: right.risk_identified ? 'none' : 'low' })}
                                        className={cn("w-10 h-5 rounded-full transition-colors flex items-center px-0.5",
                                            right.risk_identified ? "bg-red-500 justify-end" : "bg-secondary justify-start")}>
                                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                    </button>
                                </label>
                            </div>
                            {right.risk_identified && (
                                <div className="space-y-3 pl-6 border-l-2 border-red-200 dark:border-red-500/20">
                                    <div>
                                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Risk Severity</label>
                                        <div className="flex gap-2">
                                            {(['low', 'medium', 'high', 'critical'] as const).map(sev => (
                                                <button key={sev} onClick={() => updateRight(right.right_name, { risk_severity: sev })}
                                                    className={cn("px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all",
                                                        right.risk_severity === sev ? SEVERITY_STYLES[sev] + ' ring-2 ring-offset-1 ring-current' : 'bg-secondary text-muted-foreground hover:opacity-80')}>
                                                    {sev}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Risk Description</label>
                                        <textarea value={right.risk_description} onChange={e => updateRight(right.right_name, { risk_description: e.target.value })}
                                            placeholder={`Describe how this system might impact ${right.right_name.toLowerCase()}...`} rows={2}
                                            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="flex justify-between pt-2">
                        <button onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
                        <button onClick={() => setStep(3)} className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 inline-flex items-center gap-1">Next <IconChevronRight size={14} /></button>
                    </div>
                </div>
            )}

            {/* Step 3: Mitigation Measures */}
            {step === 3 && (
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-2xl shadow-card p-6 space-y-4">
                        <h3 className="text-sm font-semibold">Mitigation Measures</h3>
                        {risksIdentified.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No risks were identified in the rights analysis. You can proceed to the review step.</p>
                        ) : (
                            risksIdentified.map(right => (
                                <div key={right.right_name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium">{right.right_name}</h4>
                                        <button onClick={() => addMitigation(right.right_name)} className="text-xs text-primary hover:underline">+ Add measure</button>
                                    </div>
                                    {fria.mitigation_measures.filter(m => m.right_name === right.right_name).map((m, idx) => {
                                        const realIdx = fria.mitigation_measures.indexOf(m);
                                        return (
                                            <div key={idx} className="bg-secondary rounded-lg p-3 space-y-2">
                                                <textarea value={m.measure_description} onChange={e => updateMitigation(realIdx, { measure_description: e.target.value })}
                                                    placeholder="Describe the mitigation measure..." rows={2} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                                                <div className="flex gap-3">
                                                    <select value={m.implementation_status} onChange={e => updateMitigation(realIdx, { implementation_status: e.target.value as 'planned' | 'implemented' | 'verified' })}
                                                        className="bg-background border border-border rounded-lg px-2 py-1 text-xs">
                                                        <option value="planned">Planned</option><option value="implemented">Implemented</option><option value="verified">Verified</option>
                                                    </select>
                                                    <input type="text" value={m.responsible_person} onChange={e => updateMitigation(realIdx, { responsible_person: e.target.value })}
                                                        placeholder="Responsible person" className="flex-1 bg-background border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="bg-card border border-border rounded-2xl shadow-card p-6 space-y-4">
                        <div>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Human Oversight Plan</label>
                            <textarea value={fria.human_oversight_plan} onChange={e => update({ human_oversight_plan: e.target.value })}
                                placeholder="Describe how human oversight will be maintained during system operation..." rows={3}
                                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Monitoring Commitments</label>
                            <textarea value={fria.monitoring_commitments} onChange={e => update({ monitoring_commitments: e.target.value })}
                                placeholder="Describe ongoing monitoring commitments..." rows={3}
                                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <button onClick={() => setStep(2)} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
                        <button onClick={() => setStep(4)} className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 inline-flex items-center gap-1">Review <IconChevronRight size={14} /></button>
                    </div>
                </div>
            )}

            {/* Step 4: Review & Submit */}
            {step === 4 && (
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-2xl shadow-card p-6 space-y-4">
                        <h3 className="text-sm font-semibold">Assessment Summary</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-muted-foreground">Organisation:</span> <span className="font-medium">{fria.deployer_info.org_name || '—'}</span></div>
                            <div><span className="text-muted-foreground">Contact:</span> <span className="font-medium">{fria.deployer_info.contact_person || '—'}</span></div>
                            <div><span className="text-muted-foreground">System:</span> <span className="font-medium">{fria.system_name || '—'}</span></div>
                            <div><span className="text-muted-foreground">Risks Found:</span> <span className="font-medium">{risksIdentified.length} of {fria.rights_analysis.length}</span></div>
                            <div><span className="text-muted-foreground">Mitigations:</span> <span className="font-medium">{fria.mitigation_measures.length}</span></div>
                            <div><span className="text-muted-foreground">Status:</span> <span className="font-medium capitalize">{fria.status}</span></div>
                        </div>
                        {risksIdentified.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-border">
                                <h4 className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Identified Risks</h4>
                                {risksIdentified.map(r => (
                                    <div key={r.right_name} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                                        <span className="text-sm">{r.right_name}</span>
                                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium capitalize", SEVERITY_STYLES[r.risk_severity])}>{r.risk_severity}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {fria.authority_submission && (
                        <div className="bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-2"><IconSend size={16} className="text-indigo-500" /><h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Submitted to Authority</h4></div>
                            <p className="text-xs text-indigo-800/70 dark:text-indigo-400/70">Authority: {fria.authority_submission.authority_name} · Ref: {fria.authority_submission.reference_number} · Date: {new Date(fria.authority_submission.submitted_at).toLocaleDateString()}</p>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <button onClick={() => setStep(3)} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
                        <div className="flex gap-3">
                            {fria.status === 'draft' || fria.status === 'in_progress' ? (
                                <button onClick={handleComplete} className="px-5 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 inline-flex items-center gap-1"><IconCheck size={14} /> Mark Complete</button>
                            ) : null}
                            {fria.status === 'complete' && !fria.authority_submission ? (
                                <button onClick={handleSubmit} className="px-5 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 inline-flex items-center gap-1"><IconSend size={14} /> Submit to Authority</button>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
