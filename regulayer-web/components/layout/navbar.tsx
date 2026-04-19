"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RegulayerLogo } from "@/components/ui/regulayer-logo";

const links = [
    { label: "Product", href: "/#features" },
    { label: "Use Cases", href: "/use-cases" },
    { label: "Pricing", href: "/pricing" },
    { label: "Docs", href: "/docs" },
    { label: "Glossary", href: "/glossary" },
    { label: "Blog", href: "/blog" },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", handler, { passive: true });
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                className={`transition-all duration-500 ease-out ${scrolled
                        ? "warm-glass border-b shadow-[0_1px_24px_-8px_hsla(25,20%,40%,0.06)]"
                        : "bg-transparent border-b border-transparent"
                    }`}
                style={{ borderColor: scrolled ? "hsla(30, 25%, 88%, 0.5)" : "transparent" }}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between h-[4.25rem] px-6 lg:px-10">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <RegulayerLogo className="w-7 h-7 transition-transform duration-300 group-hover:scale-105" color="hsl(15,85%,58%)" />
                        <span style={{ fontFamily: "var(--font-space-grotesk)" }} className="text-[19px] font-bold tracking-[-0.04em] text-[hsl(15,45%,15%)]">
                            Regulayer
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {links.map((link) => (
                            <Link key={link.href} href={link.href}
                                className={`relative px-4 py-2 text-[13px] font-medium rounded-full transition-all duration-300 ${pathname === link.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                    }`}>
                                {pathname === link.href && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 rounded-full"
                                        style={{ background: "hsla(14, 60%, 55%, 0.06)" }}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                    />
                                )}
                                <span className="relative z-10">{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        <Link href="/login" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 px-3 py-2">
                            Log in
                        </Link>
                        <Link href="/signup">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="px-5 py-2 text-[13px] font-semibold rounded-full transition-all duration-300"
                                style={{ background: "hsl(14, 60%, 55%)", color: "hsl(34, 90%, 98%)", boxShadow: "0 3px 14px -3px hsla(14,60%,45%,0.25)" }}
                            >
                                Get Started
                            </motion.button>
                        </Link>
                    </div>

                    {/* Mobile */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 md:hidden text-muted-foreground hover:text-foreground rounded-full hover:bg-foreground/5 transition-colors">
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden md:hidden warm-glass"
                            style={{ borderTop: "1px solid hsla(30, 25%, 88%, 0.5)" }}
                        >
                            <div className="px-6 py-5 space-y-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                {links.map((link, i) => (
                                    <motion.div key={link.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                                        <Link href={link.href} onClick={() => setMobileOpen(false)}
                                            className="block px-4 py-2.5 text-sm font-medium rounded-xl text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors">
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                                <div className="pt-4 mt-4 space-y-2" style={{ borderTop: "1px solid hsla(30, 25%, 88%, 0.5)" }}>
                                    <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-muted-foreground">Log in</Link>
                                    <Link href="/signup" onClick={() => setMobileOpen(false)}
                                        className="block px-4 py-2.5 text-sm font-bold text-center rounded-full"
                                        style={{ background: "hsl(14, 60%, 55%)", color: "hsl(34, 90%, 98%)" }}>
                                        Get Started →
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </header>
    );
}
