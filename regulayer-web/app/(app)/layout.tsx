'use client';

import { useState, useEffect } from 'react';
import { DemoBanner } from '@/components/DemoBanner';
import { getMe } from '@/lib/api';
import { AppSidebar } from '@/components/ui/app-sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        getMe().then(response => {
            if (response.data?.org?.is_demo) {
                setIsDemo(true);
            }
        }).catch(() => { });
    }, []);

    return (
        <div className="h-screen w-full bg-background flex flex-col relative overflow-hidden">
            {/* Ambient Backgrounds - Responsive to Light/Dark Mode */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/20 dark:bg-accent/5 blur-[100px] pointer-events-none" />

            <div className="z-10 flex flex-col h-full w-full">
                {isDemo && <DemoBanner />}
                <AppSidebar>
                    {children}
                </AppSidebar>
            </div>
        </div>
    );
}
