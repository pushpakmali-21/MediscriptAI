"""
MediScript-AI RAG & Medical Knowledge Microservice.
Responsible for grounded medical QA, context retrieval, and three-tier safety classification.
"""

from fastapi import FastAPI, status
from schemas.rag import RAGQueryRequest, RAGQueryResponse, SafetyTier

app = FastAPI(
    title="MediScript-AI RAG Knowledge Service",
    version="0.1.0",
    description="Medical knowledge retrieval, patient explanation, and safety tiering microservice.",
)


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"service": "rag", "status": "healthy", "version": "0.1.0"}


@app.post("/query", response_model=RAGQueryResponse, status_code=status.HTTP_200_OK)
async def query_knowledge(req: RAGQueryRequest):
    """Stub endpoint: Return grounded medical explanation or redirect."""
    return RAGQueryResponse(
        query_id=req.query_id,
        question=req.question,
        safety_tier=SafetyTier.EXPLANATION,
        answer="[STUB] This is a stub explanation from the medical knowledge service.",
        retrieved_sources=[],
        confidence=1.0,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
