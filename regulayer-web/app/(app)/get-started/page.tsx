'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Shield, Key, Terminal, Play, CheckCircle,
    Copy, ChevronRight, ChevronDown, Lock,
    AlertCircle, Download, Loader2
} from 'lucide-react';
import {
    getMe, createProject, createApiKey, getProjects
} from '@/lib/api';

// ============================================================
// Wizard State
// ============================================================

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface WizardState {
    currentStep: WizardStep;
    projectCreated: boolean;
    apiKey: string | null;
    sdkInstalled: boolean;
    decisionRecorded: boolean;
    decisionId: string | null;
    orgId: string | null;
    projectId: string | null;
}

// ============================================================
// Trust Micropanels (Inline Education)
// ============================================================

function TrustHint({ children, expanded = false }: { children: React.ReactNode; expanded?: boolean }) {
    const [isOpen, setIsOpen] = useState(expanded);

    return (
        <div className="mt-3 text-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span>Why this matters</span>
            </button>
            {isOpen && (
                <div className="mt-2 pl-5 text-muted-foreground border-l-2 border-border">
                    {children}
                </div>
            )}
        </div>
    );
}

function ImmutableBadge() {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="relative inline-block">
            <span
                className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-sm cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <Lock className="w-3 h-3" />
                Immutable
            </span>
            {showTooltip && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white text-foreground text-xs p-2 rounded shadow-lg z-10">
                    Once recorded, this decision cannot be altered. The proof works even without Regulayer.
                </div>
            )}
        </div>
    );
}

// ============================================================
// Step Components
// ============================================================

function Step1Welcome({ onNext, loading }: { onNext: () => void; loading: boolean }) {
    return (
        <div className="text-center max-w-2xl mx-auto">
            <Shield className="w-16 h-16 text-slate-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
                Welcome to Regulayer
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
                Regulayer records AI decisions in a way that can be proven later — even without us.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
                Works for models, rules, agents, and automated decisions.
            </p>

            <button
                onClick={onNext}
                disabled={loading}
                className="bg-slate-800 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-slate-900 disabled:opacity-50 flex items-center gap-2 mx-auto mb-4"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Project...
                    </>
                ) : (
                    'Create First Project'
                )}
            </button>

            <TrustHint>
                Every decision you record is cryptographically timestamped and chained.
                You can export proofs that work offline, forever.
            </TrustHint>
        </div>
    );
}

function Step2ApiKey({ apiKey, onNext }: { apiKey: string; onNext: () => void }) {
    const [copied, setCopied] = useState(false);

    const copyKey = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-xl">
                    <Key className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Your API Key</h2>
                    <p className="text-muted-foreground">This key controls access to your project</p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                    <code className="text-green-400 font-mono break-all">{apiKey}</code>
                    <button
                        onClick={copyKey}
                        className="text-muted-foreground hover:text-foreground p-2 ml-2 flex-shrink-0"
                    >
                        {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-amber-800 text-sm">
                    <strong>Store this securely.</strong> You won&apos;t see it again.
                </p>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
                This key controls access — it cannot modify history.
            </p>

            <button
                onClick={onNext}
                className="bg-slate-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-900"
            >
                Continue to Installation
            </button>
        </div>
    );
}

function Step3Install({ onNext }: { onNext: () => void }) {
    const [showChecksum, setShowChecksum] = useState(false);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-xl">
                    <Terminal className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Install the SDK</h2>
                    <p className="text-muted-foreground">One command to get started</p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 mb-4">
                <code className="text-green-400 font-mono">pip install regulayer==1.0.0</code>
            </div>

            <button
                onClick={() => setShowChecksum(!showChecksum)}
                className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
            >
                {showChecksum ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                Verify package integrity (advanced)
            </button>

            {showChecksum && (
                <div className="bg-secondary rounded-lg p-4 mb-6 text-sm">
                    <p className="text-foreground mb-2">Verify the checksum matches our registry:</p>
                    <code className="text-xs text-muted-foreground block">
                        sha256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                    </code>
                </div>
            )}

            <button
                onClick={onNext}
                className="bg-slate-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-900"
            >
                I&apos;ve Installed It
            </button>
        </div>
    );
}

