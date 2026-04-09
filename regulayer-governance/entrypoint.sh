#!/bin/sh
set -e

# Run migrations
echo "Running Database Migrations..."
alembic upgrade head

# Start application
echo "Starting Governance Service..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8002
