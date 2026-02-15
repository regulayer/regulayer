"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
    IconLayoutDashboard,
    IconBuildingFactory2,
    IconKey,
    IconChartBar,
    IconSettings,
    IconFiles,
    IconUserBolt,
    IconBuildingBank,
    IconScale,
    IconHistory,
    IconFileDescription,
    IconBell,
    IconUsers,
    IconCreditCard,
    IconDownload,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getMe, User } from "@/lib/api";

export function AppSidebar({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getMe().then((res) => {
            if (res.data) setUser(res.data);
        }).catch(err => console.error(err));
    }, []);

    const links = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: <IconLayoutDashboard className="text-zinc-700 dark:text-zinc-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Projects",
            href: "/projects",
            icon: <IconBuildingFactory2 className="text-zinc-700 dark:text-zinc-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "API Keys",
            href: "/api-keys",
            icon: <IconKey className="text-zinc-700 dark:text-zinc-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Usage",
            href: "/usage",
            icon: <IconChartBar className="text-zinc-700 dark:text-zinc-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Settings",
            href: "/settings",
            icon: <IconSettings className="text-zinc-700 dark:text-zinc-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Governance",
            href: "/governance",
            icon: <IconBuildingBank className="text-zinc-700 dark:text-zinc-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Decisions",
            href: "/decisions",
            icon: <IconScale className="text-zinc-700 dark:text-zinc-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Audit",
            href: "/audit",
            icon: <IconHistory className="text-zinc-700 dark:text-zinc-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Reports",
            href: "/reports",
            icon: <IconFileDescription className="text-zinc-700 dark:text-zinc-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Alerts",
            href: "/alerts",
            icon: <IconBell className="text-zinc-700 dark:text-zinc-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Team",
            href: "/team",
            icon: <IconUsers className="text-zinc-700 dark:text-zinc-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Billing",
            href: "/billing",
            icon: <IconCreditCard className="text-zinc-700 dark:text-zinc-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Exports",
            href: "/exports",
            icon: <IconDownload className="text-zinc-700 dark:text-zinc-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Docs",
            href: "/docs",
            icon: <IconFiles className="text-zinc-700 dark:text-zinc-200 h-5 w-5 flex-shrink-0" />,
        }
    ];

    return (
        <div
            className={cn(
                "rounded-md flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950 w-full flex-1 max-w-screen mx-auto overflow-hidden",
                "h-full"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: user ? user.full_name || "User" : "User",
                                href: "/settings",
                                icon: (
                                    <div className="h-7 w-7 flex-shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                                        <IconUserBolt className="h-4 w-4 text-zinc-500 dark:text-zinc-300" />
                                    </div>
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
                <div className="p-2 md:p-6 flex flex-col gap-2 flex-1 w-full h-full">
                    {children}
                </div>
            </div>
        </div>
    );
}

const Logo = () => {
    return (
        <Link
            href="/"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div className="h-5 w-5 rounded-full bg-amber-500 flex-shrink-0" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-zinc-900 dark:text-zinc-100 whitespace-pre"
            >
                Regulayer
            </motion.span>
        </Link>
    );
};

const LogoIcon = () => {
    return (
        <Link
            href="/"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div className="h-5 w-5 rounded-full bg-amber-500 flex-shrink-0" />
        </Link>
    );
};
