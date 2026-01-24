'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Shield, Key, Terminal, Play, CheckCircle,
    Copy, ChevronRight, ChevronDown, Lock,
    AlertCircle, Download, ExternalLink
} from 'lucide-react';

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
                className="flex items-center gap-1 text-slate-500 hover:text-slate-700"
            >
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span>Why this matters</span>
            </button>
            {isOpen && (
                <div className="mt-2 pl-5 text-slate-600 border-l-2 border-slate-200">
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
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900 text-white text-xs p-2 rounded shadow-lg z-10">
                    Once recorded, this decision cannot be altered. The proof works even without Regulayer.
                </div>
            )}
        </div>
    );
}

// ============================================================
// Step Components
// ============================================================

function Step1Welcome({ onNext }: { onNext: () => void }) {
    return (
        <div className="text-center max-w-2xl mx-auto">
            <Shield className="w-16 h-16 text-primary-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Welcome to Regulayer
            </h1>
            <p className="text-xl text-slate-600 mb-4">
                Regulayer records AI decisions in a way that can be proven later — even without us.
            </p>
            <p className="text-sm text-slate-500 mb-8">
                Works for models, rules, agents, and automated decisions.
            </p>

            <button
                onClick={onNext}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-700 mb-4"
            >
                Create First Project
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
                    <Key className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Your API Key</h2>
                    <p className="text-slate-600">This key controls access to your project</p>
                </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                    <code className="text-green-400 font-mono">{apiKey}</code>
                    <button
                        onClick={copyKey}
                        className="text-slate-400 hover:text-white p-2"
                    >
                        {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-amber-800 text-sm">
                    <strong>Store this securely.</strong> You won't see it again.
                </p>
            </div>

            <p className="text-sm text-slate-500 mb-6">
                This key controls access — it cannot modify history.
            </p>

            <button
                onClick={onNext}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700"
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
                    <Terminal className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Install the SDK</h2>
                    <p className="text-slate-600">One command to get started</p>
                </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 mb-4">
                <code className="text-green-400 font-mono">pip install regulayer==1.0.0</code>
            </div>

            <button
                onClick={() => setShowChecksum(!showChecksum)}
                className="text-sm text-slate-500 hover:text-slate-700 mb-6 flex items-center gap-1"
            >
                {showChecksum ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                Verify package integrity (advanced)
            </button>

            {showChecksum && (
                <div className="bg-slate-100 rounded-lg p-4 mb-6 text-sm">
                    <p className="text-slate-700 mb-2">Verify the checksum matches our registry:</p>
                    <code className="text-xs text-slate-600 block">
                        sha256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                    </code>
                </div>
            )}

            <button
                onClick={onNext}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700"
            >
                I've Installed It
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        onSuccess(`dec_${Date.now().toString(36)}`);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-xl">
                    <Play className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Record Your First Decision</h2>
                    <p className="text-slate-600">Run this code in Python</p>
                </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 mb-4 overflow-x-auto">
                <pre className="text-green-400 font-mono text-sm">{codeSnippet}</pre>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            <button
                onClick={runExample}
                disabled={running}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
            >
                {running ? (
                    <>Recording...</>
                ) : (
                    <>
                        <Play className="w-4 h-4" />
                        Run Example
                    </>
                )}
            </button>

            <p className="text-sm text-slate-500 mt-4">
                Run this locally to record your first decision.
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

            <h2 className="text-3xl font-bold text-slate-900 mb-2">Decision Recorded!</h2>
            <p className="text-slate-600 mb-6">Your first AI decision is now cryptographically provable.</p>

            <div className="bg-slate-100 rounded-xl p-6 mb-6 text-left">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500">Decision ID</span>
                    <code className="font-mono text-slate-900">{decisionId}</code>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500">Timestamp</span>
                    <span className="text-slate-900">{new Date().toISOString()}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status</span>
                    <ImmutableBadge />
                </div>
                <p className="text-sm text-slate-600 mt-4 text-center">
                    This decision is now part of an append-only record.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                    href="/dashboard"
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700"
                >
                    View in Dashboard
                </Link>
                <Link
                    href="/exports"
                    className="bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export Proof
                </Link>
            </div>

            <p className="text-sm text-slate-500">
                This proof can be verified without Regulayer.
                <Link href="/docs/verify-offline" className="text-primary-600 hover:underline ml-1">
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
    });
    const [error, setError] = useState<string | null>(null);

    // Simulate project creation and API key generation
    const handleStep1Complete = async () => {
        // In production, this calls POST /v1/projects and POST /v1/keys
        setState(s => ({
            ...s,
            currentStep: 2,
            projectCreated: true,
            apiKey: `rl_live_${Date.now().toString(36)}_demo`
        }));
    };

    const handleDecisionSuccess = (id: string) => {
        setState(s => ({
            ...s,
            currentStep: 5,
            decisionRecorded: true,
            decisionId: id
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
        <div className="min-h-screen bg-slate-50 py-12 px-8">
            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-12">
                <div className="flex items-center justify-between">
                    {steps.map((step, i) => (
                        <div key={step.num} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${state.currentStep >= step.num
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                                }`}>
                                {state.currentStep > step.num ? <CheckCircle className="w-5 h-5" /> : step.num}
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-16 sm:w-24 h-1 mx-2 ${state.currentStep > step.num ? 'bg-primary-600' : 'bg-slate-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2">
                    {steps.map(step => (
                        <span key={step.num} className="text-xs text-slate-500">{step.label}</span>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-3xl mx-auto">
                {state.currentStep === 1 && (
                    <Step1Welcome onNext={handleStep1Complete} />
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
                        error={error}
                    />
                )}
                {state.currentStep === 5 && state.decisionId && (
                    <Step5Success decisionId={state.decisionId} />
                )}
            </div>
        </div>
    );
}
