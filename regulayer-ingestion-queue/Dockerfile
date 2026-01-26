FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY pyproject.toml README.md ./
RUN pip install --no-cache-dir .

COPY . .

# Run the consumer directly
CMD ["python", "-m", "app.worker"]
