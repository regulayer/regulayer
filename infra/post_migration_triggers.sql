-- ============================================================
-- Regulayer Post-Migration Triggers
--
-- Run AFTER Alembic migrations to apply append-only enforcement
-- on the actual tables.
--
-- Usage:
--   psql -U recorder -d regulayer_recorder -f infra/post_migration_triggers.sql
--   (Then governance, then incidents — see below)
--
-- These triggers prevent UPDATE and DELETE on cryptographic
-- and audit-grade tables. The trigger function is created in
-- init.sql; this script only creates the per-table triggers.
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- RECORDER: decisions table
-- ──────────────────────────────────────────────────────────────
\connect regulayer_recorder

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'no_update_delete_decisions'
    ) THEN
        CREATE TRIGGER no_update_delete_decisions
            BEFORE UPDATE OR DELETE ON decisions
            FOR EACH ROW
            EXECUTE FUNCTION prevent_update_delete();
    END IF;
END
$$;


-- ──────────────────────────────────────────────────────────────
-- GOVERNANCE: governance_tags, governance_annotations,
--             governance_review_history, governance_access_logs
--
-- NOTE: governance_metadata.review_state IS mutable (state
--       transitions are valid operations). Only the child
--       audit tables are append-only.
-- ──────────────────────────────────────────────────────────────
\connect regulayer_governance

DO $$
BEGIN
    -- governance_tags
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'no_update_delete_governance_tags'
    ) THEN
        CREATE TRIGGER no_update_delete_governance_tags
            BEFORE UPDATE OR DELETE ON governance_tags
            FOR EACH ROW
            EXECUTE FUNCTION prevent_update_delete();
    END IF;

    -- governance_annotations
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'no_update_delete_governance_annotations'
    ) THEN
        CREATE TRIGGER no_update_delete_governance_annotations
            BEFORE UPDATE OR DELETE ON governance_annotations
            FOR EACH ROW
            EXECUTE FUNCTION prevent_update_delete();
    END IF;

    -- governance_review_history
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'no_update_delete_governance_review_history'
    ) THEN
        CREATE TRIGGER no_update_delete_governance_review_history
            BEFORE UPDATE OR DELETE ON governance_review_history
            FOR EACH ROW
            EXECUTE FUNCTION prevent_update_delete();
    END IF;

    -- governance_access_logs
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'no_update_delete_governance_access_logs'
    ) THEN
        CREATE TRIGGER no_update_delete_governance_access_logs
            BEFORE UPDATE OR DELETE ON governance_access_logs
            FOR EACH ROW
            EXECUTE FUNCTION prevent_update_delete();
    END IF;
END
$$;


-- ──────────────────────────────────────────────────────────────
-- INCIDENTS: incident_events table
-- ──────────────────────────────────────────────────────────────
\connect regulayer_incidents

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'no_update_delete_incident_events'
    ) THEN
        CREATE TRIGGER no_update_delete_incident_events
            BEFORE UPDATE OR DELETE ON incident_events
            FOR EACH ROW
            EXECUTE FUNCTION prevent_update_delete();
    END IF;
END
$$;
