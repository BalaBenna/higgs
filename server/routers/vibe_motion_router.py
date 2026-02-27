import os
import json
import traceback
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from openai import AsyncOpenAI
from services.config_service import config_service, FILES_DIR
from tools.utils.image_canvas_utils import generate_file_id

router = APIRouter(prefix="/api")

VISION_MODELS = {"gemini-2.5-pro", "gemini-2.0-flash-exp"}

AVAILABLE_MODELS = {
    "gpt-4o": {"provider": "openai", "vision": False},
    "gpt-4o-mini": {"provider": "openai", "vision": False},
    "gemini-2.5-pro": {"provider": "google", "vision": True},
    "gemini-2.0-flash-exp": {"provider": "google", "vision": True},
    "grok-2": {"provider": "xai", "vision": False},
    "grok-2-vision": {"provider": "xai", "vision": True},
}


class MotionGenerateRequest(BaseModel):
    prompt: str
    system_prompt: str
    preset: Optional[str] = "scratch"
    style: Optional[str] = None
    theme: Optional[str] = None
    duration: Optional[int] = 10
    media_urls: Optional[List[str]] = None
    model: Optional[str] = "gpt-4o"
    aspect_ratio: Optional[str] = "16:9"


def _get_openai_client() -> AsyncOpenAI:
    config = config_service.get_config()
    openai_config = config.get("openai", {})
    api_key = openai_config.get("api_key", "").strip()
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="OpenAI API key not configured. Please add it in Settings.",
        )
    base_url = openai_config.get("url", "https://api.openai.com/v1/").strip()
    return AsyncOpenAI(api_key=api_key, base_url=base_url)


def _get_gemini_client():
    try:
        from google import genai
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="google-genai package not installed. Run: pip install google-genai",
        )
    config = config_service.get_config()
    vertex_config = config.get("vertex-ai", {})
    api_key = str(vertex_config.get("api_key", "")).strip()
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="Google AI API key not configured. Please add it in Settings.",
        )
    return genai.Client(api_key=api_key)


def _get_xai_client() -> AsyncOpenAI:
    config = config_service.get_config()
    xai_config = config.get("xai", {})
    api_key = xai_config.get("api_key", "").strip()
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="xAI API key not configured. Please add it in Settings.",
        )
    base_url = xai_config.get("url", "https://api.x.ai/v1").strip()
    return AsyncOpenAI(api_key=api_key, base_url=base_url)


