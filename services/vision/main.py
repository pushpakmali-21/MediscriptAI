"""
MediScript-AI Vision & OCR Microservice.
Responsible for Image Preprocessing and Text Transcription into the RawPrescriptionText schema.
"""

from fastapi import FastAPI, UploadFile, File, status
from schemas.raw_text import RawPrescriptionText

app = FastAPI(
    title="MediScript-AI Vision Service",
    version="0.1.0",
    description="Vision/OCR processing and document layout analysis microservice.",
)


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"service": "vision", "status": "healthy", "version": "0.1.0"}


@app.post("/extract-text", response_model=RawPrescriptionText, status_code=status.HTTP_200_OK)
async def extract_text(file: UploadFile = File(...)):
    """Stub endpoint: Extract raw text and layout regions from prescription image."""
    return RawPrescriptionText(
        document_id=f"doc-stub-{file.filename}",
        raw_text="[STUB] Transcribed raw prescription text placeholder.",
        layout_type="unknown",
        detected_language="en",
        average_confidence=1.0,
        regions=[],
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
