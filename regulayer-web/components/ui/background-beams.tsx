"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
    return (
        <div
            className={cn(
                "absolute h-full w-full inset-0 bg-background opacity-40",
                className
            )}
        >
            <div className="absolute h-full w-full inset-0 bg-grid-primary/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            <motion.div
                initial={{
                    opacity: 0,
                }}
                animate={{
                    opacity: 1,
                }}
                transition={{
                    duration: 1,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent h-px w-3/4 blur-sm top-0 left-10"
            />
            <motion.div
                initial={{
                    opacity: 0,
                }}
                animate={{
                    opacity: 1,
                }}
                transition={{
                    duration: 1,
                    delay: 0.2,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm top-0 left-60"
            />
        </div>
    );
};
