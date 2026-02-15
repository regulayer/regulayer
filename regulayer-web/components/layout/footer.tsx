import Link from "next/link";

const footerSections = [
    {
        title: "Product",
        links: [
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "/pricing" },
            { label: "Documentation", href: "/docs" },
            { label: "API Reference", href: "/docs" },
            { label: "Status", href: "/status" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About", href: "/about" },
            { label: "Security", href: "/security" },
            { label: "Trust Center", href: "/trust/continuity" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", href: "/legal/privacy" },
            { label: "Terms of Service", href: "/legal/terms" },
            { label: "Cookie Policy", href: "/legal/cookies" },
            { label: "DPA", href: "/legal/dpa" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Getting Started", href: "/docs" },
            { label: "SDK & Libraries", href: "/docs" },
            { label: "Changelog", href: "/docs" },
        ],
    },
];

export function Footer() {
    return (
        <footer className="border-t border-white/[0.06] bg-black">
            <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-xs">R</span>
                            </div>
                            <span className="text-white font-bold text-base tracking-tight">Regulayer</span>
                        </Link>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                            The cryptographic trust layer for AI systems. Immutable proof for every decision.
                        </p>
                    </div>

                    {/* Link Columns */}
                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                                {section.title}
                            </h4>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-zinc-500 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/[0.06]">
                    <p className="text-xs text-zinc-600">
                        &copy; {new Date().getFullYear()} Regulayer Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <span className="flex items-center gap-1.5 text-xs text-zinc-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            All systems operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
