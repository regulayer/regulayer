"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    IconShieldCheck,
    IconBuildingBank,
    IconUsers,
    IconDatabase,
    IconSearch,
    IconEdit,
    IconTrash,
    IconLock,
    IconLockOpen,
    IconRefresh,
    IconActivity
} from "@tabler/icons-react";
import {
    getAdminOverview,
    getAdminOrgs,
    getAdminOrgUsers,
    updateAdminOrgQuota,
    suspendAdminOrg,
    activateAdminOrg,
    deleteAdminOrg,
    AdminOverview,
    AdminOrgListItem,
    AdminUserListItem
} from "@/lib/api";

export default function SuperAdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [overview, setOverview] = useState<AdminOverview | null>(null);
    const [orgs, setOrgs] = useState<AdminOrgListItem[]>([]);
    const [search, setSearch] = useState("");

    // Modals
    const [selectedUsersOrgId, setSelectedUsersOrgId] = useState<string | null>(null);
    const [usersList, setUsersList] = useState<AdminUserListItem[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const [quotaModalOrg, setQuotaModalOrg] = useState<AdminOrgListItem | null>(null);
    const [customCapInput, setCustomCapInput] = useState<string>("");
    const [isUnlimited, setIsUnlimited] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const [overviewRes, orgsRes] = await Promise.all([
                getAdminOverview(),
                getAdminOrgs()
            ]);
            setOverview(overviewRes.data);
            setOrgs(orgsRes.data || []);
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 403 || err.response?.status === 401) {
                router.push("/");
            } else {
                setError(err.response?.data?.detail || "Failed to load admin data.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewUsers = async (orgId: string) => {
        setSelectedUsersOrgId(orgId);
        setUsersLoading(true);
        try {
            const res = await getAdminOrgUsers(orgId);
            setUsersList(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setUsersLoading(false);
        }
    };

    const openQuotaModal = (org: AdminOrgListItem) => {
        setQuotaModalOrg(org);
        if (org.custom_decision_cap === -1) {
            setIsUnlimited(true);
            setCustomCapInput("");
        } else {
            setIsUnlimited(false);
            setCustomCapInput(org.custom_decision_cap !== null ? String(org.custom_decision_cap) : "");
        }
    };

    const handleUpdateQuota = async () => {
        if (!quotaModalOrg) return;
        const cap = isUnlimited ? -1 : (customCapInput ? parseInt(customCapInput) : null);
        try {
            await updateAdminOrgQuota(quotaModalOrg.id, cap);
            setQuotaModalOrg(null);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to update quota");
        }
    };

    const handleSuspend = async (orgId: string, currentStatus: string) => {
        try {
            if (currentStatus === "suspended" || currentStatus === "frozen") {
                await activateAdminOrg(orgId);
            } else {
                if (!confirm("Are you sure you want to suspend this organization? They will be locked out immediately.")) return;
                await suspendAdminOrg(orgId);
            }
            fetchData();
        } catch (err: any) {
            alert("Action failed: " + err.message);
        }
    };

    const handleDelete = async (orgId: string) => {
        if (!confirm("DANGER: Are you absolutely sure you want to permanently delete this organization? This cannot be undone.")) return;
        if (!confirm("Seriously. Type to confirm? (Just hitting OK for now, but be careful!)")) return;
        try {
            await deleteAdminOrg(orgId);
            fetchData();
        } catch (err: any) {
            alert("Delete failed: " + err.message);
        }
    };

    const filteredOrgs = orgs.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        (o.owner_email && o.owner_email.toLowerCase().includes(search.toLowerCase())) ||
        o.id.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-foreground">
                <IconRefresh className="animate-spin text-muted-foreground mr-2" /> Loading God Mode...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-background text-foreground">
                <IconShieldCheck size={48} className="mx-auto text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 flex flex-col gap-8 w-full min-h-screen pb-20 text-foreground">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <IconShieldCheck className="text-emerald-500" /> Platform Administration
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">God mode controls for tenants, billing overrides, and zero-trust killswitches.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 rounded-lg bg-secondary text-foreground hover:bg-slate-200 transition-colors"
                >
                    <IconRefresh size={20} />
                </button>
            </div>

            {/* Overview Stats */}
            {overview && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-secondary p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg"><IconBuildingBank size={24} /></div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Hubs / Tenants</p>
                            <h3 className="text-2xl font-bold">{overview.total_organizations}</h3>
                        </div>
                    </div>
                    <div className="bg-secondary p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg"><IconUsers size={24} /></div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Users</p>
                            <h3 className="text-2xl font-bold">{overview.total_users}</h3>
                        </div>
                    </div>
                    <div className="bg-secondary p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-lg"><IconDatabase size={24} /></div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Platform Total Decisions</p>
                            <h3 className="text-2xl font-bold">{(overview.total_decisions || 0).toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Table */}
            <div className="bg-card border border-border rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border bg-secondary/50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Organizations</h2>
                    <div className="relative">
                        <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name, owner or ID..."
                            className="bg-card border border-border text-foreground text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-primary"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-secondary/30">
                            <tr>
                                <th className="py-3 px-5 font-semibold text-muted-foreground">Tenant Name</th>
                                <th className="py-3 px-5 font-semibold text-muted-foreground pb-3 text-center">Status</th>
                                <th className="py-3 px-5 font-semibold text-muted-foreground">Owner</th>
                                <th className="py-3 px-5 font-semibold text-muted-foreground text-center">Users</th>
                                <th className="py-3 px-5 font-semibold text-muted-foreground text-center">Usage / Quota</th>
                                <th className="py-3 px-5 font-semibold text-muted-foreground text-right">Admin Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredOrgs.map((org) => {
                                const isSuspended = org.status === "suspended" || org.status === "frozen";
                                const capDisplay = org.custom_decision_cap === -1 ? "Infinite" : (org.custom_decision_cap || "Plan Default");
                                
                                return (
                                    <tr key={org.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="py-4 px-5">
                                            <div className="font-medium">{org.name}</div>
                                            <div className="text-xs text-muted-foreground">{org.id.split('-')[0]}...</div>
                                        </td>
                                        <td className="py-4 px-5 text-center">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isSuspended ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                {isSuspended ? "Suspended" : "Active"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5 text-muted-foreground">{org.owner_email || "N/A"}</td>
                                        <td className="py-4 px-5 text-center font-medium">
                                            <button onClick={() => handleViewUsers(org.id)} className="hover:underline text-primary">
                                                {org.member_count}
                                            </button>
                                        </td>
                                        <td className="py-4 px-5 text-center">
                                            <div className="font-medium">{(org.decisions_ingested || 0).toLocaleString()}</div>
                                            <div className="text-xs text-muted-foreground">/ {typeof capDisplay === 'number' ? capDisplay.toLocaleString() : capDisplay}</div>
                                        </td>
                                        <td className="py-4 px-5 text-right">
                                            <div className="flex justify-end gap-2 text-muted-foreground">
                                                <button onClick={() => openQuotaModal(org)} className="p-1.5 hover:bg-secondary rounded hover:text-foreground" title="Override Quota">
                                                    <IconEdit size={16} />
                                                </button>
                                                <button onClick={() => handleSuspend(org.id, org.status)} className={`p-1.5 hover:bg-secondary rounded ${isSuspended ? 'text-emerald-500 hover:text-emerald-400' : 'hover:text-red-500'}`} title={isSuspended ? 'Activate' : 'Suspend Killswitch'}>
                                                    {isSuspended ? <IconLockOpen size={16} /> : <IconLock size={16} />}
                                                </button>
                                                <button onClick={() => handleDelete(org.id)} className="p-1.5 hover:bg-red-500/10 rounded hover:text-red-500" title="Delete Tenant">
                                                    <IconTrash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredOrgs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">No tenants found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quota Modal */}
            {quotaModalOrg && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-border">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h2 className="font-semibold">Update Quota Override</h2>
                            <button onClick={() => setQuotaModalOrg(null)} className="text-muted-foreground hover:text-foreground">✕</button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">Modifying decision ingestion cap for <strong>{quotaModalOrg.name}</strong>.</p>
                            
                            <label className="flex items-center gap-3 bg-secondary p-3 rounded-lg border border-border cursor-pointer">
                                <input type="checkbox" checked={isUnlimited} onChange={e => setIsUnlimited(e.target.checked)} className="rounded text-primary focus:ring-primary" />
                                <span className="text-sm font-medium">Infinite Cap (Unlimited)</span>
                            </label>

                            {!isUnlimited && (
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Custom Limit</label>
                                    <input 
                                        type="number" 
                                        value={customCapInput}
                                        onChange={e => setCustomCapInput(e.target.value)}
                                        placeholder="e.g. 500000"
                                        className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">Leave blank to revert to standard billing plan limits.</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-4">
                                <button onClick={() => setQuotaModalOrg(null)} className="px-4 py-2 text-sm bg-secondary text-foreground rounded-lg">Cancel</button>
                                <button onClick={handleUpdateQuota} className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg">Save Override</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Modal */}
            {selectedUsersOrgId && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-2xl rounded-xl shadow-xl overflow-hidden border border-border flex flex-col max-h-[80vh]">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h2 className="font-semibold flex items-center gap-2"><IconUsers size={18}/> Users in Tenant</h2>
                            <button onClick={() => setSelectedUsersOrgId(null)} className="text-muted-foreground hover:text-foreground">✕</button>
                        </div>
                        <div className="p-0 overflow-y-auto">
                            {usersLoading ? (
                                <div className="p-8 text-center text-muted-foreground">Loading users...</div>
                            ) : (
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-secondary/20">
                                        <tr>
                                            <th className="py-2 px-6 font-semibold text-muted-foreground">Email</th>
                                            <th className="py-2 px-6 font-semibold text-muted-foreground">Role</th>
                                            <th className="py-2 px-6 font-semibold text-muted-foreground text-right">Signed Up</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {usersList.map(u => (
                                            <tr key={u.id} className="hover:bg-secondary/10">
                                                <td className="py-3 px-6">{u.email}</td>
                                                <td className="py-3 px-6 uppercase text-xs">{u.role}</td>
                                                <td className="py-3 px-6 text-right text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
