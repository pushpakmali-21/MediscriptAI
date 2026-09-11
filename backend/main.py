"""
MediScript-AI Central Backend & Orchestration API.
Coordinates user requests across Vision, Extraction, and RAG microservices.
"""
import base64
import json
import os
import uuid
from typing import Any, Dict, List

from fastapi import FastAPI, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

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
    "pantoprazole": "💡 Pantoprazole is a proton pump inhibitor (PPI) that decreases the amount of acid produced in the stomach. Take 30 minutes before a meal."
}


@app.post("/api/v1/extract", status_code=status.HTTP_200_OK)
async def extract_prescription(file: UploadFile = File(...)):
    # Read image
    image_bytes = await file.read()
    
    api_key = os.environ.get("GEMINI_API_KEY")
    
    # Wizard of Oz / Fallback if no API key or genai not installed
    if not api_key or not genai:
        print("WARNING: Using Mock Fallback response (No GEMINI_API_KEY or google-generativeai missing).")
        return {
            "status": "success",
            "source": "mock",
            "medications": [
                {
                    "medicine_name": "Tab Paracetamol",
                    "dosage": "500mg",
                    "frequency": "1-0-1",
                    "duration": "5 days",
                    "instructions": "after food",
                    "rag_context": MOCK_RAG_DB["paracetamol"]
                },
                {
                    "medicine_name": "Inj Ceftriaxone",
                    "dosage": "1g",
                    "frequency": "SOS",
                    "duration": "1 day",
                    "instructions": "IV",
                    "rag_context": MOCK_RAG_DB["ceftriaxone"]
                }
            ]
        }
        
    # Process with Gemini
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(os.environ.get("GEMINI_MODEL", "gemini-3.6-flash"))
        
        prompt = (
            "You are a medical data extraction AI. Read this prescription or clinical notes image. "
            "Extract the following information into a JSON object:\n"
            "1. 'medications': an array of objects with keys `medicine_name`, `dosage`, `frequency`, `duration`, and `instructions`.\n"
            "2. 'diagnoses': an array of strings representing any conditions, symptoms, or diagnoses mentioned.\n"
            "3. 'general_notes': a string containing any other clinical findings, physical exam details, or general notes.\n"
            "Return ONLY valid JSON in the format: { \"medications\": [], \"diagnoses\": [], \"general_notes\": \"\" }. "
            "Do not include markdown code blocks around the JSON."
        )
        
        image_part = {
            "mime_type": file.content_type or "image/jpeg",
            "data": image_bytes
        }
        
        response = model.generate_content([image_part, prompt])
        response_text = response.text.strip()
        
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        data = json.loads(response_text.strip())
        
        # Add Mock RAG Context
        for med in data.get("medications", []):
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
        return JSONResponse(status_code=500, content={"error": str(e), "status": "failed"})
    except google.generativeai.APIError as e:
        print(f"Gemini API error: {e}")
        return JSONResponse(status_code=500, content={"error": "API error", "status": "failed"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
