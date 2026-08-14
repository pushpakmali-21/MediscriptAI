"""
Unit tests for MediScript-AI shared Pydantic data schemas.
Validates serialization, deserialization, and schema integrity against sample prescription payloads.
"""

import pytest
from datetime import datetime
from pydantic import ValidationError

from schemas.raw_text import (
    RawPrescriptionText,
    DocumentLayoutType,
    DetectedLanguage,
    ExtractedRegion,
    TextRegionType,
    BoundingBox,
)
from schemas.prescription import (
    StructuredPrescription,
    MedicationItem,
    MedicationForm,
    MedicationRoute,
    NormalizedDosageTiming,
    DiagnosisItem,
    LabVitalItem,
    SafetyWarning,
    SafetySeverity,
)
from schemas.rag import (
    RAGQueryRequest,
    RAGQueryResponse,
    RetrievedContextChunk,
    SafetyTier,
)


def test_raw_prescription_text_valid_pad():
    """Test RawPrescriptionText schema on a free-form doctor prescription pad payload."""
    payload = {
        "document_id": "doc-pad-001",
        "image_uri": "data/deidentified/sample_pad_01.jpg",
        "raw_text": "Rx:\nTab Pantocid 40mg 1-0-0 before breakfast\nTab Paracetamol 650mg SOS",
        "layout_type": DocumentLayoutType.FREE_FORM_PAD,
        "detected_language": DetectedLanguage.ENGLISH,
        "average_confidence": 0.92,
        "regions": [
            {
                "region_id": "reg-01",
                "region_type": TextRegionType.HEADER_PRINTED,
                "raw_text": "City Clinic - Dr. Sharma MBBS, MD",
                "confidence": 0.99,
                "is_handwritten": False,
                "has_strikethrough": False,
                "bounding_box": {"x_min": 0.05, "y_min": 0.02, "x_max": 0.95, "y_max": 0.15},
            },
            {
                "region_id": "reg-02",
                "region_type": TextRegionType.PRESCRIPTION_RX,
                "raw_text": "Tab Pantocid 40mg 1-0-0 before breakfast",
                "confidence": 0.90,
                "is_handwritten": True,
                "has_strikethrough": False,
            },
        ],
    }

    doc = RawPrescriptionText(**payload)
    assert doc.document_id == "doc-pad-001"
    assert doc.layout_type == DocumentLayoutType.FREE_FORM_PAD
    assert len(doc.regions) == 2
    assert doc.regions[0].is_handwritten is False
    assert doc.regions[1].region_type == TextRegionType.PRESCRIPTION_RX


def test_raw_prescription_text_confidence_bounds():
    """Ensure average_confidence adheres to [0.0, 1.0] bounds."""
    with pytest.raises(ValidationError):
        RawPrescriptionText(
            document_id="doc-err",
            raw_text="Test text",
            average_confidence=1.5,  # Exceeds max 1.0
        )


def test_structured_prescription_payload():
    """Test StructuredPrescription schema with medications, timings, and safety warnings."""
    med1 = MedicationItem(
        medicine_id="med-01",
        name="Augmentin",
        generic_name="Amoxicillin and Clavulanate Potassium",
        strength="625mg",
        form=MedicationForm.TABLET,
        route=MedicationRoute.ORAL,
        raw_frequency="1-0-1",
        timing=NormalizedDosageTiming(
            raw_shorthand="1-0-1",
            morning=1,
            afternoon=0,
            night=1,
            is_as_needed_sos=False,
            with_meals="after_food",
            human_readable="1 tablet in the morning and 1 tablet at night after food",
        ),
        duration="5 days",
        confidence=0.88,
        is_struck_through=False,
        manually_verified=False,
    )

    warning = SafetyWarning(
        warning_id="warn-01",
        severity=SafetySeverity.MODERATE,
        category="dose_anomaly",
        message="Patient has documented penicillin allergy in history.",
        field_reference="medications[0].generic_name",
        requires_manual_verification=True,
    )

    rx = StructuredPrescription(
        prescription_id="rx-101",
        document_id="doc-pad-001",
        prescription_date="2026-08-14",
        doctor_info={"name": "Dr. Sharma", "clinic": "City Health"},
        medications=[med1],
        diagnoses=[DiagnosisItem(condition="Acute Sinusitis", icd10_code="J01.90")],
        allergies=["Penicillin"],
        labs_and_vitals=[LabVitalItem(test_name="ESR", value="22", unit="mm/hr")],
        safety_warnings=[warning],
        overall_confidence=0.88,
        requires_human_review=True,
    )

    assert rx.prescription_id == "rx-101"
    assert len(rx.medications) == 1
    assert rx.medications[0].timing.morning == 1
    assert rx.medications[0].timing.night == 1
    assert rx.requires_human_review is True
    assert rx.safety_warnings[0].severity == SafetySeverity.MODERATE


def test_rag_three_tier_safety_routing():
    """Verify RAG request and response model structure and safety tiering."""
    chunk = RetrievedContextChunk(
        chunk_id="chunk-01",
        source_title="FDA Medication Guide: Amoxicillin-Clavulanate",
        source_url="https://fda.gov/meds/augmentin",
        content="Take this medication at the start of a meal to reduce stomach upset.",
        relevance_score=0.95,
    )

    resp = RAGQueryResponse(
        query_id="q-101",
        question="Why do I need to take Augmentin after meals?",
        safety_tier=SafetyTier.EXPLANATION,
        answer="Augmentin is taken with or after meals to minimize gastrointestinal discomfort and stomach upset.",
        retrieved_sources=[chunk],
        confidence=0.96,
    )

    assert resp.safety_tier == SafetyTier.EXPLANATION
    assert len(resp.retrieved_sources) == 1
    assert "informational purposes only" in resp.medical_disclaimer.lower()


def test_rag_safety_guidance_redirect():
    """Verify tier routing for unsafe questions requiring physician consultation."""
    resp = RAGQueryResponse(
        query_id="q-102",
        question="Can I double my dose if I missed one?",
        safety_tier=SafetyTier.SAFETY_GUIDANCE_REDIRECT,
        answer="Do not double your dose without consulting your physician. Please contact your clinic.",
        retrieved_sources=[],
        confidence=1.0,
    )
    assert resp.safety_tier == SafetyTier.SAFETY_GUIDANCE_REDIRECT
