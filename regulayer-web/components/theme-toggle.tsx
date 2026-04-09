"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 group/sidebar py-2 w-full"
        >
            <div className="h-[18px] w-[18px] flex-shrink-0 text-muted-foreground flex items-center justify-center">
                {theme === "dark" ? <IconSun className="h-full w-full" /> : <IconMoon className="h-full w-full" />}
            </div>
            <span className="text-sm group-data-[state=collapsed]/sidebar:hidden font-medium text-muted-foreground group-hover/sidebar:text-foreground transition-colors overflow-hidden text-ellipsis whitespace-nowrap">
                Toggle Theme
            </span>
        </button>
    );
}
