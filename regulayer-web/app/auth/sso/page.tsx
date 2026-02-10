'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, ArrowRight, AlertCircle } from 'lucide-react';

// ============================================================
// SSO Login Page
// ============================================================

export default function SSOLoginPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Extract domain from email
        const domain = email.split('@')[1];

        // In production, this would:
        // 1. Lookup provider by email domain
        // 2. Redirect to IdP

        // Simulate lookup
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock: redirect or show error
        if (domain === 'company.com') {
            // Would redirect to IdP
            window.location.href = `/auth/sso/callback?mock=true`;
        } else {
            setError('No SSO provider configured for this domain');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Sign in with SSO</h1>
                    <p className="text-slate-600 mt-2">Use your organization&apos;s identity provider</p>
                </div>

                {/* SSO Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Work Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="you@company.com"
                                    required
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                We&apos;ll redirect you to your organization&apos;s login page
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                'Looking up your organization...'
                            ) : (
                                <>
                                    Continue with SSO
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                        <Link href="/auth/login" className="text-sm text-primary-600 hover:underline">
                            Sign in with email instead
                        </Link>
                    </div>
                </div>

                {/* Trust Footer */}
                <p className="text-center text-xs text-slate-400 mt-8">
                    SSO authenticates your identity. Cryptographic records remain independent.
                </p>
            </div>
        </div>
    );
}
