# Regulayer: Complete Azure Deployment Runbook

This guide covers the **exact, end-to-end procedure** for deploying the entire Regulayer stack onto an Azure Virtual Machine, utilizing Azure Database for PostgreSQL (Flexible Server) and Caddy for automatic SSL termination.

---

## Phase 1: Database Provisioning & Security

### 1. Configure the Azure VM and PostgreSQL Networking
Since you correctly locked down your Azure PostgreSQL Firewall to ONLY allow access from the Azure VM:
1. Verify inside the Azure Portal that your VM's Private IP (or Public IP, if connecting over the public internet) is listed in the Azure Database Firewall rules.
2. Verify that **"Allow public access from any Azure service within Azure to this server"** is **enabled** if they are on the same VNet.

### 2. Whitelist the `uuid-ossp` Extension
Azure blocks all Postgres extensions by default. You **must** whitelist the UUID extension for Regulayer to function.
1. In the Azure Portal for your PostgreSQL Flexible Server, go to **Server parameters** in the left sidebar.
2. Search for `azure.extensions`.
3. Open the dropdown, select `uuid-ossp`, and click **Save**. 

---

## Phase 2: Database Initialization

Because your firewall perfectly isolates the database, you must configure the database from your SSH terminal running on the Azure VM.

### 1. SSH into your Azure VM
```bash
ssh user@your-azure-vm-ip
```

### 2. Connect to the Azure Database via Docker
You already have Docker installed for Regulayer, so use it to spin up a temporary PostgreSQL client to connect to your Azure database:
```bash
# Replace YOUR_SERVER_HOST and YOUR_ADMIN_USERNAME
docker run -it --rm postgres:15 psql -h YOUR_SERVER_HOST.postgres.database.azure.com -U YOUR_ADMIN_USERNAME -d postgres
```
*It will prompt you for the master admin password you created when spinning up the Azure Database.*

### 3. Execute the Zero-Trust SQL Script
Once you see the `postgres=>` prompt, copy and paste this entire block and hit enter:

```sql
-- 1. Create the 4 isolated microservice users
-- (Replace 'YourSecurePassword123!' with secure passwords)
CREATE ROLE recorder_user WITH LOGIN PASSWORD 'YourSecurePassword123!';
CREATE ROLE control_user WITH LOGIN PASSWORD 'YourSecurePassword123!';
CREATE ROLE governance_user WITH LOGIN PASSWORD 'YourSecurePassword123!';
CREATE ROLE incidents_user WITH LOGIN PASSWORD 'YourSecurePassword123!';

-- 2. Create the 4 databases and assign ownership
CREATE DATABASE regulayer_recorder OWNER recorder_user;
CREATE DATABASE regulayer_control OWNER control_user;
CREATE DATABASE regulayer_governance OWNER governance_user;
CREATE DATABASE regulayer_incidents OWNER incidents_user;

-- 3. Install the required Azure-whitelisted extension into each DB
\c regulayer_recorder
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c regulayer_control
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c regulayer_governance
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c regulayer_incidents
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```
Type `\q` to exit the database prompt.

---

## Phase 3: Application Configuration

### 1. Clone the Codebase
Still on your Azure VM, pull your code down (if it isn't already there):
```bash
git clone https://github.com/your-org/regulayer.git
cd regulayer
```

### 2. Set up the `.env` File
Create or modify your `.env` file in the root directory. You must update both the **Domain** mapping and your newly generated **Azure Database Connection URLs**.

```bash
nano .env
```

**CRUCIAL ENV VARIABLES:**
```env
# --- 1. DOMAIN MAPPING ---
# Ensure this matches your production domain (e.g. regulayer.tech)
DOMAIN=regulayer.tech

# --- 2. ENVIRONMENT ---
ENV=production
DEMO_MODE_ENABLED=false

# --- 3. ISOLATED AZURE DB CONNECTIONS ---
# Replace <azure-host> with your actual Azure server host URL
# IMPORTANT: ?sslmode=require MUST remain at the end!
RECORDER_DB_URL=postgresql://recorder_user:YourSecurePassword123!@<azure-host>:5432/regulayer_recorder?sslmode=require
CONTROL_DB_URL=postgresql://control_user:YourSecurePassword123!@<azure-host>:5432/regulayer_control?sslmode=require
GOVERNANCE_DB_URL=postgresql://governance_user:YourSecurePassword123!@<azure-host>:5432/regulayer_governance?sslmode=require
INCIDENTS_DB_URL=postgresql://incidents_user:YourSecurePassword123!@<azure-host>:5432/regulayer_incidents?sslmode=require

# --- 4. SECRETS (Generate random long strings) ---
JWT_SECRET=super_secret_string_1
SESSION_SECRET=super_secret_string_2
HMAC_SECRET_KEY=super_secret_string_3
CONTROL_PLANE_INTERNAL_SECRET=super_secret_string_4
GOVERNANCE_INTERNAL_SECRET=super_secret_string_5
INCIDENTS_INTERNAL_SECRET=super_secret_string_6
```

---

## Phase 4: DNS & Networking

Before you start the Docker containers, you must tell the global internet where to route your domain.  

1. Go to your Domain Registrar (Cloudflare, GoDaddy, Namecheap, etc.).
2. Create **two 'A' Records** pointing to your **Azure VM's Public IP Address**:
   - Primary website: `@` -> `[Azure VM Public IP]`  (Resolves to regulayer.tech)
   - API Gateway: `api` -> `[Azure VM Public IP]` (Resolves to api.regulayer.tech)
3. **VM Port Forwarding:** Ensure your Azure VM "Networking" / "Inbound Port Rules" allows traffic on `Port 80` (HTTP) and `Port 443` (HTTPS).

*Note: The frontend builds its API URLs statically at compile-time. If the domain is not mapped, the frontend will not know where to point API requests.*

---

## Phase 5: The Final Launch

With the Database initialized, the `.env` configured, and the routing set up, it's time to build.

Run this command in the root of the project on your VM:

```bash
docker compose up -d --build
```

**Here is exactly what happens in the background:**
1. **Next.js Injection:** The Dockerfile reads your `DOMAIN=regulayer.tech` variable, and Next.js permanently bakes `https://api.regulayer.tech` into the frontend code bundle as its target API server.
2. **CORS Whitelisting:** The backend FastAPI gateway reads your domain and instantly allows secure CORS requests from `https://regulayer.tech`.
3. **Automatic SSL/TLS:** Your built-in Caddy image immediately contacts Let's Encrypt using your domain name. As long as your A Records are pointing to the VM correctly, Caddy secures both `.tech` routing surfaces with Enterprise HTTPS certificates.
4. **Database Initialization:** The SQLAlchemy ORM running inside the API containers connects to your blank Azure DBs, automatically translates the Python models into SQL tables, and indexes everything.

### 🔍 Verification
1. Run `docker compose logs -f` and verify the output shows `Uvicorn running on http://0.0.0.0...`
2. Navigate to `https://regulayer.tech` in your browser. Since Azure SSL validation is fully automatic via Caddy, it will already be secure.
