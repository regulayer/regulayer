'use client';

import { BarChart3, FileCheck, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-600">Overview of your AI decision recording</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                            <FileCheck className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Decisions Today</p>
                            <p className="text-2xl font-bold text-slate-900">1,247</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        +12% from yesterday
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Attested</p>
                            <p className="text-2xl font-bold text-slate-900">892</p>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-500">
                        71.5% attestation rate
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">This Month</p>
                            <p className="text-2xl font-bold text-slate-900">28,451</p>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-500">
                        71.5% of quota used
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Chain Status</p>
                            <p className="text-2xl font-bold text-green-600">Valid</p>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-500">
                        Last verified: 5m ago
                    </div>
                </div>
            </div>

            {/* Trust Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-amber-800">Dashboard shows derived data</p>
                        <p className="text-sm text-amber-700 mt-1">
                            These statistics are computed from recorded decisions. For cryptographic verification,
                            export a proof bundle and verify offline using the standalone verifier tool.
                        </p>
                    </div>
                </div>
            </div>

            {/* Activity & Plan */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Decisions</h2>
                    <div className="space-y-4">
                        {[
                            { id: 'dec_a1b2c3', type: 'credit_decision', time: '2 min ago', attested: true },
                            { id: 'dec_d4e5f6', type: 'fraud_check', time: '5 min ago', attested: true },
                            { id: 'dec_g7h8i9', type: 'risk_assessment', time: '12 min ago', attested: false },
                            { id: 'dec_j0k1l2', type: 'credit_decision', time: '18 min ago', attested: true },
                        ].map((decision) => (
                            <div key={decision.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="font-mono text-sm text-slate-900">{decision.id}</p>
                                    <p className="text-xs text-slate-500">{decision.type}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${decision.attested
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {decision.attested ? 'Attested' : 'Legacy'}
                                    </span>
                                    <p className="text-xs text-slate-500 mt-1">{decision.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Plan Status */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Plan & Usage</h2>

                    <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl p-6 text-white mb-6">
                        <p className="text-primary-100 text-sm">Current Plan</p>
                        <p className="text-2xl font-bold mt-1">Pro</p>
                        <p className="text-primary-100 text-sm mt-2">100,000 decisions/month</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600">Decision quota</span>
                                <span className="font-medium text-slate-900">28,451 / 100,000</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full" style={{ width: '28.5%' }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600">Projects</span>
                                <span className="font-medium text-slate-900">2 / 5</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full" style={{ width: '40%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
