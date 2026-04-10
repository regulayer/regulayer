'use client';

import { useState, useEffect } from 'react';
import {
    IconCreditCard,
    IconCheck,
    IconShieldCheck,
    IconAlertCircle,
    IconLoader2,
    IconExternalLink,
    IconRocket
} from '@tabler/icons-react';
import { getMe, getUsage, createPortalSession, createCheckoutSession, Organization } from '@/lib/api';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';

// Plan definitions
const PLANS = {
    starter: {
        name: 'Free',
        price: '$0',
        features: ['1,000 decisions / mo', 'Up to 2 team members', '7-day retention', '1 project', 'Community support'],
    },
    pro: {
        name: 'Pro', // Renamed from Growth to Pro
        price: '$99',
        features: ['50,000 decisions / mo', 'Up to 20 team members', '1-year retention', 'Unlimited projects', 'RBAC & SSO', 'HITL Governance Queue', 'Conformity Assessments'],
        disabled: false,
    },
    enterprise: {
        name: 'Enterprise',
        price: 'Custom',
        features: [
            'Unlimited decisions',
            'Unlimited team members',
            'Unlimited retention',
            'Dedicated infrastructure',
            'Automated FRIA Generation',
            'On-premise deployment',
            'SOC 2 Type II BAA'
        ],
    },
};

export default function BillingPage() {
    const [org, setOrg] = useState<Organization | null>(null);
    const [usage, setUsage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [portalLoading, setPortalLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    useEffect(() => {
        loadBillingData();
    }, []);

    // Auto-trigger Stripe checkout if sent from signup
    useEffect(() => {
        if (org) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get("checkout") === "pro") {
                window.history.replaceState({}, '', '/billing');
                handleUpgrade("pro");
            }
        }
    }, [org]);

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
                alert('No billing portal available for this organization.');
            }
        } catch {
            alert('Failed to redirect to billing portal');
        } finally {
            setPortalLoading(false);
        }
    };

    const handleUpgrade = async (planKey: string) => {
        if (!org || planKey !== 'pro') return;
        setCheckoutLoading(true);
        try {
            const successUrl = `${window.location.origin}/dashboard?success=true`;
            const cancelUrl = `${window.location.origin}/billing?canceled=true`;
            // Uses the stripe_price_id_pro defined in the backend env
            const res = await createCheckoutSession("pro", successUrl, cancelUrl);
            if (res.data?.url) {
                window.location.href = res.data.url;
            } else {
                alert('Checkout session could not be created.');
            }
        } catch (err: any) {
            console.error(err);
            alert('Failed to initiate checkout.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-border border-t-indigo-500 animate-spin" />
            </div>
        );
    }

    const currentPlanKey = ((org as any)?.plan || 'starter') as keyof typeof PLANS;
    const currentPlan = PLANS[currentPlanKey] || PLANS.starter;

    return (
        <div className="p-6 md:p-10 space-y-8 pb-20 text-foreground">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Billing & Usage
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your subscription and view usage limits.
                    </p>
                </div>

                <button
                    onClick={handlePortal}
                    disabled={portalLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium shadow-lg bg-slate-700/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                    {portalLoading ? <IconLoader2 className="animate-spin" size={18} /> : <IconCreditCard size={18} />}
                    Manage Subscription
                </button>
            </div>

            {/* Current Plan Card */}
            <GlazedCard className="overflow-hidden relative">
                <div className="absolute top-0 right-0 p-32 bg-slate-700/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="p-8 grid md:grid-cols-2 gap-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 text-zinc-100 bg-slate-900 rounded-full text-xs font-bold uppercase tracking-wider border text-zinc-200">
                                Current Plan
                            </span>
                            {org?.status === 'active' ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                                    <IconCheck size={14} /> Active
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                                    <IconAlertCircle size={14} /> {(org?.status || 'inactive').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            )}
                        </div>
                        <h2 className="text-4xl font-bold text-foreground mb-2">
                            {currentPlan.name}
                        </h2>
                        <div className="text-xl text-muted-foreground flex items-baseline gap-1">
                            {currentPlan.price} {currentPlanKey !== 'enterprise' && currentPlanKey !== 'pro' && <span className="text-sm">/ month</span>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm font-medium text-foreground">
                            <span>Monthly Decisions</span>
                            <span>{usage?.decision_count?.toLocaleString() || 0} / {currentPlanKey === 'starter' ? '1,000' : currentPlanKey === 'pro' ? '50,000' : 'Unlimited'}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-slate-700 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(((usage?.decision_count || 0) / (currentPlanKey === 'starter' ? 1000 : 50000)) * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Usage resets on the 1st of every month.
                        </p>
                    </div>
                </div>
            </GlazedCard>

            {/* Plans Grid */}
            <h3 className="text-xl font-bold text-foreground mt-12 mb-6">Available Plans</h3>
            <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(PLANS).map(([key, plan]) => {
                    const isCurrent = key === currentPlanKey;
                    return (
                        <GlazedCard
                            key={key}
                            className={cn(
                                "flex flex-col p-6 h-full transition-all duration-300 hover:translate-y-[-4px]",
                                isCurrent && "bg-slate-700/50 ring-1 bg-slate-700/20 text-zinc-50/50"
                            )}
                        >
                            <div className="mb-4">
                                <h4 className="text-lg font-bold text-foreground">{plan.name}</h4>
                                <div className="text-2xl font-bold text-foreground mt-2">{plan.price}</div>
                            </div>

                            <ul className="space-y-3 flex-1 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                        <IconCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => isCurrent ? handlePortal() : handleUpgrade(key)}
                                disabled={isCurrent || (plan as any).disabled || checkoutLoading}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all duration-200",
                                    isCurrent
                                        ? "bg-secondary text-muted-foreground border border-border"
                                        : (plan as any).disabled
                                            ? "bg-secondary/50 text-muted-foreground/50 border border-transparent cursor-not-allowed"
                                            : "bg-foreground text-background shadow-soft-premium hover:bg-primary active:scale-[0.98]"
                                )}
                            >
                                {checkoutLoading && key === 'pro' ? (
                                    <IconLoader2 className="w-4 h-4 animate-spin" />
                                ) : isCurrent ? (
                                    'Current Plan'
                                ) : (plan as any).disabled ? (
                                    'Contact Sales'
                                ) : (
                                    <>
                                        Upgrade <IconRocket className="w-4 h-4 hidden sm:block" />
                                    </>
                                )}
                            </button>
                        </GlazedCard>
                    );
                })}
            </div>

            <div className="mt-12 bg-secondary rounded-xl p-6 border border-border text-center">
                <IconShieldCheck className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <h4 className="font-semibold text-foreground">Enterprise Security</h4>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto mt-1">
                    Need SOC2 Type II reports, on-premise deployment, or custom BAA? Contact our sales team for an enterprise agreement.
                </p>
                <button className="mt-4 bg-slate-800 text-sm font-medium hover:underline flex items-center justify-center gap-1">
                    Contact Sales <IconExternalLink size={14} />
                </button>
            </div>
        </div>
    );
}

