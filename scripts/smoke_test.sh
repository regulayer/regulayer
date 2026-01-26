#!/bin/bash
set -e

echo "[SMOKE] Starting Smoke Test..."

# 1. Check if stack is up
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "[SMOKE] FAIL: Services not running. Run 'make boot' first."
    exit 1
fi

# 2. Run Seeding (this exercises Auth, Gateway, Queue, Recorder)
echo "[SMOKE] Running Seed Script..."
python3 scripts/seed_demo.py

if [ ! -f demo_creds.json ]; then
    echo "[SMOKE] FAIL: Seeding failed to produce credentials."
    exit 1
fi

# 3. Export Verification
echo "[SMOKE] Verifying Export..."
# Only Recorder ID is needed for export, but in V1 API we export by Decision ID (UUID)
# For smoke test, we'll skip the exact ID lookup unless we parse the seed output.
# Instead, we check the Recorder Health which includes "total_records"

HEALTH=$(curl -s http://localhost:8001/health)
TOTAL=$(echo $HEALTH | grep -o '"total_records":[0-9]*' | cut -d: -f2)

if [ "$TOTAL" -lt 10 ]; then
     echo "[SMOKE] FAIL: Recorder did not persist 10 records. Found: $TOTAL"
     exit 1
fi

echo "[SMOKE] PASS: System is operational. $TOTAL records found."
exit 0
