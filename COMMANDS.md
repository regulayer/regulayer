# Regulayer - Complete Setup & Deployment Commands

**Step-by-step guide to run the entire Regulayer Phase 1 system**

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)
- Git

---

## Part 1: Regulayer SDK (Python)

### Initial Setup

```bash
# Navigate to SDK directory
cd c:\Users\sancheet\Documents\regulayer

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

# Install SDK in development mode
pip install -e .

# Install dev dependencies
pip install -e ".[dev]"
```

### Run SDK Tests

```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_hashing.py -v

# Run with coverage
pytest tests/ --cov=regulayer --cov-report=html
```

### Verify SDK Installation

```bash
# Run verification script
python verify_sdk.py
```

### Use SDK in Your Code

```python
from regulayer import trace, configure

# Configure SDK
configure(
    api_key="your-hmac-secret-key",
    endpoint="http://localhost:8000/v1/decisions"
)

# Use trace context manager
with trace(
    system_name="loan_approval",
    risk_level="high",
    model_name="gpt-4",
    model_version="2024-01"
) as t:
    # Set input
    t.set_input({"amount": 50000, "credit_score": 720})
    
    # Your AI logic here
    result = {"approved": True, "interest_rate": 4.5}
    
    # Set output
    t.set_output(result)
# Event automatically sent to Decision Recorder
```

---

## Part 2: Decision Recorder Backend

### Initial Setup

```bash
# Navigate to recorder directory
cd c:\Users\sancheet\Documents\regulayer\regulayer-recorder

# Install dependencies
pip install -e .

# Install dev dependencies
pip install -e ".[dev]"
```

### Database Setup

```bash
# Option 1: Use Docker Compose (recommended)
docker-compose up -d postgres

# Option 2: Manual PostgreSQL setup
# Create database
createdb regulayer_recorder

# Create read-only user (for verifier UI)
psql regulayer_recorder -c "
CREATE ROLE regulayer_readonly WITH LOGIN PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE regulayer_recorder TO regulayer_readonly;
GRANT USAGE ON SCHEMA public TO regulayer_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO regulayer_readonly;
"
```

### Configuration

```bash
# Create .env file
cp .env.example .env

# Edit .env with your settings
# DATABASE_URL=postgresql://regulayer:password@localhost:5432/regulayer_recorder
# HMAC_SECRET_KEY=your-very-long-secret-key-at-least-32-characters-long
# LOG_LEVEL=INFO
```

### Run Recorder Backend

```bash
# Development mode
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Or using docker-compose
docker-compose up -d recorder
```

### Verify Recorder is Running

```bash
# Check health
curl http://localhost:8000/health

# Check API docs
# Open browser: http://localhost:8000/docs

# Check metrics
curl http://localhost:8000/metrics
```

### Test Decision Ingestion

```bash
# Send test event (requires proper signature)
# This is automatically done by SDK, but can be tested manually
curl -X POST http://localhost:8000/v1/decisions \
  -H "Content-Type: application/json" \
  -H "X-Regulayer-Signature: <hmac-signature>" \
  -H "X-Regulayer-Algorithm: HMAC-SHA256" \
  -H "X-Regulayer-SDK-Version: 1.0.0" \
  -d @sample_event.json
```

---

## Part 3: Verification UI

### Backend Setup

```bash
# Navigate to verifier backend
cd c:\Users\sancheet\Documents\regulayer\regulayer-verifier-ui\backend

# Install dependencies
pip install -e .

# Configure environment
# Create .env file
echo "DATABASE_URL_READONLY=postgresql://regulayer_readonly:readonly_password@localhost:5432/regulayer_recorder" > .env
echo "CORS_ORIGINS=http://localhost:3000" >> .env
echo "LOG_LEVEL=INFO" >> .env
```

### Frontend Setup

```bash
# Navigate to verifier frontend
cd c:\Users\sancheet\Documents\regulayer\regulayer-verifier-ui\frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8001" > .env
```

### Run Verification UI

```bash
# Option 1: Docker Compose (recommended - runs everything)
cd c:\Users\sancheet\Documents\regulayer\regulayer-verifier-ui
docker-compose up -d

# Option 2: Manual (separate terminals)

# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Access Verification UI

```bash
# Open browser
# Frontend: http://localhost:3000
# Backend API docs: http://localhost:8001/docs
```

---

## Part 4: Complete System - All Components Together

### Using Docker Compose (Easiest)

```bash
# From regulayer-recorder directory
cd c:\Users\sancheet\Documents\regulayer\regulayer-recorder
docker-compose up -d

# From regulayer-verifier-ui directory
cd c:\Users\sancheet\Documents\regulayer\regulayer-verifier-ui
docker-compose up -d

# Check all services
docker-compose ps

# View logs
docker-compose logs -f recorder
docker-compose logs -f verifier-backend
docker-compose logs -f verifier-frontend
```

### Manual (All Components)

**Terminal 1: PostgreSQL**
```bash
# If not using Docker
# Start PostgreSQL service (method varies by OS)
```

**Terminal 2: Decision Recorder**
```bash
cd c:\Users\sancheet\Documents\regulayer\regulayer-recorder
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Terminal 3: Verifier Backend**
```bash
cd c:\Users\sancheet\Documents\regulayer\regulayer-verifier-ui\backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

**Terminal 4: Verifier Frontend**
```bash
cd c:\Users\sancheet\Documents\regulayer\regulayer-verifier-ui\frontend
npm run dev
```

---

## Part 5: End-to-End Testing

### 1. Generate Test Events with SDK

```python
# test_flow.py
from regulayer import trace, configure
import time

