"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, AlertTriangle, Check } from "lucide-react";
import { RegulayerLogo } from "@/components/ui/regulayer-logo";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const inputCls = "w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all duration-150 disabled:opacity-50";

    if (!token) {
        return (
            <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-destructive/5 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <h2 className="text-xl font-display font-semibold text-foreground mb-1">Invalid reset link</h2>
                <p className="text-sm text-muted-foreground mb-4">This link is invalid or has expired.</p>
                <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">Request a new link →</Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-4 h-4 text-success" />
                </div>
                <h2 className="text-xl font-display font-semibold text-foreground mb-1">Password updated</h2>
                <p className="text-sm text-muted-foreground mb-4">Redirecting to login...</p>
                <Button variant="outline" className="rounded-lg" onClick={() => router.push("/login")}>
                    Go to Login <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) { setError("Passwords do not match."); return; }
        if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
        setLoading(true);
        setError("");
        try {
            await resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => router.push("/login"), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to reset password.");
        } finally { setLoading(false); }
    };

    return (
        <>
            <h1 className="text-xl font-display font-semibold text-foreground mb-1">Set a new password</h1>
            <p className="text-sm text-muted-foreground mb-6">Choose a strong, unique password for your account.</p>

            {error && <div className="mb-4 p-3 rounded-lg bg-destructive/5 border border-destructive/10 text-sm text-destructive">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">New password</label>
                    <input type="password" required minLength={8} autoComplete="new-password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} className={inputCls} />
                    <p className="text-[11px] text-muted-foreground">Minimum 8 characters</p>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Confirm password</label>
                    <input type="password" required minLength={8} autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={loading} className={inputCls} />
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-lg font-display font-semibold">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Reset Password <ArrowRight className="w-3.5 h-3.5 ml-1" /></>}
                </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
                <Link href="/login" className="hover:text-foreground transition-colors duration-150">← Back to login</Link>
            </p>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex bg-background">
            <div className="hidden lg:flex lg:w-[480px] flex-col justify-between p-10 bg-primary text-primary-foreground">
                <Link href="/" className="flex items-center gap-2">
                    <RegulayerLogo className="w-7 h-7 drop-shadow-sm" color="white" />
                    <span className="font-display font-semibold text-sm">Regulayer</span>
                </Link>
                <div className="max-w-sm">
                    <h2 className="text-2xl font-bold tracking-tight mb-3 leading-snug">Security starts with a strong password.</h2>
                    <p className="text-primary-foreground/50 text-sm leading-relaxed">Choose a password that is unique to your Regulayer account.</p>
                </div>
                <p className="text-[11px] text-primary-foreground/30">© {new Date().getFullYear()} Regulayer Inc.</p>
            </div>
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden mb-8">
                        <Link href="/" className="flex items-center gap-2">
                            <RegulayerLogo className="w-7 h-7 drop-shadow-sm" color="hsl(15,85%,58%)" />
                            <span className="font-display font-semibold text-sm text-foreground">Regulayer</span>
                        </Link>
                    </div>
                    <Suspense fallback={<div className="text-sm text-muted-foreground text-center py-8">Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
