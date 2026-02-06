'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, FileText, Download, AlertCircle, CheckCircle, XCircle, Clock, Shield, ArrowUp } from 'lucide-react';
import { getMe, getBillingStatus, getPlans, updateSubscription, getUsage } from '@/lib/api';

interface Plan {
    id: string;
    name: string;
    price: string;
    features: string[];
    limit_decisions: number;
}

interface BillingState {
    plan: Plan;
    status: string;
    current_period_end: string;
    invoices: any[];
}

export default function BillingPage() {
    const [billing, setBilling] = useState<BillingState | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [usage, setUsage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orgId, setOrgId] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                // 1. Get Me (Org ID)
                const meRes = await getMe();
                if (meRes.error || !meRes.data) throw new Error(meRes.error || 'Auth failed');
                const oid = meRes.data.org.id;
                setOrgId(oid);

                // 2. Fetch Data
                const [billingRes, plansRes, usageRes] = await Promise.all([
                    getBillingStatus(oid),
                    getPlans(),
                    getUsage(oid)
                ]);

                if (billingRes.data) setBilling(billingRes.data);
                if (plansRes.data) setPlans(plansRes.data);
                if (usageRes.data && usageRes.data.length > 0) setUsage(usageRes.data[0]); // Current project usage

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleUpgrade = async (planId: string) => {
        if (!orgId) return;
        setSubmitting(true);
        try {
            const res = await updateSubscription(orgId, planId);
            if (res.data) {
                setBilling(res.data);
            } else if (res.error) {
                alert(res.error);
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-slate-400">Loading billing information...</div>;
    }

    if (!billing) {
        return <div className="p-8 text-red-500">Failed to load billing data. {error}</div>;
    }

    const isFrozen = billing.status === 'frozen' || billing.status === 'suspended';
    const usagePercent = usage ? (usage.decisions_ingested / billing.plan.limit_decisions) * 100 : 0;

    return (
        <div className="p-8 max-w-6xl mx-auto">
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

            <h1 className="text-2xl font-bold text-slate-900 mb-2">Billing</h1>
            <p className="text-slate-600 mb-8">Manage subscription and quotas</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Current Status */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-sm text-slate-500 font-medium uppercase tracking-wider">Current Plan</h2>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{billing.plan.name}</p>
                                <p className="text-slate-500">{billing.plan.price}</p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize flex items-center gap-2 ${isFrozen ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {isFrozen ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                {billing.status}
                            </div>
                        </div>

                        {/* Usage Bar */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-600">Decision Volume Usage</span>
                                <span className="font-medium text-slate-900">
                                    {usage?.decisions_ingested?.toLocaleString() || 0} / {billing.plan.limit_decisions.toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 75 ? 'bg-amber-500' : 'bg-primary-500'
                                        }`}
                                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                Resets on {new Date(billing.current_period_end).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Available Plans */}
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Plans</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {plans.map((p) => (
                                <div key={p.id} className={`bg-white border rounded-xl p-6 flex flex-col ${billing.plan.id === p.id ? 'border-primary-500 ring-1 ring-primary-500' : 'border-slate-200'
                                    }`}>
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-slate-900">{p.name}</h3>
                                        <p className="text-xl font-bold text-slate-900 mt-1">{p.price}</p>
                                    </div>
                                    <ul className="space-y-2 mb-6 flex-1">
                                        {p.features.map((f, i) => (
                                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => handleUpgrade(p.id)}
                                        disabled={submitting || billing.plan.id === p.id}
                                        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition ${billing.plan.id === p.id
                                                ? 'bg-slate-100 text-slate-400 cursor-default'
                                                : 'bg-primary-600 text-white hover:bg-primary-700'
                                            }`}
                                    >
                                        {billing.plan.id === p.id ? 'Current Plan' : 'Upgrade'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Invoices */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Invoices</h3>
                        {billing.invoices.length > 0 ? (
                            <div className="space-y-3">
                                {billing.invoices.map((inv: any) => (
                                    <div key={inv.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            <span>{inv.date}</span>
                                        </div>
                                        <span className="font-medium">{inv.amount}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">No invoices yet</p>
                        )}
                    </div>

                    {/* Trust Notice */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-amber-800 text-sm">Billing vs. Proofs</p>
                            <p className="text-xs text-amber-700 mt-1">
                                Payment status controls ingestion access only. Existing proofs remain valid
                                and exportable regardless of billing status.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
