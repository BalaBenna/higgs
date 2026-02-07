"""
Unified feature endpoint for specialized AI operations like face swap,
inpaint, relight, upscale, etc.
"""

import os
import re
import uuid
import inspect
import traceback
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.tool_service import TOOL_MAPPING, tool_service
from services.config_service import FILES_DIR

router = APIRouter(prefix="/api")


def normalize_file_url(url: str) -> str:
    return re.sub(r'http://localhost:\d+', '', url)


# Dispatch table: feature_type -> (tool_id, prompt_template)
# {prompt} is replaced with user prompt, {direction} with params.light_direction, etc.
FEATURE_DISPATCH = {
    "face_swap": {
        "tool_id": "generate_image_by_gpt_image_openai",
        "prompt_template": "Swap the face from the first image onto the person in the second image. Keep the original pose, lighting, and background. {prompt}",
    },
    "character_swap": {
        "tool_id": "generate_image_by_gpt_image_openai",
        "prompt_template": "Replace the character in the target image with the character from the reference image. Maintain the scene, pose, and lighting. {prompt}",
    },
    "inpaint": {
        "tool_id": "generate_image_by_gpt_image_openai",
        "prompt_template": "{prompt}",
    },
    "relight": {
        "tool_id": "generate_image_by_gpt_image_openai",
        "prompt_template": "Relight this image with {direction} lighting at {intensity} intensity. Use {quality} light quality. {prompt}",
    },
    "upscale": {
        "tool_id": "generate_image_by_gpt_image_openai",
        "prompt_template": "Enhance and upscale this image to higher resolution. Improve fine details, textures, and sharpness while maintaining the original composition. Scale factor: {scale}x. {prompt}",
    },
    "skin_enhance": {
        "tool_id": "generate_image_by_gpt_image_openai",
        "prompt_template": "Enhance the skin in this portrait. Smooth skin texture naturally, reduce blemishes, and improve skin tone while keeping it photorealistic. {prompt}",
    },
    "background_replace": {
        "tool_id": "generate_image_by_gpt_image_openai",
        "prompt_template": "Replace the background of this image with: {prompt}. Keep the main subject perfectly intact.",
    },
    "remove_objects": {
        "tool_id": "generate_image_by_gpt_image_openai",
        "prompt_template": "Remove the following from this image: {prompt}. Fill in the area naturally.",
    },
    "ai_enhance": {
        "tool_id": "generate_image_by_gpt_image_openai",
        "prompt_template": "Enhance this image: improve color balance, contrast, sharpness, and overall quality. Strength: {strength}. {prompt}",
    },
    "style_transfer": {
        "tool_id": "generate_image_by_flux_kontext_pro_replicate",
        "prompt_template": "Transform this image into {style} style. {prompt}",
    },
    "smart_crop": {
        "tool_id": "generate_image_by_gpt_image_openai",
        "prompt_template": "Intelligently crop and reframe this image for {aspect_ratio} aspect ratio. Focus on the main subject. {prompt}",
    },
}


class FeatureRequest(BaseModel):
    feature_type: str
    input_images: List[str] = []
    prompt: str = ""
    params: dict = {}


@router.post("/generate/feature")
async def generate_feature(req: FeatureRequest):
    """Unified feature endpoint for specialized AI operations."""
    dispatch = FEATURE_DISPATCH.get(req.feature_type)
    if not dispatch:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown feature type: '{req.feature_type}'. Available: {list(FEATURE_DISPATCH.keys())}",
        )

    tool_id = dispatch["tool_id"]
    tool_info = TOOL_MAPPING.get(tool_id) or tool_service.tools.get(tool_id)
    if not tool_info:
        raise HTTPException(status_code=404, detail=f"Tool '{tool_id}' not found")

    tool_fn = tool_info.get("tool_function")
    if not tool_fn:
        raise HTTPException(status_code=404, detail=f"Tool '{tool_id}' has no function")

    # Build the prompt from template
    template = dispatch["prompt_template"]
    format_vars = {"prompt": req.prompt}
    format_vars.update(req.params)
    try:
        final_prompt = template.format(**{k: format_vars.get(k, '') for k in
                                          _extract_format_keys(template)})
    except (KeyError, IndexError):
        final_prompt = template.replace("{prompt}", req.prompt)

    session_id = f"feature_{uuid.uuid4().hex[:8]}"
    config = {"configurable": {"canvas_id": "", "session_id": session_id}}

    try:
        call_id = f"call_{uuid.uuid4().hex[:8]}"
        invoke_args = {
            "prompt": final_prompt.strip(),
            "aspect_ratio": req.params.get("aspect_ratio", "1:1"),
            "tool_call_id": call_id,
        }

        # Pass input_images if the tool supports it
        sig = inspect.signature(tool_fn.coroutine) if hasattr(tool_fn, 'coroutine') else None
        has_input_images = sig and 'input_images' in sig.parameters if sig else False
        if has_input_images and req.input_images:
            invoke_args["input_images"] = req.input_images

        result = await tool_fn.ainvoke(invoke_args, config=config)

        url_match = re.search(r'(http[^\s\)]+)', str(result))
        image_url = normalize_file_url(url_match.group(1)) if url_match else ""

        return {
            "id": f"feat_{uuid.uuid4().hex[:8]}",
            "type": "image",
            "url": image_url,
            "src": image_url,
            "prompt": req.prompt,
            "feature_type": req.feature_type,
            "createdAt": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


def _extract_format_keys(template: str) -> list[str]:
    """Extract {key} placeholders from a format string."""
    import string
    formatter = string.Formatter()
    return [field_name for _, field_name, _, _ in formatter.parse(template) if field_name]
