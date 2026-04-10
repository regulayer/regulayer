import axios from "axios";
import { getToken, removeToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

import { InternalAxiosRequestConfig } from "axios";

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Redirect to login on 401 (expired or missing session)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't redirect if already on auth pages
            const url = error.config?.url || '';
            const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/signup');
            if (!isAuthEndpoint && typeof window !== 'undefined') {
                removeToken();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// --- Types ---

export interface Organization {
    id: string;
    name: string;
    logo_url?: string;
    status: string;
    is_demo?: boolean;
    environment?: string;
    stripe_customer_id?: string;
    subscription_status?: string;
    created_at: string;
    updated_at?: string;
}

export interface User {
    id: string;
    email: string;
    organization_id: string;
    role: string;
    created_at: string;
    last_login_at?: string;
    org?: Organization;
}
// Alias for backwards compatibility
export type UserWithOrg = User;

export interface Project {
    id: string;
    name: string;
    description?: string;
    organization_id: string;
    governance_mode?: string; // "observe" (Mode 1) or "gate" (Mode 2)
    gate_decline_message?: string;
    created_at: string;
}

export interface ApiKey {
    id: string;
    name: string;
    key_prefix: string;
    scopes: string[];
    created_at: string;
}

export interface ApiKeyWithSecret extends ApiKey {
    key_secret: string;
}

export interface Incident {
    id: string;
    severity: "critical" | "warning" | "info";
    source: string;
    incident_type: string;
    message: string;
    created_at: string;
}

export interface AuditLogEntry {
    id: string;
    action: string;
    actor_email?: string;
    resource_type: string;
    resource_id?: string;
    details?: Record<string, unknown>;
    created_at: string;
}

export interface Decision {
    decision_id: string;
    record_id?: number;
    record_hash: string;
    previous_record_hash?: string;
    canonical_payload_hash?: string;
    server_timestamp: string;
    chain_id?: string;
    sequence_number?: number | null;
    system_name: string;
    risk_level: string;
    event_state: string;
    sdk_instance_id?: string;
    sdk_version?: string;
    attestation?: {
        identity_id?: string;
        algorithm?: string;
        signed_at?: string;
        identity_status_at_signing?: string;
    } | null;
    canonical_payload: {
        decision_id?: string;
        system_name?: string;
        system?: string;
        model_name?: string;
        model_version?: string;
        input?: Record<string, unknown>;
        output?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
        input_hash?: string;
        output_hash?: string;
        start_timestamp?: string;
        end_timestamp?: string;
        execution_duration_ms?: number;
        risk_level?: string;
        event_state?: string;
        event_version?: string;
        decision_type?: string;
        runtime_fingerprint?: Record<string, unknown>;
        [key: string]: unknown;
    };
}

export interface UsageStats {
    period_start: string;
    period_end: string;
    decision_count: number;
    used: number;
    limit: number;
}

// --- Auth ---
export const login = (email: string, password: string) => api.post("/v1/auth/login", { email, password });
export const signup = (data: { name: string; email: string; password: string; organization_name?: string }) => api.post("/v1/auth/signup", data);
let mePromise: Promise<any> | null = null;
export const getMe = () => {
    if (!mePromise) {
        mePromise = api.get<User>("/v1/auth/me").finally(() => {
            // Deduplicate only simultaneous requests (in-flight caching)
            setTimeout(() => { mePromise = null; }, 100);
        });
    }
    return mePromise;
};
export const forgotPassword = (email: string) => api.post("/v1/auth/forgot-password", { email });
export const resetPassword = (token: string, password: string) => api.post("/v1/auth/reset-password", { token, new_password: password });

// --- Notifications ---
export interface NotificationPreference {
    incident_alerts: boolean;
    governance_reviews: boolean;
    billing_updates: boolean;
    email_enabled: boolean;
    in_app_enabled: boolean;
}

export const getNotificationPrefs = () => api.get<NotificationPreference>("/v1/users/me/notifications");
export const updateNotificationPrefs = (data: Partial<NotificationPreference>) => api.put<NotificationPreference>("/v1/users/me/notifications", data);

// --- Webhooks ---
export interface WebhookDestination {
    id: string;
    organization_id: string;
    name: string;
    url: string;
    events: string[];
    status: string;
    secret: string;
    created_at: string;
}

export const getWebhooks = (orgId: string) => api.get<WebhookDestination[]>(`/v1/orgs/${orgId}/webhooks`);
export const createWebhook = (orgId: string, data: { name: string; url: string; events: string[] }) => api.post<WebhookDestination>(`/v1/orgs/${orgId}/webhooks`, data);
export const deleteWebhook = (orgId: string, webhookId: string) => api.delete(`/v1/orgs/${orgId}/webhooks/${webhookId}`);

export interface InvitationDetails {
    email: string;
    role: string;
    orgName: string;
    orgId: string;
}
export const validateInvitation = (token: string) => api.get<InvitationDetails>(`/v1/auth/invitations/${token}`);
export const acceptInvitation = (token: string, password: string) => api.post<{ token: string; user: any }>("/v1/auth/invitations/accept", { token, password });

// --- Projects ---
export const getProjects = (orgId: string) => api.get<Project[]>(`/v1/orgs/${orgId}/projects`);
export const createProject = (orgId: string, data: { name: string; description?: string }) => api.post<Project>(`/v1/orgs/${orgId}/projects`, data);
export const getProject = (projectId: string) => api.get<Project>(`/v1/projects/${projectId}`);
export const updateProject = (projectId: string, data: { name?: string; description?: string; governance_mode?: string; gate_decline_message?: string }) => api.patch(`/v1/projects/${projectId}`, data);

// --- API Keys ---
export const getApiKeys = (projectId: string) => api.get<ApiKey[]>(`/v1/projects/${projectId}/keys`);
export const createApiKey = (projectId: string, data: { name: string; scopes?: string[] }) => api.post<ApiKeyWithSecret>(`/v1/projects/${projectId}/keys`, data);
export const revokeApiKey = (keyId: string) => api.post(`/v1/keys/${keyId}/revoke`);

// --- Usage ---
export const getUsage = (orgId: string) => api.get<UsageStats>(`/v1/usage/orgs/${orgId}`);

export interface DailyUsage {
    date: string;
    count: number;
}
export const getDailyUsage = (orgId: string, days: number = 30, projectId?: string) => {
    let url = `/v1/usage/orgs/${orgId}/daily?days=${days}`;
    if (projectId && projectId !== 'all') url += `&project_id=${projectId}`;
    return api.get<DailyUsage[]>(url);
};

// --- Billing ---
export const getBilling = (orgId: string) => api.get<{ decision_count: number; limit: number; tier: string; plan?: { name: string; limit_decisions: number } }>(`/v1/usage/${orgId}`);


// --- Governance / Decisions ---
export const getDecisions = (projectId: string) => api.get<Decision[]>(`/v1/decisions?project_id=${projectId}`, { headers: { "X-Regulayer-Project-Id": projectId } });
export const getDecision = (decisionId: string) => api.get<Decision>(`/v1/decisions/${decisionId}`, { headers: { "X-Regulayer-Project-Id": "all" } });

// --- Incidents ---
export interface Incident {
    id: string;
    incident_type: string;
    severity: "critical" | "warning" | "info";
    source: string;
    message: string;
    status: string;
    resolved_at?: string;
    created_at: string;
}

export const getIncidents = (orgId: string) => api.get<Incident[]>(`/v1/incidents?org_id=${orgId}`);
export const resolveIncident = (orgId: string, incidentId: string) => api.post<Incident>(`/v1/incidents/${incidentId}/resolve?org_id=${orgId}`, {});

// --- Audit ---
export const getAuditLogs = (orgId: string) => api.get<AuditLogEntry[]>(`/v1/orgs/${orgId}/audit-logs`);

// --- Team ---
export interface TeamMember {
    id: string;
    email: string;
    role: "owner" | "admin" | "editor" | "viewer" | "member";
    status: string;
    joined_at: string;
}

export const listTeamMembers = (orgId: string) => api.get<TeamMember[]>(`/v1/orgs/${orgId}/members`);
export const getTeamMembers = listTeamMembers; // Alias
export const inviteTeamMember = (orgId: string, email: string, role: string) => api.post(`/v1/orgs/${orgId}/invitations`, { email, role });
export const inviteMember = inviteTeamMember; // Alias
export const changeUserRole = (orgId: string, userId: string, role: string) => api.put(`/v1/orgs/${orgId}/members/${userId}`, { role });
export const removeTeamMember = (orgId: string, userId: string) => api.delete(`/v1/orgs/${orgId}/members/${userId}`);

export interface PendingInvitation {
    id: string;
    organization_id: string;
    email: string;
    role: string;
    inviter_id: string;
    expires_at: string;
    created_at: string;
}
export const listInvitations = (orgId: string) => api.get<PendingInvitation[]>(`/v1/orgs/${orgId}/invitations`);
export const revokeInvitation = (orgId: string, inviteId: string) => api.delete(`/v1/orgs/${orgId}/invitations/${inviteId}`);

// --- Account Deletion ---
export const requestDeleteOtp = (orgId: string) => api.post(`/v1/orgs/${orgId}/delete/request-otp`, {});
export const confirmDeleteOrg = (orgId: string, code: string) => api.post(`/v1/orgs/${orgId}/delete/confirm`, { code });

// --- Auth (OTP & Session) ---
export const requestOtp = (email: string) => api.post("/v1/auth/signup/otp-request", { email });
export const verifyOtp = (email: string, code: string) => api.post("/v1/auth/signup/otp-verify", { email, code });
export const completeSignup = (token: string, orgName: string, password: string) => api.post("/v1/auth/signup/complete", { signup_token: token, orgName, password });
export const logout = () => {
    removeToken();
    return api.post("/v1/auth/logout").catch(() => {
        // Logout endpoint may fail if token already expired, that's OK
    });
};

// --- Billing ---
export const createCheckoutSession = (planId: string, successUrl: string, cancelUrl: string) =>
    api.post("/v1/billing/checkout", { plan_id: planId, success_url: successUrl, cancel_url: cancelUrl });
export const createPortalSession = (orgId: string) => api.post("/v1/billing/portal", { return_url: window.location.href });

// --- Organization ---
export const updateOrg = (orgId: string, data: { name: string }) => api.patch(`/v1/orgs/${orgId}`, data);

// --- Governance ---
export interface GovernanceAnnotation {
    id: string;
    note: string;
    author_role: string;
    created_at: string;
}

export interface GovernanceTag {
    id: string;
    name: string;
    category: string;
}

export interface GovernanceMetadata {
    decision_id: string;
    review_state: string;
    tags: GovernanceTag[];
    annotations: GovernanceAnnotation[];
    last_updated: string;
}

export const getGovernance = (decisionId: string) => api.get<GovernanceMetadata>(`/v1/governance/${decisionId}`);
export const addGovernanceAnnotation = (decisionId: string, note: string) => api.post(`/v1/governance/${decisionId}/annotations`, { note });
export const addGovernanceTag = (decisionId: string, name: string, category: string) => api.post(`/v1/governance/${decisionId}/tags`, { name, category });
export const updateReviewState = (decisionId: string, state: string, comment?: string) => api.post(`/v1/governance/${decisionId}/reviews`, { state, comment });
export const resolveGateDecision = (decisionId: string, status: "approved" | "declined", decline_message?: string, edited_output?: any) => api.post(`/v1/governance/${decisionId}/resolve`, { status, decline_message, edited_output });
export const getGovernanceQueue = (status?: string) => api.get(`/v1/governance/queue?status=${status || 'all'}`);

export interface GovernanceProposal {
    id: string;
    org_id?: string;
    project_id?: string;
    environment: string;
    proposed_payload: any;
    status: string;
    decision_id?: string;
    action_reason?: string;
    risk_level?: string;
    edit_chain?: {
        original_hash: string;
        edited_hash: string;
        editor_id: string;
        editor_role: string;
        edited_at: string;
        chain_hash: string;
    };
    created_at: string;
    updated_at: string;
}

export const listProposals = (status?: string) => api.get<GovernanceProposal[]>(`/v1/governance/proposals?status=${status || 'pending'}`);
export const proposeDecision = (data: { environment: string; proposed_payload: any; org_id?: string; project_id?: string }) => api.post<GovernanceProposal>(`/v1/governance/propose`, data);
export const getProposal = (proposalId: string) => api.get<GovernanceProposal>(`/v1/governance/proposals/${proposalId}`);
export const reviewProposal = (proposalId: string, action: "approve" | "reject", reason: string, edited_payload?: any) =>
    api.post<GovernanceProposal>(`/v1/governance/proposals/${proposalId}/review`, { action, reason, edited_payload });


// --- Governance Policies ---
export interface PolicyCondition {
    field: string;
    operator: string;
    value: any;
}

export interface PolicyAction {
    type: string;
    require_role?: string;
    add_tag?: string;
}

export interface GovernancePolicy {
    policy_id: string;
    name: string;
    description?: string;
    enabled: boolean;
    project_id?: string;
    applies_to: string[];
    conditions: PolicyCondition[];
    actions: PolicyAction[];
    created_at: string;
    updated_at: string;
}

export const getPolicies = () => api.get<GovernancePolicy[]>(`/v1/policies`);
export const createPolicy = (data: Partial<GovernancePolicy>) => api.post<GovernancePolicy>(`/v1/policies`, data);
export const togglePolicy = (policyId: string, enabled: boolean) => api.patch(`/v1/policies/${policyId}/enable?enabled=${enabled}`, {});
export const deletePolicy = (policyId: string) => api.delete(`/v1/policies/${policyId}`);

// --- Reports Data ---
export interface ChainIntegrityReport {
    report_id: string;
    organization_id: string;
    generated_at: string;
    status: string;
    chain_length: number;
    last_verified_hash: string;
}

export interface GovernanceReport {
    report_id: string;
    organization_id: string;
    generated_at: string;
    period: string;
    total_flagged: number;
    approved: number;
    rejected: number;
    escalations: number;
}

export interface IncidentsReport {
    report_id: string;
    organization_id: string;
    generated_at: string;
    active_incidents: number;
    resolved_incidents: number;
    mean_time_to_resolution_hours: number;
}

export interface UsageReport {
    report_id: string;
    organization_id: string;
    generated_at: string;
    decisions_recorded: number;
    storage_used_bytes: number;
    api_requests: number;
}

export interface SlaReport {
    report_id: string;
    organization_id: string;
    generated_at: string;
    uptime_percentage: number;
    p95_latency_ms: number;
    governance_queue_time_avg_minutes: number;
}

export const getChainReport = (format?: string) => api.get<ChainIntegrityReport>(`/v1/reports/chain/default?format=${format || 'json'}`);
export const getGovernanceReport = () => api.get<GovernanceReport>(`/v1/reports/governance?format=json`);
export const getIncidentsReport = () => api.get<IncidentsReport>(`/v1/reports/incidents?format=json`);
export const getUsageReport = () => api.get<UsageReport>(`/v1/reports/usage?format=json`);
export const getSlaReport = () => api.get<SlaReport>(`/v1/reports/sla?format=json`);

// --- Export History (client-side tracking) ---
export interface ExportRecord {
    id: string;
    report_type: string;
    report_title: string;
    format: string;
    exported_at: string;
    status: 'completed' | 'failed';
    file_size_estimate?: string;
}

export function getExportHistory(): ExportRecord[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem('regulayer_export_history') || '[]');
    } catch { return []; }
}

