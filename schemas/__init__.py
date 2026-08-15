"""
MediScript-AI Shared Schema Contracts.
Provides centralized Pydantic data models for inter-service communication.
"""

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
from schemas.raw_text import (
    BoundingBox,
    DetectedLanguage,
    DocumentLayoutType,
    ExtractedRegion,
    RawPrescriptionText,
    TextRegionType,
)

__all__ = [
    "BoundingBox",
    "DetectedLanguage",
    "DiagnosisItem",
    "DocumentLayoutType",
    "ExtractedRegion",
    "LabVitalItem",
    "MedicationForm",
    "MedicationItem",
    "MedicationRoute",
    "NormalizedDosageTiming",
    "RAGQueryRequest",
    "RAGQueryResponse",
    "RawPrescriptionText",
    "RetrievedContextChunk",
    "SafetySeverity",
    "SafetyTier",
    "SafetyWarning",
    "StructuredPrescription",
    "TextRegionType",
]
