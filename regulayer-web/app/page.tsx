import Link from 'next/link';
import { Shield, Lock, FileCheck, ArrowRight, Building2, Scale, Heart, Landmark } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Navigation */}
            <nav className="py-6 px-8 flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-primary-400" />
                    <span className="text-xl font-bold text-white">Regulayer</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-slate-300">
                    <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
                    <Link href="/security" className="hover:text-white transition">Security</Link>
                    <Link href="/docs" className="hover:text-white transition">Docs</Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-slate-300 hover:text-white transition">
                        Log in
                    </Link>
                    <Link href="/signup" className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-500 transition">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="py-24 px-8 text-center max-w-5xl mx-auto">
                <div className="inline-block px-4 py-1.5 bg-primary-900/50 border border-primary-700 rounded-full text-primary-300 text-sm font-medium mb-6">
                    Cryptographic Trust for AI Systems
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                    Provable AI Decisions.
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-500">
                        Auditable Forever.
                    </span>
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                    Every AI decision recorded. Every record chained. Every chain verifiable.
                    Prove what your system decided — to regulators, auditors, and courts.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/signup" className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-500 transition flex items-center justify-center gap-2">
                        Start Free <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link href="/docs" className="bg-white/10 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition border border-white/20">
                        Read the Docs
                    </Link>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-8 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-white text-center mb-4">How Regulayer Works</h2>
                <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
                    From claim to fact to proof — in seconds.
                </p>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FileCheck className="w-8 h-8 text-primary-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">1. Record</h3>
                        <p className="text-slate-400">
                            Your AI system sends decisions to Regulayer. Each record is hashed and chained.
                        </p>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-8 h-8 text-primary-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">2. Chain</h3>
                        <p className="text-slate-400">
                            Records form an immutable hash chain. Tampering is mathematically detectable.
                        </p>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-8 h-8 text-primary-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">3. Prove</h3>
                        <p className="text-slate-400">
                            Export proof bundles. Verify offline — no internet, no login, no trust required.
                        </p>
                    </div>
                </div>
            </section>

            {/* Who It's For */}
            <section className="py-20 px-8 bg-slate-800/30">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-4">Built for Regulated Industries</h2>
                    <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
                        When AI decisions carry legal weight, you need evidence — not explanations.
                    </p>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { icon: Building2, name: 'Finance', desc: 'Credit, lending, trading' },
                            { icon: Heart, name: 'Healthcare', desc: 'Diagnosis, triage, claims' },
                            { icon: Landmark, name: 'Government', desc: 'Benefits, licensing, permits' },
                            { icon: Scale, name: 'Legal', desc: 'Discovery, compliance, disputes' },
                        ].map(({ icon: Icon, name, desc }) => (
                            <div key={name} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-primary-600 transition">
                                <Icon className="w-10 h-10 text-primary-400 mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
                                <p className="text-slate-400 text-sm">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Guarantees */}
            <section className="py-20 px-8 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-white text-center mb-16">Trust Guarantees</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-green-900/50 text-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                            ✓
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">Tamper-Evident Hash Chains</h3>
                            <p className="text-slate-400">Any modification breaks the chain. Detectable instantly.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-green-900/50 text-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                            ✓
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">Offline Verification</h3>
                            <p className="text-slate-400">Proofs verify without Regulayer. No network, no login needed.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-green-900/50 text-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                            ✓
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">Ed25519 Signatures</h3>
                            <p className="text-slate-400">Cryptographically signed attestations. Court-ready evidence.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-green-900/50 text-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                            ✓
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">Human Separation</h3>
                            <p className="text-slate-400">Humans control access. Humans never alter facts.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-8 text-center">
                <div className="max-w-3xl mx-auto bg-gradient-to-r from-primary-900 to-accent-900 rounded-3xl p-12 border border-primary-700">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to prove your AI decisions?</h2>
                    <p className="text-primary-200 mb-8">Start recording decisions in under 5 minutes.</p>
                    <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-primary-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition">
                        Get Started Free <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-8 border-t border-slate-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Shield className="w-5 h-5" />
                        <span>© 2026 Regulayer. Provable trust.</span>
                    </div>
                    <div className="flex gap-6 text-slate-400">
                        <Link href="/security" className="hover:text-white transition">Security</Link>
                        <Link href="/docs" className="hover:text-white transition">Docs</Link>
                        <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
