import os
import re
import uuid
import inspect
import asyncio
import traceback
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
import requests
import httpx
from pydantic import BaseModel
from models.tool_model import ToolInfoJson
from services.tool_service import tool_service
from services.config_service import config_service, FILES_DIR
from services.db_service import db_service
from services.tool_confirmation_manager import tool_confirmation_manager
from tools.utils.image_canvas_utils import generate_file_id
from utils.http_client import HttpClient

# services
from models.config_model import ModelInfo
from typing import Any, List, Optional
from services.tool_service import TOOL_MAPPING
from middleware.auth import get_current_user, optional_auth

router = APIRouter(prefix="/api")


def normalize_file_url(url: str) -> str:
    """Strip http://localhost:PORT prefix, returning a relative /api/file/... URL."""
    return re.sub(r"http://localhost:\d+", "", url)


def _get_tool_schema_fields(tool_fn: Any) -> set[str]:
    """Get Pydantic schema field names for both v1 and v2 models."""
    args_schema = getattr(tool_fn, "args_schema", None)
    if not args_schema:
        return set()

    model_fields = getattr(args_schema, "model_fields", None)
    if isinstance(model_fields, dict):
        return set(model_fields.keys())

    fields = getattr(args_schema, "__fields__", None)
    if isinstance(fields, dict):
        return set(fields.keys())

    return set()


def _requires_tool_call_envelope(tool_fn: Any, sig: inspect.Signature | None) -> bool:
    """
    LangChain tools that use InjectedToolCallId must be invoked with a ToolCall envelope
    ({name, type, id, args}) instead of a plain args dict.
    """
    params = sig.parameters if sig else {}
    if "tool_call_id" in params:
        return True
    return "tool_call_id" in _get_tool_schema_fields(tool_fn)


async def _invoke_tool(
    tool_fn: Any,
    tool_name: str,
    call_id: str,
    invoke_args: dict[str, Any],
    config: dict[str, Any],
    requires_tool_call_envelope: bool,
) -> Any:
    if requires_tool_call_envelope:
        return await tool_fn.ainvoke(
            {
                "name": tool_name,
                "type": "tool_call",
                "id": call_id,
                "args": invoke_args,
            },
            config=config,
        )
    return await tool_fn.ainvoke(invoke_args, config=config)


def _tool_result_to_text(result: Any) -> str:
    """Normalize tool output (string or ToolMessage) into plain text for parsing."""
    if hasattr(result, "content"):
        content = getattr(result, "content")
        if isinstance(content, list):
            parts: list[str] = []
            for item in content:
                if isinstance(item, dict):
                    parts.append(str(item.get("text") or item.get("content") or item))
                else:
                    parts.append(str(item))
            return " ".join(parts)
        return str(content)
    return str(result)


def _extract_media_urls(result_text: str) -> list[str]:
    """
    Extract media URLs from markdown and fallback plain-text output.
    Supports both absolute URLs and local /api/file/... paths.
    """
    urls: list[str] = []

    for match in re.finditer(
        r"!\[.*?\]\(((?:https?://|/api/file/)[^\s\)]+)\)", result_text
    ):
        urls.append(normalize_file_url(match.group(1)))

    if not urls:
        for match in re.finditer(r"((?:https?://|/api/file/)[^\s\)]+)", result_text):
            urls.append(normalize_file_url(match.group(1)))

    # Preserve order while removing duplicates
    seen: set[str] = set()
    deduped: list[str] = []
    for url in urls:
        if url not in seen:
            seen.add(url)
            deduped.append(url)
    return deduped


async def get_comfyui_model_list(base_url: str) -> List[str]:
    """Get ComfyUI model list from object_info API"""
    try:
        timeout = httpx.Timeout(10.0)
        async with HttpClient.create(timeout=timeout) as client:
            response = await client.get(f"{base_url}/api/object_info")
            if response.status_code == 200:
                data = response.json()
                # Extract models from CheckpointLoaderSimple node
                models = (
                    data.get("CheckpointLoaderSimple", {})
                    .get("input", {})
                    .get("required", {})
                    .get("ckpt_name", [[]])[0]
                )
                return models if isinstance(models, list) else []  # type: ignore
            else:
                print(f"ComfyUI server returned status {response.status_code}")
                return []
    except Exception as e:
        print(f"Error querying ComfyUI: {e}")
        return []


