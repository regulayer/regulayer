import Link from 'next/link';
import { ArrowLeft, Copy, CheckCircle, Terminal, AlertTriangle } from 'lucide-react';

export default function PythonDocsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-slate-900 text-white py-8 px-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/docs" className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition">
                        <ArrowLeft className="w-4 h-4" /> Back to docs
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Terminal className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Python SDK</h1>
                            <p className="text-slate-400">v1.0.0 · Stable</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-8 py-12">
                {/* Installation */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Installation</h2>
                    <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between">
                        <code className="text-green-400">pip install regulayer</code>
                        <button className="text-slate-400 hover:text-white p-2">
                            <Copy className="w-5 h-5" />
                        </button>
                    </div>
                </section>

                {/* Quick Start */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Start</h2>
                    <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto">
                        <pre className="text-sm">
                            <code className="text-slate-300">{`from regulayer import trace, configure

# Configure with your API key
configure(
    api_key="rl_live_YOUR_KEY_HERE",
    endpoint="https://api.regulayer.io/v1/ingest/decision"
)

# Record a decision using the context manager
with trace(
    system="loan_approval",
    decision_type="credit_check",
    risk_level="high"
) as t:
    # Capture the input
    t.set_input({
        "applicant_id": "user_123",
        "income": 75000,
        "credit_score": 720
    })
    
    # Your AI logic here
    result = your_model.predict(...)
    
    # Capture the output
    t.set_output({
        "approved": True,
        "limit": 15000,
        "confidence": 0.94
    })

# Decision is automatically recorded when context exits`}</code>
                        </pre>
                    </div>
                </section>

                {/* Trust Notice */}
                <section className="mb-12">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-amber-900 mb-2">SDK Trust Model</h3>
                                <ul className="space-y-2 text-sm text-amber-800">
                                    <li>• <strong>The SDK does NOT hash or sign anything</strong> — all cryptographic operations happen server-side</li>
                                    <li>• The SDK is a transport layer, not a trust layer</li>
                                    <li>• Verification requires the standalone proof verifier, not the SDK</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* API Reference */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">API Reference</h2>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-mono text-lg font-semibold text-slate-900 mb-2">configure()</h3>
                            <p className="text-slate-600 mb-4">Initialize the SDK with your credentials.</p>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b border-slate-200">
                                        <th className="pb-2">Parameter</th>
                                        <th className="pb-2">Type</th>
                                        <th className="pb-2">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-600">
                                    <tr className="border-b border-slate-100">
                                        <td className="py-2 font-mono">api_key</td>
                                        <td className="py-2">str</td>
                                        <td className="py-2">Your Regulayer API key</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <td className="py-2 font-mono">endpoint</td>
                                        <td className="py-2">str</td>
                                        <td className="py-2">Ingestion endpoint URL</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-mono text-lg font-semibold text-slate-900 mb-2">trace()</h3>
                            <p className="text-slate-600 mb-4">Context manager for recording decisions.</p>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b border-slate-200">
                                        <th className="pb-2">Parameter</th>
                                        <th className="pb-2">Type</th>
                                        <th className="pb-2">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-600">
                                    <tr className="border-b border-slate-100">
                                        <td className="py-2 font-mono">system</td>
                                        <td className="py-2">str</td>
                                        <td className="py-2">Name of the AI system</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <td className="py-2 font-mono">decision_type</td>
                                        <td className="py-2">str</td>
                                        <td className="py-2">Type of decision</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <td className="py-2 font-mono">risk_level</td>
                                        <td className="py-2">str</td>
                                        <td className="py-2">standard | elevated | high</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Next Steps */}
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Next Steps</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Link href="/docs/first-decision" className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition">
                            <CheckCircle className="w-8 h-8 text-green-500 mb-3" />
                            <h3 className="font-semibold text-slate-900 mb-1">Record your first decision</h3>
                            <p className="text-sm text-slate-600">Complete walkthrough in 5 minutes</p>
                        </Link>
                        <Link href="/dashboard" className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition">
                            <Terminal className="w-8 h-8 text-primary-500 mb-3" />
                            <h3 className="font-semibold text-slate-900 mb-1">Get your API key</h3>
                            <p className="text-sm text-slate-600">Create a project and generate keys</p>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
