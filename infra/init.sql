-- ============================================================
-- Regulayer Database Initialization
--
-- FORENSIC INFRASTRUCTURE: This script enforces:
-- 1. Service isolation (no cross-database access)
-- 2. Append-only enforcement (no UPDATE/DELETE on crypto tables)
-- 3. Privilege escalation prevention
-- 4. Non-superuser service accounts
--
-- MUST run BEFORE Alembic migrations.
-- ============================================================


-- ============================================================
-- 1. CREATE SERVICE USERS (non-superuser, no createdb, no createrole)
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'recorder') THEN
        CREATE USER recorder WITH PASSWORD 'recorder_password'
            NOSUPERUSER NOCREATEDB NOCREATEROLE;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'control') THEN
        CREATE USER control WITH PASSWORD 'control_password'
            NOSUPERUSER NOCREATEDB NOCREATEROLE;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'governance') THEN
        CREATE USER governance WITH PASSWORD 'governance_password'
            NOSUPERUSER NOCREATEDB NOCREATEROLE;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'incidents') THEN
        CREATE USER incidents WITH PASSWORD 'incidents_password'
            NOSUPERUSER NOCREATEDB NOCREATEROLE;
    END IF;
END
$$;


-- ============================================================
-- 2. CREATE DATABASES
-- ============================================================

CREATE DATABASE regulayer_recorder OWNER recorder;
CREATE DATABASE regulayer_control  OWNER control;
CREATE DATABASE regulayer_governance OWNER governance;
CREATE DATABASE regulayer_incidents OWNER incidents;


-- ============================================================
-- 3. DATABASE-LEVEL ISOLATION
--    Revoke all access from PUBLIC and cross-service users.
-- ============================================================

-- Recorder DB: only recorder can connect
REVOKE ALL ON DATABASE regulayer_recorder FROM PUBLIC;
REVOKE ALL ON DATABASE regulayer_recorder FROM control;
REVOKE ALL ON DATABASE regulayer_recorder FROM governance;
REVOKE ALL ON DATABASE regulayer_recorder FROM incidents;
GRANT CONNECT ON DATABASE regulayer_recorder TO recorder;

-- Control DB: only control can connect
REVOKE ALL ON DATABASE regulayer_control FROM PUBLIC;
REVOKE ALL ON DATABASE regulayer_control FROM recorder;
REVOKE ALL ON DATABASE regulayer_control FROM governance;
REVOKE ALL ON DATABASE regulayer_control FROM incidents;
GRANT CONNECT ON DATABASE regulayer_control TO control;

-- Governance DB: only governance can connect
REVOKE ALL ON DATABASE regulayer_governance FROM PUBLIC;
REVOKE ALL ON DATABASE regulayer_governance FROM recorder;
REVOKE ALL ON DATABASE regulayer_governance FROM control;
REVOKE ALL ON DATABASE regulayer_governance FROM incidents;
GRANT CONNECT ON DATABASE regulayer_governance TO governance;

-- Incidents DB: only incidents can connect
REVOKE ALL ON DATABASE regulayer_incidents FROM PUBLIC;
REVOKE ALL ON DATABASE regulayer_incidents FROM recorder;
REVOKE ALL ON DATABASE regulayer_incidents FROM control;
REVOKE ALL ON DATABASE regulayer_incidents FROM governance;
GRANT CONNECT ON DATABASE regulayer_incidents TO incidents;


-- ============================================================
-- 4. SCHEMA-LEVEL ISOLATION + APPEND-ONLY + DEFAULT PRIVILEGES
--    Each block connects to the target DB, locks schema, and
--    installs triggers.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 4a. RECORDER DATABASE
-- ──────────────────────────────────────────────────────────────
\connect regulayer_recorder

-- Schema isolation
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO recorder;

-- Append-only trigger function
CREATE OR REPLACE FUNCTION prevent_update_delete()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Append-only table: UPDATE or DELETE not allowed on %', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

-- Lock default privileges: recorder can INSERT but not UPDATE/DELETE on future tables
ALTER DEFAULT PRIVILEGES FOR ROLE recorder IN SCHEMA public
    REVOKE UPDATE, DELETE ON TABLES FROM recorder;

-- Grant recorder full schema usage for migrations
GRANT USAGE, CREATE ON SCHEMA public TO recorder;


-- ──────────────────────────────────────────────────────────────
-- 4b. CONTROL DATABASE (mutable — no append-only needed)
-- ──────────────────────────────────────────────────────────────
\connect regulayer_control

REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO control;
GRANT USAGE, CREATE ON SCHEMA public TO control;


-- ──────────────────────────────────────────────────────────────
-- 4c. GOVERNANCE DATABASE
-- ──────────────────────────────────────────────────────────────
\connect regulayer_governance

-- Schema isolation
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO governance;

-- Reuse the same append-only trigger function
CREATE OR REPLACE FUNCTION prevent_update_delete()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Append-only table: UPDATE or DELETE not allowed on %', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

-- Lock default privileges
ALTER DEFAULT PRIVILEGES FOR ROLE governance IN SCHEMA public
    REVOKE UPDATE, DELETE ON TABLES FROM governance;

GRANT USAGE, CREATE ON SCHEMA public TO governance;


-- ──────────────────────────────────────────────────────────────
-- 4d. INCIDENTS DATABASE
-- ──────────────────────────────────────────────────────────────
\connect regulayer_incidents

-- Schema isolation
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO incidents;

-- Reuse the same append-only trigger function
CREATE OR REPLACE FUNCTION prevent_update_delete()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Append-only table: UPDATE or DELETE not allowed on %', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

-- Lock default privileges
ALTER DEFAULT PRIVILEGES FOR ROLE incidents IN SCHEMA public
    REVOKE UPDATE, DELETE ON TABLES FROM incidents;

GRANT USAGE, CREATE ON SCHEMA public TO incidents;


-- ============================================================
-- 5. APPEND-ONLY TRIGGERS (applied after Alembic creates tables)
--
--    These triggers MUST be applied via a post-migration script
--    because the tables don't exist yet at init.sql time.
--    See: infra/post_migration_triggers.sql
-- ============================================================
-- NOTE: Trigger application is in post_migration_triggers.sql
-- because init.sql runs BEFORE Alembic creates the tables.
