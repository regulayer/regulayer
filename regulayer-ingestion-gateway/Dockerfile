FROM python:3.11-slim

WORKDIR /app

# Copy requirements
COPY pyproject.toml .
RUN pip install .

# Copy app
COPY app/ app/

# Run
EXPOSE 8400
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8400"]
