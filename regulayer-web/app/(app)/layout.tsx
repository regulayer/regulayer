'use client';

import { useState, useEffect } from 'react';
import { DemoBanner } from '@/components/DemoBanner';
import { getMe } from '@/lib/api';
import { AppSidebar } from '@/components/ui/app-sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
        <div className="h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex flex-col">
            {/* Demo Banner - Non-dismissible (Phase I.1) */}
            {isDemo && <DemoBanner />}

            <AppSidebar>
                {children}
            </AppSidebar>
        </div>
    );
}

