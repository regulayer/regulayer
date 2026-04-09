"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem } from "./navbar-menu";
import { cn } from "@/lib/utils";

export function Navbar({ className }: { className?: string }) {
    const [active, setActive] = useState<string | null>(null);
    return (
        <div
            className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
        >
            <Menu setActive={setActive}>
                <MenuItem setActive={setActive} active={active} item="Platform">
                    <div className="flex flex-col space-y-4 text-sm">
                        <HoveredLink href="/#features">Core Features</HoveredLink>
                        <HoveredLink href="/docs/recording">Cryptographic Ledger</HoveredLink>
                        <HoveredLink href="/docs/governance">Policy Governance</HoveredLink>
                        <HoveredLink href="/docs/reports">Compliance Reports</HoveredLink>
                    </div>
                </MenuItem>
                <MenuItem setActive={setActive} active={active} item="Developers">
                    <div className="flex flex-col space-y-4 text-sm">
                        <HoveredLink href="/docs">Documentation</HoveredLink>
                        <HoveredLink href="/docs/auth">API Keys & Auth</HoveredLink>
                        <HoveredLink href="/docs/sdk-python">Python SDK</HoveredLink>
                        <HoveredLink href="/docs/webhooks">Webhooks</HoveredLink>
                    </div>
                </MenuItem>
                <MenuItem setActive={setActive} active={active} item="Company">
                    <div className="flex flex-col space-y-4 text-sm">
                        <HoveredLink href="/about">About Us</HoveredLink>
                        <HoveredLink href="/pricing">Pricing</HoveredLink>
                        <HoveredLink href="/trust">Security & Trust</HoveredLink>
                        <HoveredLink href="/legal">Legal</HoveredLink>
                    </div>
                </MenuItem>
            </Menu>
        </div>
    );
}
