'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Shield,
    LayoutDashboard,
    FolderKanban,
    Key,
    BarChart3,
    FileText,
    Scale,
    Settings,
    ChevronDown,
    ShieldAlert,
    LifeBuoy,
    Users,
    CreditCard
} from 'lucide-react';
import { DemoBanner } from '@/components/DemoBanner';
import { getMe } from '@/lib/api';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'API Keys', href: '/api-keys', icon: Key },
    { name: 'Usage', href: '/usage', icon: BarChart3 },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Governance', href: '/governance', icon: Scale },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Alerts', href: '/alerts', icon: ShieldAlert },
    { name: 'Support', href: 'mailto:support@regulayer.tech', icon: LifeBuoy },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        // Check if current org is demo
        getMe().then(response => {
            if (response.data?.org?.is_demo) {
                setIsDemo(true);
            }
        }).catch(() => {
            // Ignore errors, default to non-demo
        });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Demo Banner - Non-dismissible (Phase I.1) */}
            {isDemo && <DemoBanner />}

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="w-64 bg-slate-900 text-white flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-slate-700">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Shield className="w-8 h-8 text-primary-400" />
                            <span className="text-xl font-bold">Regulayer</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${isActive
                                        ? 'bg-primary-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Trust Banner */}
                    <div className="p-4">
                        <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-3">
                            <p className="text-xs text-amber-200">
                                ⚠️ UI shows derived data. Cryptographic verification requires offline proof tools.
                            </p>
                        </div>
                    </div>

                    {/* User */}
                    <div className="p-4 border-t border-slate-700">
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition">
                            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                U
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-white">User</p>
                                <p className="text-xs text-slate-400">Owner</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
