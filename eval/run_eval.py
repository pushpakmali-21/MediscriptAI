import os
import glob
import json
import requests
import argparse
from typing import List, Dict, Any

API_URL = os.environ.get("API_URL", "http://localhost:8000/api/v1/extract")

def evaluate_prescription(image_path: str, ground_truth: Dict[str, Any]) -> Dict[str, Any]:
    with open(image_path, "rb") as f:
        # Mocking profile for eval if needed
        profile = {"allergies": [], "chronic_conditions": [], "current_medications": []}
        files = {"file": (os.path.basename(image_path), f, "image/jpeg")}
        data = {"profile": json.dumps(profile)}
        
        try:
            resp = requests.post(API_URL, files=files, data=data)
            resp.raise_for_status()
            result = resp.json()
        except Exception as e:
            print(f"Error calling API for {image_path}: {e}")
            return {"error": str(e)}

    # Calculate metrics
    meds_extracted = result.get("medications", [])
    meds_truth = ground_truth.get("medications", [])
    
    extracted_names = [m.get("medicine_name", "").lower() for m in meds_extracted]
    truth_names = [m.get("medicine_name", "").lower() for m in meds_truth]
    
    # Simple name overlap accuracy
    matches = sum(1 for n in extracted_names if n in truth_names)
    name_accuracy = matches / len(truth_names) if truth_names else 0.0
    
    extracted_dosages = [m.get("dosage", "").lower() for m in meds_extracted]
    truth_dosages = [m.get("dosage", "").lower() for m in meds_truth]
    dose_matches = sum(1 for d in extracted_dosages if d in truth_dosages)
    dosage_accuracy = dose_matches / len(truth_dosages) if truth_dosages else 0.0
    
    needs_review_count = sum(1 for m in meds_extracted if m.get("needs_review"))
    needs_review_share = needs_review_count / len(meds_extracted) if meds_extracted else 0.0
    
    return {
        "name_accuracy": name_accuracy,
        "dosage_accuracy": dosage_accuracy,
        "needs_review_share": needs_review_share
    }

def main(eval_folder: str):
    images = glob.glob(os.path.join(eval_folder, "*.jpg"))
    if not images:
        print(f"No images found in {eval_folder}")
        return
        
    metrics_sum = {"name_accuracy": 0.0, "dosage_accuracy": 0.0, "needs_review_share": 0.0}
    successful = 0
    
    for img_path in images:
        json_path = img_path.replace(".jpg", ".json")
        if not os.path.exists(json_path):
            print(f"Missing ground truth for {img_path}")
            continue
            
        with open(json_path, "r") as f:
            ground_truth = json.load(f)
            
        res = evaluate_prescription(img_path, ground_truth)
        if "error" in res:
            continue
            
        for k in metrics_sum:
            metrics_sum[k] += res[k]
        successful += 1
        
    if successful > 0:
        for k in metrics_sum:
            metrics_sum[k] /= successful
            
    print(f"Evaluated {successful} samples.")
    print("Metrics:", json.dumps(metrics_sum, indent=2))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--folder", type=str, default="./eval/samples", help="Folder with test .jpg and .json pairs")
    args = parser.parse_args()
    main(args.folder)
