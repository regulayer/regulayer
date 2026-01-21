-- Regulayer Governance - Database Migration
-- Version: 001
-- Description: Create governance tables
--
-- CRITICAL CONSTRAINTS:
-- 1. NO foreign key constraints to recorder tables
-- 2. NO cascading deletes
-- 3. Annotations table has NO update trigger (immutable)

-- Governance Metadata (core record)
CREATE TABLE IF NOT EXISTS governance_metadata (
    decision_id UUID PRIMARY KEY,
    review_state VARCHAR(50) NOT NULL DEFAULT 'unreviewed',
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE governance_metadata IS 'Governance metadata overlay. Does NOT affect cryptographic verification.';

-- Governance Tags
CREATE TABLE IF NOT EXISTS governance_tags (
    id BIGSERIAL PRIMARY KEY,
    decision_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'manual',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_governance_tags_decision ON governance_tags(decision_id);
COMMENT ON TABLE governance_tags IS 'Tags are descriptive only. No deletion in Phase 4.1.';

-- Governance Annotations (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS governance_annotations (
    id BIGSERIAL PRIMARY KEY,
    decision_id UUID NOT NULL,
    author_role VARCHAR(50) NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_governance_annotations_decision ON governance_annotations(decision_id);
COMMENT ON TABLE governance_annotations IS 'APPEND-ONLY. No update or delete permitted, even by admins.';

-- Prevent updates on annotations (enforced at application level, but this is defense in depth)
-- Note: Uncomment if you want DB-level enforcement
-- CREATE OR REPLACE FUNCTION prevent_annotation_update()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     RAISE EXCEPTION 'Annotations are immutable. Updates not permitted.';
-- END;
-- $$ LANGUAGE plpgsql;
--
-- CREATE TRIGGER no_annotation_update
-- BEFORE UPDATE ON governance_annotations
-- FOR EACH ROW EXECUTE FUNCTION prevent_annotation_update();
