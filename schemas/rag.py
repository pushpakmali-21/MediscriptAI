"""
RAG (Retrieval-Augmented Generation) and Medical Safety Schemas.
Represents contracts for query routing, retrieved medical context, and patient explanations (Phase 6).
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field


class SafetyTier(str, Enum):
    """
    Three-tier safety routing per specification:
    1. EXPLANATION: General plain-language explanation of prescribed medicine or condition.
    2. INFORMATION: General medical knowledge retrieved from validated corpus.
    3. SAFETY_GUIDANCE_REDIRECT: High-risk questions (e.g. altering dosage, severe adverse reactions)
       strictly redirected to consult the prescribing physician.
    """

    EXPLANATION = "explanation"
    INFORMATION = "information"
    SAFETY_GUIDANCE_REDIRECT = "safety_guidance_redirect"


class RetrievedContextChunk(BaseModel):
    """A single retrieved chunk from the medical knowledge base."""

    chunk_id: str
    source_title: str = Field(
        ..., description="E.g., FDA Label, NHS Medicine Guide, MedlinePlus"
    )
    source_url: str | None = None
    content: str
    relevance_score: float = Field(default=0.0, ge=0.0, le=1.0)


class RAGQueryRequest(BaseModel):
    """Incoming patient query payload."""

    query_id: str
    user_id: str | None = None
    prescription_id: str | None = Field(
        default=None, description="Optional prescription ID to ground the answer"
    )
    question: str = Field(..., min_length=2, description="Patient question text")
    user_language: str = Field(default="en", description="Preferred response language")


class RAGQueryResponse(BaseModel):
    """Output response from services/rag with grounding and safety routing."""

    query_id: str
    question: str
    safety_tier: SafetyTier = SafetyTier.EXPLANATION
    answer: str = Field(..., description="Grounded, plain-language patient explanation")
    retrieved_sources: list[RetrievedContextChunk] = Field(default_factory=list)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    medical_disclaimer: str = Field(
        default="This explanation is for informational purposes only. Do not change medications or dosages without consulting your doctor."
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
