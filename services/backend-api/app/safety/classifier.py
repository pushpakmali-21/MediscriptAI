import os
from typing import Any

import httpx
import yaml
from pydantic import BaseModel


class UserProfile(BaseModel):
    allergies: list[str] = []
    chronic_conditions: list[str] = []
    current_medications: list[str] = []
    age_band: str | None = None
    pregnancy_flag: bool = False

RAG_SERVICE_URL = os.environ.get("RAG_SERVICE_URL", "http://rag:8003")

def load_interactions_db() -> dict[str, Any]:
    file_path = os.path.join(os.path.dirname(__file__), "interactions.yaml")
    try:
        with open(file_path, "r") as f:
            return yaml.safe_load(f)
    except (OSError, yaml.YAMLError):
        return {"interactions": [], "allergies_cross_reactivity": []}

INTERACTIONS_DB = load_interactions_db()

async def get_rag_context(client: httpx.AsyncClient, generic_name: str, section: str | None = None) -> list[dict[str, Any]]:
    filters = {"generic_name": generic_name.lower()}
    if section:
        filters["section"] = section
        
    try:
        resp = await client.post(
            f"{RAG_SERVICE_URL}/retrieve",
            json={"query": generic_name, "filters": filters, "top_k": 3},
            timeout=5.0
        )
        if resp.status_code == 200:
            return resp.json().get("results", [])
    except httpx.RequestError as e:
        print(f"RAG retrieval error: {e}")
    return []

def explain_tier(dosage: dict[str, Any]) -> str:
    """Tier 1: Explain - Decode shorthand rule-based."""
    if not dosage or not any([dosage.get("morning"), dosage.get("afternoon"), dosage.get("evening"), dosage.get("night")]):
        return ""
        
    parts = []
    if dosage.get("morning"): parts.append(f"{dosage['morning']} in the morning")
    if dosage.get("afternoon"): parts.append(f"{dosage['afternoon']} in the afternoon")
    if dosage.get("evening"): parts.append(f"{dosage['evening']} in the evening")
    if dosage.get("night"): parts.append(f"{dosage['night']} at night")
    
    explanation = "Take " + ", ".join(parts) + "."
    if dosage.get("with_food") == "before":
        explanation += " Take before food."
    elif dosage.get("with_food") == "after":
        explanation += " Take after food."
        
    if dosage.get("as_needed"):
        explanation += " Take only as needed."
        
    if dosage.get("duration_days"):
        explanation += f" Continue for {dosage['duration_days']} days."
        
    return explanation

async def inform_tier(client: httpx.AsyncClient, generic_name: str) -> dict[str, Any]:
    """Tier 2: Inform - Evidence-based info from RAG."""
    if not generic_name:
        return {"text": "", "citations": []}
        
    results = await get_rag_context(client, generic_name)
    if not results:
        return {"text": "No trusted source information found.", "citations": []}
        
    # Strictly use only retrieved text
    combined_text = " ".join([r["text"][:300] + "..." for r in results])
    citations = [r["metadata"].get("source_url", "OpenFDA") for r in results]
    
    return {
        "text": f"Information: {combined_text}",
        "citations": list(set(citations))
    }