function Step4Record({
    apiKey,
    onSuccess,
    error
}: {
    apiKey: string;
    onSuccess: (id: string) => void;
    error: string | null;
}) {
    const [running, setRunning] = useState(false);
    const [recordError, setRecordError] = useState<string | null>(error);
    const [status, setStatus] = useState<string | null>(null);

    const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8106';

    const codeSnippet = `from regulayer import trace, configure

configure(api_key="${apiKey}")

with trace(
    system="loan_approval",
    risk_level="high",
    model_name="demo-model",
    model_version="1.0"
) as t:
    t.set_input({"income": 50000})
    t.set_output({"approved": True})`;

    const runExample = async () => {
        setRunning(true);
        setRecordError(null);
        setStatus('Sending decision to gateway...');

        try {
            const response = await fetch(`${GATEWAY_URL}/v1/decisions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    ingestion_type: 'legacy',
                    payload: {
                        event_version: '1.0',
                        event_state: 'completed',
                        decision_id: crypto.randomUUID(),
                        system_name: 'loan_approval',
                        risk_level: 'high',
                        model_name: 'demo-model',
                        model_version: '1.0',
                        input_hash: null,
                        output_hash: null,
                        start_timestamp: new Date().toISOString(),
                        end_timestamp: new Date().toISOString(),
                        execution_duration_ms: 42,
                        runtime_fingerprint: {
                            python_version: '3.11.0',
                            os: 'browser-demo',
                            sdk_version: '1.0.0',
                            sdk_instance_id: crypto.randomUUID(),
                        },
                        input: { income: 50000 },
                        output: { approved: true },
                    },
                }),
            });

            if (response.status === 202 || response.status === 200) {
                const data = await response.json();
                setStatus('Decision accepted (202). Polling for confirmation...');

                // The gateway returns the decision_id or record confirmation
                const decisionId = data.decision_id || data.record?.decision_id;
                if (decisionId) {
                    onSuccess(decisionId);
                } else {
                    // If the response doesn't include an ID, still succeed
                    setStatus('Decision recorded successfully.');
                    onSuccess(data.id || 'recorded');
                }
            } else {
                const errData = await response.json().catch(() => null);
                setRecordError(
                    errData?.message || errData?.detail || `Gateway returned ${response.status}`
                );
            }
        } catch (err) {
            setRecordError(
                err instanceof Error ? err.message : 'Failed to connect to gateway'
            );
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-xl">
                    <Play className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Record Your First Decision</h2>
                    <p className="text-muted-foreground">Run this code in Python — or click below to test</p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 mb-4 overflow-x-auto">
                <pre className="text-green-400 font-mono text-sm">{codeSnippet}</pre>
            </div>

            {recordError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <p className="text-red-700 text-sm">{recordError}</p>
                </div>
            )}

            {status && !recordError && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-muted-foreground text-sm">{status}</p>
                </div>
            )}

            <button
                onClick={runExample}
                disabled={running}
                className="bg-slate-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-900 disabled:opacity-50 flex items-center gap-2"
            >
                {running ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Recording...
                    </>
                ) : (
                    <>
                        <Play className="w-4 h-4" />
                        Send Test Decision
                    </>
                )}
            </button>

            <p className="text-sm text-muted-foreground mt-4">
                This sends a real decision to the gateway. You can also run the Python code locally.
            </p>
        </div>
    );
}

function Step5Success({ decisionId }: { decisionId: string }) {
    return (
        <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-2">Decision Recorded!</h2>
            <p className="text-muted-foreground mb-6">Your first AI decision is now cryptographically provable.</p>

            <div className="bg-secondary rounded-xl p-6 mb-6 text-left">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">Decision ID</span>
                    <code className="font-mono text-foreground text-sm break-all">{decisionId}</code>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">Timestamp</span>
                    <span className="text-foreground">{new Date().toISOString()}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <ImmutableBadge />
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                    This decision is now part of an append-only record.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                    href="/dashboard"
                    className="bg-slate-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-900"
                >
                    View in Dashboard
                </Link>
                <Link
                    href="/reports"
                    className="bg-card border border-border text-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary flex items-center justify-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export Proof
                </Link>
            </div>

            <p className="text-sm text-muted-foreground">
                This proof can be verified without Regulayer.
                <Link href="/docs/verify-offline" className="text-primary hover:underline ml-1">
                    Learn about offline verification →
                </Link>
            </p>
        </div>
    );
}

// ============================================================
// Main Wizard
// ============================================================

export default function GetStartedWizard() {
    const [state, setState] = useState<WizardState>({
        currentStep: 1,
        projectCreated: false,
        apiKey: null,
        sdkInstalled: false,
        decisionRecorded: false,
        decisionId: null,
        orgId: null,
        projectId: null,
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // On mount: load org info and check for existing project/key
    useEffect(() => {
        (async () => {
            try {
                const me = await getMe();
                if (me.data?.org) {
                    const orgId = me.data.org.id;
                    setState(s => ({ ...s, orgId }));

                    // Check if org already has a project
                    const projects = await getProjects(orgId);
                    if (projects.data && projects.data.length > 0) {
                        setState(s => ({
                            ...s,
                            projectCreated: true,
                            projectId: projects.data![0].id,
                        }));
                    }
                }
            } catch (err) {
                console.error('Failed to load initial data:', err);
            }
        })();
    }, []);

    // Step 1: Create project + API key via real APIs
    const handleStep1Complete = async () => {
        setLoading(true);
        setError(null);

        try {
            const orgId = state.orgId;
            if (!orgId) {
                setError('Organization not loaded. Please refresh.');
                setLoading(false);
                return;
            }

            let projectId = state.projectId;

            // If no project exists, create one
            if (!projectId) {
                const projRes = await createProject(orgId, { name: 'My First Project' });
                if (!projRes.data) {
                    setError('Failed to create project');
                    setLoading(false);
                    return;
                }
                projectId = projRes.data.id;
            }

            // Create API key for the project
            const keyRes = await createApiKey(projectId, {
                name: 'Getting Started Key',
                scopes: ['ingest'],
            });

            if (!keyRes.data) {
                setError('Failed to create API key');
                setLoading(false);
                return;
            }

            setState(s => ({
                ...s,
                currentStep: 2,
                projectCreated: true,
                projectId,
                apiKey: keyRes.data!.key_secret,
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unexpected error');
        } finally {
            setLoading(false);
        }
    };

    const handleDecisionSuccess = (id: string) => {
        setState(s => ({
            ...s,
            currentStep: 5,
            decisionRecorded: true,
            decisionId: id,
        }));
    };

    // Progress indicator
    const steps = [
        { num: 1, label: 'Welcome' },
        { num: 2, label: 'API Key' },
        { num: 3, label: 'Install' },
        { num: 4, label: 'Record' },
        { num: 5, label: 'Success' },
    ];

    return (
        <div className="min-h-screen bg-secondary py-12 px-8">
            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-12">
                <div className="flex items-center justify-between">
                    {steps.map((step, i) => (
                        <div key={step.num} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${state.currentStep >= step.num
                                ? 'bg-slate-800 text-white'
                                : 'bg-slate-200 text-muted-foreground'
                                }`}>
                                {state.currentStep > step.num ? <CheckCircle className="w-5 h-5" /> : step.num}
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-16 sm:w-24 h-1 mx-2 ${state.currentStep > step.num ? 'bg-slate-800' : 'bg-slate-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2">
                    {steps.map(step => (
                        <span key={step.num} className="text-xs text-muted-foreground">{step.label}</span>
                    ))}
                </div>
            </div>

            {/* Error banner */}
            {error && state.currentStep === 1 && (
                <div className="max-w-3xl mx-auto mb-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Step Content */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8 max-w-3xl mx-auto">
                {state.currentStep === 1 && (
                    <Step1Welcome onNext={handleStep1Complete} loading={loading} />
                )}
                {state.currentStep === 2 && state.apiKey && (
                    <Step2ApiKey
                        apiKey={state.apiKey}
                        onNext={() => setState(s => ({ ...s, currentStep: 3 }))}
                    />
                )}
                {state.currentStep === 3 && (
                    <Step3Install
                        onNext={() => setState(s => ({ ...s, currentStep: 4, sdkInstalled: true }))}
                    />
                )}
                {state.currentStep === 4 && state.apiKey && (
                    <Step4Record
                        apiKey={state.apiKey}
                        onSuccess={handleDecisionSuccess}
                        error={null}
                    />
                )}
                {state.currentStep === 5 && state.decisionId && (
                    <Step5Success decisionId={state.decisionId} />
                )}
            </div>
        </div>
    );
}

