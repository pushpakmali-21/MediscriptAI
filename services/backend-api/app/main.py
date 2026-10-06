"""
MediScript-AI Central Backend & Orchestration API.
Coordinates user requests across Vision, Extraction, and RAG microservices.
"""

import json
import os
import re
import asyncio
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx

load_dotenv(Path(__file__).resolve().parents[3] / ".env")

try:
    import google.generativeai as genai
except ImportError:
    genai = None

app = FastAPI(
    title="MediScript-AI Orchestration API",
    version="0.1.0",
    description="Central backend gateway orchestrating document ingestion, clinical extraction, and patient assistance.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VISION_SERVICE_URL = os.environ.get("VISION_SERVICE_URL", "http://vision:8001")
EXTRACTION_SERVICE_URL = os.environ.get("EXTRACTION_SERVICE_URL", "http://extraction:8002")
RAG_SERVICE_URL = os.environ.get("RAG_SERVICE_URL", "http://rag:8003")


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"service": "backend", "status": "healthy", "version": "0.1.0"}


def _parse_gemini_json(response_text: str) -> dict:
    fenced_json = re.search(
        r"```(?:\s*json)?\s*(.*?)\s*```",
        response_text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    json_text = fenced_json.group(1) if fenced_json else response_text

    if not fenced_json:
        json_match = re.search(r"\{.*\}", response_text, flags=re.DOTALL)
        if json_match:
            json_text = json_match.group(0)

    data = json.loads(json_text.strip())
    if not isinstance(data, dict):
        raise ValueError("Gemini response must be a JSON object")
    return data

async def call_with_retry(client: httpx.AsyncClient, method: str, url: str, retries: int = 2, **kwargs) -> httpx.Response:
    for attempt in range(retries + 1):
        try:
            resp = await client.request(method, url, **kwargs)
            resp.raise_for_status()
            return resp
        except httpx.HTTPError as e:
            if attempt == retries:
                raise
            await asyncio.sleep(2 ** attempt)  # exponential backoff
    raise RuntimeError("Unreachable")


@app.post("/api/v1/extract", status_code=status.HTTP_200_OK)
async def extract_prescription(file: UploadFile = File(...), profile: str = Form(None)):
    use_legacy = os.environ.get("USE_LEGACY_GEMINI", "true").lower() == "true"
    image_bytes = await file.read()
    
    if use_legacy:
        return await _extract_legacy_gemini(file.content_type, image_bytes)

    # NEW PIPELINE
    pipeline_status = {
        "vision": "pending",
        "extraction": "pending",
        "rag": "pending",
        "safety": "pending"
    }
    
    timeout = httpx.Timeout(20.0, connect=5.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        # 1. Vision OCR
        try:
            files = {"file": (file.filename, image_bytes, file.content_type)}
            vision_resp = await call_with_retry(client, "POST", f"{VISION_SERVICE_URL}/ocr", files=files, retries=1)
            vision_data = vision_resp.json()
            pipeline_status["vision"] = "ok"
        except httpx.HTTPError as e:
            pipeline_status["vision"] = "failed"
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Vision service failed: {str(e)}"
            )
            
        # 2. Extraction
        try:
            extract_resp = await call_with_retry(client, "POST", f"{EXTRACTION_SERVICE_URL}/extract", json=vision_data, retries=1)
            extraction_data = extract_resp.json()
            pipeline_status["extraction"] = "ok"
        except httpx.HTTPError as e:
            pipeline_status["extraction"] = "failed"
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Extraction service failed: {str(e)}"
            )

        # 3. RAG and 4. Safety (to be implemented in phase 3)
        # For now, graceful degradation
        pipeline_status["rag"] = "degraded" 
        pipeline_status["safety"] = "degraded"
        
        # Add required response fields
        medications = extraction_data.get("medications", [])
        
        # Transform extracted med into expected format (for contract compatibility + new fields)
        formatted_meds = []
        for m in medications:
            med_formatted = {
                "medicine_name": m.get("name_normalized") or m.get("name_raw"),
                "generic_name": m.get("generic_name"),
                "dosage": m.get("dosage", {}).get("raw", ""),
                "dosage_parsed": m.get("dosage"),
                "frequency": m.get("dosage", {}).get("raw", ""), 
                "duration": str(m.get("dosage", {}).get("duration_days", "")),
                "instructions": "",
                "confidence": m.get("confidence", 0.0),
                "needs_review": m.get("needs_review", False),
                "rag_context": "" # To be filled in Phase 3
            }
            formatted_meds.append(med_formatted)

        return {
            "medications": formatted_meds,
            "diagnoses": extraction_data.get("diagnoses", []),
            "general_notes": extraction_data.get("general_notes", ""),
            "pipeline_status": pipeline_status,
            "status": "success",
            "source": "pipeline"
        }

async def _extract_legacy_gemini(content_type: str, image_bytes: bytes):
    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key is not configured.",
        )
    if genai is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini SDK is unavailable.",
        )

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(os.environ.get("GEMINI_MODEL", "gemini-3.6-flash"))

        prompt = (
            "You are a medical data extraction AI. Read this prescription or clinical notes image. "
            "Extract the following information into a JSON object:\n"
            "1. 'medications': an array of objects with keys `medicine_name`, `dosage`, `frequency`, `duration`, `instructions`, and `confidence`.\n"
            "   - `confidence`: a float between 0.0 and 1.0 indicating your confidence in the extraction of this medication.\n"
            "2. 'diagnoses': an array of strings representing any conditions, symptoms, or diagnoses mentioned.\n"
            "3. 'general_notes': a string containing any other clinical findings, physical exam details, or general notes.\n"
            'Return ONLY valid JSON in the format: { "medications": [], "diagnoses": [], "general_notes": "" }. '
            "Do not include markdown code blocks around the JSON."
        )

        image_part = {
            "mime_type": content_type or "image/jpeg",
            "data": image_bytes,
        }

        response = model.generate_content([image_part, prompt])
        response_text = response.text.strip()
        data = _parse_gemini_json(response_text)

        # Sanitize data
        medications = data.get("medications", [])
        if not isinstance(medications, list):
            medications = []
            
        sanitized_meds = []
        for m in medications:
            if isinstance(m, dict):
                sanitized_m = {}
                for k in ["medicine_name", "dosage", "frequency", "duration", "instructions"]:
                    val = m.get(k)
                    if val is not None:
                        sanitized_m[k] = str(val)
                conf = m.get("confidence")
                if conf is not None:
                    try:
                        sanitized_m["confidence"] = float(conf)
                    except ValueError:
                        pass
                
                # Mock RAG Context
                from app.main import MOCK_RAG_DB  # fallback to import if needed
                
                sanitized_meds.append(sanitized_m)
        data["medications"] = sanitized_meds

        diagnoses = data.get("diagnoses")
        data["diagnoses"] = [str(d) for d in diagnoses if d is not None] if isinstance(diagnoses, list) else []

        general_notes = data.get("general_notes")
        data["general_notes"] = str(general_notes) if general_notes is not None else ""

        data["status"] = "success"
        data["source"] = "gemini"
        data["pipeline_status"] = {"vision": "legacy", "extraction": "legacy", "rag": "legacy", "safety": "legacy"}
        return data

    except Exception as e:
        print(f"Gemini API error: {e}")
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={"error": "Gemini API request failed.", "status": "failed"},
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