async def guide_tier(client: httpx.AsyncClient, generic_name: str, profile: UserProfile, prescribed_meds: list[str]) -> list[dict[str, Any]]:
    """Tier 3: Guide - Risk alerts."""
    alerts = []
    if not generic_name:
        return alerts
        
    gn_lower = generic_name.lower()
    
    # 1. Allergy Match
    for allergy in profile.allergies:
        al_lower = allergy.lower()
        if gn_lower == al_lower or al_lower in gn_lower:
            alerts.append({
                "severity": "high",
                "type": "allergy",
                "medications": [generic_name],
                "message": f"Allergy match detected for {generic_name}. Discuss with your doctor or pharmacist.",
                "citation": "User Profile"
            })
            continue
            
        # Check cross-reactivity
        for group in INTERACTIONS_DB.get("allergies_cross_reactivity", []):
            drugs = [d.lower() for d in group.get("drugs", [])]
            cross = [c.lower() for c in group.get("cross_reacts_with", [])]
            if gn_lower in drugs and (al_lower in cross or al_lower == group.get("class", "").lower()):
                alerts.append({
                    "severity": "high",
                    "type": "allergy",
                    "medications": [generic_name],
                    "message": f"Potential cross-reactivity allergy detected between {allergy} and {generic_name}. Discuss with your doctor or pharmacist.",
                    "citation": "Interactions DB"
                })

    # 2. Drug-Drug Interactions
    all_meds = [m.lower() for m in prescribed_meds] + [m.lower() for m in profile.current_medications]
    # Local curated checks
    for interaction in INTERACTIONS_DB.get("interactions", []):
        d1 = interaction["drug1"].lower()
        d2 = interaction["drug2"].lower()
        if (gn_lower == d1 and d2 in all_meds) or (gn_lower == d2 and d1 in all_meds):
            alerts.append({
                "severity": interaction.get("severity", "info"),
                "type": "drug_drug",
                "medications": [interaction["drug1"], interaction["drug2"]],
                "message": f"{interaction['message']} Discuss with your doctor or pharmacist.",
                "citation": "Curated Interactions DB"
            })
            
    # RAG based drug interactions
    di_chunks = await get_rag_context(client, generic_name, section="drug_interactions")
    if di_chunks:
        # Check if any other med is mentioned in the drug_interactions chunk
        for chunk in di_chunks:
            text_lower = chunk["text"].lower()
            for other_med in all_meds:
                if other_med != gn_lower and len(other_med) > 4 and other_med in text_lower:
                    alerts.append({
                        "severity": "caution",
                        "type": "drug_drug",
                        "medications": [generic_name, other_med],
                        "message": f"Potential interaction found in our sources between {generic_name} and {other_med}. Discuss with your doctor or pharmacist.",
                        "citation": chunk["metadata"].get("source_url", "OpenFDA")
                    })

    # 3. Drug-Condition
    dc_chunks = await get_rag_context(client, generic_name, section="contraindications")
    if dc_chunks:
        for chunk in dc_chunks:
            text_lower = chunk["text"].lower()
            for cond in profile.chronic_conditions:
                if len(cond) > 3 and cond.lower() in text_lower:
                    alerts.append({
                        "severity": "high",
                        "type": "drug_condition",
                        "medications": [generic_name],
                        "message": f"Potential contraindication found for condition '{cond}'. Discuss with your doctor or pharmacist.",
                        "citation": chunk["metadata"].get("source_url", "OpenFDA")
                    })
                    
    return alerts

async def process_safety(client: httpx.AsyncClient, extracted_meds: list[dict[str, Any]], profile: UserProfile | None = None) -> list[dict[str, Any]]:
    if not profile:
        profile = UserProfile()
        
    prescribed_med_names = [m.get("generic_name", m.get("medicine_name", "")) for m in extracted_meds]
    prescribed_med_names = [name for name in prescribed_med_names if name]
    
    enriched_meds = []
    for med in extracted_meds:
        enriched_med = med.copy()
        gn = med.get("generic_name") or med.get("medicine_name")
        
        # 1. Explain
        explain_text = explain_tier(med.get("dosage_parsed", {}))
        
        # 2. Inform
        inform_data = await inform_tier(client, gn)
        
        # 3. Guide
        alerts = await guide_tier(client, gn, profile, prescribed_med_names)
        
        # Determine overall safety tier assigned to this med
        if alerts:
            tier = "Guide"
        elif inform_data.get("text"):
            tier = "Inform"
        elif explain_text:
            tier = "Explain"
        else:
            tier = "None"
            
        enriched_med["safety"] = {
            "tier": tier,
            "explain": explain_text,
            "inform": inform_data,
            "alerts": alerts
        }
        # Backward compatibility for RAG context in meds list
        enriched_med["rag_context"] = inform_data.get("text", "")
        enriched_meds.append(enriched_med)
        
    return enriched_meds