configure(
    api_key="your-hmac-secret-key",
    endpoint="http://localhost:8000/v1/decisions"
)

# Generate multiple test decisions
for i in range(10):
    with trace(
        system_name=f"test_system_{i % 3}",
        risk_level="high" if i % 2 == 0 else "low",
        model_name="test_model",
        model_version="v1.0.0"
    ) as t:
        t.set_input({"test_id": i, "data": f"test_{i}"})
        t.set_output({"result": i * 2})
    time.sleep(0.5)

print("✅ Generated 10 test decisions")
```

```bash
# Run test
python test_flow.py
```

### 2. Verify in Recorder

```bash
# Check total records
curl http://localhost:8000/metrics

# Should show total_records >= 10
```

### 3. Verify in UI

```bash
# Open browser
open http://localhost:3000

# Navigation:
# 1. Chain Overview - See total records
# 2. Decision Records - See list of decisions
# 3. Click "Inspect" on any decision
# 4. Click "Run Spot Verification"
# 5. Go to Verification Report
# 6. Click "Run Full Chain Verification"
# 7. Verify chain status shows "PASS"
```

---

## Part 6: Running Benchmarks

### SDK Benchmarks

```bash
cd c:\Users\sancheet\Documents\regulayer
# No benchmark script for SDK in Phase 1
```

### Recorder Benchmarks

```bash
cd c:\Users\sancheet\Documents\regulayer\regulayer-recorder
python benchmark.py

# Expected output:
# Event Creation: <2ms p50
# Canonicalization: <1ms p50
# SHA-256 Hashing: <0.1ms p50
# HMAC Verification: <0.2ms p50
# Validation: <0.5ms p50
# Total: <5ms p50
```

---

## Part 7: Running Tests

### SDK Tests

```bash
cd c:\Users\sancheet\Documents\regulayer
pytest tests/ -v
```

### Recorder Tests

```bash
cd c:\Users\sancheet\Documents\regulayer\regulayer-recorder
# Tests to be implemented
pytest tests/ -v
```

---

## Part 8: Stopping Services

### Docker Compose

```bash
# Stop recorder
cd c:\Users\sancheet\Documents\regulayer\regulayer-recorder
docker-compose down

# Stop verifier
cd c:\Users\sancheet\Documents\regulayer\regulayer-verifier-ui
docker-compose down

# Remove volumes (deletes data)
docker-compose down -v
```

### Manual

```bash
# Press Ctrl+C in each terminal running a service
```

---

## Part 9: Troubleshooting

### SDK Issues

```bash
# SDK not found
pip install -e .

# Import errors
python -c "import regulayer; print(regulayer.__version__)"
```

### Recorder Issues

```bash
# Database connection failed
# Check DATABASE_URL in .env
# Verify PostgreSQL is running
pg_isready -h localhost -p 5432

# Port already in use
# Kill process on port 8000
# Windows: netstat -ano | findstr :8000
# Linux/Mac: lsof -ti:8000 | xargs kill
```

### Verifier UI Issues

```bash
# Backend can't connect to database
# Verify read-only user exists
psql regulayer_recorder -c "\du regulayer_readonly"

# Frontend can't reach backend
# Check CORS_ORIGINS in backend .env
# Check VITE_API_URL in frontend .env

# npm install fails
# Clear cache: npm cache clean --force
# Delete node_modules: rm -rf node_modules
# Reinstall: npm install
```

---

## Part 10: Production Deployment Checklist

### Security

```bash
# 1. Generate strong secrets
openssl rand -hex 32  # For HMAC_SECRET_KEY

# 2. Use TLS/HTTPS
# Configure reverse proxy (nginx/Caddy) with SSL certificates

# 3. Set up VPN for verifier UI (internal access only)

# 4. Configure database with TLS
# Add ?sslmode=require to DATABASE_URL
```

### Monitoring

```bash
# 1. Set up health check monitoring
# Recorder: GET /health
# Verifier: GET /health

# 2. Set up log aggregation
# Configure log level: LOG_LEVEL=WARNING in production

# 3. Set up alerting
# Alert on 503 from health endpoints
# Alert on failed verifications
```

### Backup

```bash
# Database backups
pg_dump regulayer_recorder > backup_$(date +%Y%m%d).sql

# Automated backups
# Set up cron job or use cloud provider's backup service
```

---

## Quick Reference

| Component | Port | URL |
|-----------|------|-----|
| Decision Recorder | 8000 | http://localhost:8000 |
| Recorder API Docs | 8000 | http://localhost:8000/docs |
| Verifier Backend | 8001 | http://localhost:8001 |
| Verifier API Docs | 8001 | http://localhost:8001/docs |
| Verifier Frontend | 3000 | http://localhost:3000 |
| PostgreSQL | 5432 | localhost:5432 |

---

## Summary

**Minimum steps to run everything:**

```bash
# 1. Start recorder
cd regulayer-recorder
docker-compose up -d

# 2. Start verifier
cd ../regulayer-verifier-ui
docker-compose up -d

# 3. Use SDK in your code
python your_application.py

# 4. View in UI
open http://localhost:3000
```

**Trust is now operational, visible, and verifiable.**
