'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, FileText, Download, AlertCircle, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';

// Mock data - in production, fetch from API
const billingData = {
    plan: 'Pro',
    status: 'active', // 'active' | 'trial_ended' | 'frozen' | 'demo'
    currentPeriodEnd: '2026-02-24',
    usage: {
        decisions: 45000,
        limit: 100000,
    },
    invoices: [
        { id: 'inv_001', date: '2026-01-01', amount: '$99.00', status: 'paid' },
        { id: 'inv_002', date: '2025-12-01', amount: '$99.00', status: 'paid' },
        { id: 'inv_003', date: '2025-11-01', amount: '$99.00', status: 'paid' },
    ],
};

const isFrozen = billingData.status === 'frozen' || billingData.status === 'trial_ended';
const isDemo = billingData.status === 'demo';

export default function BillingPage() {
    const usagePercent = (billingData.usage.decisions / billingData.usage.limit) * 100;

    return (
        <div className="p-8">
            {/* Frozen State Banner */}
            {isFrozen && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                        <p className="font-medium text-red-800">Ingestion Paused</p>
                        <p className="text-sm text-red-700">
                            Ingestion paused due to billing status. <strong>Proof export remains available.</strong>
                        </p>
                        <Link href="/exports" className="text-sm text-red-600 underline hover:text-red-800 mt-1 inline-block">
                            Export your proofs →
                        </Link>
                    </div>
                </div>
            )}

            {/* Demo Mode Banner */}
            {isDemo && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                        <p className="font-medium text-purple-800">Demo Mode</p>
                        <p className="text-sm text-purple-700">
                            Data is real, cryptographic proofs are valid. Billing is disabled.
                        </p>
                    </div>
                </div>
            )}

            <h1 className="text-2xl font-bold text-slate-900 mb-2">Billing</h1>
            <p className="text-slate-600 mb-8">Manage your subscription and payment</p>

            {/* Plan Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Current Plan</h2>
                        <p className="text-3xl font-bold text-primary-600">{billingData.plan}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-600 font-medium capitalize">{billingData.status}</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-slate-500 mb-1">Billing Period Ends</p>
                        <p className="font-medium">{billingData.currentPeriodEnd}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 mb-1">Usage This Period</p>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                                <div
                                    className="bg-primary-500 h-2 rounded-full"
                                    style={{ width: `${usagePercent}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium">
                                {billingData.usage.decisions.toLocaleString()} / {billingData.usage.limit.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 flex gap-4">
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                        Upgrade Plan
                    </button>
                    <button className="text-slate-600 px-4 py-2 hover:text-slate-900">
                        Manage Payment Method
                    </button>
                </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Invoice History</h2>
                <div className="divide-y divide-slate-100">
                    {billingData.invoices.map((invoice) => (
                        <div key={invoice.id} className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <FileText className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="font-medium">{invoice.date}</p>
                                    <p className="text-sm text-slate-500">{invoice.id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-medium">{invoice.amount}</span>
                                <span className="text-green-600 text-sm capitalize">{invoice.status}</span>
                                <button className="text-primary-600 hover:text-primary-700">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trust Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                    <p className="font-medium text-amber-800">Billing Does Not Affect Proofs</p>
                    <p className="text-sm text-amber-700">
                        Payment status controls ingestion access only. Existing proofs remain valid
                        and exportable regardless of billing status.
                    </p>
                </div>
            </div>
        </div>
    );
}
