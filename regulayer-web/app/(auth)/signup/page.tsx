"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { requestOtp, verifyOtp, completeSignup } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function SignupPage() {
    const router = useRouter();
    
    // Steps: 1 = Email, 2 = OTP, 3 = Password & Org
    const [step, setStep] = useState<1 | 2 | 3>(1);
    
    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [signupToken, setSignupToken] = useState("");
    const [orgName, setOrgName] = useState("");
    const [password, setPassword] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await requestOtp(email);
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to send verification code");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await verifyOtp(email, otpCode);
            // Expected to return { signup_token: "signup_token_abc123" }
            if (res.data?.signup_token) {
                setSignupToken(res.data.signup_token);
                setStep(3);
            } else {
                setError("Invalid response from server");
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || "Invalid verification code");
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await completeSignup(signupToken, orgName, password);
            if (res.data?.access_token || res.data?.token) {
                setToken(res.data.access_token || res.data.token);
                router.push("/dashboard");
            } else {
                setError("Account created, but failed to log in automatically");
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to complete account creation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[hsl(30,60%,99%)] text-[hsl(15,45%,15%)] antialiased cursor-none flex flex-col items-center justify-center relative overflow-hidden">
            <CustomCursor />
            
            <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-50 z-[9999]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E\")" }} />

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group z-10">
                <div className="w-8 h-8 rounded-full border border-[hsl(15,30%,85%)] bg-white flex items-center justify-center transition-colors group-hover:bg-[hsl(15,85%,58%,0.1)] group-hover:border-[hsl(15,85%,58%,0.3)]">
                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:text-[hsl(15,85%,58%)] transition-colors" />
                </div>
                <span className="text-[14px] font-bold text-[hsl(15,25%,45%)] group-hover:text-[hsl(15,45%,15%)] transition-colors">Return Home</span>
            </Link>

            <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[420px] px-6 relative z-10"
            >
                <div className="flex justify-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[hsl(15,30%,85%)] shadow-sm flex items-center justify-center relative">
                        {step === 3 ? (
                            <CheckCircle2 className="w-6 h-6 text-[hsl(15,85%,58%)]" />
                        ) : (
                            <Lock className="w-6 h-6 text-[hsl(15,45%,15%)]" />
                        )}
                        {step !== 3 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(15,85%,58%)] opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[hsl(15,85%,58%)]" />
                            </span>
                        )}
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                        {step === 1 && "Create your workspace"}
                        {step === 2 && "Verify your email"}
                        {step === 3 && "Complete your profile"}
                    </h1>
                    <p className="text-[14px] text-[hsl(15,25%,45%)] font-light">
                        {step === 1 && "to spin up a cryptographic core engine."}
                        {step === 2 && `We sent a code to ${email}`}
                        {step === 3 && "Set up your workspace to continue."}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-[hsl(15,30%,85%)] shadow-xl p-8 relative overflow-hidden">
                    
                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2 text-red-600 text-[13px] font-medium leading-tight">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {/* STEP 1: EMAIL */}
                        {step === 1 && (
                            <motion.form 
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleRequestOtp} 
                                className="flex flex-col gap-5"
                            >
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(15,45%,15%)]">Work Email</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="john@acme.com" 
                                        required
                                        disabled={loading}
                                        className="h-12 px-4 rounded-xl border border-[hsl(15,30%,85%)] bg-[hsl(30,60%,99%)] focus:outline-none focus:border-[hsl(15,45%,15%)] focus:ring-1 focus:ring-[hsl(15,45%,15%)] transition-all text-[14px] disabled:opacity-50" 
                                    />
                                </div>
                                <button disabled={loading} className="h-12 mt-2 w-full rounded-xl bg-[hsl(15,45%,15%)] text-white font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg shadow-[rgba(56,30,21,0.2)] disabled:opacity-70">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue with Email"}
                                </button>
                            </motion.form>
                        )}

                        {/* STEP 2: OTP */}
                        {step === 2 && (
                            <motion.form 
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleVerifyOtp} 
                                className="flex flex-col gap-5"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(15,45%,15%)]">Verification Code</label>
                                        <button type="button" onClick={handleRequestOtp} className="text-[11px] text-[hsl(15,30%,50%)] hover:text-[hsl(15,85%,58%)] transition-colors">Resend Code</button>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        placeholder="000000" 
                                        maxLength={6}
                                        required
                                        disabled={loading}
                                        className="h-12 px-4 rounded-xl border border-[hsl(15,30%,85%)] bg-[hsl(30,60%,99%)] focus:outline-none focus:border-[hsl(15,45%,15%)] focus:ring-1 focus:ring-[hsl(15,45%,15%)] transition-all text-center tracking-[0.5em] text-[18px] font-mono font-bold text-[hsl(15,45%,15%)] disabled:opacity-50" 
                                    />
                                </div>
                                <button disabled={loading} className="h-12 mt-2 w-full rounded-xl bg-[hsl(15,45%,15%)] text-white font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg shadow-[rgba(56,30,21,0.2)] disabled:opacity-70">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
                                </button>
                            </motion.form>
                        )}

                        {/* STEP 3: ORG & PASSWORD */}
                        {step === 3 && (
                            <motion.form 
                                key="step3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleCompleteSignup} 
                                className="flex flex-col gap-5"
                            >
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(15,45%,15%)]">Organization Name</label>
                                    <input 
                                        type="text" 
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        placeholder="Acme Corp" 
                                        required
                                        disabled={loading}
                                        className="h-12 px-4 rounded-xl border border-[hsl(15,30%,85%)] bg-[hsl(30,60%,99%)] focus:outline-none focus:border-[hsl(15,45%,15%)] focus:ring-1 focus:ring-[hsl(15,45%,15%)] transition-all text-[14px] disabled:opacity-50" 
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(15,45%,15%)]">Create Password</label>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="At least 8 characters" 
                                        required
                                        minLength={8}
                                        disabled={loading}
                                        className="h-12 px-4 rounded-xl border border-[hsl(15,30%,85%)] bg-[hsl(30,60%,99%)] focus:outline-none focus:border-[hsl(15,45%,15%)] focus:ring-1 focus:ring-[hsl(15,45%,15%)] transition-all text-[14px] disabled:opacity-50" 
                                    />
                                </div>
                                <button disabled={loading} className="h-12 mt-2 w-full rounded-xl bg-[hsl(15,85%,58%)] text-white font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[hsl(15,80%,53%)] transition-colors shadow-lg shadow-[hsl(15,85%,58%,0.3)] disabled:opacity-70 group">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>Finish Setup <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                <p className="text-center text-[12px] text-[hsl(15,25%,45%)] mt-8">
                    By confirming, you agree to our <Link href="/legal/terms" className="underline hover:text-[hsl(15,45%,15%)]">Terms of Service</Link> and <Link href="/legal/privacy" className="underline hover:text-[hsl(15,45%,15%)]">Privacy Policy</Link>.
                </p>
                <p className="text-center text-[13px] text-[hsl(15,25%,45%)] mt-4 font-bold">
                    Already have an account? <Link href="/login" className="text-[hsl(15,85%,58%)] hover:underline">Log in</Link>
                </p>
            </motion.div>
        </div>
    );
}
