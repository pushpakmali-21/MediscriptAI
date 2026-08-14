"""
MediScript-AI Entity Extraction & NER Microservice.
Responsible for converting RawPrescriptionText into validated, normalized StructuredPrescription.
"""

from fastapi import FastAPI, status
from schemas.raw_text import RawPrescriptionText
from schemas.prescription import StructuredPrescription

app = FastAPI(
    title="MediScript-AI Entity Extraction Service",
    version="0.1.0",
    description="Medical NER, shorthand normalization, and clinical entity extraction microservice.",
)


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"service": "extraction", "status": "healthy", "version": "0.1.0"}


@app.post("/extract-entities", response_model=StructuredPrescription, status_code=status.HTTP_200_OK)
async def extract_entities(raw_input: RawPrescriptionText):
    """Stub endpoint: Extract structured clinical entities from raw transcribed text."""
    return StructuredPrescription(
        prescription_id=f"rx-stub-{raw_input.document_id}",
        document_id=raw_input.document_id,
        medications=[],
        diagnoses=[],
        allergies=[],
        labs_and_vitals=[],
        safety_warnings=[],
        overall_confidence=raw_input.average_confidence,
        requires_human_review=False,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
