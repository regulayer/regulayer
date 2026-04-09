'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Building2, Code, Copy, Loader2, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import { getMe, getProjects, updateProject, createProject, createApiKey, ApiKeyWithSecret, Project } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { RegulayerLogo } from '@/components/ui/regulayer-logo';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [orgId, setOrgId] = useState<string>('');
    const [project, setProject] = useState<Project | null>(null);
    const [projectName, setProjectName] = useState('');
    const [apiKey, setApiKey] = useState<ApiKeyWithSecret | null>(null);
    const [keyError, setKeyError] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeLang, setActiveLang] = useState<'python' | 'node' | 'go'>('python');

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const me = await getMe();
            if (me.data?.id && me.data.org) {
                setOrgId(me.data.org.id);
                const projectsRes = await getProjects(me.data.org.id);
                if (projectsRes.data && projectsRes.data.length > 0) {
                    setProject(projectsRes.data[0]);
                    setProjectName(projectsRes.data[0].name);
                }
            }
        } catch (e) {
            console.error("Failed to load onboarding data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleProjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectName.trim()) return;

        setSaving(true);
        try {
            if (project) {
                await updateProject(project.id, { name: projectName });
            } else if (orgId) {
                const createRes = await createProject(orgId, { name: projectName });
                if (createRes.data) {
                    setProject(createRes.data);
                }
            }
            setStep(2); // Go directly to integration/keys
        } catch {
            alert("Failed to save project");
        } finally {
            setSaving(false);
        }
    };

    const attemptKeyGeneration = async () => {
        if (apiKey) return;
        setSaving(true);
        setKeyError(false);
        try {
            let projectId = project?.id;
            if (!projectId && orgId) {
                const createRes = await createProject(orgId, { name: projectName || 'Production' });
                if (createRes.data) {
                    setProject(createRes.data);
                    projectId = createRes.data.id;
                }
            }

            if (!projectId) {
                setKeyError(true);
                return;
            }

            const res = await createApiKey(projectId, {
                name: "Production Default Key",
                scopes: ["ingest"]
            });

            if (res.data) {
                setApiKey(res.data);
            } else {
                setKeyError(true);
            }
        } catch (err) {
            console.error('[Onboarding] KeyError:', err);
            setKeyError(true);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (step === 2 && !apiKey) {
            attemptKeyGeneration();
        }
    }, [step]);

    const finishOnboarding = () => {
        router.push('/dashboard');
    };

    const copyToClipboard = () => {
        if (apiKey?.key_secret) {
            navigator.clipboard.writeText(apiKey.key_secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 bg-slate-700 animate-spin" />
            </div>
        );
    }

    const currentKey = apiKey?.key_secret || 'YOUR_API_KEY';

    const snippets = {
        python: `import os\nfrom regulayer import Regulayer\n\n# Initialize the secure client\nclient = Regulayer(\n    api_key="` + currentKey + `"\n)\n\n# Wrap your critical LLM call\n@client.trace(model="gpt-4", tags=["auth"])\ndef generate_response(prompt):\n    return llm.predict(prompt)\n`,
        node: `import { Regulayer } from '@regulayer/sdk';\n\nconst regulayer = new Regulayer(\n    '` + currentKey + `'\n);\n\nconst record = await regulayer.record({\n    input: "Analyze transaction...",\n    output: "Approved.",\n    model: "gpt-4"\n});\n`,
        go: `import "github.com/regulayer/regulayer-go"\n\nclient := regulayer.NewClient("` + currentKey + `")\n\nres, err := client.Evaluate(regulayer.PolicyCheck{\n    Prompt: "User input...",\n    Target: "gpt-4",\n})`
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-secondary flex flex-col">
            {/* Header / Progress bar */}
            <div className="border-b border-border bg-slate-50 p-6 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shadow-lg">
                        <RegulayerLogo className="w-5 h-5" color="hsl(15,85%,58%)" />
                    </div>
                    <span className="font-semibold tracking-tight text-foreground">Setup Project</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        {/* Step Indicators */}
                        <div className={`w-2.5 h-2.5 rounded-full ${step >= 1 ? 'bg-slate-700 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-secondary'}`} />
                        <div className={`w-8 h-px ${step >= 2 ? 'bg-slate-700' : 'bg-secondary'}`} />
                        <div className={`w-2.5 h-2.5 rounded-full ${step >= 2 ? 'bg-slate-700 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-secondary'}`} />
                    </div>
                    {step < 2 && (
                        <button
                            onClick={finishOnboarding}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Skip Setup
                        </button>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 flex items-start justify-center pt-16 px-6">
                <div className="w-full max-w-[600px]">

                    {/* Step 1: Project Setup */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                            className="space-y-8"
                        >
                            <div className="mb-10 text-center">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">Create your first vault</h1>
                                <p className="text-muted-foreground">
                                    A project isolates your cryptographic records, API keys, and governance policies.
                                </p>
                            </div>

                            <form onSubmit={handleProjectSubmit} className="bg-white border border-border rounded-xl p-8 shadow-2xl">
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-foreground mb-3">Project Environment Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            className="w-full bg-white border border-border rounded-lg py-3.5 pl-12 pr-4 text-foreground placeholder-slate-800 focus:bg-slate-700 focus:ring-1 focus:bg-slate-700 hover:border-slate-400 transition-all outline-none font-medium"
                                            placeholder="e.g. Production Vault"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving || !projectName}
                                    className="w-full bg-secondary text-foreground py-3.5 rounded-lg font-bold hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.15)] flex justify-center items-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue to Integration'}
                                    {!saving && <ArrowRight className="w-4 h-4" />}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* Step 2: Integration & Keys */}
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                            className="space-y-8"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">Secure your integration</h2>
                                <p className="text-muted-foreground">
                                    Use this production key to start cryptographically recording your LLM decisions.
                                </p>
                            </div>

                            <div className="bg-white border border-border rounded-xl overflow-hidden shadow-2xl">

                                {/* API Key Section */}
                                <div className="p-8 border-b border-border bg-white">
                                    {saving ? (
                                        <div className="flex justify-center py-6">
                                            <Loader2 className="w-6 h-6 bg-slate-700 animate-spin" />
                                        </div>
                                    ) : apiKey ? (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Production Key</label>
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary/10 text-amber-500 border border-amber-500/20">Store securely</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 bg-black border border-border p-3.5 rounded-lg text-emerald-400 font-mono text-sm tracking-tight break-all shadow-inner">
                                                    {apiKey.key_secret}
                                                </code>
                                                <button
                                                    onClick={copyToClipboard}
                                                    className={`p-3.5 rounded-lg border transition-all flex items-center justify-center shrink-0 w-12 h-12 ${copied ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                                                        }`}
                                                >
                                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-red-400 text-sm mb-4">API key generation failed.</p>
                                            <button onClick={attemptKeyGeneration} className="text-sm font-medium text-zinc-400 hover:-zinc-300">Retry</button>
                                        </div>
                                    )}
                                </div>

                                {/* Code Snippets Section */}
                                <div>
                                    <div className="flex items-center bg-[#1a1a24] border-b border-border px-4">
                                        {(['python', 'node', 'go'] as const).map(lang => (
                                            <button
                                                key={lang}
                                                onClick={() => setActiveLang(lang)}
                                                className={`px-4 py-3 text-xs font-mono font-medium transition-all capitalize border-b-2 ${activeLang === lang
                                                    ? '-zinc-400 bg-slate-700 bg-[#222230]'
                                                    : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-[#222230]/50'
                                                    }`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-6 bg-background">
                                        <pre className="text-sm font-mono text-foreground overflow-x-auto selection:bg-secondary">
                                            <code>{snippets[activeLang]}</code>
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={finishOnboarding}
                                className="w-full bg-white border border-border text-foreground py-4 rounded-xl font-bold hover:bg-secondary hover:border-slate-400 transition-all flex justify-center items-center gap-2 shadow-lg"
                            >
                                Enter Console
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
}

