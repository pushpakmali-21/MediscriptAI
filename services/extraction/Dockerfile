# ==========================================
# MediScript-AI — Entity Extraction / NER Service
# Port: 8002
# ==========================================
FROM python:3.11-slim AS base

# No system-level build deps needed — spacy and scikit-learn ship as pre-built wheels
RUN apt-get update && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements-extraction.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy shared schemas package
COPY schemas/ ./schemas/

# Copy service code
COPY services/extraction/ ./services/extraction/

ENV PYTHONPATH=/app
ENV PORT=8002

EXPOSE 8002

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8002/health')"

CMD ["uvicorn", "services.extraction.main:app", "--host", "0.0.0.0", "--port", "8002", "--workers", "1"]
