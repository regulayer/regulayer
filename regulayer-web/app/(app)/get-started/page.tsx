'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Circle, Copy, ArrowRight, Terminal, Shield, Download, ExternalLink } from 'lucide-react';

const steps = [
    { id: 1, title: 'Get your API key', description: 'Copy your project API key' },
    { id: 2, title: 'Install the SDK', description: 'Add Regulayer to your project' },
    { id: 3, title: 'Record a decision', description: 'Send your first decision' },
    { id: 4, title: 'View in dashboard', description: 'See it recorded' },
    { id: 5, title: 'Export proof', description: 'Get verifiable evidence' },
];

export default function GetStartedPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const apiKey = 'rl_live_demo_key_abc123xyz';

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Get Started</h1>
                <p className="text-slate-600">Record your first provable AI decision in under 5 minutes</p>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
                {steps.map((step, idx) => (
                    <div key={step.id} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep > step.id
                                ? 'bg-green-500 text-white'
                                : currentStep === step.id
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-slate-200 text-slate-500'
                            }`}>
                            {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`w-8 h-0.5 ${currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
                {currentStep === 1 && (
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Step 1: Get your API key</h2>
                        <p className="text-slate-600 mb-6">Use this API key to authenticate with Regulayer:</p>

                        <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between mb-6">
                            <code className="text-green-400 text-sm">{apiKey}</code>
                            <button className="text-slate-400 hover:text-white p-2 transition">
                                <Copy className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-amber-800">
                                <strong>Keep this key secret!</strong> It authenticates your project.
                                Store it securely and never commit to source control.
                            </p>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Step 2: Install the SDK</h2>
                        <p className="text-slate-600 mb-6">Install the Regulayer Python SDK:</p>

                        <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between mb-6">
                            <code className="text-green-400">pip install regulayer</code>
                            <button className="text-slate-400 hover:text-white p-2 transition">
                                <Copy className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Why no hashing in the SDK?</strong> The SDK is a transport layer only.
                                All cryptographic operations happen server-side to ensure integrity.
                            </p>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Step 3: Record a decision</h2>
                        <p className="text-slate-600 mb-6">Add this code to your application:</p>

                        <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto mb-6">
                            <pre className="text-sm">
                                <code className="text-slate-300">{`from regulayer import trace, configure

configure(api_key="${apiKey}")

with trace(system="my_ai_system", risk_level="high") as t:
    t.set_input({"query": "Should I approve this loan?"})
    
    # Your AI logic
    result = my_model.predict(...)
    
    t.set_output({"decision": "approved", "confidence": 0.92})

print("✅ Decision recorded!")`}</code>
                            </pre>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-800">
                                <strong>What happens next?</strong> The decision is hashed, chained, and (for high-risk)
                                attested with an Ed25519 signature. All server-side.
                            </p>
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Step 4: View in dashboard</h2>
                        <p className="text-slate-600 mb-6">Your decision is now recorded and visible!</p>

                        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center mb-6">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Decision Recorded</h3>
                            <p className="text-slate-600 mb-4">ID: dec_1a2b3c4d5e6f</p>
                            <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1">
                                View in Dashboard <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-sm text-amber-800">
                                <strong>Dashboard shows derived data.</strong> The UI displays computed statistics
                                from your recordings. For cryptographic proof, export a proof bundle.
                            </p>
                        </div>
                    </div>
                )}

                {currentStep === 5 && (
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Step 5: Export proof</h2>
                        <p className="text-slate-600 mb-6">Download a self-verifying proof bundle:</p>

                        <button className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-500 transition flex items-center justify-center gap-2 mb-6">
                            <Download className="w-5 h-5" />
                            Download Proof Bundle
                        </button>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-green-900 mb-2">🎉 You've verified trust!</h4>
                            <p className="text-sm text-green-800 mb-2">
                                This proof bundle contains everything needed to verify the decision:
                            </p>
                            <ul className="text-sm text-green-800 list-disc list-inside space-y-1">
                                <li>The decision record</li>
                                <li>The hash chain proof</li>
                                <li>The Ed25519 signature</li>
                                <li>Verification instructions</li>
                            </ul>
                        </div>

                        <div className="bg-slate-100 rounded-lg p-4">
                            <h4 className="font-semibold text-slate-900 mb-2">Verify offline</h4>
                            <div className="bg-slate-900 rounded-lg p-3">
                                <code className="text-green-400 text-sm">regulayer-verify proof_bundle.json</code>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Works without internet. Works without Regulayer. Forever.
                            </p>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                    <button
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1}
                        className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Back
                    </button>
                    {currentStep < 5 ? (
                        <button
                            onClick={() => setCurrentStep(currentStep + 1)}
                            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-500 transition flex items-center gap-2"
                        >
                            Next <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <Link
                            href="/dashboard"
                            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500 transition flex items-center gap-2"
                        >
                            Go to Dashboard <ArrowRight className="w-5 h-5" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Trust Education */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <h4 className="font-medium text-slate-900 mb-2">Why is this hashed?</h4>
                    <p className="text-sm text-slate-600">
                        Hashing creates a fixed-size fingerprint. Any change produces a completely different hash,
                        making tampering detectable.
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <h4 className="font-medium text-slate-900 mb-2">Why can't this be edited?</h4>
                    <p className="text-sm text-slate-600">
                        Each record is chained to the previous one. Editing any record breaks the chain
                        and invalidates all subsequent proofs.
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <h4 className="font-medium text-slate-900 mb-2">Why verify offline?</h4>
                    <p className="text-sm text-slate-600">
                        Offline verification means the proof doesn't depend on Regulayer existing.
                        It's self-contained and permanent.
                    </p>
                </div>
            </div>
        </div>
    );
}
