'use client';

import { BarChart3, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';

export default function UsagePage() {
    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Usage</h1>
                <p className="text-slate-600">Monitor your decision recording usage and quotas</p>
            </div>

            {/* Current Period */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Current Billing Period</h2>
                        <p className="text-sm text-slate-500">January 1 - January 31, 2026</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Within limits
                    </span>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-slate-500 mb-2">Decisions Ingested</p>
                        <p className="text-3xl font-bold text-slate-900">28,451</p>
                        <div className="mt-2">
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>Usage</span>
                                <span>28.5% of 100,000</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full" style={{ width: '28.5%' }} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-slate-500 mb-2">Attested Decisions</p>
                        <p className="text-3xl font-bold text-slate-900">22,761</p>
                        <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            80% attestation rate
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-slate-500 mb-2">Proof Exports</p>
                        <p className="text-3xl font-bold text-slate-900">47</p>
                        <div className="mt-2 text-sm text-slate-500">
                            No limit on Pro plan
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Usage Chart Placeholder */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Daily Usage</h2>
                <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                        <p>Usage chart</p>
                    </div>
                </div>
            </div>

            {/* Quota Warnings */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Quota Alerts</h2>

                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-medium text-slate-700">No alerts</p>
                            <p className="text-sm text-slate-500">You're well within your plan limits</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-900">Need more capacity?</p>
                            <p className="text-sm text-slate-500">Upgrade to increase your limits</p>
                        </div>
                        <button className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium">
                            View plans <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
