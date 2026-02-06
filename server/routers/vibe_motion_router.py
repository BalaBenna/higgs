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


class MotionGenerateRequest(BaseModel):
    prompt: str
    system_prompt: str
    preset: Optional[str] = "scratch"
    style: Optional[str] = None
    theme: Optional[str] = None
    duration: Optional[int] = 10
    media_urls: Optional[List[str]] = None
    model: Optional[str] = "gpt-4o"


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


async def _openai_event_stream(client: AsyncOpenAI, req: MotionGenerateRequest):
    try:
        stream = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": req.system_prompt},
                {"role": "user", "content": req.prompt},
            ],
            stream=True,
            temperature=0.7,
            max_tokens=8192,
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
            model="gemini-2.5-pro",
            contents=req.prompt,
            config=types.GenerateContentConfig(
                system_instruction=req.system_prompt,
                temperature=0.7,
                max_output_tokens=8192,
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


@router.post("/generate/motion")
async def generate_motion(req: MotionGenerateRequest):
    """SSE streaming endpoint: proxies prompt to OpenAI or Gemini and streams Remotion code back."""
    model = req.model or "gpt-4o"

    if model.startswith("gemini"):
        client = _get_gemini_client()
        stream = _gemini_event_stream(client, req)
    else:
        client = _get_openai_client()
        stream = _openai_event_stream(client, req)

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
        ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "png"
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
