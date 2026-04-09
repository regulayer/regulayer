"use client";

import React, { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { RegulayerLogo } from "@/components/ui/regulayer-logo";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "success">("idle");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await forgotPassword(email);
            setStatus("success");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to send reset link.");
        } finally { setLoading(false); }
    };

    const inputCls = "w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all duration-150";

    return (
        <div className="min-h-screen flex bg-background">
            <div className="hidden lg:flex lg:w-[480px] flex-col justify-between p-10 bg-primary text-primary-foreground">
                <Link href="/" className="flex items-center gap-2">
                    <RegulayerLogo className="w-7 h-7 drop-shadow-sm" color="white" />
                    <span className="font-display font-semibold text-sm">Regulayer</span>
                </Link>
                <div className="max-w-sm">
                    <h2 className="text-2xl font-bold tracking-tight mb-3 leading-snug">Account recovery</h2>
                    <p className="text-primary-foreground/50 text-sm leading-relaxed">We&apos;ll send a secure reset link to your registered email address.</p>
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

                    {status === "success" ? (
                        <div className="text-center">
                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <h1 className="text-xl font-display font-semibold text-foreground mb-1">Check your email</h1>
                            <p className="text-sm text-muted-foreground mb-6">If an account exists for <span className="font-medium text-foreground">{email}</span>, we&apos;ve sent a reset link.</p>
                            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">← Back to login</Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-xl font-display font-semibold text-foreground mb-1">Reset your password</h1>
                            <p className="text-sm text-muted-foreground mb-6">Enter the email address associated with your account.</p>

                            {error && <div className="mb-4 p-3 rounded-lg bg-destructive/5 border border-destructive/10 text-sm text-destructive">{error}</div>}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">Email</label>
                                    <input type="email" required autoComplete="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} className={inputCls} />
                                </div>
                                <Button type="submit" disabled={loading} className="w-full rounded-lg font-display font-semibold">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Reset Link <ArrowRight className="w-3.5 h-3.5 ml-1" /></>}
                                </Button>
                            </form>
                            <p className="text-center text-sm text-muted-foreground mt-6">
                                <Link href="/login" className="hover:text-foreground transition-colors duration-150">← Back to login</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