# List all LLM models
@router.get("/list_models")
async def get_models() -> list[ModelInfo]:
    config = config_service.get_config()
    res: List[ModelInfo] = []

    for provider in config.keys():
        provider_config = config[provider]
        provider_url = provider_config.get("url", "").strip()
        provider_api_key = provider_config.get("api_key", "").strip()

        # Skip provider if URL is empty or API key is empty
        if not provider_url or not provider_api_key:
            continue

        models = provider_config.get("models", {})
        for model_name in models:
            model = models[model_name]
            model_type = model.get("type", "text")
            # Return all model types (text, image, video)
            res.append(
                {
                    "provider": provider,
                    "model": model_name,
                    "url": provider_url,
                    "type": model_type,
                }
            )
    return res


@router.get("/list_tools")
async def list_tools() -> list[ToolInfoJson]:
    config = config_service.get_config()
    res: list[ToolInfoJson] = []
    for tool_id, tool_info in tool_service.tools.items():
        if tool_info.get("provider") == "system":
            continue
        provider = tool_info["provider"]
        provider_api_key = config[provider].get("api_key", "").strip()
        if provider != "comfyui" and not provider_api_key:
            continue
        res.append(
            {
                "id": tool_id,
                "provider": tool_info.get("provider", ""),
                "type": tool_info.get("type", ""),
                "display_name": tool_info.get("display_name", ""),
            }
        )

    # Handle ComfyUI models separately
    # comfyui_config = config.get('comfyui', {})
    # comfyui_url = comfyui_config.get('url', '').strip()
    # comfyui_config_models = comfyui_config.get('models', {})
    # if comfyui_url:
    #     comfyui_models = await get_comfyui_model_list(comfyui_url)
    #     for comfyui_model in comfyui_models:
    #         if comfyui_model in comfyui_config_models:
    #             res.append({
    #                 'provider': 'comfyui',
    #                 'model': comfyui_model,
    #                 'url': comfyui_url,
    #                 'type': 'image'
    #             })

    return res


@router.get("/list_chat_sessions")
async def list_chat_sessions(user_id: str = Depends(get_current_user)):
    return await db_service.list_sessions(user_id=user_id)


@router.get("/chat_session/{session_id}")
async def get_chat_session(session_id: str, user_id: str = Depends(get_current_user)):
    return await db_service.get_chat_history(session_id)


# ---------------
# Direct Generation Endpoints
# ---------------


class ImageGenerateRequest(BaseModel):
    tool: str
    prompt: str
    negative_prompt: Optional[str] = None
    aspect_ratio: Optional[str] = "1:1"
    num_images: Optional[int] = 1
    guidance_scale: Optional[float] = None
    style: Optional[str] = None
    model_name: Optional[str] = None
    input_images: Optional[List[str]] = None


