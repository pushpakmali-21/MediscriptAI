"""
Raw Text and Document Understanding Schemas.
Represents the contract between Vision/OCR services (Phase 4) and downstream NER/Entity Extraction (Phase 5).
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class DocumentLayoutType(str, Enum):
    FREE_FORM_PAD = (
        "free_form_pad"  # E.g., doctor prescription pad with freehand cursive
    )
    STRUCTURED_FORM = (
        "structured_form"  # E.g., bilingual pre-printed checklist / hospital template
    )
    MIXED = "mixed"
    UNKNOWN = "unknown"


class DetectedLanguage(str, Enum):
    ENGLISH = "en"
    HINDI = "hi"
    BILINGUAL_EN_HI = "en-hi"
    MARATHI = "mr"
    GUJARATI = "gu"
    OTHER = "other"


class TextRegionType(str, Enum):
    HEADER_PRINTED = "header_printed"  # Clinic/Hospital name, doctor credentials
    PATIENT_DEMOGRAPHICS = "patient_demographics"  # Age, gender, date, ID
    CLINICAL_NOTES = "clinical_notes"  # History, complaints, diagnosis
    PRESCRIPTION_RX = "prescription_rx"  # Medication orders
    LAB_VITALS = "lab_vitals"  # Lab tests, ESR, BP, vitals
    FOOTER_DISCLAIMER = "footer_disclaimer"  # Signature, stamps, MLC disclaimers
    OTHER = "other"


class BoundingBox(BaseModel):
    """Normalized or absolute coordinates [x_min, y_min, x_max, y_max] or polygon."""

    x_min: float
    y_min: float
    x_max: float
    y_max: float


class ExtractedRegion(BaseModel):
    """A segmented region within the prescription image."""

    region_id: str = Field(..., description="Unique identifier for the region")
    region_type: TextRegionType = Field(default=TextRegionType.OTHER)
    bounding_box: BoundingBox | None = None
    raw_text: str = Field(..., description="Transcribed text from this region")
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="OCR/VLM confidence score (0-1)"
    )
    is_handwritten: bool = Field(
        default=True, description="True if handwritten, False if printed"
    )
    has_strikethrough: bool = Field(
        default=False,
        description="True if text shows visible strike-through/corrections",
    )


class RawPrescriptionText(BaseModel):
    """
    Contract payload output by services/vision.
    Persisted to allow re-running entity extraction without re-running OCR.
    """

    document_id: str = Field(..., description="Unique ID of the processed document")
    image_uri: str | None = Field(
        default=None, description="URI or path of the deidentified image"
    )
    raw_text: str = Field(
        ..., description="Full concatenated transcribed text of the prescription"
    )
    layout_type: DocumentLayoutType = Field(default=DocumentLayoutType.UNKNOWN)
    detected_language: DetectedLanguage = Field(default=DetectedLanguage.ENGLISH)
    average_confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    regions: list[ExtractedRegion] = Field(
        default_factory=list, description="Segmented text blocks/regions"
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "document_id": "doc-12345",
                "image_uri": "data/deidentified/sample_pad_01.jpg",
                "raw_text": "Rx:\nTab Paracetamol 500mg 1-0-1 x 5 days after food\nInj Ceftriaxone 1g IV SOS",
                "layout_type": "free_form_pad",
                "detected_language": "en",
                "average_confidence": 0.94,
                "regions": [
                    {
                        "region_id": "reg-01",
                        "region_type": "prescription_rx",
                        "raw_text": "Tab Paracetamol 500mg 1-0-1 x 5 days after food",
                        "confidence": 0.95,
                        "is_handwritten": True,
                        "has_strikethrough": False,
                    }
                ],
            }
        }
    )
