import os
from typing import Any, cast

import pandas as pd
import spacy
from spacy.cli.download import download as spacy_download
from fastapi import FastAPI
from pydantic import BaseModel
from rapidfuzz import fuzz, process

from app.dosage_normalizer import parse_dosage

app = FastAPI(title="Entity Extraction Service")

# Load brand mapping
brand_map: dict[str, str] = {}
brand_names: list[str] = []
try:
    df = pd.read_csv(os.path.join(os.path.dirname(__file__), 'brand_mapping.csv'))
    for _, row in df.iterrows():
        b, g = str(row['brand_name']).strip(), str(row['generic_name']).strip()
        brand_map[b.lower()] = g
        brand_names.append(b.lower())
except (OSError, pd.errors.ParserError) as e:
    print(f"Warning: Could not load brand mapping: {e}")

# Load spaCy model
try:
    nlp = spacy.load(os.environ.get("SPACY_MODEL", "en_core_web_sm"))
except OSError:
    # Fallback to downloading if not present (in a real scenario, should be baked into Docker image)
    spacy_download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# Add EntityRuler for basic entities (forms, routes, etc.)
ruler = nlp.add_pipe("entity_ruler", before="ner")
patterns = [
    {"label": "FORM", "pattern": [{"LOWER": {"IN": ["tab", "tablet", "cap", "capsule", "syr", "syrup", "inj", "injection", "drop", "drops"]}}]},
    {"label": "ROUTE", "pattern": [{"LOWER": {"IN": ["oral", "iv", "im", "po", "topical"]}}]},
]
# We could also add known brand names to patterns
for b in brand_names:
    patterns.append({"label": "DRUG", "pattern": [{"LOWER": b}]})

cast(Any, ruler).add_patterns(patterns)

class OCRLine(BaseModel):
    text: str
    bbox: list[list[float]]
    confidence: float

class OCRExtractRequest(BaseModel):
    lines: list[OCRLine]
    overall_confidence: float

class ExtractedMedication(BaseModel):
    name_raw: str
    name_normalized: str
    generic_name: str | None
    strength: str | None
    form: str | None
    route: str | None
    dosage: dict[str, Any]
    confidence: float
    source_line_bbox: list[list[float]] | None
    needs_review: bool

class ExtractionResponse(BaseModel):
    medications: list[ExtractedMedication]
    diagnoses: list[str]
    general_notes: str

CONFIDENCE_THRESHOLD = float(os.environ.get("CONFIDENCE_THRESHOLD", "0.6"))

@app.get("/health")
def health_check():
    return {"status": "ok"}

def map_brand_to_generic(raw_name: str) -> tuple[str, str | None]:
    # Fuzzy match raw_name to brand_names
    best_match = process.extractOne(raw_name.lower(), brand_names, scorer=fuzz.ratio)
    if best_match and best_match[1] >= 80: # 80% similarity threshold
        matched_brand = best_match[0]
        return matched_brand.title(), brand_map.get(matched_brand)
    return raw_name, None

@app.post("/extract", response_model=ExtractionResponse)
def extract_entities(req: OCRExtractRequest):
    medications = []
    diagnoses = []
    general_notes = []
    
    # Process lines
    for line in req.lines:
        doc = nlp(line.text)
        
        # Super simple heuristic extraction for demo purposes based on rules
        # Real-world would use a specialized medical model like scispaCy
        
        # Check if it looks like a medication line
        is_medication = False
        raw_name = ""
        form = None
        route = None
        strength = None
        
        for ent in doc.ents:
            if ent.label_ == "DRUG":
                raw_name = ent.text
                is_medication = True
            elif ent.label_ == "FORM":
                form = ent.text
                is_medication = True
            elif ent.label_ == "ROUTE":
                route = ent.text
                is_medication = True
                
        # Heuristic for strength (e.g. 500mg)
        for token in doc:
            if "mg" in token.text.lower() or "ml" in token.text.lower():
                strength = token.text
                is_medication = True
                
        if not is_medication:
            # Maybe it's a diagnosis? Or just general notes.
            # Look for keywords or fallback to notes.
            if "dx:" in line.text.lower() or "diagnosis:" in line.text.lower():
                diagnoses.append(line.text)
            else:
                general_notes.append(line.text)
            continue
            
        if not raw_name:
            # If no DRUG matched, use the first Noun Chunk as a fallback
            noun_chunks = list(doc.noun_chunks)
            if noun_chunks:
                raw_name = noun_chunks[0].text
            else:
                # If still empty, use the first word that's not form/strength
                words = [t.text for t in doc if t.text != form and t.text != strength]
                if words:
                    raw_name = words[0]
                else:
                    raw_name = line.text
                
        # Attempt brand mapping
        name_normalized, generic_name = map_brand_to_generic(raw_name)
        
        # Parse dosage
        dosage_info = parse_dosage(line.text)
        
        # Calculate combined confidence
        line_conf = line.confidence
        dose_conf = dosage_info["confidence"]
        combined_conf = (line_conf + dose_conf) / 2
        
        needs_review = combined_conf < CONFIDENCE_THRESHOLD
        
        medications.append(ExtractedMedication(
            name_raw=raw_name,
            name_normalized=name_normalized,
            generic_name=generic_name,
            strength=strength,
            form=form,
            route=route,
            dosage=dosage_info,
            confidence=combined_conf,
            source_line_bbox=line.bbox,
            needs_review=needs_review
        ))

    return ExtractionResponse(
        medications=medications,
        diagnoses=diagnoses,
        general_notes=" ".join(general_notes)
    )
