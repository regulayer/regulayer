-- Hardened Permissions for Governance Database
-- Run this as a superuser (usually 'postgres') after tables are created.
-- Replace 'regulayer_governance_user' with the actual DB user from your config if different.

BEGIN;

-- 1. Revoke dangerous permissions on existing critical tables
REVOKE UPDATE, DELETE, TRUNCATE ON governance_annotations FROM "regulayer";
REVOKE UPDATE, DELETE, TRUNCATE ON governance_tags FROM "regulayer";
REVOKE UPDATE, DELETE, TRUNCATE ON governance_review_history FROM "regulayer";
REVOKE UPDATE, DELETE, TRUNCATE ON governance_access_logs FROM "regulayer";

-- 2. Enforce future safety (Default Privileges)
-- This ensures that if new tables are created, the app user cannot unknowingly get update/delete rights.
-- We assume the schema is 'public'.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE UPDATE, DELETE, TRUNCATE ON TABLES FROM "regulayer";

COMMIT;
