import Link from 'next/link';
import { Book, Code, Zap, Shield, ArrowRight, Terminal } from 'lucide-react';

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-slate-900 text-white py-16 px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Shield className="w-8 h-8 text-primary-400" />
                        <span className="text-xl font-bold">Regulayer</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Documentation</h1>
                    <p className="text-slate-300 text-lg">
                        Record provable AI decisions in minutes. Verify them forever.
                    </p>
                </div>
            </header>

            {/* Quick Start */}
            <section className="max-w-4xl mx-auto px-8 py-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Quick Start</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/docs/python" className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Terminal className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition">Python SDK</h3>
                                <code className="text-sm text-slate-500">pip install regulayer</code>
                            </div>
                        </div>
                        <p className="text-slate-600 mb-4">
                            Record decisions from Python applications with a simple context manager.
                        </p>
                        <span className="text-primary-600 font-medium flex items-center gap-1">
                            Get started <ArrowRight className="w-4 h-4" />
                        </span>
                    </Link>

                    <Link href="/docs/first-decision" className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Zap className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition">First Decision</h3>
                                <span className="text-sm text-slate-500">5 minute guide</span>
                            </div>
                        </div>
                        <p className="text-slate-600 mb-4">
                            Record, verify, and export your first provable decision in under 5 minutes.
                        </p>
                        <span className="text-primary-600 font-medium flex items-center gap-1">
                            Start now <ArrowRight className="w-4 h-4" />
                        </span>
                    </Link>
                </div>
            </section>

            {/* Core Concepts */}
            <section className="max-w-4xl mx-auto px-8 py-12 border-t border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Core Concepts</h2>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">📝 Decisions</h3>
                        <p className="text-slate-600 mb-4">
                            A decision is a recorded moment when your AI system made a choice.
                            It includes the input, output, and metadata about the context.
                        </p>
                        <div className="bg-slate-900 rounded-lg p-4 text-sm">
                            <pre className="text-green-400">{`# Every decision includes:
- system: Name of your AI system
- input: What the system received
- output: What the system decided
- metadata: Additional context`}</pre>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">🔗 Hash Chains</h3>
                        <p className="text-slate-600 mb-4">
                            Each decision is hashed and chained to the previous one.
                            This makes tampering mathematically detectable — any modification breaks the chain.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                            <strong>Important:</strong> Hashing happens server-side. The SDK does not perform cryptographic operations.
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">✅ Attestations</h3>
                        <p className="text-slate-600 mb-4">
                            For high-stakes decisions, Regulayer signs the record with Ed25519 signatures.
                            This creates court-ready evidence that the decision existed at a specific time.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">📦 Proof Bundles</h3>
                        <p className="text-slate-600 mb-4">
                            Export decisions as self-contained proof bundles.
                            These can be verified offline, without Regulayer, without internet access.
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                            <strong>Why this matters:</strong> Regulayer disappearing tomorrow wouldn't affect proof validity.
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 py-8 px-8">
                <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
                    <p>Docs explain how to use Regulayer — never what is true.</p>
                </div>
            </footer>
        </div>
    );
}
