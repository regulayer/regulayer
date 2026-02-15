"use client";

import { cn } from "@/lib/utils";
import { useMotionValue, useSpring, motion, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export const MetricDisplay = ({
    label,
    value,
    trend,
    className,
}: {
    label: string;
    value: number;
    trend?: { value: number; isPositive: boolean };
    className?: string;
}) => {
    return (
        <div className={cn("flex flex-col gap-1", className)}>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {label}
            </p>
            <div className="flex items-end gap-2">
                <AnimatedNumber value={value} />
                {trend && (
                    <span
                        className={cn(
                            "mb-1 text-xs font-medium",
                            trend.isPositive ? "text-emerald-500" : "text-rose-500"
                        )}
                    >
                        {trend.isPositive ? "+" : ""}
                        {trend.value}%
                    </span>
                )}
            </div>
        </div>
    );
};

function AnimatedNumber({ value }: { value: number }) {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
    });
    const rounded = useTransform(springValue, (latest) => Math.round(latest));

    useEffect(() => {
        motionValue.set(value);
    }, [value, motionValue]);

    return (
        <motion.span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 table-cell">
            {rounded}
        </motion.span>
    );
}
