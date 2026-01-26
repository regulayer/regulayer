'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Shield, ArrowRight, Mail, Lock, Building2 } from 'lucide-react';
import { signup } from '@/lib/api';

export default function SignupPage() {
    const [orgName, setOrgName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error: apiError } = await signup({ orgName, email, password });

            if (data) {
                // Login automatically or redirect to login?
                // The signup response includes token/user typically (LoginResponse)
                // Let's store token if present
                if (data.token) {
                    localStorage.setItem('regulayer_token', data.token);
                    window.location.href = '/dashboard';
                } else {
                    // Fallback if API changes
                    window.location.href = '/login';
                }
            } else {
                setError(apiError || 'Signup failed');
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <Shield className="w-10 h-10 text-primary-400" />
                    <span className="text-2xl font-bold text-white">Regulayer</span>
                </Link>

                {/* Card */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
                    <h1 className="text-2xl font-bold text-white text-center mb-2">Create your account</h1>
                    <p className="text-slate-400 text-center mb-8">Start recording provable AI decisions</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Organization name</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                    placeholder="Acme Corp"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Work email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                    placeholder="you@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
                        </div>

                        {error && (
                            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-400">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-700">
                        <p className="text-xs text-slate-500 text-center">
                            By signing up, you agree to our Terms of Service and Privacy Policy.
                            Your data is cryptographically protected.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
