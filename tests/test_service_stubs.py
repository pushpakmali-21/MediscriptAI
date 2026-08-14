"""
Integration tests for service stubs and /health endpoints.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from services.vision.main import app as vision_app
from services.extraction.main import app as extraction_app
from services.rag.main import app as rag_app
from backend.main import app as backend_app


@pytest.mark.asyncio
async def test_vision_health():
    async with AsyncClient(transport=ASGITransport(app=vision_app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert response.json()["service"] == "vision"


@pytest.mark.asyncio
async def test_extraction_health():
    async with AsyncClient(transport=ASGITransport(app=extraction_app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert response.json()["service"] == "extraction"


@pytest.mark.asyncio
async def test_rag_health():
    async with AsyncClient(transport=ASGITransport(app=rag_app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert response.json()["service"] == "rag"


@pytest.mark.asyncio
async def test_backend_health():
    async with AsyncClient(transport=ASGITransport(app=backend_app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert response.json()["service"] == "backend"
