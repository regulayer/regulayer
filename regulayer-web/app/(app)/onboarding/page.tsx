'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Building2, Check, Code, Copy, Loader2, Sparkles } from 'lucide-react'; //lucide-react icons
import { getMe, getProjects, updateProject, createProject, createApiKey, createCheckoutSession, ApiKeyWithSecret, Project } from '@/lib/api';

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

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const me = await getMe();
            // Backend returns flat UserWithOrg: { id, email, ..., org: { id, name, ... } }
            // me.data IS the user (not me.data.user)
            if (me.data?.id) {
                if (me.data.org) {
                    setOrgId(me.data.org.id);
                    const projectsRes = await getProjects(me.data.org.id);
                    if (projectsRes.data && projectsRes.data.length > 0) {
                        setProject(projectsRes.data[0]);
                        setProjectName(projectsRes.data[0].name);
                    }
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
                // Update existing project
                await updateProject(project.id, projectName);
            } else if (orgId) {
                // Create new project for organizations that don't have one yet
                const createRes = await createProject(orgId, projectName);
                if (createRes.data) {
                    setProject(createRes.data);
                }
            }
            setStep(3); // Go to Billing
        } catch {
            alert("Failed to save project");
        } finally {
            setSaving(false);
        }
    };

    const handlePlanSelect = async (plan: 'free' | 'pro') => {
        if (plan === 'free') {
            setStep(4); // Go to Integration
        } else {
            // Redirect to Stripe Checkout for Pro plan
            setSaving(true);
            try {
                const res = await createCheckoutSession(
                    'pro',
                    `${window.location.origin}/dashboard?upgraded=true`,
                    `${window.location.origin}/onboarding`
                );
                if (res.data?.url) {
                    window.location.href = res.data.url;
                } else {
                    // Fallback: if mock mode, just proceed
                    console.warn('No checkout URL returned, proceeding to integration step');
                    setStep(4);
                }
            } catch {
                console.error('Checkout session failed');
                // Graceful fallback - continue onboarding
                setStep(4);
            } finally {
                setSaving(false);
            }
        }
    };

    // Key generation logic
    const attemptKeyGeneration = async () => {
        if (apiKey) return; // Already have a key
        setSaving(true);
        setKeyError(false);
        try {
            let projectId = project?.id;
            if (!projectId && orgId) {
                console.log('[Onboarding] Creating project for org:', orgId);
                const createRes = await createProject(orgId, projectName || 'My AI Agent');
                console.log('[Onboarding] createProject result:', JSON.stringify(createRes));
                if (createRes.data) {
                    setProject(createRes.data);
                    projectId = createRes.data.id;
                } else {
                    console.error('[Onboarding] createProject failed:', createRes.error);
                }
            }

            if (!projectId) {
                console.error('[Onboarding] No projectId available. project:', project, 'orgId:', orgId);
                setKeyError(true);
                return;
            }

            console.log('[Onboarding] Creating API key for project:', projectId);
            const res = await createApiKey(projectId, {
                name: "Onboarding Key",
                scopes: ["ingest"]
            });
            console.log('[Onboarding] createApiKey result:', JSON.stringify(res));
            if (res.data) {
                setApiKey(res.data);
            } else {
                console.error('[Onboarding] createApiKey failed:', res.error);
                setKeyError(true);
            }
        } catch (err) {
            console.error('[Onboarding] attemptKeyGeneration exception:', err);
            setKeyError(true);
        } finally {
            setSaving(false);
        }
    };

    // Trigger key generation when entering step 4
    useEffect(() => {
        if (step === 4 && !apiKey) {
            attemptKeyGeneration();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    const finishOnboarding = () => {
        router.push('/dashboard');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            {/* Header */}
            <div className="border-b border-slate-800 p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-primary-500" />
                    <span className="font-bold text-xl">Regulayer</span>
                </div>
                <div className="text-sm text-slate-400">
                    Step {step} of 4
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-start justify-center pt-20 px-4">
                <div className="w-full max-w-2xl">

                    {/* Step 1: Welcome */}
                    {step === 1 && (
                        <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-primary-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto ring-1 ring-primary-500/50">
                                <Sparkles className="w-10 h-10 text-primary-400" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold mb-4">Welcome to Regulayer</h1>
                                <p className="text-xl text-slate-400 max-w-lg mx-auto">
                                    You&apos;re minutes away from cryptographic proof for your AI agents.
                                    Let&apos;s get you set up.
                                </p>
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                className="bg-primary-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-500 transition flex items-center gap-2 mx-auto"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Project Setup */}
                    {step === 2 && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <h2 className="text-2xl font-bold mb-2">Name your Project</h2>
                            <p className="text-slate-400 mb-8">
                                Projects organize your agents and decisions. You can add more later.
                            </p>

                            <form onSubmit={handleProjectSubmit}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            type="text"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                            placeholder="My AI Agent"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving || !projectName}
                                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                                    {!saving && <ArrowRight className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Step 3: Billing */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold mb-2">Choose your plan</h2>
                                <p className="text-slate-400">
                                    Start free, upgrade when you scale.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Free Plan */}
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-500 transition cursor-pointer relative group" onClick={() => handlePlanSelect('free')}>
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="w-6 h-6 rounded-full border-2 border-slate-600 group-hover:border-primary-500 flex items-center justify-center">
                                            {/* Radio circle */}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Developer</h3>
                                    <div className="text-3xl font-bold mb-4">$0 <span className="text-sm font-normal text-slate-400">/mo</span></div>
                                    <ul className="space-y-3 mb-6">
                                        <li className="flex items-center gap-2 text-slate-300">
                                            <Check className="w-4 h-4 text-primary-400" /> 1,000 Decisions/mo
                                        </li>
                                        <li className="flex items-center gap-2 text-slate-300">
                                            <Check className="w-4 h-4 text-primary-400" /> 30-day Retention
                                        </li>
                                        <li className="flex items-center gap-2 text-slate-300">
                                            <Check className="w-4 h-4 text-primary-400" /> Community Support
                                        </li>
                                    </ul>
                                    <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition">
                                        Select Free
                                    </button>
                                </div>

                                {/* Pro Plan */}
                                <div className="bg-slate-800 border-2 border-primary-900/50 rounded-2xl p-6 hover:border-primary-500 transition cursor-pointer relative group" onClick={() => handlePlanSelect('pro')}>
                                    <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                                        RECOMMENDED
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Startup</h3>
                                    <div className="text-3xl font-bold mb-4">$49 <span className="text-sm font-normal text-slate-400">/mo</span></div>
                                    <ul className="space-y-3 mb-6">
                                        <li className="flex items-center gap-2 text-slate-300">
                                            <Check className="w-4 h-4 text-primary-400" /> 100,000 Decisions/mo
                                        </li>
                                        <li className="flex items-center gap-2 text-slate-300">
                                            <Check className="w-4 h-4 text-primary-400" /> 1-year Retention
                                        </li>
                                        <li className="flex items-center gap-2 text-slate-300">
                                            <Check className="w-4 h-4 text-primary-400" /> Priority Support
                                        </li>
                                    </ul>
                                    <button className="w-full bg-primary-600 hover:bg-primary-500 text-white py-2 rounded-lg font-medium transition">
                                        Select Startup
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Integration */}
                    {step === 4 && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="text-center mb-8">
                                <div className="bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto ring-1 ring-green-500/50 mb-4">
                                    <Code className="w-8 h-8 text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">You&apos;re ready to integrate</h2>
                                <p className="text-slate-400">
                                    Use this key to record decisions from your AI agent.
                                </p>
                            </div>

                            {saving ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                                </div>
                            ) : apiKey ? (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Your API Key</label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-slate-950 border border-slate-800 p-4 rounded-lg text-primary-400 font-mono break-all">
                                                {apiKey.key_secret}
                                            </code>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(apiKey.key_secret || "")}
                                                className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                                                title="Copy to clipboard"
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-amber-500 mt-2">
                                            Save this key now! You won&apos;t be able to see it again.
                                        </p>
                                    </div>

                                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                                        <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-bold">Quick Start (Python)</p>
                                        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
                                            {`from regulayer import Regulayer

sender = Regulayer(
    api_key="${apiKey.key_secret}"
)

with sender.scan(input="Verify this"):
    # Your agent logic
    pass`}
                                        </pre>
                                    </div>

                                    <button
                                        onClick={finishOnboarding}
                                        className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-500 transition flex items-center justify-center gap-2"
                                    >
                                        Go to Dashboard
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : keyError ? (
                                <div className="text-center space-y-4">
                                    <p className="text-red-400">
                                        Failed to generate API Key.
                                    </p>
                                    <button
                                        onClick={attemptKeyGeneration}
                                        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-500 transition font-medium"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
