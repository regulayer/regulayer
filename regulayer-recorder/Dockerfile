FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY pyproject.toml .

# Install Python dependencies
# Note: regulayer_attestation is now part of the source tree, so no external dep needed
RUN pip install --no-cache-dir .

# Copy application and vendored lib
COPY app/ ./app/
COPY migrations/ ./migrations/
COPY regulayer_attestation/ ./regulayer_attestation/

# Create non-root user
RUN useradd -m -u 1000 regulayer && \
    mkdir -p /keys && \
    chown -R regulayer:regulayer /app /keys

USER regulayer

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; import sys; r = urllib.request.urlopen('http://localhost:8000/health'); sys.exit(0) if r.getcode() == 200 else sys.exit(1)"

# Run application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
