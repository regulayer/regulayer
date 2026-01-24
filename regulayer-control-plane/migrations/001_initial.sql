-- Regulayer Control Plane: Initial Schema
-- Version: 001

-- Organizations (tenants)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    environment VARCHAR(20) NOT NULL DEFAULT 'dev',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_projects_organization_id ON projects(organization_id);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id),
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    key_hash VARCHAR(64) NOT NULL,
    scopes JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_api_keys_project_id ON api_keys(project_id);
CREATE INDEX IF NOT EXISTS ix_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS ix_api_keys_key_hash ON api_keys(key_hash);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    password_hash VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
