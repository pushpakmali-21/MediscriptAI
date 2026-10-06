# ==========================================
# MediScript-AI — RAG / Medical Knowledge Service
# Port: 8003
# ==========================================
FROM python:3.11-slim AS base

# No system-level build deps needed — all rag dependencies ship as pre-built wheels
RUN apt-get update && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements-rag.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy shared schemas package
COPY schemas/ ./schemas/

# Copy service code
COPY services/rag/ ./services/rag/

ENV PYTHONPATH=/app
ENV PORT=8003

EXPOSE 8003

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8003/health')"

CMD ["uvicorn", "services.rag.main:app", "--host", "0.0.0.0", "--port", "8003", "--workers", "1"]
