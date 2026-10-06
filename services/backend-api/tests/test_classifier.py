import pytest
import asyncio
from app.safety.classifier import explain_tier, UserProfile, guide_tier

def test_explain_tier():
    dosage = {
        "morning": "1",
        "afternoon": None,
        "evening": "1",
        "night": None,
        "with_food": "after",
        "as_needed": False,
        "duration_days": 5
    }
    explanation = explain_tier(dosage)
    assert "Take 1 in the morning, 1 in the evening." in explanation
    assert "Take after food." in explanation
    assert "Continue for 5 days." in explanation

@pytest.mark.asyncio
async def test_guide_tier_allergy():
    profile = UserProfile(allergies=["Amoxicillin"])
    # Mocking httpx.AsyncClient for purely local testing
    class MockClient:
        async def post(self, *args, **kwargs):
            return None
            
    alerts = await guide_tier(MockClient(), "Amoxicillin", profile, ["Amoxicillin"])
    assert len(alerts) >= 1
    assert alerts[0]["type"] == "allergy"
    assert alerts[0]["severity"] == "high"

@pytest.mark.asyncio
async def test_guide_tier_cross_reactivity():
    profile = UserProfile(allergies=["penicillins"])
    class MockClient:
        async def post(self, *args, **kwargs):
            return None
    
    alerts = await guide_tier(MockClient(), "Ceftriaxone", profile, ["Ceftriaxone"])
    # Should catch cephalosporins -> penicillins cross-reactivity
    assert len(alerts) >= 1
    assert alerts[0]["type"] == "allergy"

@pytest.mark.asyncio
async def test_guide_tier_drug_interaction():
    profile = UserProfile(current_medications=["Alcohol"])
    class MockClient:
        async def post(self, *args, **kwargs):
            return None
            
    alerts = await guide_tier(MockClient(), "Paracetamol", profile, ["Paracetamol"])
    assert len(alerts) >= 1
    assert alerts[0]["type"] == "drug_drug"
    assert alerts[0]["severity"] == "high"
