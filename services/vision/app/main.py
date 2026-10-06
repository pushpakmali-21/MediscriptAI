import io
import os
import cv2
import numpy as np
import fitz  # PyMuPDF
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.engine import get_ocr_engine

app = FastAPI(title="Vision OCR Service")

ocr_engine = None

@app.on_event("startup")
def startup_event():
    global ocr_engine
    ocr_engine = get_ocr_engine()

@app.get("/health")
def health_check():
    return {"status": "ok"}

class OCRResponse(BaseModel):
    lines: List[Dict[str, Any]]
    overall_confidence: float
    status: str

def preprocess_image(image_bytes: bytes) -> bytes:
    # Decode image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Could not decode image")
    
    # Optional preprocessing (resize if too large, grayscale, contrast)
    # Resize cap: if width or height > 2000, scale down
    h, w = img.shape[:2]
    max_dim = 2000
    if h > max_dim or w > max_dim:
        scale = max_dim / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)))
        
    # Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Denoise
    denoised = cv2.fastNlMeansDenoising(gray, h=10)
    
    # Return as jpeg bytes
    _, encoded_img = cv2.imencode('.jpg', denoised)
    return encoded_img.tobytes()

@app.post("/ocr", response_model=OCRResponse)
async def perform_ocr(file: UploadFile = File(...)):
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png", "application/pdf"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid file type. Only JPEG, PNG, and PDF are supported."
        )
        
    file_bytes = await file.read()
    
    # Convert PDF to Image if necessary
    if file.content_type == "application/pdf":
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            if len(doc) == 0:
                raise ValueError("Empty PDF")
            page = doc.load_page(0)  # Just take the first page for now
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom
            file_bytes = pix.tobytes("jpg")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to process PDF: {str(e)}"
            )
            
    try:
        processed_bytes = preprocess_image(file_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to preprocess image: {str(e)}"
        )

    try:
        lines, overall_confidence = ocr_engine.extract_text(processed_bytes)
        return OCRResponse(
            lines=lines,
            overall_confidence=overall_confidence,
            status="success"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"OCR Engine failed: {str(e)}"
        )
