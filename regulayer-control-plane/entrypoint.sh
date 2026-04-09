#!/bin/sh
set -e

# Run migrations
echo "Running Database Migrations..."
alembic upgrade head

# Start application
echo "Starting Control Plane Service..."
exec uvicorn app.api:app --host 0.0.0.0 --port 8000
