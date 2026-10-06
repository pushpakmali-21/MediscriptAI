import re
from typing import Dict, Any, Optional

def parse_dosage(raw_text: str) -> Dict[str, Any]:
    text = raw_text.strip().upper()
    # Normalize dashes and spaces
    text = re.sub(r'\s*[-\u2010-\u2015]\s*', '-', text)
    
    canonical = {
        "morning": None,
        "afternoon": None,
        "evening": None,
        "night": None,
        "with_food": None,
        "as_needed": False,
        "duration_days": None,
        "raw": raw_text,
        "confidence": 0.0
    }
    
    matched = False
    
    # 1. Numeric patterns (e.g. 1-0-1, 1/2-0-1/2)
    numeric_pattern = r'^([0-9/]+)-([0-9/]+)-([0-9/]+)(?:-([0-9/]+))?'
    match = re.search(numeric_pattern, text)
    if match:
        m, a, e = match.group(1), match.group(2), match.group(3)
        n = match.group(4)
        
        canonical["morning"] = m if m != "0" else None
        canonical["afternoon"] = a if a != "0" else None
        canonical["evening"] = e if e != "0" else None
        if n:
            canonical["night"] = n if n != "0" else None
            
        canonical["confidence"] = 0.9
        matched = True

    # 2. Latin Abbreviations
    if re.search(r'\b(OD)\b', text):
        canonical["morning"] = "1"
        canonical["confidence"] = max(canonical["confidence"], 0.8)
        matched = True
    elif re.search(r'\b(BD|BID)\b', text):
        canonical["morning"] = "1"
        canonical["night"] = "1"
        canonical["confidence"] = max(canonical["confidence"], 0.8)
        matched = True
    elif re.search(r'\b(TDS|TID)\b', text):
        canonical["morning"] = "1"
        canonical["afternoon"] = "1"
        canonical["night"] = "1"
        canonical["confidence"] = max(canonical["confidence"], 0.8)
        matched = True
    elif re.search(r'\b(QID)\b', text):
        canonical["morning"] = "1"
        canonical["afternoon"] = "1"
        canonical["evening"] = "1"
        canonical["night"] = "1"
        canonical["confidence"] = max(canonical["confidence"], 0.8)
        matched = True
    elif re.search(r'\b(HS)\b', text):
        canonical["night"] = "1"
        canonical["confidence"] = max(canonical["confidence"], 0.8)
        matched = True
    elif re.search(r'\b(SOS|PRN)\b', text):
        canonical["as_needed"] = True
        canonical["confidence"] = max(canonical["confidence"], 0.8)
        matched = True
    elif re.search(r'\b(STAT)\b', text):
        canonical["morning"] = "1"
        canonical["confidence"] = max(canonical["confidence"], 0.8)
        matched = True
        
    # Food modifiers
    if re.search(r'\b(AC)\b', text) or "BEFORE FOOD" in text or "BEFORE MEAL" in text:
        canonical["with_food"] = "before"
    elif re.search(r'\b(PC)\b', text) or "AFTER FOOD" in text or "AFTER MEAL" in text:
        canonical["with_food"] = "after"

    # Duration parsing
    # x 5 days, for 1 week, x 3/7
    dur_match = re.search(r'(?:X|FOR)\s*(\d+)\s*(DAY|WEEK|MONTH)S?', text)
    if dur_match:
        val = int(dur_match.group(1))
        unit = dur_match.group(2)
        if unit == "DAY":
            canonical["duration_days"] = val
        elif unit == "WEEK":
            canonical["duration_days"] = val * 7
        elif unit == "MONTH":
            canonical["duration_days"] = val * 30
    else:
        # x 3/7 -> 3 days
        frac_match = re.search(r'(?:X|FOR)\s*(\d+)/7', text)
        if frac_match:
            canonical["duration_days"] = int(frac_match.group(1))
            
    if not matched:
        canonical["confidence"] = 0.2
        
    return canonical
