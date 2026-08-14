"""
MediScript-AI Shared Schema Contracts.
Provides centralized Pydantic data models for inter-service communication.
"""

from schemas.raw_text import (
    BoundingBox,
    DetectedLanguage,
    DocumentLayoutType,
    ExtractedRegion,
    RawPrescriptionText,
    TextRegionType,
)
from schemas.prescription import (
    DiagnosisItem,
    LabVitalItem,
    MedicationForm,
    MedicationItem,
    MedicationRoute,
    NormalizedDosageTiming,
    SafetySeverity,
    SafetyWarning,
    StructuredPrescription,
)
from schemas.rag import (
    RAGQueryRequest,
    RAGQueryResponse,
    RetrievedContextChunk,
    SafetyTier,
)

__all__ = [
    # Raw Text / Vision
    "BoundingBox",
    "DetectedLanguage",
    "DocumentLayoutType",
    "ExtractedRegion",
    "RawPrescriptionText",
    "TextRegionType",
    # Structured Prescription / Extraction
    "DiagnosisItem",
    "LabVitalItem",
    "MedicationForm",
    "MedicationItem",
    "MedicationRoute",
    "NormalizedDosageTiming",
    "SafetySeverity",
    "SafetyWarning",
    "StructuredPrescription",
    # RAG / Clinical Knowledge
    "RAGQueryRequest",
    "RAGQueryResponse",
    "RetrievedContextChunk",
    "SafetyTier",
]
