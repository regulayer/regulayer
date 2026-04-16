"use client";

import React, { useState, useEffect } from "react";
import {
    IconTargetArrow, IconBrain, IconShieldCheck, IconLock,
    IconFileText, IconRefresh, IconFileCheck, IconAlertTriangle,
    IconChevronDown, IconDownload
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
    getAISystems,
    getMe,
    draftAiActReport,
    sealAiActReport,
    AISystem
} from "@/lib/api";

const PROVIDERS = [
    { value: "groq", label: "Groq", model: "Llama 3.3 70B" },
    { value: "openai", label: "OpenAI", model: "GPT-4o" },
    { value: "anthropic", label: "Anthropic", model: "Claude 3.5 Sonnet" },
];

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
    const [sealedDoc, setSealedDoc] = useState<{ status: string, markdown: string, hash: string, timestamp: string } | null>(null);

    useEffect(() => {
        Promise.all([
            getAISystems(),
            getMe()
        ]).then(([systemsRes, meRes]) => {
            setSystems(systemsRes);
            if (meRes.data?.org) {
                setOrgLogoUrl((meRes.data.org as any).logo_url || '');
                setOrgName(meRes.data.org.name || 'Organization');
            }
            setLoadingSystems(false);
        }).catch(() => setLoadingSystems(false));
    }, []);

    const selectedSystem = systems.find(s => s.id === selectedSystemId);
    const selectedProvider = PROVIDERS.find(p => p.value === provider);

    const handleDraft = async () => {
        if (!selectedSystemId || !aiApiKey) return;
        setDraftError("");
        setIsDrafting(true);
        setDraftMarkdown("");
        setSealedDoc(null);

        if (!selectedSystem) return;

        try {
            const res = await draftAiActReport({
                ai_api_key: aiApiKey,
                provider: provider,
                project_id: selectedSystem.id,
                system_name: selectedSystem.name
            });
            setDraftMarkdown(res.data.markdown);
        } catch (err: any) {
            setDraftError(err.response?.data?.detail || "Failed to generate draft. Please verify your API key and try again.");
        } finally {
            setIsDrafting(false);
        }
    };

    const handleSeal = async () => {
        if (!attesterName || !attesterTitle || !draftMarkdown) return;
        setIsSealing(true);

        try {
            const res = await sealAiActReport({
                project_id: selectedSystemId,
                system_name: selectedSystem?.name || "Unknown System",
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

    const handleReset = () => {
        setSealedDoc(null);
        setDraftMarkdown("");
        setAttesterName("");
        setAttesterTitle("");
    };

    const handlePrint = () => {
        if (!sealedDoc) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<title>EU AI Act — Technical Documentation & FRIA — ${selectedSystem?.name || 'System'}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Source Serif 4', Georgia, serif; color: #111827; background: #fff; padding: 60px 72px; max-width: 900px; margin: 0 auto; line-height: 1.8; font-size: 13.5px; }
.doc-header { border-bottom: 3px double #111827; padding-bottom: 20px; margin-bottom: 12px; }
.doc-header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.org-name { font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: -0.3px; text-transform: uppercase; }
.platform-mark { font-family: 'Inter', sans-serif; text-align: right; font-size: 9px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; line-height: 1.8; }
.classification { font-family: 'Inter', sans-serif; text-align: center; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #6B7280; border: 1px solid #D1D5DB; padding: 4px 16px; display: inline-block; margin-top: 8px; }
.doc-title { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin: 24px 0 6px; line-height: 1.3; }
.doc-subtitle { font-size: 13px; color: #6B7280; margin-bottom: 32px; font-style: italic; }
.doc-body { white-space: pre-wrap; word-wrap: break-word; }
.doc-body h1 { font-size: 20px; font-weight: 700; margin: 36px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #E5E7EB; }
.doc-body h2 { font-size: 16px; font-weight: 700; margin: 28px 0 10px; }
.doc-body h3 { font-size: 14px; font-weight: 700; margin: 20px 0 8px; }
.doc-body p { margin-bottom: 12px; }
.doc-body table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
.doc-body th, .doc-body td { border: 1px solid #D1D5DB; padding: 8px 12px; text-align: left; }
.doc-body th { background: #F9FAFB; font-weight: 600; font-family: 'Inter', sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
.doc-body strong { font-weight: 700; }
.doc-body em { font-style: italic; color: #4B5563; }
.doc-body code { font-family: 'Courier New', monospace; font-size: 11px; background: #F3F4F6; padding: 2px 6px; border-radius: 3px; }
.doc-body hr { border: none; border-top: 1px solid #E5E7EB; margin: 32px 0; }
.doc-body ol, .doc-body ul { margin: 8px 0 16px 24px; }
.doc-body li { margin-bottom: 6px; }
.footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #D1D5DB; font-family: 'Inter', sans-serif; font-size: 8px; color: #9CA3AF; display: flex; justify-content: space-between; text-transform: uppercase; letter-spacing: 0.5px; }
@media print {
  body { padding: 40px; }
  .doc-header, .doc-body h1, .doc-body h2, .seal-box { break-inside: avoid; }
}
</style>
</head>
<body>
<div class="doc-header">
  <div class="doc-header-top">
    <div class="org-name">${orgName}</div>
    <div class="platform-mark">
      Regulayer Compliance Infrastructure<br>
      Document Ref: ${selectedSystemId.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}<br>
      Generated: ${new Date(sealedDoc.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
      Regulation: EU AI Act (2024/1689)
    </div>
  </div>
  <div style="text-align:center;">
    <span class="classification">Confidential — Regulatory Compliance Document</span>
  </div>
</div>

<div class="doc-title">Technical Documentation & Fundamental Rights Impact Assessment</div>
<div class="doc-subtitle">Prepared pursuant to Articles 11, 13, and 27 of Regulation (EU) 2024/1689 of the European Parliament and of the Council</div>

<div class="doc-body">${sealedDoc.markdown}</div>

<div class="footer">
  <span>© ${new Date().getFullYear()} ${orgName} — Prepared via Regulayer Enterprise Compliance Infrastructure</span>
  <span>SHA-256: ${sealedDoc.hash.slice(0, 24)}...</span>
</div>
</body>
</html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    };

    // ── Sealed Document View ──
    if (sealedDoc) {
        return (
            <div className="p-6 md:p-8 pb-20 space-y-6 text-foreground">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Assessment Finalized</h1>
                        <p className="text-muted-foreground text-sm">Your EU AI Act assessment has been cryptographically sealed and is ready for distribution.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                            <IconDownload size={16} /> Download Report
                        </button>
                        <button onClick={handleReset} className="px-4 py-2.5 bg-secondary text-foreground rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors">
                            New Assessment
                        </button>
                    </div>
                </div>

                {/* Seal Confirmation Banner */}
                <div className={cn("bg-card border border-border rounded-2xl shadow-card overflow-hidden")}>
                    <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-500/5 border-b border-border">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold mb-4">
                            <IconShieldCheck size={16} /> REGULAYER SEALED
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Sealed on {new Date(sealedDoc.timestamp).toLocaleString()} • SHA-256: <code className="font-mono text-[10px]">{sealedDoc.hash.slice(0, 24)}...</code>
                        </p>
                    </div>

                    {/* Document Preview */}
                    <div className="px-6 py-4 border-b border-border bg-background flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold">Technical Documentation & FRIA</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{selectedSystem?.name || 'System'} • EU AI Act (2024/1689)</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                                ID: {selectedSystemId.slice(0, 8).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="bg-secondary/30 rounded-xl p-6 text-sm text-foreground font-mono whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
                            {sealedDoc.markdown}
                        </div>
                    </div>

                    {/* Attestation Footer */}
                    <div className="px-6 py-5 border-t border-border bg-background flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground italic mb-1">Attested by:</p>
                            <p className="text-sm font-semibold">{attesterName}</p>
                            <p className="text-xs text-muted-foreground">{attesterTitle} — {orgName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-mono text-muted-foreground bg-secondary px-3 py-1.5 rounded">
                                SHA-256: {sealedDoc.hash.slice(0, 32)}...
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                    This document was auto-drafted by AI and reviewed by a human attester. It is a self-assessment and does not constitute formal legal certification.
                </p>
            </div>
        );
    }

    // ── Main Assessment Flow ──
    return (
        <div className="p-6 md:p-8 pb-20 space-y-6 text-foreground">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Automated Assessment & FRIA</h1>
                    <p className="text-muted-foreground text-sm">Generate AI-drafted EU AI Act Technical Documentation from live system telemetry.</p>
                </div>
                <IconBrain size={28} className="text-muted-foreground" />
            </div>

            {/* Step 1: System Selection */}
            <div className="bg-card border border-border rounded-2xl shadow-card p-6">
                <h3 className="text-sm font-semibold mb-4">Select AI System</h3>
                {loadingSystems ? (
                    <div className="h-20 flex items-center justify-center text-muted-foreground text-sm">Loading systems...</div>
                ) : systems.length === 0 ? (
                    <div className="text-center py-8">
                        <IconTargetArrow size={32} className="mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">No AI systems registered. Go to AI Systems to register one first.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {systems.map(system => (
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
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Step 2: Provider & Key */}
            <div className="bg-card border border-border rounded-2xl shadow-card p-6">
                <h3 className="text-sm font-semibold mb-4">AI Engine Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
                    <div>
                        <label className="block text-xs text-muted-foreground font-medium mb-1.5">Provider</label>
                        <select
                            className="w-full h-10 px-3 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                            value={provider}
                            onChange={e => setProvider(e.target.value)}
                        >
                            {PROVIDERS.map(p => (
                                <option key={p.value} value={p.value}>{p.label} — {p.model}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground font-medium mb-1.5">API Key</label>
                        <input
                            type="password"
                            placeholder={provider === 'groq' ? 'gsk_...' : provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                            value={aiApiKey}
                            onChange={e => setAiApiKey(e.target.value)}
                            className="w-full h-10 px-4 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                        />
                    </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                    Your key is transmitted statelessly to the {selectedProvider?.label || 'provider'} API for a single inference call. It is never persisted in Regulayer infrastructure.
                </p>

                <button
                    onClick={handleDraft}
                    disabled={!selectedSystemId || !aiApiKey || isDrafting}
                    className={cn(
                        "w-full py-3 mt-5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
                        selectedSystemId && aiApiKey && !isDrafting
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-secondary text-muted-foreground cursor-not-allowed"
                    )}
                >
                    {isDrafting ? (
                        <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Generating Assessment...</>
                    ) : (
                        <><IconTargetArrow size={16} /> Generate Assessment Draft</>
                    )}
                </button>
            </div>

            {/* Error State */}
            {draftError && (
                <div className="bg-card border border-red-200 dark:border-red-500/20 rounded-2xl shadow-card p-5 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                        <IconAlertTriangle size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Generation Failed</h3>
                        <p className="text-xs text-muted-foreground mt-1">{draftError}</p>
                    </div>
                </div>
            )}

            {/* Drafting Animation */}
            {isDrafting && (
                <div className="bg-card border border-border rounded-2xl shadow-card p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-6" />
                    <h3 className="text-sm font-semibold text-foreground mb-1">Synthesizing Compliance Assessment</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        Correlating WORM log hashes, HITL interventions, and incident data with EU AI Act article requirements via {selectedProvider?.label || 'AI'} ({selectedProvider?.model || 'LLM'})...
                    </p>
                </div>
            )}

            {/* Step 3: Review Draft */}
            {draftMarkdown && !isDrafting && (
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-background flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <IconFileText size={18} className="text-muted-foreground" />
                                <div>
                                    <h3 className="text-sm font-semibold">Review & Refine Draft</h3>
                                    <p className="text-[11px] text-muted-foreground">Edit the generated markdown before attestation. All changes will be included in the final sealed document.</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                                {draftMarkdown.length.toLocaleString()} chars
                            </span>
                        </div>
                        <textarea
                            value={draftMarkdown}
                            onChange={e => setDraftMarkdown(e.target.value)}
                            className="w-full h-[500px] bg-background text-foreground text-sm p-6 focus:outline-none resize-y font-mono leading-relaxed border-0"
                        />
                    </div>

                    {/* Step 4: Attestation */}
                    <div className="bg-card border border-border rounded-2xl shadow-card p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                                <IconLock size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">Legal Attestation</h3>
                                <p className="text-xs text-muted-foreground">Under Article 14, an authorized human representative must assume liability for this documentation.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                            <div>
                                <label className="block text-xs text-muted-foreground font-medium mb-1.5">Attester Full Name</label>
                                <input
                                    type="text"
                                    value={attesterName}
                                    onChange={e => setAttesterName(e.target.value)}
                                    placeholder="e.g. Jane Doe"
                                    className="w-full h-10 px-4 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-muted-foreground font-medium mb-1.5">Corporate Title</label>
                                <input
                                    type="text"
                                    value={attesterTitle}
                                    onChange={e => setAttesterTitle(e.target.value)}
                                    placeholder="e.g. Chief Compliance Officer"
                                    className="w-full h-10 px-4 text-sm bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground mb-5 leading-relaxed">
                            By clicking below, you affirm that you have reviewed this document and that it accurately represents the operational reality and compliance controls of the AI system. This action generates a cryptographic SHA-256 seal that cannot be altered.
                        </p>

                        <button
                            onClick={handleSeal}
                            disabled={!attesterName || !attesterTitle || isSealing}
                            className={cn(
                                "w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
                                attesterName && attesterTitle && !isSealing
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                            )}
                        >
                            {isSealing ? (
                                <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Sealing Document...</>
                            ) : (
                                <><IconFileCheck size={16} /> Attest & Seal Document</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
