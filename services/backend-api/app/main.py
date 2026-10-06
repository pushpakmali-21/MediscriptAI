"""
MediScript-AI Central Backend & Orchestration API.
Coordinates user requests across Vision, Extraction, and RAG microservices.
"""

import json
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

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


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"service": "backend", "status": "healthy", "version": "0.1.0"}


@app.get("/api/v1/status", status_code=status.HTTP_200_OK)
async def api_status():
    return {
        "status": "ready",
        "services": {
            "vision": "services/vision",
            "extraction": "services/extraction",
            "rag": "services/rag",
        },
    }


# Mock RAG Database
MOCK_RAG_DB = {
    "paracetamol": "💡 Paracetamol is a pain reliever and a fever reducer. **Warning:** Do not exceed 4000mg per day. Take after food to avoid stomach upset.",
    "amoxicillin": "💡 Amoxicillin is a penicillin antibiotic. **Warning:** Finish the entire course even if you feel better. Stop taking and seek medical help if you develop a severe rash.",
    "ceftriaxone": "💡 Ceftriaxone is a cephalosporin antibiotic given by injection. Used to treat severe bacterial infections.",
    "pantoprazole": "💡 Pantoprazole is a proton pump inhibitor (PPI) that decreases the amount of acid produced in the stomach. Take 30 minutes before a meal.",
}


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


@app.post("/api/v1/extract", status_code=status.HTTP_200_OK)
async def extract_prescription(file: UploadFile = File(...)):  # noqa: B008
    # Read image
    image_bytes = await file.read()

    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key is not configured. Set GEMINI_API_KEY in the project .env file and restart the backend.",
        )
    if genai is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini SDK is unavailable. Install the backend dependencies and restart the backend.",
        )

    # Process with Gemini
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")
        )

        prompt = (
            "You are a medical data extraction AI. Read this prescription or clinical notes image. "
            "Extract the following information into a JSON object:\n"
            "1. 'medications': an array of objects with keys `medicine_name`, `dosage`, `frequency`, `duration`, and `instructions`.\n"
            "2. 'diagnoses': an array of strings representing any conditions, symptoms, or diagnoses mentioned.\n"
            "3. 'general_notes': a string containing any other clinical findings, physical exam details, or general notes.\n"
            'Return ONLY valid JSON in the format: { "medications": [], "diagnoses": [], "general_notes": "" }. '
            "Do not include markdown code blocks around the JSON."
        )

        image_part = {
            "mime_type": file.content_type or "image/jpeg",
            "data": image_bytes,
        }

        response = model.generate_content([image_part, prompt])
        response_text = response.text.strip()

        data = _parse_gemini_json(response_text)

        # Sanitize data to match frontend expectations
        medications = data.get("medications")
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
                sanitized_meds.append(sanitized_m)
        data["medications"] = sanitized_meds

        diagnoses = data.get("diagnoses")
        if not isinstance(diagnoses, list):
            data["diagnoses"] = []
        else:
            data["diagnoses"] = [str(d) for d in diagnoses if d is not None]

        general_notes = data.get("general_notes")
        if general_notes is None:
            data["general_notes"] = ""
        else:
            data["general_notes"] = str(general_notes)

        # Add Mock RAG Context
        for med in data["medications"]:
            med_name_lower = med.get("medicine_name", "").lower()
            for key, info in MOCK_RAG_DB.items():
                if key in med_name_lower:
                    med["rag_context"] = info
                    break

        data["status"] = "success"
        data["source"] = "gemini"
        return data

    except (json.JSONDecodeError, ValueError, TypeError, AttributeError) as e:
        print(f"Error processing Gemini response: {e}")
        return JSONResponse(
            status_code=500, content={"error": str(e), "status": "failed"}
        )
    except Exception as e:  # noqa: BLE001
        print(f"Gemini API error: {e}")
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={
                "error": "Gemini API request failed. Check the API key and model configuration, then review the backend logs.",
                "status": "failed",
            },
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
