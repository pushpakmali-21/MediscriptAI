import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

from app.vector_store import get_vector_store

app = FastAPI(title="RAG Service")

vector_store = None

@app.on_event("startup")
def startup_event():
    global vector_store
    vector_store = get_vector_store()

@app.get("/health")
def health_check():
    return {"status": "ok"}

class IngestRequest(BaseModel):
    chunks: List[Dict[str, Any]]

class RetrieveRequest(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None
    top_k: Optional[int] = 5

class RetrieveResponse(BaseModel):
    results: List[Dict[str, Any]]
    status: str
    reason: Optional[str] = None

@app.post("/ingest")
def ingest_documents(req: IngestRequest):
    try:
        vector_store.ingest(req.chunks)
        return {"status": "success", "ingested_count": len(req.chunks)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest: {str(e)}"
        )

@app.post("/retrieve", response_model=RetrieveResponse)
def retrieve_documents(req: RetrieveRequest):
    try:
        results = vector_store.retrieve(req.query, filters=req.filters, top_k=req.top_k)
        
        # Minimum score threshold
        min_score = float(os.environ.get("MIN_RETRIEVAL_SCORE", "0.3"))
        filtered_results = [r for r in results if r["score"] >= min_score]
        
        if not filtered_results:
            return RetrieveResponse(
                results=[],
                status="empty",
                reason="no_trusted_source"
            )
            
        return RetrieveResponse(
            results=filtered_results,
            status="success"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve: {str(e)}"
        )
