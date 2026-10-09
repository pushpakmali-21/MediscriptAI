"""
MediScript-AI Central Backend & Orchestration API.
Coordinates user requests across Vision, Extraction, and RAG microservices.
"""

import asyncio
import json
import os
import re
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

load_dotenv(Path(__file__).resolve().parents[3] / ".env")

try:
    from google import genai
    from google.genai import types
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
        raise TypeError("Gemini response must be a JSON object")
    return data

async def call_with_retry(client: httpx.AsyncClient, method: str, url: str, retries: int = 2, **kwargs) -> httpx.Response:
    for attempt in range(retries + 1):
        try:
            resp = await client.request(method, url, **kwargs)
            resp.raise_for_status()
            return resp
        except httpx.HTTPError:
            if attempt == retries:
                raise
            await asyncio.sleep(2 ** attempt)  # exponential backoff
    raise RuntimeError("Unreachable")


@app.post("/api/v1/extract", status_code=status.HTTP_200_OK)
async def extract_prescription(file: UploadFile, profile: str = Form(None)):
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
                detail=f"Vision service failed: {e!s}"
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
                detail=f"Extraction service failed: {e!s}"
            )

        # 3. RAG and 4. Safety
        try:
            from app.safety.classifier import UserProfile, process_safety
            
            # Parse user profile if provided
            user_profile = UserProfile()
            if profile:
                try:
                    profile_data = json.loads(profile)
                    user_profile = UserProfile(**profile_data)
                except (json.JSONDecodeError, ValueError, TypeError) as e:
                    print(f"Error parsing profile: {e}")

            medications = extraction_data.get("medications", [])
            
            # Transform extracted med into expected format
            formatted_meds = []
            for m in medications:
                med_formatted = {
                    "medicine_name": m.get("name_normalized") or m.get("name_raw"),
                    "generic_name": m.get("generic_name"),
                    "dosage": (m.get("dosage") or {}).get("raw", ""),
                    "dosage_parsed": m.get("dosage"),
                    "frequency": (m.get("dosage") or {}).get("raw", ""), 
                    "duration": str((m.get("dosage") or {}).get("duration_days", "")),
                    "instructions": "",
                    "confidence": m.get("confidence", 0.0),
                    "needs_review": m.get("needs_review", False),
                    "rag_context": ""
                }
                formatted_meds.append(med_formatted)
                
            # Process safety checks
            enriched_meds = await process_safety(client, formatted_meds, user_profile)
            
            pipeline_status["rag"] = "ok"
            pipeline_status["safety"] = "ok"
            
            return {
                "medications": enriched_meds,
                "diagnoses": extraction_data.get("diagnoses", []),
                "general_notes": extraction_data.get("general_notes", ""),
                "pipeline_status": pipeline_status,
                "status": "success",
                "source": "pipeline"
            }
        except (httpx.RequestError, ValueError, TypeError) as e:
            print(f"RAG/Safety failure: {e}")
            pipeline_status["rag"] = "degraded" 
            pipeline_status["safety"] = "degraded"
            
            # Fallback to simple formatting if safety fails
            medications = extraction_data.get("medications", [])
            formatted_meds = []
            for m in medications:
                med_formatted = {
                    "medicine_name": m.get("name_normalized") or m.get("name_raw"),
                    "generic_name": m.get("generic_name"),
                    "dosage": (m.get("dosage") or {}).get("raw", ""),
                    "dosage_parsed": m.get("dosage"),
                    "frequency": (m.get("dosage") or {}).get("raw", ""), 
                    "duration": str((m.get("dosage") or {}).get("duration_days", "")),
                    "instructions": "",
                    "confidence": m.get("confidence", 0.0),
                    "needs_review": m.get("needs_review", False),
                    "rag_context": ""
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

async def _extract_legacy_gemini(content_type: str | None, image_bytes: bytes):
    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GEMINI_API_KEY is not configured.",
        )
    if genai is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini SDK is unavailable.",
        )

    try:
        client = genai.Client(api_key=api_key)
        model_name = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")

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

        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type=content_type or "image/jpeg",
        )

        response = await client.aio.models.generate_content(
            model=model_name,
            contents=[image_part, prompt]
        )
        if not response.text:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No text returned from the model. The request might have been blocked or resulted in an empty response."
            )
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

    except (httpx.RequestError, ValueError, TypeError, RuntimeError) as e:
        print(f"Gemini API error: {e}")
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={"error": f"Gemini API request failed. Details: {e!s}", "status": "failed"},
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
