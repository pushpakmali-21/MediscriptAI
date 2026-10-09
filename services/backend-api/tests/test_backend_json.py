from io import BytesIO

import pytest
from app import main
from app.main import _parse_gemini_json
from fastapi import HTTPException, UploadFile
from starlette.datastructures import Headers
import json


@pytest.mark.parametrize(
    ("response", "expected"),
    [
        (
            '```json\n{"medications": [], "diagnoses": []}\n```',
            {"medications": [], "diagnoses": []},
        ),
        (
            '```JSON\r\n{"medications": [{"medicine_name": "A"}]}\r\n```',
            {"medications": [{"medicine_name": "A"}]},
        ),
        (
            '``` \n{"general_notes": "line 1\\nline 2"}\n```',
            {"general_notes": "line 1\nline 2"},
        ),
        (
            'Result:\n{"medications": [], "general_notes": "ok"}\nDone.',
            {"medications": [], "general_notes": "ok"},
        ),
    ],
)
def test_parse_gemini_json_from_fenced_or_surrounded_text(response, expected):
    assert _parse_gemini_json(response) == expected


def test_parse_gemini_json_rejects_non_object():
    with pytest.raises(ValueError, match="JSON object"):
        _parse_gemini_json("```json\n[]\n```")


@pytest.mark.asyncio
async def test_extract_prescription_fails_instead_of_returning_mock_without_key(
    monkeypatch,
):
    monkeypatch.setenv("GEMINI_API_KEY", "")
    upload = UploadFile(filename="prescription.png", file=BytesIO(b"image bytes"))

    with pytest.raises(HTTPException) as exc_info:
        await main.extract_prescription(upload)

    assert exc_info.value.status_code == 503
    assert "GEMINI_API_KEY" in exc_info.value.detail


@pytest.mark.asyncio
async def test_extract_prescription_sends_uploaded_image_to_gemini(monkeypatch):
    calls = {}

    class FakeModel:
        def generate_content(self, parts):
            calls["parts"] = parts

            class Response:
                text = '```json\n{"medications": [{"medicine_name": "TestMed"}]}\n```'

            return Response()

    class FakeGemini:
        @staticmethod
        def configure(api_key):
            calls["api_key"] = api_key

        @staticmethod
        def GenerativeModel(model_name):
            calls["model_name"] = model_name
            return FakeModel()

    monkeypatch.setattr(main, "genai", FakeGemini)
    monkeypatch.setenv("GEMINI_API_KEY", "test-api-key")
    monkeypatch.delenv("GEMINI_MODEL", raising=False)
    upload = UploadFile(
        filename="prescription.png",
        file=BytesIO(b"uploaded image bytes"),
        headers=Headers({"content-type": "image/png"}),
    )

    result = await main.extract_prescription(upload)

    assert calls["api_key"] == "test-api-key"
    assert calls["model_name"] == "gemini-3.6-flash"
    assert calls["parts"][0] == {
        "mime_type": "image/png",
        "data": b"uploaded image bytes",
    }
    assert result["source"] == "gemini"
    assert result["medications"][0]["medicine_name"] == "TestMed"
