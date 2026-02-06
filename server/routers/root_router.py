import os
import re
import uuid
import inspect
import asyncio
import traceback
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
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
from typing import List, Optional
from services.tool_service import TOOL_MAPPING

router = APIRouter(prefix="/api")


def normalize_file_url(url: str) -> str:
    """Strip http://localhost:PORT prefix, returning a relative /api/file/... URL."""
    return re.sub(r'http://localhost:\d+', '', url)


async def get_comfyui_model_list(base_url: str) -> List[str]:
    """Get ComfyUI model list from object_info API"""
    try:
        timeout = httpx.Timeout(10.0)
        async with HttpClient.create(timeout=timeout) as client:
            response = await client.get(f"{base_url}/api/object_info")
            if response.status_code == 200:
                data = response.json()
                # Extract models from CheckpointLoaderSimple node
                models = data.get('CheckpointLoaderSimple', {}).get(
                    'input', {}).get('required', {}).get('ckpt_name', [[]])[0]
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
        provider_url = provider_config.get('url', '').strip()
        provider_api_key = provider_config.get('api_key', '').strip()

        # Skip provider if URL is empty or API key is empty
        if not provider_url or not provider_api_key:
            continue

        models = provider_config.get('models', {})
        for model_name in models:
            model = models[model_name]
            model_type = model.get('type', 'text')
            # Return all model types (text, image, video)
            res.append({
                'provider': provider,
                'model': model_name,
                'url': provider_url,
                'type': model_type
            })
    return res


@router.get("/list_tools")
async def list_tools() -> list[ToolInfoJson]:
    config = config_service.get_config()
    res: list[ToolInfoJson] = []
    for tool_id, tool_info in tool_service.tools.items():
        if tool_info.get('provider') == 'system':
            continue
        provider = tool_info['provider']
        provider_api_key = config[provider].get('api_key', '').strip()
        if provider != 'comfyui' and not provider_api_key:
            continue
        res.append({
            'id': tool_id,
            'provider': tool_info.get('provider', ''),
            'type': tool_info.get('type', ''),
            'display_name': tool_info.get('display_name', ''),
        })

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
async def list_chat_sessions():
    return await db_service.list_sessions()