async def _openai_event_stream(client: AsyncOpenAI, req: MotionGenerateRequest):
    try:
        stream = await client.chat.completions.create(
            model=req.model or "gpt-4o",
            messages=[
                {"role": "system", "content": req.system_prompt},
                {"role": "user", "content": req.prompt},
            ],
            stream=True,
            temperature=0.7,
            max_tokens=16384,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta if chunk.choices else None
            if delta and delta.content:
                data = json.dumps({"type": "delta", "content": delta.content})
                yield f"data: {data}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
    except Exception as e:
        traceback.print_exc()
        error_data = json.dumps({"type": "error", "content": str(e)})
        yield f"data: {error_data}\n\n"


async def _gemini_event_stream(client, req: MotionGenerateRequest):
    try:
        from google.genai import types

        response = await client.aio.models.generate_content_stream(
            model=req.model or "gemini-2.5-pro",
            contents=req.prompt,
            config=types.GenerateContentConfig(
                system_instruction=req.system_prompt,
                temperature=0.7,
                max_output_tokens=16384,
            ),
        )
        async for chunk in response:
            if chunk.text:
                data = json.dumps({"type": "delta", "content": chunk.text})
                yield f"data: {data}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
    except Exception as e:
        traceback.print_exc()
        error_data = json.dumps({"type": "error", "content": str(e)})
        yield f"data: {error_data}\n\n"


async def _xai_event_stream(client: AsyncOpenAI, req: MotionGenerateRequest):
    try:
        stream = await client.chat.completions.create(
            model=req.model or "grok-2",
            messages=[
                {"role": "system", "content": req.system_prompt},
                {"role": "user", "content": req.prompt},
            ],
            stream=True,
            temperature=0.7,
            max_tokens=16384,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta if chunk.choices else None
            if delta and delta.content:
                data = json.dumps({"type": "delta", "content": delta.content})
                yield f"data: {data}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
    except Exception as e:
        traceback.print_exc()
        error_data = json.dumps({"type": "error", "content": str(e)})
        yield f"data: {error_data}\n\n"


@router.post("/generate/motion")
async def generate_motion(req: MotionGenerateRequest):
    """SSE streaming endpoint: proxies prompt to OpenAI, Gemini, or xAI and streams Remotion code back."""
    model = req.model or "gpt-4o"

    has_media = req.media_urls and len(req.media_urls) > 0

    if has_media and model not in VISION_MODELS:
        model = "gemini-2.5-pro"

    if model.startswith("gemini"):
        try:
            client = _get_gemini_client()
            stream = _gemini_event_stream(client, req)
        except HTTPException:
            raise
        except Exception as e:
            error_msg = str(e)
            if "clipboard" in error_msg.lower():
                raise HTTPException(
                    status_code=400,
                    detail="The uploaded image could not be processed. Please try using GPT-4o without the image, or use a different image format.",
                )
            if "image" in error_msg.lower() or "vision" in error_msg.lower():
                raise HTTPException(
                    status_code=400,
                    detail="Gemini failed to process media. Please try using GPT-4o without the image, or remove uploaded media.",
                )
            raise HTTPException(status_code=500, detail=f"Gemini error: {error_msg}")
    elif model.startswith("grok"):
        if has_media:
            raise HTTPException(
                status_code=400,
                detail="Grok does not support image input. Please switch to Gemini 2.5 Pro or use GPT-4o without uploaded images.",
            )
        try:
            client = _get_xai_client()
            stream = _xai_event_stream(client, req)
        except HTTPException:
            raise
        except Exception as e:
            error_msg = str(e)
            if (
                "image" in error_msg.lower()
                or "vision" in error_msg.lower()
                or "does not support image" in error_msg.lower()
            ):
                raise HTTPException(
                    status_code=400,
                    detail=f"Model {model} does not support image input. Please switch to Gemini or remove uploaded media.",
                )
            raise HTTPException(status_code=500, detail=f"xAI error: {error_msg}")
    else:
        try:
            client = _get_openai_client()
            stream = _openai_event_stream(client, req)
        except HTTPException:
            raise
        except Exception as e:
            error_msg = str(e)
            if "clipboard" in error_msg.lower():
                raise HTTPException(
                    status_code=400,
                    detail="The uploaded image could not be processed. Please try using Gemini 2.5 Pro or remove the uploaded image.",
                )
            if (
                "image" in error_msg.lower()
                or "vision" in error_msg.lower()
                or "does not support image" in error_msg.lower()
            ):
                raise HTTPException(
                    status_code=400,
                    detail=f"Model {model} does not support image input. Please switch to Gemini 2.5 Pro or remove uploaded media.",
                )
            raise HTTPException(status_code=500, detail=f"OpenAI error: {error_msg}")

    return StreamingResponse(
        stream,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/generate/motion/upload")
async def upload_motion_media(file: UploadFile = File(...)):
    """Upload media file for use in motion generation."""
    try:
        file_id = generate_file_id()
        ext = (
            file.filename.rsplit(".", 1)[-1]
            if file.filename and "." in file.filename
            else "png"
        )
        filename = f"{file_id}.{ext}"
        file_path = os.path.join(FILES_DIR, filename)
        os.makedirs(FILES_DIR, exist_ok=True)
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        return {"file_id": file_id, "url": f"/api/file/{filename}"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


class EnhancePromptRequest(BaseModel):
    prompt: str
    preset: str
    style: Optional[str] = None


def _is_valid_api_key(key: str) -> bool:
    """Check if an API key is a real key (not empty or placeholder)."""
    if not key:
        return False
    key_lower = key.strip().lower()
    return not key_lower.startswith("your_") and key_lower not in ("", "none", "null")


@router.get("/available-models")
async def get_available_models():
    """Return available models based on configured API keys."""
    config = config_service.get_config()
    available = []

    openai_config = config.get("openai", {})
    if _is_valid_api_key(openai_config.get("api_key", "")):
        available.extend(
            [
                {
                    "id": "gpt-4o",
                    "label": "GPT-4o",
                    "provider": "OpenAI",
                    "vision": False,
                },
                {
                    "id": "gpt-4o-mini",
                    "label": "GPT-4o Mini",
                    "provider": "OpenAI",
                    "vision": False,
                },
            ]
        )

    vertex_config = config.get("vertex-ai", {})
    if _is_valid_api_key(vertex_config.get("api_key", "")):
        available.extend(
            [
                {
                    "id": "gemini-2.5-pro",
                    "label": "Gemini 2.5 Pro",
                    "provider": "Google",
                    "vision": True,
                },
                {
                    "id": "gemini-2.0-flash-exp",
                    "label": "Gemini 2.0 Flash",
                    "provider": "Google",
                    "vision": True,
                },
            ]
        )

    xai_config = config.get("xai", {})
    if _is_valid_api_key(xai_config.get("api_key", "")):
        available.extend(
            [
                {"id": "grok-2", "label": "Grok-2", "provider": "xAI", "vision": False},
                {
                    "id": "grok-2-vision",
                    "label": "Grok-2 Vision",
                    "provider": "xAI",
                    "vision": True,
                },
            ]
        )

    return {"models": available}


ENHANCE_SYSTEM_PROMPT = """You are a motion graphics prompt enhancer. The user gives you a simple command or idea for a video, and you must enhance it into a detailed, specific prompt for Remotion motion graphics generation.

Your task is to:
1. Understand the user's intent (e.g., "flip it", "bounce the text", "make it slide in")
2. Expand it into a detailed motion graphics prompt that matches the preset type
3. Include specific animation details, timing, and visual style
4. Make it actionable for an AI that generates Remotion/React code

PRESET TYPES to consider:
- infographics: Data visualization, charts, statistics
- text-animation: Kinetic typography, text reveals
- posters: Eye-catching posters with subtle motion
- presentation: Professional slides with transitions
- social-media-ad: Attention-grabbing marketing clips
- logo-animation: Brand intros and logo reveals
- product-showcase: Product features and highlights
- countdown: Timers and countdowns
- scratch: General motion graphics

Guidelines:
- Be specific about animation types (spring, fade, slide, flip, wipe)
- Include timing suggestions (e.g., "over 30 frames", "with 0.5s delay")
- Reference visual elements (colors, positioning, scale)
- Keep the enhanced prompt as a single coherent description
- Output ONLY the enhanced prompt, no explanations or markdown"""

PRESET_ENHANCEMENT_GUIDANCE = {
    "infographics": "Focus on data visualization, charts, bars, counters, and statistics. Include specific data points to animate.",
    "text-animation": "Focus on typography, letter animations, word reveals, and kinetic text effects.",
    "posters": "Focus on bold imagery, gradients, parallax effects, and subtle motion.",
    "presentation": "Focus on slide transitions, bullet point animations, and professional layouts.",
    "social-media-ad": "Focus on attention-grabbing hooks, CTAs, fast-paced cuts, and bold visuals.",
    "logo-animation": "Focus on logo reveals, path animations, and brand identity moments.",
    "product-showcase": "Focus on product features, zoom highlights, and comparison reveals.",
    "countdown": "Focus on number transitions, flip effects, circular progress, and urgency.",
    "cinema": "Focus on cinematic video generation with camera movements, professional cinematography, dramatic lighting, and film-quality visuals.",
    "scratch": "Create engaging motion graphics with dynamic animations.",
}


async def _enhance_prompt_stream(
    client: AsyncOpenAI, prompt: str, preset: str, style: Optional[str]
):
    """Stream the enhanced prompt back."""
    try:
        guidance = PRESET_ENHANCEMENT_GUIDANCE.get(preset, "")
        full_prompt = f"""{ENHANCE_SYSTEM_PROMPT}

Preset: {preset}
{guidance}

User's simple command/idea: "{prompt}"

{"Style preference: " + style if style else ""}

Enhanced prompt:"""

        stream = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a motion graphics prompt enhancer. Output ONLY the enhanced prompt, no explanations.",
                },
                {"role": "user", "content": full_prompt},
            ],
            stream=True,
            temperature=0.7,
            max_tokens=500,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta if chunk.choices else None
            if delta and delta.content:
                data = json.dumps({"type": "delta", "content": delta.content})
                yield f"data: {data}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
    except Exception as e:
        traceback.print_exc()
        error_data = json.dumps({"type": "error", "content": str(e)})
        yield f"data: {error_data}\n\n"


@router.post("/enhance/prompt")
async def enhance_prompt(req: EnhancePromptRequest):
    """Enhance a simple prompt into a detailed motion graphics prompt."""
    config = config_service.get_config()
    openai_config = config.get("openai", {})

    if not _is_valid_api_key(openai_config.get("api_key", "")):
        raise HTTPException(
            status_code=400,
            detail="OpenAI API key not configured. Please add it in Settings.",
        )

    base_url = openai_config.get("url", "https://api.openai.com/v1/").strip()
    client = AsyncOpenAI(api_key=openai_config.get("api_key", ""), base_url=base_url)

    stream = _enhance_prompt_stream(client, req.prompt, req.preset, req.style)

    return StreamingResponse(
        stream,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
