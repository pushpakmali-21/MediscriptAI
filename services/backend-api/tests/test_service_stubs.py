"""
Integration tests for service stubs and /health endpoints.
"""

import importlib.util
import sys
import pytest
import pathlib
from httpx import ASGITransport, AsyncClient

PROJECT_ROOT = pathlib.Path(__file__).resolve().parent.parent.parent.parent

def load_app(module_name: str, file_path: str):
    absolute_path = str(PROJECT_ROOT / file_path)
    spec = importlib.util.spec_from_file_location(module_name, absolute_path)
    if spec is None:
        raise ImportError(f"Could not load module {module_name} from {absolute_path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    # pyrefly: ignore [missing-attribute]
    spec.loader.exec_module(module)
    return module.app

backend_app = load_app("backend_main", "services/backend-api/app/main.py")
vision_app = load_app("vision_main", "services/vision-ocr/app/main.py")
extraction_app = load_app("extraction_main", "services/entity-extraction/app/main.py")
rag_app = load_app("rag_main", "services/rag-service/app/main.py")


@pytest.mark.asyncio
async def test_vision_health():
    async with AsyncClient(
        transport=ASGITransport(app=vision_app), base_url="http://test"
    ) as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert response.json()["service"] == "vision"


@pytest.mark.asyncio
async def test_extraction_health():
    async with AsyncClient(
        transport=ASGITransport(app=extraction_app), base_url="http://test"
    ) as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert response.json()["service"] == "extraction"


@pytest.mark.asyncio
async def test_rag_health():
    async with AsyncClient(
        transport=ASGITransport(app=rag_app), base_url="http://test"
    ) as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert response.json()["service"] == "rag"


@pytest.mark.asyncio
async def test_backend_health():
    async with AsyncClient(
        transport=ASGITransport(app=backend_app), base_url="http://test"
    ) as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert response.json()["service"] == "backend"
