'use client';

import { useState, useEffect } from 'react';
import {
    IconCreditCard,
    IconCheck,
    IconShieldCheck,
    IconAlertCircle,
    IconLoader2,
    IconExternalLink
} from '@tabler/icons-react';
import { getMe, getUsage, createPortalSession, Organization } from '@/lib/api';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';

// Plan definitions
const PLANS = {
    starter: {
        name: 'Starter',
        price: 'Free',
        features: ['1,000 decisions / month', '7-day retention', 'Basic Support', '1 Team Member'],
    },
    pro: {
        name: 'Pro',
        price: '$49 / mo',
        features: ['100,000 decisions / month', '1-year retention', 'Priority Support', '5 Team Members', 'Audit Logs'],
    },
    enterprise: {
        name: 'Enterprise',
        price: 'Custom',
        features: [
            'Unlimited decisions / day',
            'Cryptographic Evidence Export',
            'Offline Verification Tool',
            'Governance Overlay',
            'Dedicated Support',
            'Custom SLAs',
        ],
    },
};

export default function BillingPage() {
    const [org, setOrg] = useState<Organization | null>(null);
    const [usage, setUsage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [portalLoading, setPortalLoading] = useState(false);

    useEffect(() => {
        loadBillingData();
    }, []);

    const loadBillingData = async () => {
        try {
            const me = await getMe();
            if (me.data?.org) {
                setOrg(me.data.org);
                const usageRes = await getUsage(me.data.org.id);
                if (usageRes.data) {
                    setUsage(usageRes.data);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePortal = async () => {
        if (!org) return;
        setPortalLoading(true);
        try {
            const res = await createPortalSession(org.id);
            if (res.data?.url) {
                window.location.href = res.data.url;
            } else {
                alert('No billing portal available used for this organization.');
            }
        } catch {
            alert('Failed to redirect to billing portal');
        } finally {
            setPortalLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-indigo-500 animate-spin" />
            </div>
        );
    }

    const currentPlanKey = (org?.plan || 'starter') as keyof typeof PLANS;
    const currentPlan = PLANS[currentPlanKey] || PLANS.starter;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                        Billing & Usage
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Manage your subscription and view usage limits.
                    </p>
                </div>

                <button
                    onClick={handlePortal}
                    disabled={portalLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                    {portalLoading ? <IconLoader2 className="animate-spin" size={18} /> : <IconCreditCard size={18} />}
                    Manage Subscription
                </button>
            </div>

            {/* Current Plan Card */}
            <GlazedCard className="overflow-hidden relative">
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="p-8 grid md:grid-cols-2 gap-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-500/30">
                                Current Plan
                            </span>
                            {org?.status === 'active' ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    <IconCheck size={14} /> Active
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                    <IconAlertCircle size={14} /> payment_past_due
                                </span>
                            )}
                        </div>
                        <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                            {currentPlan.name}
                        </h2>
                        <div className="text-xl text-zinc-500 dark:text-zinc-400 flex items-baseline gap-1">
                            {currentPlan.price} <span className="text-sm">/ month</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <span>Monthly Decisions</span>
                            <span>{usage?.decisions_count?.toLocaleString() || 0} / {currentPlanKey === 'starter' ? '1,000' : currentPlanKey === 'pro' ? '100,000' : 'Unlimited'}</span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(((usage?.decisions_count || 0) / (currentPlanKey === 'starter' ? 1000 : 100000)) * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Usage resets on the 1st of every month.
                        </p>
                    </div>
                </div>
            </GlazedCard>

            {/* Plans Grid */}
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-12 mb-6">Available Plans</h3>
            <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(PLANS).map(([key, plan]) => {
                    const isCurrent = key === currentPlanKey;
                    return (
                        <GlazedCard
                            key={key}
                            className={cn(
                                "flex flex-col p-6 h-full transition-all duration-300 hover:translate-y-[-4px]",
                                isCurrent && "border-indigo-500/50 dark:border-indigo-500/50 ring-1 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-900/10"
                            )}
                        >
                            <div className="mb-4">
                                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{plan.name}</h4>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">{plan.price}</div>
                            </div>

                            <ul className="space-y-3 flex-1 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                                        <IconCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                disabled={isCurrent}
                                className={cn(
                                    "w-full py-2 rounded-lg font-medium transition-colors",
                                    isCurrent
                                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-default"
                                        : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90"
                                )}
                            >
                                {isCurrent ? 'Current Plan' : 'Upgrade'}
                            </button>
                        </GlazedCard>
                    );
                })}
            </div>

            <div className="mt-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 text-center">
                <IconShieldCheck className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Enterprise Security</h4>
                <p className="text-sm text-zinc-500 max-w-lg mx-auto mt-1">
                    Need SOC2 Type II reports, on-premise deployment, or custom BAA? Contact our sales team for an enterprise agreement.
                </p>
                <button className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline flex items-center justify-center gap-1">
                    Contact Sales <IconExternalLink size={14} />
                </button>
            </div>
        </div>
    );
}
