import Link from 'next/link';
import { Shield, Check } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'For exploring AI decision logging',
        features: [
            '1,000 decisions/month',
            '1 project',
            '3 API keys',
            'Basic proof export',
            'Community support',
        ],
        cta: 'Start Free',
        href: '/signup',
        highlighted: false,
    },
    {
        name: 'Pro',
        price: '$99',
        period: '/month',
        description: 'For teams shipping AI to production',
        features: [
            '100,000 decisions/month',
            '10 projects',
            'Unlimited API keys',
            'Full proof bundles',
            'Governance annotations',
            'Priority support',
            'Usage analytics',
        ],
        cta: 'Start Pro Trial',
        href: '/signup?plan=pro',
        highlighted: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For regulated industries & scale',
        features: [
            'Unlimited decisions',
            'Unlimited projects',
            'Dedicated VPC option',
            'SSO / SAML',
            'Custom SLA',
            'Compliance mapping',
            'Dedicated support',
            'Security review',
        ],
        cta: 'Contact Sales',
        href: 'mailto:enterprise@regulayer.io',
        highlighted: false,
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 py-4 px-8">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-primary-600" />
                        <span className="text-xl font-bold text-slate-900">Regulayer</span>
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link href="/docs" className="text-slate-600 hover:text-slate-900">Docs</Link>
                        <Link href="/status" className="text-slate-600 hover:text-slate-900">Status</Link>
                        <Link href="/login" className="text-slate-600 hover:text-slate-900">Login</Link>
                        <Link href="/signup" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                            Start Free
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-8 py-16">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Pay for decisions recorded. Proof export always included.
                        No hidden fees, no payload inspection.
                    </p>
                </div>

                {/* Plans */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`bg-white rounded-2xl border-2 p-8 ${plan.highlighted
                                ? 'border-primary-500 shadow-lg relative'
                                : 'border-slate-200'
                                }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                            <div className="mb-4">
                                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                <span className="text-slate-500">{plan.period}</span>
                            </div>
                            <p className="text-slate-600 mb-6">{plan.description}</p>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-slate-700">
                                        <Check className="w-5 h-5 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                className={`block w-full text-center py-3 rounded-lg font-medium transition ${plan.highlighted
                                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Trust Notice */}
                <div className="bg-slate-900 text-white rounded-2xl p-8 text-center">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-primary-400" />
                    <h3 className="text-xl font-bold mb-2">Billing ≠ Truth</h3>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        Billing controls access to ingestion. It never affects recorded facts.
                        Even frozen accounts can export proofs. Your evidence survives non-payment.
                    </p>
                </div>
            </main>
        </div>
    );
}