@router.post("/generate/image")
async def generate_image(
    req: ImageGenerateRequest, user_id: Optional[str] = Depends(optional_auth)
):
    """Direct image generation endpoint that invokes a tool by name."""
    tool_info = TOOL_MAPPING.get(req.tool) or tool_service.tools.get(req.tool)
    if not tool_info:
        raise HTTPException(status_code=404, detail=f"Tool '{req.tool}' not found")

    tool_fn = tool_info.get("tool_function")
    if not tool_fn:
        raise HTTPException(
            status_code=404, detail=f"Tool '{req.tool}' has no function"
        )

    # Check if stub tool (coming soon)
    tool_desc = getattr(tool_fn, "description", "")
    if "[Coming Soon]" in tool_desc:
        display = tool_info.get("display_name", req.tool)
        raise HTTPException(
            status_code=400,
            detail=f"{display} is coming soon. Stay tuned!",
        )

    session_id = f"direct_{uuid.uuid4().hex[:8]}"
    config = {
        "configurable": {
            "canvas_id": "",
            "session_id": session_id,
            "user_id": user_id or "",
        }
    }

    # Check if this tool accepts input_images
    sig = (
        inspect.signature(tool_fn.coroutine) if hasattr(tool_fn, "coroutine") else None
    )
    has_input_images = sig and "input_images" in sig.parameters if sig else False

    # Check if this tool accepts num_images
    has_num_images = sig and "num_images" in sig.parameters if sig else False
    # Also check args_schema if available
    if not has_num_images and hasattr(tool_fn, "args_schema") and tool_fn.args_schema:
        schema = tool_fn.args_schema
        # Check if num_images is a field in the schema
        if "num_images" in schema.__fields__:
            has_num_images = True

    # Check if this tool natively accepts negative_prompt, guidance_scale, style
    params = sig.parameters if sig else {}
    has_negative_prompt = "negative_prompt" in params
    has_guidance_scale = "guidance_scale" in params
    has_style = "style" in params
    # Also check args_schema for these fields
    if hasattr(tool_fn, "args_schema") and tool_fn.args_schema:
        schema_fields = tool_fn.args_schema.__fields__
        if not has_negative_prompt and "negative_prompt" in schema_fields:
            has_negative_prompt = True
        if not has_guidance_scale and "guidance_scale" in schema_fields:
            has_guidance_scale = True
        if not has_style and "style" in schema_fields:
            has_style = True

    # Build effective prompt with fallbacks for params the tool doesn't natively support
    effective_prompt = req.prompt
    if req.negative_prompt and not has_negative_prompt:
        effective_prompt = f"{effective_prompt}. Avoid: {req.negative_prompt}"
    if req.style and not has_style:
        effective_prompt = f"{effective_prompt}, {req.style} style"

    # Determine if this tool needs a ToolCall envelope (InjectedToolCallId)
    use_envelope = _requires_tool_call_envelope(tool_fn, sig)

    try:
        results = []

        # If tool supports batch generation, call it once
        if has_num_images and (req.num_images or 1) > 1:
            call_id = f"call_{uuid.uuid4().hex[:8]}"
            invoke_args = {
                "prompt": effective_prompt,
                "aspect_ratio": req.aspect_ratio or "1:1",
                "num_images": req.num_images,
            }
            if has_input_images and req.input_images:
                invoke_args["input_images"] = req.input_images
            if has_negative_prompt and req.negative_prompt:
                invoke_args["negative_prompt"] = req.negative_prompt
            if has_guidance_scale and req.guidance_scale is not None:
                invoke_args["guidance_scale"] = req.guidance_scale
            if has_style and req.style:
                invoke_args["style"] = req.style

            try:
                result = await _invoke_tool(
                    tool_fn, req.tool, call_id, invoke_args, config, use_envelope
                )
                print(f"🖼️ Batch tool result: {str(result)[:200]}")
            except Exception as tool_error:
                print(f"🖼️ Batch tool invocation error: {tool_error}")
                traceback.print_exc()
                raise

            # Normalize result (handles both str and ToolMessage)
            result_text = _tool_result_to_text(result)

            # Parse multiple image URLs from the tool result string
            for url in _extract_media_urls(result_text):
                results.append(
                    {
                        "id": f"gen_{uuid.uuid4().hex[:8]}",
                        "type": "image",
                        "url": url,
                        "src": url,
                        "prompt": req.prompt,
                        "model": req.model_name or req.tool,
                        "createdAt": datetime.now().isoformat(),
                    }
                )

            # Fallback if no URLs found but result is not empty (error handling)
            if not results and result_text:
                print(f"Warning: No image URLs found in result: {result_text}")

        else:
            # Legacy loop for tools that don't support batching
            for i in range(req.num_images or 1):
                call_id = f"call_{uuid.uuid4().hex[:8]}"
                invoke_args = {
                    "prompt": effective_prompt,
                    "aspect_ratio": req.aspect_ratio or "1:1",
                }
                if has_input_images and req.input_images:
                    invoke_args["input_images"] = req.input_images
                if has_negative_prompt and req.negative_prompt:
                    invoke_args["negative_prompt"] = req.negative_prompt
                if has_guidance_scale and req.guidance_scale is not None:
                    invoke_args["guidance_scale"] = req.guidance_scale
                if has_style and req.style:
                    invoke_args["style"] = req.style
                try:
                    result = await _invoke_tool(
                        tool_fn, req.tool, call_id, invoke_args, config, use_envelope
                    )
                    print(f"🖼️ Tool result: {str(result)[:200]}")
                except Exception as tool_error:
                    print(f"🖼️ Tool invocation error: {tool_error}")
                    traceback.print_exc()
                    raise

                # Normalize result (handles both str and ToolMessage)
                result_text = _tool_result_to_text(result)

                # Parse the image URL from the tool result string
                urls = _extract_media_urls(result_text)
                image_url = urls[0] if urls else ""
                results.append(
                    {
                        "id": f"gen_{uuid.uuid4().hex[:8]}",
                        "type": "image",
                        "url": image_url,
                        "src": image_url,
                        "prompt": req.prompt,
                        "model": req.model_name or req.tool,
                        "createdAt": datetime.now().isoformat(),
                    }
                )
        # Persist to Supabase if user is authenticated
        if user_id and results:
            try:
                from services import storage_service

                for img in results:
                    local_url = img.get("url", "")
                    if not local_url or not local_url.startswith("/api/file/"):
                        continue
                    filename = local_url.split("/api/file/")[-1]
                    file_path = os.path.join(FILES_DIR, filename)
                    if not os.path.exists(file_path):
                        continue
                    with open(file_path, "rb") as f:
                        image_bytes = f.read()
                    public_url = await storage_service.upload_file(
                        user_id=user_id,
                        file_bytes=image_bytes,
                        filename=filename,
                    )
                    await db_service.insert_generated_content(
                        {
                            "user_id": user_id,
                            "type": "image",
                            "storage_path": f"{user_id}/{filename}",
                            "prompt": req.prompt,
                            "model": req.model_name or req.tool,
                            "metadata": {
                                "public_url": public_url,
                                "aspect_ratio": req.aspect_ratio or "1:1",
                            },
                        }
                    )
                    img["url"] = public_url
                    img["src"] = public_url
            except Exception as persist_err:
                print(f"Warning: Failed to persist images to Supabase: {persist_err}")
                traceback.print_exc()

        return {"images": results}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/video")
