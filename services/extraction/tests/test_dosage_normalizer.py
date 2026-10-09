from app.dosage_normalizer import parse_dosage


def test_numeric_patterns():
    # 1-0-1
    res = parse_dosage("1-0-1")
    assert res["morning"] == "1"
    assert res["afternoon"] is None
    assert res["evening"] == "1"
    assert res["night"] is None

    # 1-1-1
    res = parse_dosage("1-1-1")
    assert res["morning"] == "1"
    assert res["afternoon"] == "1"
    assert res["evening"] == "1"

    # 0-0-1
    res = parse_dosage("0-0-1")
    assert res["morning"] is None
    assert res["afternoon"] is None
    assert res["evening"] == "1"
    
    # 1/2-0-1/2
    res = parse_dosage("1/2-0-1/2")
    assert res["morning"] == "1/2"
    assert res["afternoon"] is None
    assert res["evening"] == "1/2"
    
    # 1 - 0 - 1 (spaces)
    res = parse_dosage("1 - 0 - 1")
    assert res["morning"] == "1"
    assert res["evening"] == "1"
    
    # 4 parts: 1-0-0-1
    res = parse_dosage("1-0-0-1")
    assert res["morning"] == "1"
    assert res["afternoon"] is None
    assert res["evening"] is None
    assert res["night"] == "1"

def test_latin_abbreviations():
    res = parse_dosage("OD")
    assert res["morning"] == "1"
    
    res = parse_dosage("BID")
    assert res["morning"] == "1"
    assert res["night"] == "1"
    
    res = parse_dosage("TDS")
    assert res["morning"] == "1"
    assert res["afternoon"] == "1"
    assert res["night"] == "1"
    
    res = parse_dosage("QID")
    assert res["morning"] == "1"
    assert res["afternoon"] == "1"
    assert res["evening"] == "1"
    assert res["night"] == "1"
    
    res = parse_dosage("HS")
    assert res["night"] == "1"
    
    res = parse_dosage("SOS")
    assert res["as_needed"] is True
    
    res = parse_dosage("STAT")
    assert res["morning"] == "1"

def test_food_modifiers():
    res = parse_dosage("1-0-1 AC")
    assert res["with_food"] == "before"
    
    res = parse_dosage("BID PC")
    assert res["with_food"] == "after"
    
    res = parse_dosage("1-1-1 before food")
    assert res["with_food"] == "before"

def test_duration():
    res = parse_dosage("1-0-1 x 5 days")
    assert res["duration_days"] == 5
    
    res = parse_dosage("OD for 1 week")
    assert res["duration_days"] == 7
    
    res = parse_dosage("BID x 3/7")
    assert res["duration_days"] == 3

def test_unknown_ambiguous():
    res = parse_dosage("Take some when pain")
    assert res["morning"] is None
    assert res["afternoon"] is None
    assert res["evening"] is None
    assert res["night"] is None
    assert res["confidence"] < 0.5