export function addExportRecord(record: Omit<ExportRecord, 'id' | 'exported_at'>): ExportRecord {
    const entry: ExportRecord = {
        ...record,
        id: crypto.randomUUID(),
        exported_at: new Date().toISOString(),
    };
    const history = getExportHistory();
    history.unshift(entry);
    // Keep last 100 entries
    if (history.length > 100) history.length = 100;
    localStorage.setItem('regulayer_export_history', JSON.stringify(history));
    return entry;
}

export function clearExportHistory(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('regulayer_export_history');
    }
}

// --- Public ---
export const getPublicStatus = () => api.get("/v1/status");

// ═══════════════════════════════════════════════════════════
// EU AI ACT — DATA MODELS & LOCAL PERSISTENCE
// ═══════════════════════════════════════════════════════════

export type RiskTier = 'unacceptable' | 'high' | 'limited' | 'minimal' | 'unclassified';
export type LifecycleStatus = 'development' | 'testing' | 'deployed' | 'monitoring' | 'retired';
export type AnnexCategory =
    | 'biometric' | 'critical_infrastructure' | 'education'
    | 'employment' | 'essential_services' | 'law_enforcement'
    | 'migration' | 'justice' | 'none';

export interface AISystem {
    id: string;
    name: string;
    version: string;
    description: string;
    intended_purpose: string;
    provider_name: string;
    risk_tier: RiskTier;
    annex_category: AnnexCategory;
    lifecycle_status: LifecycleStatus;
    project_id?: string;
    classification_rationale: string;
    deployment_date?: string;
    member_states: string[];
    created_at: string;
    updated_at: string;
}

