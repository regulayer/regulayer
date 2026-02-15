"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const StickyBanner = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <motion.div
            initial={{
                y: -100,
                opacity: 0,
            }}
            animate={{
                y: 0,
                opacity: 1,
            }}
            transition={{
                duration: 0.5,
            }}
            className={cn(
                "fixed z-[5000] top-0 inset-x-0 mx-auto bg-blue-500 py-3 px-4 md:px-8 flex items-center justify-center",
                className
            )}
        >
            {children}
        </motion.div>
    );
};
