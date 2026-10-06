# ==========================================
# MediScript-AI — Vision / OCR Service
# Port: 8001
# ==========================================
FROM python:3.11-slim AS base

# System deps for opencv-headless
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install only the deps this service actually needs (subset of root requirements.txt)
COPY requirements-vision.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy shared schemas package
COPY schemas/ ./schemas/

# Copy service code
COPY services/vision/ ./services/vision/

ENV PYTHONPATH=/app
ENV PORT=8001

EXPOSE 8001

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')"

CMD ["uvicorn", "services.vision.main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]
