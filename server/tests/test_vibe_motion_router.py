"""Tests for the vibe motion router."""

import sys
import pytest
from unittest.mock import patch, MagicMock, AsyncMock

# Pre-mock modules that cause import errors in the test environment.
# The vibe_motion_router imports image_canvas_utils → db_service → supabase_service → supabase.
# We stub these so the router module can be imported without the full dependency chain.
_stubs = {}
for mod_name in [
    "supabase",
    "services.supabase_service",
    "services.db_service",
    "tools.utils.image_canvas_utils",
]:
    if mod_name not in sys.modules:
        _stubs[mod_name] = MagicMock()
        sys.modules[mod_name] = _stubs[mod_name]

# Ensure generate_file_id is available on the stubbed module
sys.modules["tools.utils.image_canvas_utils"].generate_file_id = MagicMock(
    return_value="test-id"
)

from routers.vibe_motion_router import (  # noqa: E402
    MotionGenerateRequest,
    _get_openai_client,
    _get_gemini_client,
)


class TestMotionGenerateRequest:
    def test_defaults(self):
        req = MotionGenerateRequest(prompt="test", system_prompt="sys")
        assert req.model == "gpt-4o"
        assert req.preset == "scratch"
        assert req.duration == 10

    def test_custom_model(self):
        req = MotionGenerateRequest(
            prompt="test", system_prompt="sys", model="gpt-4o-mini"
        )
        assert req.model == "gpt-4o-mini"

    def test_custom_preset_and_duration(self):
        req = MotionGenerateRequest(
            prompt="test",
            system_prompt="sys",
            preset="infographics",
            duration=30,
        )
        assert req.preset == "infographics"
        assert req.duration == 30

    def test_media_urls_default_none(self):
        req = MotionGenerateRequest(prompt="test", system_prompt="sys")
        assert req.media_urls is None

    def test_media_urls_set(self):
        urls = ["https://example.com/img.jpg"]
        req = MotionGenerateRequest(
            prompt="test", system_prompt="sys", media_urls=urls
        )
        assert req.media_urls == urls


class TestGetOpenAIClient:
    @patch("routers.vibe_motion_router.config_service")
    def test_missing_api_key_raises_400(self, mock_config_service):
        mock_config_service.get_config.return_value = {"openai": {"api_key": ""}}
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            _get_openai_client()
        assert exc_info.value.status_code == 400
        assert "OpenAI API key" in exc_info.value.detail

    @patch("routers.vibe_motion_router.config_service")
    def test_missing_openai_section_raises_400(self, mock_config_service):
        mock_config_service.get_config.return_value = {}
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            _get_openai_client()
        assert exc_info.value.status_code == 400

    @patch("routers.vibe_motion_router.AsyncOpenAI")
    @patch("routers.vibe_motion_router.config_service")
    def test_valid_key_returns_client(self, mock_config_service, mock_openai_cls):
        mock_config_service.get_config.return_value = {
            "openai": {"api_key": "sk-test123", "url": "https://api.openai.com/v1/"}
        }
        client = _get_openai_client()
        mock_openai_cls.assert_called_once_with(
            api_key="sk-test123", base_url="https://api.openai.com/v1/"
        )


class TestGetGeminiClient:
    @patch("routers.vibe_motion_router.config_service")
    def test_missing_api_key_raises_400(self, mock_config_service):
        mock_config_service.get_config.return_value = {"vertex-ai": {"api_key": ""}}
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            _get_gemini_client()
        assert exc_info.value.status_code == 400
        assert "Google AI API key" in exc_info.value.detail

    @patch("routers.vibe_motion_router.config_service")
    def test_missing_vertex_section_raises_400(self, mock_config_service):
        mock_config_service.get_config.return_value = {}
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            _get_gemini_client()
        assert exc_info.value.status_code == 400


class TestGenerateMotionRouting:
    """Tests for the generate_motion endpoint routing logic."""

    @pytest.fixture
    def client(self):
        from fastapi.testclient import TestClient
        from routers.vibe_motion_router import router
        from fastapi import FastAPI

        app = FastAPI()
        app.include_router(router)
        return TestClient(app)

    @patch("routers.vibe_motion_router._get_openai_client")
    def test_non_gemini_model_uses_openai(self, mock_get_openai, client):
        mock_openai = AsyncMock()
        mock_get_openai.return_value = mock_openai

        # Mock the streaming response
        mock_chunk = MagicMock()
        mock_choice = MagicMock()
        mock_choice.delta.content = "test code"
        mock_chunk.choices = [mock_choice]

        mock_stream = AsyncMock()
        mock_stream.__aiter__ = MagicMock(return_value=iter([mock_chunk]))
        mock_openai.chat.completions.create = AsyncMock(return_value=mock_stream)

        response = client.post(
            "/api/generate/motion",
            json={
                "prompt": "make a bouncing ball",
                "system_prompt": "you are a motion designer",
                "model": "gpt-4o",
            },
        )
        assert response.status_code == 200
        mock_get_openai.assert_called_once()

    @patch("routers.vibe_motion_router._get_gemini_client")
    def test_gemini_model_uses_gemini(self, mock_get_gemini, client):
        mock_gemini = MagicMock()
        mock_get_gemini.return_value = mock_gemini

        # Mock the streaming response
        mock_chunk = MagicMock()
        mock_chunk.text = "test code"

        mock_stream = AsyncMock()
        mock_stream.__aiter__ = MagicMock(return_value=iter([mock_chunk]))
        mock_gemini.aio.models.generate_content_stream = AsyncMock(
            return_value=mock_stream
        )

        response = client.post(
            "/api/generate/motion",
            json={
                "prompt": "make a bouncing ball",
                "system_prompt": "you are a motion designer",
                "model": "gemini-2.5-pro",
            },
        )
        assert response.status_code == 200
        mock_get_gemini.assert_called_once()
