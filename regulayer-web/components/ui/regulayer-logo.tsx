import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function RegulayerLogo({ 
    className = "w-6 h-6", 
    color 
}: { 
    className?: string; 
    color?: string;
}) {
    // The previous SVG implementation has been swapped out for the user's 
    // real transparent PNG to ensure it works correctly everywhere.
    return (
        <div className={cn("relative flex-shrink-0", className)}>
            <Image
                src="/regulayer_logo.png"
                alt="Regulayer Logo"
                fill
                className="object-contain drop-shadow-sm"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
            />
        </div>
    );
}
