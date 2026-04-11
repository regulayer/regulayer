'use client';

import { useState } from 'react';
import {
    Cloud, Server, Layers, Shield,
    CheckCircle, AlertCircle, Info, Lock,
    Building2
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

type DeploymentMode = 'saas_shared' | 'dedicated_vpc' | 'hybrid' | 'on_prem_verify';

interface ModeConfig {
    id: DeploymentMode;
    name: string;
    icon: React.ReactNode;
    description: string;
    buyerType: string;
    features: string[];
    locations: { component: string; location: string }[];
}

// ============================================================
// Mode Configurations
// ============================================================

const MODES: ModeConfig[] = [
    {
        id: 'saas_shared',
        name: 'SaaS (Shared)',
        icon: <Cloud className="w-6 h-6" />,
        description: 'Multi-tenant cloud deployment with shared infrastructure',
        buyerType: 'Startups, mid-market',
        features: ['Instant setup', 'Automatic updates', 'Standard SLA'],
        locations: [
            { component: 'Control Plane', location: 'Regulayer Cloud' },
            { component: 'Recorder', location: 'Regulayer Cloud' },
            { component: 'Storage', location: 'Regulayer Cloud' },
        ],
    },
    {
        id: 'dedicated_vpc',
        name: 'Dedicated VPC',
        icon: <Server className="w-6 h-6" />,
        description: 'Single-tenant deployment in isolated infrastructure',
        buyerType: 'Banks, enterprises',
        features: ['Isolated environment', 'Customer VPC', 'Enhanced SLA', 'Dedicated support'],
        locations: [
            { component: 'Control Plane', location: 'Regulayer Cloud' },
            { component: 'Recorder', location: 'Customer VPC' },
            { component: 'Storage', location: 'Customer VPC' },
        ],
    },
    {
        id: 'hybrid',
        name: 'Hybrid',
        icon: <Layers className="w-6 h-6" />,
        description: 'SaaS control plane with private recorder',
        buyerType: 'Regulated organizations',
        features: ['Data stays in-house', 'Customer-owned recorder', 'Full data sovereignty'],
        locations: [
            { component: 'Control Plane', location: 'Regulayer Cloud' },
            { component: 'Recorder', location: 'Customer Environment' },
            { component: 'Storage', location: 'Customer Environment' },
        ],
    },
    {
        id: 'on_prem_verify',
        name: 'On-Prem Verify',
        icon: <Shield className="w-6 h-6" />,
        description: 'Offline verification without network access',
        buyerType: 'Courts, regulators',
        features: ['Air-gapped verification', 'No network required', 'Court-admissible'],
        locations: [
            { component: 'Verifier', location: 'Customer Air-Gapped' },
        ],
    },
];

// ============================================================
// Mode Card
// ============================================================

function ModeCard({
    mode,
    isActive,
    onSelect
}: {
    mode: ModeConfig;
    isActive: boolean;
    onSelect: () => void;
}) {
    return (
        <div
            className={`rounded-xl border-2 p-6 cursor-pointer transition-all ${isActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-border bg-card hover:border-border'
                }`}
            onClick={onSelect}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${isActive ? 'bg-primary-100 bg-slate-800' : 'bg-secondary text-muted-foreground'}`}>
                    {mode.icon}
                </div>
                {isActive && (
                    <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded-full">
                        Current
                    </span>
                )}
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-1">{mode.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{mode.description}</p>
            <p className="text-xs text-muted-foreground mb-4">For: {mode.buyerType}</p>

            <div className="space-y-1">
                {mode.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-foreground">{feature}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// Component Locations Table
// ============================================================

function LocationsTable({ mode }: { mode: ModeConfig }) {
    return (
        <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Component Locations</h3>
            <div className="space-y-3">
                {mode.locations.map((loc) => (
                    <div key={loc.component} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-muted-foreground">{loc.component}</span>
                        <span className="font-medium text-foreground flex items-center gap-2">
                            {loc.location.includes('Customer') ? <Building2 className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
                            {loc.location}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// Main Deployment Settings Page
// ============================================================

export default function DeploymentSettingsPage() {
    const [currentMode, setCurrentMode] = useState<DeploymentMode>('saas_shared');

    const activeMode = MODES.find((m) => m.id === currentMode)!;

    return (
        <div className="min-h-screen bg-secondary">
            <div className="px-6 md:px-10 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Server className="w-6 h-6 text-muted-foreground" />
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Deployment Mode</h1>
                            <p className="text-muted-foreground">Customer isolation and infrastructure configuration</p>
                        </div>
                    </div>
                </div>

                {/* Trust Guarantee Banner */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                        <p className="text-green-800 text-sm font-medium">Cryptographic Validity Unchanged</p>
                        <p className="text-green-700 text-sm">
                            Deployment mode does not affect cryptographic validity. Proofs generated in any mode are identical and can be verified offline.
                        </p>
                    </div>
                </div>

                {/* Mode Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {MODES.map((mode) => (
                        <ModeCard
                            key={mode.id}
                            mode={mode}
                            isActive={mode.id === currentMode}
                            onSelect={() => setCurrentMode(mode.id)}
                        />
                    ))}
                </div>

                {/* Active Mode Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <LocationsTable mode={activeMode} />

                    <div className="bg-card rounded-xl border border-border p-6">
                        <h3 className="font-semibold text-foreground mb-4">Trust Guarantees</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-foreground">Proof format: identical across all modes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-foreground">Offline verification: always available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-foreground">Regulayer cannot forge proofs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-foreground">Customer cannot forge proofs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-foreground">Tampering is detectable</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Failure Semantics */}
                <div className="bg-card rounded-xl border border-border p-6 mb-6">
                    <h3 className="font-semibold text-foreground mb-4">Failure Handling</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                            <div>
                                <span className="font-medium text-foreground">Dedicated DB down</span>
                                <p className="text-muted-foreground">Ingestion pauses, existing proofs unaffected</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                            <div>
                                <span className="font-medium text-foreground">Control plane down</span>
                                <p className="text-muted-foreground">Recorder continues, billing delayed</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                            <div>
                                <span className="font-medium text-foreground">Customer VPC compromised</span>
                                <p className="text-muted-foreground">Tampering detectable via proof verification</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                            <div>
                                <span className="font-medium text-foreground">Regulayer gone</span>
                                <p className="text-muted-foreground">Proofs still verify offline</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact for Mode Change */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="text-zinc-800 text-sm font-medium">Need to Change Modes?</p>
                        <p className="text-muted-foreground text-sm">
                            Deployment mode changes require coordination.{' '}
                            <a href="mailto:enterprise@regulayer.io" className="underline">Contact our enterprise team</a> for migration assistance.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground mt-8">
                    Deployment affects where services run &mdash; never what is provable.
                </p>
            </div>
        </div>
    );
}
