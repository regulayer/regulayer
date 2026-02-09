-- Secure the Recorder Database
-- REVOKE all mutable permissions from the app user
-- This enforces "Append-Only" at the database engine level.

DO $$
BEGIN
    -- 1. Revoke from existing table
    -- NOTE: Wrapped in try/catch or conditional if role doesn't exist during dev
    -- But strict enforcement means we should fail if role missing.
    
    -- Assuming role name matches POSTGRES_USER env in docker-compose, commonly 'recorder_user' or 'regulayer'
    -- Adjust ROLE name as per docker-compose.yml: POSTGRES_USER: recorder_user
    
    REVOKE UPDATE, DELETE, TRUNCATE ON decisions FROM recorder_user;
    
    -- 2. Revoke from future tables (Default Privileges)
    ALTER DEFAULT PRIVILEGES 
    FOR ROLE recorder_user 
    REVOKE UPDATE, DELETE, TRUNCATE ON TABLES;
    
    RAISE NOTICE 'Permissions locked: UPDATE/DELETE revoked from recorder_user';
END
$$;
