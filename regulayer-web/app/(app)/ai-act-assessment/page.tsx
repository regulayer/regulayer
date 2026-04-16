"use client";

import React, { useState, useEffect } from "react";
import { 
    IconTargetArrow, IconBrain, IconShieldCheck, IconLock, 
    IconFileText, IconCheck, IconRefresh, IconFileCheck
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { 
    getAISystems,
    getMe, 
    draftAiActReport, 
    sealAiActReport, 
    AISystem 
} from "@/lib/api";

export default function AiActAssessmentPage() {
    const [systems, setSystems] = useState<AISystem[]>([]);
    const [loadingSystems, setLoadingSystems] = useState(true);
    const [orgLogoUrl, setOrgLogoUrl] = useState('');
    const [orgName, setOrgName] = useState('');
    
    // Form State
    const [selectedSystemId, setSelectedSystemId] = useState<string>("");
    const [provider, setProvider] = useState<string>("groq");
    const [aiApiKey, setAiApiKey] = useState<string>("");
    const [attesterName, setAttesterName] = useState("");
    const [attesterTitle, setAttesterTitle] = useState("");

    // Engine State
    const [isDrafting, setIsDrafting] = useState(false);
    const [draftError, setDraftError] = useState("");
    const [draftMarkdown, setDraftMarkdown] = useState("");
    
    // Attestation State
    const [isSealing, setIsSealing] = useState(false);
    const [sealedDoc, setSealedDoc] = useState<{status: string, markdown: string, hash: string, timestamp: string} | null>(null);

    useEffect(() => {
        Promise.all([
            getAISystems(),
            getMe()
        ]).then(([systemsRes, meRes]) => {
            setSystems(systemsRes);
            if (meRes.data?.org) {
                setOrgLogoUrl(meRes.data.org.logo_url || '');
                setOrgName(meRes.data.org.name || 'Organization');
            }
            setLoadingSystems(false);
        }).catch(() => setLoadingSystems(false));
    }, []);

    const handleDraft = async () => {
        if (!selectedSystemId || !aiApiKey) return;
        setDraftError("");
        setIsDrafting(true);
        setDraftMarkdown("");
        setSealedDoc(null);

        const system = systems.find(s => s.id === selectedSystemId);
        if (!system) return;

        try {
            const res = await draftAiActReport({
                ai_api_key: aiApiKey,
                provider: provider,
                project_id: system.id,
                system_name: system.name
            });
            setDraftMarkdown(res.data.markdown);
        } catch (err: any) {
            setDraftError(err.response?.data?.detail || "Failed to generate draft. Please check your Groq API Key.");
        } finally {
            setIsDrafting(false);
        }
    };

    const handleSeal = async () => {
        if (!attesterName || !attesterTitle || !draftMarkdown) return;
        setIsSealing(true);
        const system = systems.find(s => s.id === selectedSystemId);

        try {
            const res = await sealAiActReport({
                project_id: selectedSystemId,
                system_name: system?.name || "Unknown System",
                final_document_markdown: draftMarkdown,
                attester_name: attesterName,
                attester_title: attesterTitle
            });
            setSealedDoc({
                status: res.data.status,
                markdown: res.data.sealed_document_markdown,
                hash: res.data.cryptographic_hash,
                timestamp: res.data.timestamp
            });
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to seal document.");
        } finally {
            setIsSealing(false);
        }
    };

    return (
        <div className="p-6 md:p-10 pb-32 space-y-8 text-foreground max-w-6xl mx-auto">
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-indigo-500 flex items-center gap-2">
                        <IconBrain size={32} />
                        Automated AI Act Assessment
                    </h1>
                    <p className="text-muted-foreground text-sm mt-2 max-w-3xl">
                        Enterprise-grade compliance pipeline. This engine automatically sweeps your cryptographic telemetry 
                        and utilizes Llama-3.3 to draft your mandatory EU AI Act Technical Documentation and FRIA.
                    </p>
                </div>
            </div>

            {sealedDoc ? (
                <div className="bg-card border border-border rounded-xl shadow-2xl p-0 animate-in fade-in slide-in-from-bottom-4 overflow-hidden max-w-4xl mx-auto">
                    {/* Premium Legal Document Header */}
                    <div className="bg-white text-slate-900 border-b-4 border-slate-900 p-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {orgLogoUrl ? (
                                <img src={orgLogoUrl} alt="Org Logo" className="h-16 object-contain" />
                            ) : (
                                <div className="h-16 flex items-center text-xl font-bold uppercase tracking-widest">{orgName}</div>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-2 text-indigo-700 font-bold text-xl tracking-tighter mb-1">
                                <IconBrain size={24} /> REGULAYER
                            </div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                                Certified Legal Assessment
                            </div>
                        </div>
                    </div>

                    <div className="bg-white text-slate-900 px-12 py-10">
                        <div className="border-b border-dashed border-slate-300 pb-6 mb-8 flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight leading-none mb-2">Technical Documentation & FRIA</h2>
                                <p className="text-slate-500 text-sm font-medium">Pursuant to EU AI Act (Req. Articles 9, 12, 14, 27)</p>
                            </div>
                            <div className="text-right text-xs font-mono text-slate-500">
                                <div>SYSTEM ID: {selectedSystemId.slice(0,8).toUpperCase()}</div>
                                <div>DATE: {new Date(sealedDoc.timestamp).toLocaleDateString()}</div>
                            </div>
                        </div>

                        {/* Document Body */}
                        <div className="prose prose-sm prose-slate max-w-none font-serif leading-relaxed mb-16">
                            <div dangerouslySetInnerHTML={{ __html: sealedDoc.markdown.replace(/\n/g, '<br/>') }} />
                        </div>

                        {/* Formal Attestation Seal */}
                        <div className="border border-slate-900 p-8 relative mt-16 bg-slate-50">
                            <div className="absolute -top-3 left-6 bg-slate-900 text-amber-400 text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                                Binding Legal Attestation
                            </div>
                            
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-slate-600 mb-4 max-w-md italic">
                                        "I hereby declare under penalty of perjury that I have reviewed the contents of this technical documentation and verify that it represents the objective operational reality and compliance measures of the active AI system."
                                    </p>
                                    <div className="font-bold text-lg">{attesterName}</div>
                                    <div className="text-sm text-slate-600">{attesterTitle}</div>
                                    <div className="text-xs font-semibold text-slate-400 mt-1 uppercase">{orgName}</div>
                                </div>
                                <div className="text-right">
                                    <div className="w-24 h-24 rounded-full border-4 border-indigo-700/20 flex flex-col items-center justify-center text-indigo-700 ml-auto mb-2 opacity-80">
                                        <IconShieldCheck size={32} />
                                        <div className="text-[8px] font-bold uppercase mt-1">Regulayer</div>
                                        <div className="text-[7px] font-bold uppercase">Sealed</div>
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-500 bg-slate-200 px-2 py-1 rounded">
                                        SHA-256: {sealedDoc.hash.slice(0, 32)}...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
                            <div className="flex items-center gap-2 font-semibold">
                                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">1</div>
                                Target System
                            </div>
                            {loadingSystems ? (
                                <div className="text-sm text-muted-foreground animate-pulse">Scanning infrastructure...</div>
                            ) : (
                                <select 
                                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={selectedSystemId}
                                    onChange={e => setSelectedSystemId(e.target.value)}
                                >
                                    <option value="" disabled>Select an AI System...</option>
                                    {systems.map(s => <option key={s.id} value={s.id}>{s.name} (Risk: {(s as any).risk_classification || 'Unclassified'})</option>)}
                                </select>
                            )}

                            <div className="flex items-center gap-2 font-semibold mt-6">
                                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">2</div>
                                AI Engine Provider
                            </div>
                            <div className="flex gap-2">
                                <select 
                                    className="w-1/3 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={provider}
                                    onChange={e => setProvider(e.target.value)}
                                >
                                    <option value="groq">Groq</option>
                                    <option value="openai">OpenAI</option>
                                    <option value="anthropic">Anthropic</option>
                                </select>
                                <input 
                                    type="password" 
                                    placeholder="API Key..."
                                    value={aiApiKey}
                                    onChange={e => setAiApiKey(e.target.value)}
                                    className="flex-1 bg-secondary border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                                High-speed enterprise automated reasoning. Keys are executed statelessly and never stored.
                            </p>

                            <button 
                                onClick={handleDraft}
                                disabled={!selectedSystemId || !aiApiKey || isDrafting}
                                className={cn(
                                    "w-full py-3 mt-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm",
                                    selectedSystemId && aiApiKey && !isDrafting
                                        ? "bg-indigo-600 text-white hover:bg-indigo-500" 
                                        : "bg-secondary text-muted-foreground cursor-not-allowed"
                                )}
                            >
                                {isDrafting ? <IconRefresh className="animate-spin" size={18} /> : <IconTargetArrow size={18} />}
                                {isDrafting ? "Sweeping Telemetry..." : "Initiate Forensic Draft"}
                            </button>
                        </div>
                    </div>

                    {/* Editor & Attestation Pane */}
                    <div className="lg:col-span-2">
                        {draftError ? (
                            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl flex items-start gap-4 text-red-500">
                                <IconLock className="shrink-0" />
                                <div>
                                    <h3 className="font-semibold">Engine Failure</h3>
                                    <p className="text-sm mt-1">{draftError}</p>
                                </div>
                            </div>
                        ) : isDrafting ? (
                            <div className="h-full min-h-[400px] border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
                                <IconBrain className="animate-pulse mb-4 text-indigo-500" size={48} />
                                <p className="font-semibold">Synthesizing Mathematical Proofs</p>
                                <p className="text-sm mt-2 text-center max-w-sm">
                                    Correlating WORM hashes mapping to ISO 42001 and EU AI Act constraints. 
                                    Invoking advanced inference models...
                                </p>
                            </div>
                        ) : draftMarkdown ? (
                            <div className="space-y-6 animate-in fade-in">
                                <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
                                    <div className="bg-secondary px-6 py-3 border-b border-border flex items-center gap-2 text-sm font-semibold">
                                        <IconFileText size={18} /> Review & Refine Technical Documentation
                                    </div>
                                    <textarea 
                                        value={draftMarkdown}
                                        onChange={e => setDraftMarkdown(e.target.value)}
                                        className="w-full h-[600px] bg-background text-foreground text-sm p-6 focus:outline-none resize-y font-mono leading-relaxed"
                                    />
                                </div>

                                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-amber-500">
                                        <IconLock size={20}/> Legal Attestation Check
                                    </h3>
                                    <p className="text-sm text-slate-400 mb-6">
                                        Under Article 14, an authorized human representative must take ultimate liability for the system's operational documentation. Ensure the drafted text accurately reflects your internal controls before sealing.
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 mb-1">Attester Legal Name</label>
                                            <input 
                                                type="text" 
                                                value={attesterName}
                                                onChange={e => setAttesterName(e.target.value)}
                                                placeholder="e.g. Jane Doe"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 mb-1">Corporate Title</label>
                                            <input 
                                                type="text" 
                                                value={attesterTitle}
                                                onChange={e => setAttesterTitle(e.target.value)}
                                                placeholder="e.g. Chief Compliance Officer"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500/50"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleSeal}
                                        disabled={!attesterName || !attesterTitle || isSealing}
                                        className={cn(
                                            "w-full py-4 rounded-xl font-bold tracking-widest text-sm transition-all flex items-center justify-center gap-2 uppercase",
                                            attesterName && attesterTitle && !isSealing
                                                ? "bg-amber-500 text-slate-900 hover:bg-amber-400" 
                                                : "bg-slate-800 text-slate-500 cursor-not-allowed"
                                        )}
                                    >
                                        {isSealing ? <IconRefresh className="animate-spin" size={20} /> : <IconFileCheck size={20} />}
                                        {isSealing ? "Applying Cryptographic Seal..." : "Attest & Finalize Legal Document"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground/50">
                                <IconFileText size={64} className="mb-4 text-muted-foreground/30" />
                                <p>Awaiting Target System & API Credential</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
