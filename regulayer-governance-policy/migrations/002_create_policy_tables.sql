-- Regulayer Governance Policy - Database Migration
-- Version: 002
-- Description: Create policy and workflow tables
--
-- CRITICAL CONSTRAINTS:
-- 1. Approval records are APPEND-ONLY (no update, no delete)
-- 2. Evaluation logs are immutable

-- Governance Policies
CREATE TABLE IF NOT EXISTS governance_policies (
    policy_id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    applies_to JSONB NOT NULL DEFAULT '[]',
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE governance_policies IS 'Governance policy definitions. Policies never affect cryptographic facts.';

-- Policy Evaluation Logs (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS policy_evaluation_logs (
    id BIGSERIAL PRIMARY KEY,
    decision_id UUID NOT NULL,
    policy_id UUID NOT NULL,
    matched BOOLEAN NOT NULL,
    actions_executed JSONB NOT NULL DEFAULT '[]',
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eval_logs_decision ON policy_evaluation_logs(decision_id);
CREATE INDEX IF NOT EXISTS idx_eval_logs_policy ON policy_evaluation_logs(policy_id);
COMMENT ON TABLE policy_evaluation_logs IS 'APPEND-ONLY policy evaluation log.';

-- Approval Records (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS approval_records (
    id BIGSERIAL PRIMARY KEY,
    decision_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    approved BOOLEAN NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approvals_decision ON approval_records(decision_id);
COMMENT ON TABLE approval_records IS 'APPEND-ONLY. No update or delete permitted, even by admins.';

-- Required Approvals (set by policies)
CREATE TABLE IF NOT EXISTS required_approvals (
    id BIGSERIAL PRIMARY KEY,
    decision_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    required_by_policy_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_required_approvals_decision ON required_approvals(decision_id);
