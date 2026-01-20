# Regulayer Verification UI

**Internal Integrity Verification and Inspection Interface**

## Overview

Read-only forensic tool for engineers and auditors to verify hash-chain integrity and inspect immutable decision records.

> ⚠️ **Internal Forensic Tool**: This UI is an internal forensic tool and is not intended to satisfy regulator-facing evidence submission requirements. Formal attestations and signed reports are introduced in Phase 2.

## Core Principle

**The UI NEVER modifies data.**  
**The UI ONLY verifies and visualizes facts.**

This is forensics tooling, not a product dashboard.

## Features

✅ Chain status overview  
✅ Full chain integrity verification  
✅ Decision record inspection (read-only)  
✅ Spot verification of individual decisions  
✅ Hash visualization with copy functionality  
✅ Tamper detection  

## Quick Start

```bash
# Start all services
docker-compose up -d

# Access UI
open http://localhost:3000

# Access API docs
open http://localhost:8001/docs
```

## Security

### Read-Only Database Access

```sql
CREATE ROLE regulayer_readonly WITH LOGIN PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE regulayer_recorder TO regulayer_readonly;
GRANT USAGE ON SCHEMA public TO regulayer_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO regulayer_readonly;
```

### Internal Access Only
- Deploy behind VPN
- Internal network only
- No public exposure

**This UI reveals and proves trust that already exists.**