@router.get("/chat_session/{session_id}")
async def get_chat_session(session_id: str):
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
async def generate_image(req: ImageGenerateRequest):
    """Direct image generation endpoint that invokes a tool by name."""
    tool_info = TOOL_MAPPING.get(req.tool) or tool_service.tools.get(req.tool)
    if not tool_info:
        raise HTTPException(status_code=404, detail=f"Tool '{req.tool}' not found")

    tool_fn = tool_info.get("tool_function")
    if not tool_fn:
        raise HTTPException(status_code=404, detail=f"Tool '{req.tool}' has no function")

    # Check if stub tool (coming soon)
    tool_desc = getattr(tool_fn, "description", "")
    if "[Coming Soon]" in tool_desc:
        display = tool_info.get("display_name", req.tool)
        raise HTTPException(
            status_code=400,
            detail=f"{display} is coming soon. Stay tuned!",
        )

    session_id = f"direct_{uuid.uuid4().hex[:8]}"
    config = {"configurable": {"canvas_id": "", "session_id": session_id}}

    # Check if this tool accepts input_images
    sig = inspect.signature(tool_fn.coroutine) if hasattr(tool_fn, 'coroutine') else None
    has_input_images = sig and 'input_images' in sig.parameters if sig else False
    
    # Check if this tool accepts num_images
    has_num_images = sig and 'num_images' in sig.parameters if sig else False
    # Also check args_schema if available
    if not has_num_images and hasattr(tool_fn, 'args_schema') and tool_fn.args_schema:
        schema = tool_fn.args_schema
        # Check if num_images is a field in the schema
        if 'num_images' in schema.__fields__:
            has_num_images = True

    try:
        results = []
        
        # If tool supports batch generation, call it once
        if has_num_images and (req.num_images or 1) > 1:
            call_id = f"call_{uuid.uuid4().hex[:8]}"
            invoke_args = {
                "prompt": req.prompt,
                "aspect_ratio": req.aspect_ratio or "1:1",
                "num_images": req.num_images,
            }
            if has_input_images and req.input_images:
                invoke_args["input_images"] = req.input_images
                
            result = await tool_fn.ainvoke(
                invoke_args,
                config=config,
            )
            
            # Parse multiple image URLs from the tool result string
            # The result string format is: "image generated successfully ![id](url) ![id](url) ..."
            url_matches = re.finditer(r'!\[.*?\]\((http[^\s\)]+)\)', str(result))
            
            for match in url_matches:
                image_url = normalize_file_url(match.group(1))
                results.append({
                    "id": f"gen_{uuid.uuid4().hex[:8]}",
                    "type": "image",
                    "url": image_url,
                    "src": image_url,
                    "prompt": req.prompt,
                    "model": req.model_name or req.tool,
                    "createdAt": datetime.now().isoformat(),
                })
                
            # Fallback if no URLs found but result is not empty (error handling)
            if not results and str(result):
                print(f"Warning: No image URLs found in result: {result}")
                
        else:
            # Legacy loop for tools that don't support batching
            for i in range(req.num_images or 1):
                call_id = f"call_{uuid.uuid4().hex[:8]}"
                invoke_args = {
                    "prompt": req.prompt,
                    "aspect_ratio": req.aspect_ratio or "1:1",
                }
                if has_input_images and req.input_images:
                    invoke_args["input_images"] = req.input_images
                result = await tool_fn.ainvoke(
                    invoke_args,
                    config=config,
                )
                # Parse the image URL from the tool result string
                url_match = re.search(r'(http[^\s\)]+)', str(result))
                image_url = normalize_file_url(url_match.group(1)) if url_match else ""
                results.append({
                    "id": f"gen_{uuid.uuid4().hex[:8]}",
                    "type": "image",
                    "url": image_url,
                    "src": image_url,
                    "prompt": req.prompt,
                    "model": req.model_name or req.tool,
                    "createdAt": datetime.now().isoformat(),
                })
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
):
    """Direct video generation endpoint that invokes a tool by name."""
    tool_info = TOOL_MAPPING.get(tool) or tool_service.tools.get(tool)
    if not tool_info:
        raise HTTPException(status_code=404, detail=f"Tool '{tool}' not found")

    tool_fn = tool_info.get("tool_function")
    if not tool_fn:
        raise HTTPException(status_code=404, detail=f"Tool '{tool}' has no function")

    # Check if stub tool (coming soon)
    tool_desc = getattr(tool_fn, "description", "")
    if "[Coming Soon]" in tool_desc:
        display = tool_info.get("display_name", tool)
        raise HTTPException(
            status_code=400,
            detail=f"{display} is coming soon. Stay tuned!",
        )

    session_id = f"direct_{uuid.uuid4().hex[:8]}"
    config = {"configurable": {"canvas_id": "", "session_id": session_id}}

    try:
        call_id = f"call_{uuid.uuid4().hex[:8]}"
        invoke_args = {
            "prompt": prompt,
            "aspect_ratio": aspect_ratio or "16:9",
        }
        if duration:
            invoke_args["duration"] = int(duration)

        # Check if this tool expects input_images
        sig = inspect.signature(tool_fn.coroutine) if hasattr(tool_fn, 'coroutine') else None
        has_input_images_param = sig and 'input_images' in sig.parameters if sig else False

        if has_input_images_param:
            if source_image and source_image.filename:
                # Save uploaded source image to FILES_DIR
                file_id = generate_file_id()
                ext = source_image.filename.rsplit('.', 1)[-1] if '.' in source_image.filename else 'png'
                filename = f"{file_id}.{ext}"
                file_path = os.path.join(FILES_DIR, filename)
                content = await source_image.read()
                with open(file_path, 'wb') as f:
                    f.write(content)
                invoke_args["input_images"] = [filename]
            else:
                # Check if input_images is required (no default value)
                param = sig.parameters['input_images']
                if param.default is inspect.Parameter.empty:
                    display = tool_info.get("display_name", tool)
                    raise HTTPException(
                        status_code=400,
                        detail=f"{display} requires a source image. Please upload an image and use Image-to-Video mode.",
                    )

        # Auto-confirm for tools that use tool_confirmation_manager (e.g. Veo3)
        async def _auto_confirm(cid: str):
            """Poll until the pending confirmation appears, then confirm it."""
            for _ in range(100):  # up to 10 seconds
                if tool_confirmation_manager.confirm_tool(cid):
                    return
                await asyncio.sleep(0.1)

        asyncio.create_task(_auto_confirm(call_id))

        result = await tool_fn.ainvoke(invoke_args, config=config)

        url_match = re.search(r'(http[^\s\)]+)', str(result))
        video_url = normalize_file_url(url_match.group(1)) if url_match else ""

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
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
