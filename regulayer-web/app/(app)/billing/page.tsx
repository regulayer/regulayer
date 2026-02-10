'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, ExternalLink, Shield, AlertCircle } from 'lucide-react';
import { getMe } from '@/lib/api';

export default function BillingPage() {
    const [loading, setLoading] = useState(false);
    const [isDemo, setIsDemo] = useState(false);
    const [checkingOrg, setCheckingOrg] = useState(true);

    useEffect(() => {
        async function checkOrg() {
            try {
                const res = await getMe();
                if (res.data?.org?.is_demo) {
                    setIsDemo(true);
                }
            } catch {
                // Ignore - default to non-demo
            } finally {
                setCheckingOrg(false);
            }
        }
        checkOrg();
    }, []);

    const handlePortal = () => {
        setLoading(true);
        // Mock redirect to Stripe Portal
        setTimeout(() => {
            window.location.href = process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL || 'https://billing.stripe.com/p/login/mock';
            setLoading(false);
        }, 1000);
    };

    // Demo org restriction
    if (!checkingOrg && isDemo) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-5xl mx-auto px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900">Billing & Subscription</h1>
                        <p className="text-slate-600">Manage your plan and payment methods</p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Billing Not Available for Demo Accounts</h2>
                        <p className="text-slate-600 max-w-lg mx-auto">
                            Demo organizations cannot access billing features. To upgrade to a paid plan,
                            please create a new production organization.
                        </p>
                        <div className="mt-6 p-4 bg-amber-100 rounded-lg inline-block">
                            <p className="text-sm text-amber-800 font-medium">
                                Demo data and decisions cannot be migrated to production.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Billing & Subscription</h1>
                    <p className="text-slate-600">Manage your plan and payment methods</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Current Plan */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-semibold text-slate-900">Current Plan</h3>
                                    <p className="text-sm text-slate-500">Your organization&apos;s subscription tier</p>
                                </div>
                                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                                    Pro Plan
                                </span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-slate-700">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>100,000 decisions / day</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>Cryptographic Evidence Export</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>Offline Verification Tool</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>Governance Overlay</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div className="text-sm">
                                    <p className="text-slate-900 font-medium">$299 / month</p>
                                    <p className="text-slate-500">Next billing date: Mar 01, 2026</p>
                                </div>
                                <button
                                    onClick={handlePortal}
                                    disabled={loading}
                                    className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    {loading ? 'Redirecting...' : 'Manage Subscription'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Invoice History</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 rounded -mx-2 transition">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                                                <ExternalLink className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">Invoice #INV-2026-00{i}</p>
                                                <p className="text-xs text-slate-500">Feb 01, 2026</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-slate-900">$299.00</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Trust Promise */}
                    <div>
                        <div className="bg-slate-900 text-white rounded-xl p-6">
                            <Shield className="w-8 h-8 text-primary-400 mb-4" />
                            <h3 className="font-bold text-lg mb-2">Billing never affects truth.</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                If your payment fails, ingestion may pause, but your existing cryptographic proofs are <strong>never deleted</strong> and always <strong>exportable</strong>.
                            </p>
                            <div className="bg-slate-800 rounded-lg p-4">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Guarantee</p>
                                <p className="text-sm text-white font-medium">
                                    &quot;Your evidence belongs to you, regardless of your subscription status.&quot;
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