export interface ConformityChecklistItem {
    id: string;
    article: string;
    title: string;
    description: string;
    status: 'not_started' | 'in_progress' | 'complete' | 'not_applicable';
    evidence_notes: string;
    evidence_links: string[];
    completed_at?: string;
}

export interface ConformityAssessment {
    id: string;
    system_id: string;
    system_name?: string;
    status: 'not_started' | 'in_progress' | 'complete' | 'expired';
    checklist: ConformityChecklistItem[];
    ce_declaration_generated: boolean;
    assessment_type: 'internal' | 'third_party';
    started_at?: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface FRIARightAssessment {
    right_name: string;
    risk_identified: boolean;
    risk_description: string;
    risk_severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
    affected_groups: string[];
}

export interface FRIAMitigation {
    right_name: string;
    measure_description: string;
    implementation_status: 'planned' | 'implemented' | 'verified';
    responsible_person: string;
}

export interface FRIAAssessment {
    id: string;
    system_id: string;
    system_name?: string;
    status: 'draft' | 'in_progress' | 'complete' | 'submitted';
    deployer_info: {
        org_name: string;
        contact_person: string;
        dpo_name: string;
        dpo_email: string;
    };
    system_description: {
        purpose: string;
        scope: string;
        affected_groups: string[];
        scale_of_use: string;
    };
    rights_analysis: FRIARightAssessment[];
    mitigation_measures: FRIAMitigation[];
    human_oversight_plan: string;
    monitoring_commitments: string;
    authority_submission?: {
        submitted_at: string;
        authority_name: string;
        reference_number: string;
    };
    created_at: string;
    updated_at: string;
}

export interface TechDocSection {
    id: string;
    section_number: string;
    title: string;
    content: string;
    auto_populated: boolean;
    last_updated: string;
    completeness: number;
}

export interface TechDocumentation {
    id: string;
    system_id: string;
    system_name?: string;
    sections: TechDocSection[];
    overall_completeness: number;
    created_at: string;
    updated_at: string;
}

export interface MonitoringKPI {
    id: string;
    name: string;
    metric_type: 'accuracy' | 'bias' | 'drift' | 'latency' | 'error_rate' | 'custom';
    current_value: number;
    threshold_warning: number;
    threshold_critical: number;
    unit: string;
    trend: 'improving' | 'stable' | 'degrading';
    history: { date: string; value: number }[];
    last_measured: string;
}

export interface MonitoringPlan {
    id: string;
    system_id: string;
    system_name?: string;
    kpis: MonitoringKPI[];
    review_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    next_review_date: string;
    alerts_enabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface IncidentReportData {
    id: string;
    system_id: string;
    system_name?: string;
    severity: 'death' | 'critical_infrastructure' | 'fundamental_rights';
    deadline_days: number;
    deadline_date: string;
    status: 'draft' | 'under_review' | 'submitted' | 'acknowledged';
    form_data: {
        system_name: string;
        system_version: string;
        ce_marking_number: string;
        incident_description: string;
        incident_date: string;
        timeline_of_events: string;
        affected_individuals: string;
        scope_description: string;
        root_cause: string;
        causal_link_assessment: string;
        corrective_actions_taken: string;
        corrective_actions_planned: string;
    };
    authority_name: string;
    submission_date?: string;
    linked_incident_ids: string[];
    created_at: string;
    updated_at: string;
}

export interface ComplianceArticleScore {
    article: string;
    title: string;
    score: number;
    status: 'complete' | 'partial' | 'missing';
    gaps: string[];
}

export interface ComplianceScore {
    system_id: string;
    system_name: string;
    overall_percentage: number;
    article_scores: ComplianceArticleScore[];
    eu_database_ready: boolean;
    registration_checklist: { item: string; complete: boolean }[];
    last_calculated: string;
}

let cachedOrgId: string | null = null;
export const clearOrgIdCache = () => { cachedOrgId = null; };

const getOrgId = async () => {
    if (cachedOrgId) return cachedOrgId;
    const me = await getMe();
    if (!me.data || !me.data.organization_id) throw new Error("No organization found");
    cachedOrgId = me.data.organization_id;
    return cachedOrgId;
};

// AI Systems
export const getAISystems = async (): Promise<AISystem[]> => {
    const orgId = await getOrgId();
    const res = await api.get<AISystem[]>(`/v1/orgs/${orgId}/compliance/ai-systems`);
    return res.data;
};

export const getAISystem = async (id: string): Promise<AISystem | undefined> => {
    const systems = await getAISystems();
    return systems.find(s => s.id === id);
};

export const saveAISystem = async (s: AISystem): Promise<AISystem> => {
    const orgId = await getOrgId();
    const res = await api.post<AISystem>(`/v1/orgs/${orgId}/compliance/ai-systems`, s);
    return res.data;
};

export const deleteAISystemRecord = async (id: string): Promise<void> => {
    // Requires delete endpoint in backend, stubbing for now.
    console.warn("Delete AI system not fully implemented in backend.");
};

// Conformity Assessments
export const getConformityAssessments = async (): Promise<ConformityAssessment[]> => {
    const orgId = await getOrgId();
    const res = await api.get<ConformityAssessment[]>(`/v1/orgs/${orgId}/compliance/conformity`);
    return res.data;
};

export const getConformityAssessment = async (id: string): Promise<ConformityAssessment | undefined> => {
    const assessments = await getConformityAssessments();
    return assessments.find(a => a.id === id);
};

export const saveConformityAssessment = async (a: ConformityAssessment): Promise<ConformityAssessment> => {
    const orgId = await getOrgId();
    const res = await api.post<ConformityAssessment>(`/v1/orgs/${orgId}/compliance/conformity`, a);
    return res.data;
};

export const deleteConformityAssessmentRecord = async (id: string): Promise<void> => {};

// FRIA
export const getFRIAs = async (): Promise<FRIAAssessment[]> => {
    const orgId = await getOrgId();
    const res = await api.get<FRIAAssessment[]>(`/v1/orgs/${orgId}/compliance/fria`);
    return res.data;
};

export const getFRIA = async (id: string): Promise<FRIAAssessment | undefined> => {
    const frias = await getFRIAs();
    return frias.find(f => f.id === id);
};

export const saveFRIA = async (f: FRIAAssessment): Promise<FRIAAssessment> => {
    const orgId = await getOrgId();
    const res = await api.post<FRIAAssessment>(`/v1/orgs/${orgId}/compliance/fria`, f);
    return res.data;
};

export const deleteFRIARecord = async (id: string): Promise<void> => {};

// Tech Docs
export const getTechDocs = async (): Promise<TechDocumentation[]> => {
    const orgId = await getOrgId();
    const res = await api.get<TechDocumentation[]>(`/v1/orgs/${orgId}/compliance/tech-docs`);
    return res.data;
};

export const getTechDoc = async (id: string): Promise<TechDocumentation | undefined> => {
    const docs = await getTechDocs();
    return docs.find(d => d.id === id);
};

export const saveTechDoc = async (d: TechDocumentation): Promise<TechDocumentation> => {
    const orgId = await getOrgId();
    const res = await api.post<TechDocumentation>(`/v1/orgs/${orgId}/compliance/tech-docs`, d);
    return res.data;
};

export const deleteTechDocRecord = async (id: string): Promise<void> => {};

// Monitoring Plans
export const getMonitoringPlans = async (): Promise<MonitoringPlan[]> => {
    const orgId = await getOrgId();
    const res = await api.get<MonitoringPlan[]>(`/v1/orgs/${orgId}/compliance/monitoring`);
    return res.data;
};

export const getMonitoringPlan = async (id: string): Promise<MonitoringPlan | undefined> => {
    const plans = await getMonitoringPlans();
    return plans.find(m => m.id === id);
};

export const saveMonitoringPlan = async (m: MonitoringPlan): Promise<MonitoringPlan> => {
    const orgId = await getOrgId();
    const res = await api.post<MonitoringPlan>(`/v1/orgs/${orgId}/compliance/monitoring`, m);
    return res.data;
};

// Incident Reports
export const getIncidentReports = async (): Promise<IncidentReportData[]> => {
    const orgId = await getOrgId();
    const res = await api.get<IncidentReportData[]>(`/v1/orgs/${orgId}/compliance/incidents`);
    return res.data;
};

export const getIncidentReport = async (id: string): Promise<IncidentReportData | undefined> => {
    const reports = await getIncidentReports();
    return reports.find(r => r.id === id);
};

export const saveIncidentReport = async (r: IncidentReportData): Promise<IncidentReportData> => {
    const orgId = await getOrgId();
    const res = await api.post<IncidentReportData>(`/v1/orgs/${orgId}/compliance/incidents`, r);
    return res.data;
};

export const deleteIncidentReportRecord = async (id: string): Promise<void> => {};

export default api;
