import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlazedCardProps {
    children: ReactNode;
    className?: string;
}

export function GlazedCard({ children, className }: GlazedCardProps) {
    return (
        <div
            className={cn(
                "bg-card text-card-foreground rounded-2xl border border-border shadow-card hover:shadow-glow-sm transition-all duration-300",
                className
            )}
        >
            {children}
        </div>
    );
}