async def generate_video(
    tool: str = Form(...),
    prompt: str = Form(...),
    duration: Optional[str] = Form(None),
    aspect_ratio: Optional[str] = Form("16:9"),
    resolution: Optional[str] = Form(None),
    motion_strength: Optional[str] = Form(None),
    model_name: Optional[str] = Form(None),
    source_image: Optional[UploadFile] = File(None),
    # Kling-specific fields
    negative_prompt: Optional[str] = Form(None),
    cfg_scale: Optional[str] = Form(None),
    guidance_scale: Optional[str] = Form(None),
    generate_audio: Optional[str] = Form(None),
    mode: Optional[str] = Form(None),
    end_image: Optional[UploadFile] = File(None),
    audio_file: Optional[UploadFile] = File(None),
    video_file: Optional[UploadFile] = File(None),
    voice_id: Optional[str] = Form(None),
    voice_speed: Optional[str] = Form(None),
    lip_sync_text: Optional[str] = Form(None),
    user_id: Optional[str] = Depends(get_current_user),
):
    """Direct video generation endpoint that invokes a tool by name."""
    print(f"🎬 === VIDEO GENERATION REQUEST ===")
    print(f"🎬 Tool: {tool}")
    print(
        f"🎬 Prompt: {prompt[:100]}..." if len(prompt) > 100 else f"🎬 Prompt: {prompt}"
    )
    print(f"🎬 Duration: {duration}, Aspect: {aspect_ratio}")
    tool_info = TOOL_MAPPING.get(tool) or tool_service.tools.get(tool)
    if not tool_info:
        print(f"🎬 Tool NOT FOUND: {tool}")
        print(f"🎬 Available tools: {list(TOOL_MAPPING.keys())[:20]}")
        raise HTTPException(status_code=404, detail=f"Tool '{tool}' not found")

    tool_fn = tool_info.get("tool_function")
    if not tool_fn:
        print(f"🎬 Tool has no function: {tool}")
        raise HTTPException(status_code=404, detail=f"Tool '{tool}' has no function")

    print(f"🎬 Found tool function: {tool_fn}")

    # Check if stub tool (coming soon)
    tool_desc = getattr(tool_fn, "description", "")
    if "[Coming Soon]" in tool_desc:
        display = tool_info.get("display_name", tool)
        raise HTTPException(
            status_code=400,
            detail=f"{display} is coming soon. Stay tuned!",
        )

    session_id = f"direct_{uuid.uuid4().hex[:8]}"
    config = {
        "configurable": {
            "canvas_id": "",
            "session_id": session_id,
            "user_id": user_id or "",
        }
    }

    try:
        call_id = f"call_{uuid.uuid4().hex[:8]}"
        invoke_args = {
            "prompt": prompt,
            "aspect_ratio": aspect_ratio or "16:9",
        }
        if duration:
            invoke_args["duration"] = int(duration)

        # Inspect tool signature for supported params
        sig = (
            inspect.signature(tool_fn.coroutine)
            if hasattr(tool_fn, "coroutine")
            else None
        )
        params = sig.parameters if sig else {}

        has_input_images_param = "input_images" in params
        has_start_image_param = "start_image" in params

        # Helper to save an uploaded file and return its filename
        async def _save_upload(upload: UploadFile) -> str:
            fid = generate_file_id()
            ext = (
                upload.filename.rsplit(".", 1)[-1]
                if upload.filename and "." in upload.filename
                else "bin"
            )
            fname = f"{fid}.{ext}"
            fpath = os.path.join(FILES_DIR, fname)
            content = await upload.read()
            with open(fpath, "wb") as f:
                f.write(content)
            return fname

        # Handle source image → input_images or start_image
        if source_image and source_image.filename:
            saved_name = await _save_upload(source_image)
            if has_start_image_param:
                invoke_args["start_image"] = saved_name
            elif has_input_images_param:
                invoke_args["input_images"] = [saved_name]
        else:
            if has_input_images_param:
                param = params["input_images"]
                if param.default is inspect.Parameter.empty:
                    display = tool_info.get("display_name", tool)
                    raise HTTPException(
                        status_code=400,
                        detail=f"{display} requires a source image. Please upload an image and use Image-to-Video mode.",
                    )
            if has_start_image_param:
                param = params["start_image"]
                if (
                    param.default is inspect.Parameter.empty
                    and "start_image" not in invoke_args
                ):
                    display = tool_info.get("display_name", tool)
                    raise HTTPException(
                        status_code=400,
                        detail=f"{display} requires a source image. Please upload an image.",
                    )

        # Handle end_image upload
        if end_image and end_image.filename and "end_image" in params:
            invoke_args["end_image"] = await _save_upload(end_image)

        # Handle audio_file upload
        if audio_file and audio_file.filename and "audio_url" in params:
            invoke_args["audio_url"] = await _save_upload(audio_file)

        # Handle video_file upload
        if video_file and video_file.filename and "video_url" in params:
            invoke_args["video_url"] = await _save_upload(video_file)

        # Pass scalar params if the tool accepts them
        if negative_prompt and "negative_prompt" in params:
            invoke_args["negative_prompt"] = negative_prompt
        if cfg_scale and "cfg_scale" in params:
            invoke_args["cfg_scale"] = float(cfg_scale)
        if guidance_scale and "guidance_scale" in params:
            invoke_args["guidance_scale"] = float(guidance_scale)
        if motion_strength and "motion_strength" in params:
            invoke_args["motion_strength"] = float(motion_strength)
        if generate_audio is not None and "generate_audio" in params:
            invoke_args["generate_audio"] = generate_audio.lower() == "true"
        if mode and "mode" in params:
            invoke_args["mode"] = mode
        if voice_id and "voice_id" in params:
            invoke_args["voice_id"] = voice_id
        if voice_speed and "voice_speed" in params:
            invoke_args["voice_speed"] = float(voice_speed)
        if lip_sync_text and "text" in params:
            invoke_args["text"] = lip_sync_text

        # Auto-confirm for tools that use tool_confirmation_manager (e.g. Veo3)
        async def _auto_confirm(cid: str):
            """Poll until the pending confirmation appears, then confirm it."""
            for _ in range(100):  # up to 10 seconds
                if tool_confirmation_manager.confirm_tool(cid):
                    return
                await asyncio.sleep(0.1)

        asyncio.create_task(_auto_confirm(call_id))

        # Determine if this tool needs a ToolCall envelope
        video_sig = (
            inspect.signature(tool_fn.coroutine)
            if hasattr(tool_fn, "coroutine")
            else None
        )
        video_use_envelope = _requires_tool_call_envelope(tool_fn, video_sig)

        try:
            print(f"🎬 Invoking tool with args: {invoke_args}")
            result = await _invoke_tool(
                tool_fn, tool, call_id, invoke_args, config, video_use_envelope
            )
            print(f"🎬 Video tool result: {str(result)[:200]}")
        except Exception as tool_error:
            print(f"🎬 Video tool invocation error: {tool_error}")
            traceback.print_exc()
            raise HTTPException(
                status_code=500, detail=f"Video generation failed: {str(tool_error)}"
            )

        result_str = _tool_result_to_text(result)
        print(f"🎬 Result string: {result_str[:200]}")

        # Check for various failure patterns
        is_failure = (
            result_str.startswith("Failed")
            or result_str.startswith("Video generation failed")
            or "API key not configured" in result_str
        )

        # Always try to extract URLs, even if it looks like a failure
        urls = _extract_media_urls(result_str)

        if is_failure and not urls:
            # Real failure - no video and error message
            raise HTTPException(status_code=400, detail=result_str)

        # If we have URLs (even with warning), use them
        if urls:
            video_url = urls[0]
            print(f"🎬 Video URL extracted: {video_url}")
            return {
                "id": f"gen_{uuid.uuid4().hex[:8]}",
                "type": "video",
                "url": video_url,
                "thumbnail": "",
                "prompt": prompt,
                "model": model_name or tool,
                "duration": duration or "5",
                "createdAt": datetime.now().isoformat(),
            }

        # Fallback: try to construct URL from local files
        # Look for recently created video files
        try:
            from glob import glob
            from datetime import timedelta

            files_dir = os.path.join(
                os.path.dirname(os.path.dirname(__file__)), "user_data", "files"
            )
            if os.path.exists(files_dir):
                # Get video files created in last 5 minutes
                cutoff = datetime.now() - timedelta(minutes=5)
                video_files = glob(os.path.join(files_dir, "vi_*.mp4"))
                for vf in sorted(video_files, key=os.path.getmtime, reverse=True):
                    mtime = datetime.fromtimestamp(os.path.getmtime(vf))
                    if mtime > cutoff:
                        filename = os.path.basename(vf)
                        video_url = f"/api/file/{filename}"
                        print(f"🎬 Found recent video file: {video_url}")
                        return {
                            "id": f"gen_{uuid.uuid4().hex[:8]}",
                            "type": "video",
                            "url": video_url,
                            "thumbnail": "",
                            "prompt": prompt,
                            "model": model_name or tool,
                            "duration": duration or "5",
                            "createdAt": datetime.now().isoformat(),
                        }
        except Exception as e:
            print(f"⚠️ Fallback file search error: {e}")

        # Last resort - return the result string as error
        raise HTTPException(
            status_code=500, detail=f"No video URL found. Result: {result_str[:200]}"
        )
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
