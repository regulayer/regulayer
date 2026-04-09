"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { login } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        setLoading(true);
        try {
            const res = await login(email, password);
            if (res.data?.access_token || res.data?.token) {
                setToken(res.data.access_token || res.data.token);
                router.push("/dashboard");
            } else {
                setError("Invalid response from server");
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || "Invalid email or password");
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
                    <div className="w-12 h-12 rounded-xl bg-[hsl(15,45%,15%)] border border-[hsl(15,30%,85%)] shadow-sm flex items-center justify-center relative shadow-[0_10px_30px_rgba(56,30,21,0.2)]">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>Log in to Regulayer</h1>
                    <p className="text-[14px] text-[hsl(15,25%,45%)] font-light">Access your control plane and cryptographic ledgers.</p>
                </div>

                <div className="bg-white rounded-2xl border border-[hsl(15,30%,85%)] shadow-xl p-8">
                    
                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2 text-red-600 text-[13px] font-medium leading-tight">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(15,45%,15%)]">Work Email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@acme.com" 
                                required
                                disabled={loading}
                                className="h-12 px-4 rounded-xl border border-[hsl(15,30%,85%)] bg-[hsl(30,60%,99%)] focus:outline-none focus:border-[hsl(15,85%,58%)] focus:ring-1 focus:ring-[hsl(15,85%,58%)] transition-all text-[14px] disabled:opacity-50" 
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(15,45%,15%)]">Password</label>
                                <Link href="/forgot-password" className="text-[11px] text-[hsl(15,30%,50%)] hover:text-[hsl(15,85%,58%)] transition-colors">Forgot?</Link>
                            </div>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" 
                                required
                                disabled={loading}
                                className="h-12 px-4 rounded-xl border border-[hsl(15,30%,85%)] bg-[hsl(30,60%,99%)] focus:outline-none focus:border-[hsl(15,85%,58%)] focus:ring-1 focus:ring-[hsl(15,85%,58%)] transition-all text-[14px] disabled:opacity-50" 
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="h-12 mt-2 w-full rounded-xl bg-[hsl(15,85%,58%)] text-white font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[hsl(15,80%,53%)] transition-colors shadow-lg shadow-[hsl(15,85%,58%,0.3)] group disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>Continue <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>
                            )}
                        </button>
                    </form>
                </div>
                
                <p className="text-center text-[13px] text-[hsl(15,25%,45%)] mt-8 font-bold">
                    Need an account? <Link href="/signup" className="text-[hsl(15,85%,58%)] hover:underline">Sign up</Link>
                </p>
            </motion.div>
        </div>
    );
}
