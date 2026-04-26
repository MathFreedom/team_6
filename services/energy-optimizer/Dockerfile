# ──────────────────────────────────────────────────────────────────────────
# Container image for the Energy Contract Optimization Service.
#
# Targets Google Cloud Run. The runtime listens on $PORT (Cloud Run injects
# 8080 by default). Image is intentionally slim — only what FastAPI, the
# CrewAI orchestrator and the protocol clients need.
# ──────────────────────────────────────────────────────────────────────────
FROM python:3.12-slim

# System deps required by some transitive wheels (cryptography, lxml, ...)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps in a separate layer to maximise build cache reuse.
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Application source
COPY . .

# Cloud Run sets $PORT; default to 8080 for local docker run.
ENV PORT=8080
EXPOSE 8080

# Single-worker uvicorn — Cloud Run scales by replica, not by worker.
CMD exec uvicorn app:app --host 0.0.0.0 --port ${PORT}
