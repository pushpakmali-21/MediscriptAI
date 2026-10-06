import os
import requests
import json
import argparse
from datetime import datetime
from typing import List, Dict, Any

# Adjust this URL depending on where RAG service is running
RAG_API_URL = os.environ.get("RAG_API_URL", "http://localhost:8003")

def fetch_openfda_labels(limit: int = 10) -> List[Dict[str, Any]]:
    # OpenFDA drug label endpoint
    url = f"https://api.fda.gov/drug/label.json?search=_exists_:indications_and_usage&limit={limit}"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    return data.get("results", [])

def chunk_label(label: Dict[str, Any]) -> List[Dict[str, Any]]:
    chunks = []
    
    openfda = label.get("openfda", {})
    generic_name = openfda.get("generic_name", ["Unknown"])[0]
    brand_names = openfda.get("brand_name", [])
    
    sections = [
        "indications_and_usage", 
        "dosage_and_administration",
        "warnings", 
        "contraindications", 
        "drug_interactions", 
        "adverse_reactions"
    ]
    
    retrieval_date = datetime.now().isoformat()
    
    for section in sections:
        if section in label:
            text = " ".join(label[section])
            if text:
                chunks.append({
                    "text": f"{generic_name} ({section.replace('_', ' ').title()}): {text}",
                    "metadata": {
                        "source": "openfda",
                        "generic_name": generic_name.lower(),
                        "brand_names": [b.lower() for b in brand_names],
                        "section": section,
                        "source_url": "https://open.fda.gov",
                        "retrieval_date": retrieval_date
                    }
                })
    return chunks

def ingest_corpus(limit: int = 10):
    print(f"Fetching {limit} labels from OpenFDA...")
    labels = fetch_openfda_labels(limit)
    
    all_chunks = []
    for label in labels:
        chunks = chunk_label(label)
        all_chunks.extend(chunks)
        
    print(f"Created {len(all_chunks)} chunks. Sending to RAG service...")
    
    response = requests.post(f"{RAG_API_URL}/ingest", json={"chunks": all_chunks})
    response.raise_for_status()
    
    print(f"Ingestion successful: {response.json()}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest drug labels into RAG.")
    parser.add_argument("--limit", type=int, default=10, help="Number of labels to fetch from openFDA.")
    args = parser.parse_args()
    
    ingest_corpus(args.limit)
