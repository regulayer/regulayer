# Regulayer - Complete Setup & Deployment Commands

**Step-by-step guide to run the entire Regulayer Platform.**

> [!TIP]
> **Use the Quick Start below to run the FULL system (Dashboard, Gateway, Control Plane, DBs).**
> Only follow the individual component guides if you need to develop on a single service in isolation.

---

## 🚀 Quick Start: Run the Whole Platform

This will start all services:
- **Frontend**: Dashboard (`web`)
- **API Gateway**: Public Ingestion Points (`gateway`)
- **Control Plane**: Management API (`control-plane`)
- **Trust Layer**: Recorder, Governance, Reports (`recorder`, `governance`, `reports`)
- **Infrastructure**: Postgres, Redis, Queue Workers

### 1. Prerequisites
- Docker & Docker Compose
- Python 3.10+ (for SDK usage)

### 2. Configuration
Ensure you have a `.env` file in the root directory:

```bash
cd c:\Users\sancheet\Documents\regulayer
cp .env.example .env
# Edit .env if needed (default values work for local dev)
```

### 3. Start Everything
```bash
# Build and start all services
docker-compose up -d --build
```

### 4. Verify Services are Running
```bash
docker-compose ps
```

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard** | [http://localhost:3000](http://localhost:3000) | Main UI (Login/Signup) |
| **Gateway** | [http://localhost:8080](http://localhost:8080) | Public Ingestion API |
| **Control Plane** | [http://localhost:8000/docs](http://localhost:8000/docs) | Internal Management API |
| **Recorder** | Internal (Port 8000) | Immutable Ledger |

### 5. Using the System
1. Open [http://localhost:3000](http://localhost:3000)
2. Sign up for a new account (creates Organization & API Key).
3. Copy your API Key.
4. Use the Python SDK to send data:

```python
from regulayer import trace, configure

configure(api_key="rl_live_YOUR_KEY_HERE", endpoint="http://localhost:8080/v1/decisions")

with trace(system_name="demo", risk_level="low", model_name="gpt-4") as t:
    t.set_input("Hello world")
    t.set_output("Hi there")
```

---

## Component-Specific Guides (Advanced)

Only use these if you are debugging a specific service or running without Docker.

### Part 1: Regulayer SDK (Python)

#### Initial Setup
```bash
cd c:\Users\sancheet\Documents\regulayer
python -m venv venv
venv\Scripts\activate
pip install -e .
pip install -e ".[dev]"
```

#### Run Tests
```bash
pytest tests/ -v
```

### Part 2: Decision Recorder (Standalone)

*To run simpler, isolated recorder + verifier only.*

```bash
cd c:\Users\sancheet\Documents\regulayer\regulayer-recorder
docker-compose up -d
```
*Note: This runs a separate database instance from the main platform.*

### Part 3: Verification UI (Standalone)

*To run the standalone chain verifier.*

```bash
cd c:\Users\sancheet\Documents\regulayer\regulayer-verifier-ui
docker-compose up -d
```
*Access at [http://localhost:3000](http://localhost:3000) (if mapping port 3000)*

---

## 🛠 Troubleshooting

### "No services to build" / Only DB starts
If `docker-compose up` only starts Postgres:
1. Ensure you are in the **ROOT** directory `c:\Users\sancheet\Documents\regulayer`.
2. Check `docker-compose.yml` defines all services (`web`, `gateway`, etc).
3. Run `docker-compose up -d --build` to force image creation.

### Database Connection Errors
- The root `docker-compose` spins up one shared Postgres.
- Sub-folder `docker-compose` files spin up *separate* Postgres instances.
- **Don't run both at the same time** to avoid port conflicts (5432).

`docker-compose down` in subfolders before starting the root platform.

### View Logs
```bash
docker-compose logs -f web
docker-compose logs -f gateway
docker-compose logs -f recorder
```
