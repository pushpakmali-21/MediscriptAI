"""
MediScript-AI Central Backend & Orchestration API.
Coordinates user requests across Vision, Extraction, and RAG microservices.
"""

from fastapi import FastAPI, status

app = FastAPI(
    title="MediScript-AI Orchestration API",
    version="0.1.0",
    description="Central backend gateway orchestrating document ingestion, clinical extraction, and patient assistance.",
)


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"service": "backend", "status": "healthy", "version": "0.1.0"}


@app.get("/api/v1/status", status_code=status.HTTP_200_OK)
async def api_status():
    return {
        "status": "ready",
        "services": {
            "vision": "services/vision",
            "extraction": "services/extraction",
            "rag": "services/rag",
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
