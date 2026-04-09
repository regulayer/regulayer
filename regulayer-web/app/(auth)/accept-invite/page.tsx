'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { validateInvitation, acceptInvitation, InvitationDetails } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { RegulayerLogo } from '@/components/ui/regulayer-logo';

function AcceptInviteContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [inviteDetails, setInviteDetails] = useState<InvitationDetails | null>(null);
    const [pageError, setPageError] = useState('');
    const [formError, setFormError] = useState('');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (!token) {
            setPageError('Invalid or missing invitation token.');
            setLoading(false);
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await validateInvitation(token);
                setInviteDetails(res.data);
            } catch (err: any) {
                setPageError(err.response?.data?.detail || 'This invitation has expired or is invalid.');
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!token) return;

        if (password.length < 8) {
            setFormError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setFormError('Passwords do not match');
            return;
        }

        setSubmitting(true);
        try {
            const res = await acceptInvitation(token, password);
            if (res.data.token) {
                setToken(res.data.token);
                router.push('/dashboard');
            } else {
                setFormError('Account created, but no token returned. Please log in.');
                setSubmitting(false);
            }
        } catch (err: any) {
            setFormError(err.response?.data?.detail || 'Failed to accept invitation');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-muted-foreground text-sm">Verifying invitation...</p>
            </div>
        );
    }

    if (pageError || !inviteDetails) {
        return (
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Invalid Invitation</h1>
                    <p className="text-sm text-muted-foreground mt-2">{pageError}</p>
                </div>
                <div className="flex justify-center">
                    <Link href="/login" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full shadow-sm">
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm space-y-8">
            <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Join your team</h1>
                <p className="text-sm text-muted-foreground mt-2">
                    Create a password to accept your invitation.
                </p>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                    <h4 className="text-sm font-medium text-foreground">Joining {inviteDetails.orgName}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                        You have been invited as a <span className="font-display font-semibold">{inviteDetails.role}</span>. Set a strong password for your account <strong>{inviteDetails.email}</strong> to access the dashboard.
                    </p>
                </div>
            </div>

            {formError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {formError}
                </div>
            )}

            <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">Create Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        disabled={submitting}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        disabled={submitting}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full shadow-sm"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating Account...
                        </>
                    ) : (
                        "Join Organization"
                    )}
                </button>
            </form>
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background">
            {/* Left: Branding / Visual */}
            <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand-50 via-violet-50 -zinc-50 p-12 text-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(67,56,202,0.1),transparent_50%)]" />
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-300/50 flex items-center justify-center shadow-2xl">
                            <RegulayerLogo className="w-8 h-8" color="hsl(15,85%,58%)" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Regulayer</span>
                    </Link>
                </div>
                <div className="relative z-10 max-w-md">
                    <h2 className="text-3xl font-bold mb-4">Accept your invitation.</h2>
                    <p className="text-slate-500 leading-relaxed">
                        Join your team to start logging, verifying, and managing cryptographic proofs for every AI decision.
                    </p>
                </div>
                <div className="relative z-10 text-sm text-slate-500">
                    © 2026 Regulayer Inc.
                </div>
            </div>

            {/* Right: Accept Invite Form */}
            <div className="flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                }>
                    <AcceptInviteContent />
                </Suspense>
            </div>
        </div>
    );
}
