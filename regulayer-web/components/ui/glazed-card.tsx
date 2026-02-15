"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

export const GlazedCard = ({
    children,
    className,
    hoverEffect = true,
}: {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}) => {
    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-3xl border border-zinc-200/50 bg-white/50 p-8 backdrop-blur-md transition-all duration-300 dark:border-zinc-800/50 dark:bg-zinc-900/50",
                hoverEffect && "hover:border-zinc-300/80 hover:bg-white/80 dark:hover:border-zinc-700/80 dark:hover:bg-zinc-900/80 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/50",
                className
            )}
        >
            {hoverEffect && (
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer dark:via-white/5" />
            )}
            <div className="relative z-10">{children}</div>
        </div>
    );
};
