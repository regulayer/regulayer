"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar";
import {
    IconLayoutDashboard,
    IconBuildingFactory2,
    IconKey,
    IconChartBar,
    IconSettings,
    IconBook,
    IconUserBolt,
    IconBuildingBank,
    IconScale,
    IconHistory,
    IconFileDescription,
    IconBell,
    IconUsers,
    IconCreditCard,
    IconDownload,
    IconCpu,
    IconCertificate,
    IconHeartHandshake,
    IconFileText,
    IconActivityHeartbeat,
    IconUrgent,
    IconTargetArrow,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getMe, User } from "@/lib/api";
import { RegulayerLogo } from "@/components/ui/regulayer-logo";
import { ThemeToggle } from "@/components/theme-toggle";

/* Section divider */
function SidebarSection({ label }: { label: string }) {
    const { open, animate } = useSidebar();
    return (
        <div className="mt-5 mb-1.5 px-1">
            <motion.span
                animate={{
                    display: animate ? (open ? "block" : "none") : "block",
                    opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground whitespace-pre"
            >
                {label}
            </motion.span>
            <motion.div
                animate={{
                    display: animate ? (open ? "none" : "block") : "none",
                    opacity: animate ? (open ? 0 : 0.3) : 0,
                }}
                className="h-px bg-border mx-1 my-1"
            />
        </div>
    );
}

const iconClass = "text-muted-foreground h-[18px] w-[18px] flex-shrink-0";

const coreLinks = [
    { label: "Dashboard", href: "/dashboard", icon: <IconLayoutDashboard className={cn(iconClass, "text-foreground")} /> },
    { label: "Projects", href: "/projects", icon: <IconBuildingFactory2 className={iconClass} /> },
    { label: "API Keys", href: "/api-keys", icon: <IconKey className={iconClass} /> },
];

const complianceLinks = [
    { label: "Decisions", href: "/decisions", icon: <IconScale className={iconClass} /> },
    { label: "Governance", href: "/governance", icon: <IconBuildingBank className={iconClass} /> },
    { label: "Rules", href: "/governance/rules", icon: <IconSettings className={iconClass} /> },
    { label: "Audit Logs", href: "/audit", icon: <IconHistory className={iconClass} /> },
];

const euAiActLinks = [
    { label: "AI Systems", href: "/ai-systems", icon: <IconCpu className={iconClass} /> },
    { label: "Conformity", href: "/conformity", icon: <IconCertificate className={iconClass} /> },
    { label: "FRIA", href: "/fria", icon: <IconHeartHandshake className={iconClass} /> },
    { label: "Tech Docs", href: "/tech-docs", icon: <IconFileText className={iconClass} /> },
    { label: "Monitoring", href: "/monitoring", icon: <IconActivityHeartbeat className={iconClass} /> },
    { label: "Incident Report", href: "/incident-report", icon: <IconUrgent className={iconClass} /> },
    { label: "Compliance", href: "/compliance", icon: <IconTargetArrow className={iconClass} /> },
];

const monitoringLinks = [
    { label: "Usage", href: "/usage", icon: <IconChartBar className={iconClass} /> },
    { label: "Alerts", href: "/alerts", icon: <IconBell className={iconClass} /> },
];

const reportsLinks = [
    { label: "Reports", href: "/reports", icon: <IconFileDescription className={iconClass} /> },
    { label: "Exports", href: "/exports", icon: <IconDownload className={iconClass} /> },
];

const orgLinks = [
    { label: "Team", href: "/org/team", icon: <IconUsers className={iconClass} /> },
    { label: "Settings", href: "/org/settings", icon: <IconSettings className={iconClass} /> },
    { label: "Billing", href: "/billing", icon: <IconCreditCard className={iconClass} /> },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getMe().then((res) => {
            if (res.data) setUser(res.data);
        }).catch(() => { });
    }, []);

    return (
        <div className={cn("flex flex-col md:flex-row w-full flex-1 max-w-screen mx-auto overflow-hidden", "h-full")}>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10 bg-card border-r border-border">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? <Logo /> : <LogoIcon />}

                        <div className="mt-5 flex flex-col gap-0.5">
                            {coreLinks.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>

                        <SidebarSection label="Compliance" />
                        <div className="flex flex-col gap-0.5">
                            {complianceLinks.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>

                        <SidebarSection label="EU AI Act" />
                        <div className="flex flex-col gap-0.5">
                            {euAiActLinks.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>

                        <SidebarSection label="Monitoring" />
                        <div className="flex flex-col gap-0.5">
                            {monitoringLinks.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>

                        <SidebarSection label="Reports" />
                        <div className="flex flex-col gap-0.5">
                            {reportsLinks.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>

                        <SidebarSection label="Organization" />
                        <div className="flex flex-col gap-0.5">
                            {orgLinks.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-0.5 border-t border-border pt-3">
                        <SidebarLink
                            link={{
                                label: "Docs",
                                href: "/docs",
                                icon: <IconBook className="text-muted-foreground h-[18px] w-[18px] flex-shrink-0" />,
                            }}
                        />
                        <SidebarLink
                            link={{
                                label: user ? user.email.split('@')[0] : "User",
                                href: "/settings",
                                icon: (
                                    <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <IconUserBolt className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                ),
                            }}
                        />
                        <div className="px-1 mt-1">
                            <ThemeToggle />
                        </div>
                    </div>
                </SidebarBody>
            </Sidebar>
            <div className="flex-1 overflow-y-auto bg-background">
                {children}
            </div>
        </div>
    );
}

const Logo = () => (
    <Link href="/" className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20">
        <RegulayerLogo className="w-7 h-7 drop-shadow-sm flex-shrink-0" />
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-semibold text-foreground whitespace-pre text-[15px] tracking-tight">
            Regulayer
        </motion.span>
    </Link>
);

const LogoIcon = () => (
    <Link href="/" className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20 justify-center">
        <RegulayerLogo className="w-7 h-7 drop-shadow-sm flex-shrink-0" />
    </Link>
);
