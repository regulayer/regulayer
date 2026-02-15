"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestOtp, verifyOtp, completeSignup } from "@/lib/api";
import { setToken } from "@/lib/auth";

type Step = "email" | "otp" | "details";

export default function SignupPage() {
    const router = useRouter();

    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [signupToken, setSignupToken] = useState("");
    const [orgName, setOrgName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [debugCode, setDebugCode] = useState<string | null>(null);

    // Step 1: Request OTP
    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setDebugCode(null);

        const res = await requestOtp(email);

        if (res.error) {
            setError(res.error);
            setLoading(false);
            return;
        }

        // In dev mode, the API may return the code for convenience
        if (res.data?.debug_code) {
            setDebugCode(res.data.debug_code);
        }

        setStep("otp");
        setLoading(false);
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await verifyOtp(email, otpCode);

        if (res.error) {
            setError(res.error);
            setLoading(false);
            return;
        }

        if (res.data?.signup_token) {
            setSignupToken(res.data.signup_token);
            setStep("details");
        } else {
            setError("Verification failed. Please try again.");
        }

        setLoading(false);
    };

    // Step 3: Complete signup
    const handleCompleteSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        setError("");

        const res = await completeSignup(signupToken, orgName, password);

        if (res.data?.token) {
            setToken(res.data.token);
            router.push("/dashboard");
        } else {
            setError(res.error || "Signup failed. Please try again.");
            setLoading(false);
        }
    };

    const stepNumber = step === "email" ? 1 : step === "otp" ? 2 : 3;

    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 mesh-gradient opacity-30" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-white font-bold">R</span>
                        </div>
                    </Link>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${s < stepNumber
                                        ? "bg-indigo-600 text-white"
                                        : s === stepNumber
                                            ? "bg-indigo-600/20 text-indigo-400 ring-2 ring-indigo-500/40"
                                            : "bg-white/[0.04] text-zinc-600"
                                    }`}>
                                    {s < stepNumber ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    ) : s}
                                </div>
                                {s < 3 && <div className={`w-8 h-px ${s < stepNumber ? "bg-indigo-500/40" : "bg-white/[0.06]"}`} />}
                            </div>
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* ─── STEP 1: Email ─── */}
                    {step === "email" && (
                        <>
                            <h2 className="text-2xl font-bold text-white text-center mb-1">Create your account</h2>
                            <p className="text-sm text-zinc-500 text-center mb-8">We&apos;ll send a verification code to your email</p>

                            <form className="space-y-4" onSubmit={handleRequestOtp}>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-zinc-400">Work Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all disabled:opacity-50"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner />
                                            Sending code...
                                        </>
                                    ) : (
                                        "Continue"
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ─── STEP 2: OTP Verification ─── */}
                    {step === "otp" && (
                        <>
                            <h2 className="text-2xl font-bold text-white text-center mb-1">Verify your email</h2>
                            <p className="text-sm text-zinc-500 text-center mb-2">
                                Enter the 6-digit code sent to <span className="text-zinc-300 font-medium">{email}</span>
                            </p>

                            {debugCode && (
                                <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-xs text-amber-400">
                                        <span className="font-semibold">Dev mode:</span> Your code is <code className="font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded">{debugCode}</code>
                                    </p>
                                </div>
                            )}

                            <form className="space-y-4 mt-6" onSubmit={handleVerifyOtp}>
                                <div className="space-y-2">
                                    <label htmlFor="otp" className="text-sm font-medium text-zinc-400">Verification Code</label>
                                    <input
                                        id="otp"
                                        type="text"
                                        required
                                        autoComplete="one-time-code"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        disabled={loading}
                                        className="w-full h-12 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-lg font-mono tracking-[0.5em] text-center placeholder:text-zinc-700 placeholder:tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all disabled:opacity-50"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otpCode.length < 6}
                                    className="w-full h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner />
                                            Verifying...
                                        </>
                                    ) : (
                                        "Verify"
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setStep("email"); setError(""); setDebugCode(null); }}
                                    className="w-full text-center text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
                                >
                                    Use a different email
                                </button>
                            </form>
                        </>
                    )}

                    {/* ─── STEP 3: Org & Password ─── */}
                    {step === "details" && (
                        <>
                            <h2 className="text-2xl font-bold text-white text-center mb-1">Set up your workspace</h2>
                            <p className="text-sm text-zinc-500 text-center mb-8">Choose your organization name and set a password</p>

                            <form className="space-y-4" onSubmit={handleCompleteSignup}>
                                <div className="space-y-2">
                                    <label htmlFor="orgName" className="text-sm font-medium text-zinc-400">Organization Name</label>
                                    <input
                                        id="orgName"
                                        type="text"
                                        required
                                        placeholder="Acme Corp"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        disabled={loading}
                                        className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium text-zinc-400">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        minLength={8}
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all disabled:opacity-50"
                                    />
                                    <p className="text-xs text-zinc-600">Minimum 8 characters</p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-400">Confirm Password</label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        minLength={8}
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={loading}
                                        className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all disabled:opacity-50"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner />
                                            Creating account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Link to login */}
                    <p className="text-center text-sm text-zinc-500 mt-6">
                        Already have an account?{" "}
                        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>

                <p className="text-center text-xs text-zinc-600 mt-6">
                    By creating an account, you agree to our{" "}
                    <Link href="/legal/terms" className="text-zinc-500 hover:text-zinc-400 underline">Terms</Link>
                    {" "}and{" "}
                    <Link href="/legal/privacy" className="text-zinc-500 hover:text-zinc-400 underline">Privacy Policy</Link>.
                </p>
            </div>
        </div>
    );
}

function Spinner() {
    return (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}
