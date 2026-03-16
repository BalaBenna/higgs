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
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from services.tool_service import TOOL_MAPPING, tool_service
from services.config_service import FILES_DIR
from services.db_service import db_service
from services import supabase_service
from middleware.auth import get_current_user

router = APIRouter(prefix="/api")


def normalize_file_url(url: str) -> str:
    return re.sub(r"http://localhost:\d+", "", url)


def extract_media_url(result_text: str) -> str:
    markdown_match = re.search(
        r"!\[.*?\]\(((?:https?://|/api/file/)[^\s\)]+)\)", result_text
    )
    if markdown_match:
        return normalize_file_url(markdown_match.group(1))

    url_match = re.search(r"((?:https?://|/api/file/)[^\s\)]+)", result_text)
    if url_match:
        return normalize_file_url(url_match.group(1))

    return ""


# Dispatch table: feature_type -> (tool_id, prompt_template)
# {prompt} is replaced with user prompt, {direction} with params.light_direction, etc.
FEATURE_DISPATCH = {
    "face_swap": {
        "tool_id": "face_swap_replicate",
        "prompt_template": "{prompt}",
    },
    "character_swap": {
        "tool_id": "generate_image_by_flux_kontext_pro_replicate",
        "prompt_template": "Replace the main person/character in this image with a different person while keeping the exact same pose, scene, background, and lighting. {prompt}",
    },
    "inpaint": {
        "tool_id": "generate_image_by_gpt_image_openai",
        "prompt_template": "{prompt}",
    },
    "relight": {
        "tool_id": "generate_image_by_gpt_image_openai",
        "prompt_template": "ONLY adjust the lighting in this image. Do NOT change the person's face, identity, features, body, clothing, hairstyle, background, or any other detail. Keep EVERYTHING exactly the same — only modify the light direction, shadows, and highlights. Apply {direction} lighting at {intensity}/10 intensity with {quality} light quality. {prompt}",
    },
    "upscale": {
        "tool_id": "enhance_image_by_topaz",
        "prompt_template": "upscale",
    },
    "skin_enhance": {
        "tool_id": "generate_image_by_gpt_image_openai",
        "prompt_template": "ONLY enhance the skin in this portrait. Do NOT change the person's face, facial features, identity, expression, eyes, nose, mouth, hair, clothing, pose, background, or any other detail. Keep EVERYTHING exactly the same — only improve the skin quality: {prompt}",
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
    "video_face_swap": {
        "tool_id": "generate_image_by_gpt_image_openai",
        "prompt_template": "Generate a video with this person's face applied naturally. Maintain expressions and lip movement. {prompt}",
    },
    "soul_id_character": {
        "tool_id": "generate_image_by_gpt_image_openai",
        "prompt_template": "Generate a consistent character based on the reference image. Maintain the same face, features, and identity. {prompt}",
    },
    "creative_upscale": {
        "tool_id": "creative_upscale_by_recraft_replicate",
        "prompt_template": "upscale",
    },
}


class FeatureRequest(BaseModel):
    feature_type: str
    input_images: List[str] = []
    prompt: str = ""
    params: dict = {}
    character_id: Optional[str] = None
    tool_id: Optional[str] = None


@router.post("/generate/feature")
async def generate_feature(
    req: FeatureRequest, user_id: str = Depends(get_current_user)
):
    """Unified feature endpoint for specialized AI operations."""
    print(f"🔧 Feature request: type={req.feature_type}, images={len(req.input_images)}, params={req.params}", flush=True)

    # If a character_id is provided, fetch the character and prepend its
    # reference images + enrich the prompt with character context.
    if req.character_id:
        try:
            character = await supabase_service.get_character(req.character_id, user_id)
            if character:
                ref_imgs = character.get("reference_images") or []
                ref_urls = [img["url"] for img in ref_imgs if img.get("url")]
                req.input_images = ref_urls + req.input_images
                char_ctx = f"Character: {character.get('name', '')}."
                if character.get("style"):
                    char_ctx += f" Style: {character['style']}."
                if character.get("description"):
                    char_ctx += f" {character['description']}."
                char_ctx += " Maintain the exact same face, features, and identity as the reference image."
                req.prompt = f"{char_ctx} {req.prompt}".strip()
        except Exception as char_err:
            print(f"Warning: could not load character {req.character_id}: {char_err}")

    dispatch = FEATURE_DISPATCH.get(req.feature_type)
    if not dispatch:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown feature type: '{req.feature_type}'. Available: {list(FEATURE_DISPATCH.keys())}",
        )

    tool_id = req.tool_id or dispatch["tool_id"]
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
        final_prompt = template.format(
            **{k: format_vars.get(k, "") for k in _extract_format_keys(template)}
        )
    except (KeyError, IndexError):
        final_prompt = template.replace("{prompt}", req.prompt)

    session_id = f"feature_{uuid.uuid4().hex[:8]}"
    config = {
        "configurable": {
            "canvas_id": "",
            "session_id": session_id,
            "user_id": user_id,
            "feature_type": req.feature_type,
        }
    }

    try:
        call_id = f"call_{uuid.uuid4().hex[:8]}"
        invoke_args = {
            "prompt": final_prompt.strip(),
        }

        # Pass input_images if the tool supports it
        sig = (
            inspect.signature(tool_fn.coroutine)
            if hasattr(tool_fn, "coroutine")
            else None
        )
        has_input_images = sig and "input_images" in sig.parameters if sig else False
        if has_input_images and req.input_images:
            images = req.input_images
            # For character_swap, the frontend sends [source_character, target_scene].
            # Flux Kontext Pro only uses the first image (input_image), so we reverse
            # the order so the target scene (to be edited) is passed as input_image.
            if req.feature_type == "character_swap" and len(images) >= 2:
                images = [images[1]]
            invoke_args["input_images"] = images

        # Fallback: pass singular input_image if the tool uses that param name
        has_input_image = sig and "input_image" in sig.parameters if sig else False
        if has_input_image and not has_input_images and req.input_images:
            invoke_args["input_image"] = req.input_images[0]

        # Fallback: pass "image" if the tool uses that param name (e.g. Seededit)
        has_image = sig and "image" in sig.parameters if sig else False
        if has_image and not has_input_images and not has_input_image and req.input_images:
            invoke_args["image"] = req.input_images

        # Pass upscale-specific params if the tool supports them
        if req.params.get("upscale_factor"):
            if sig and "upscale_factor" in sig.parameters:
                invoke_args["upscale_factor"] = req.params.get("upscale_factor")
        if "face_enhancement" in req.params:
            if sig and "face_enhancement" in sig.parameters:
                invoke_args["face_enhancement"] = req.params.get("face_enhancement")
        if req.params.get("output_format"):
            if sig and "output_format" in sig.parameters:
                invoke_args["output_format"] = req.params.get("output_format")
        if req.params.get("enhance_model"):
            if sig and "enhance_model" in sig.parameters:
                invoke_args["enhance_model"] = req.params.get("enhance_model")

        # Pass aspect_ratio for image generation tools
        if req.params.get("aspect_ratio"):
            invoke_args["aspect_ratio"] = req.params.get("aspect_ratio")
        elif sig and "aspect_ratio" in sig.parameters and "aspect_ratio" not in invoke_args:
            invoke_args["aspect_ratio"] = "1:1"

        print(f"🔧 Feature invoke: tool={tool_id}, args_keys={list(invoke_args.keys())}", flush=True)

        # Use ToolCall format so InjectedToolCallId is handled correctly
        tool_call = {
            "args": invoke_args,
            "name": tool_id,
            "type": "tool_call",
            "id": call_id,
        }
        result = await tool_fn.ainvoke(tool_call, config=config)
        # ToolCall invocation returns a ToolMessage; extract the content string
        result_text = result.content if hasattr(result, "content") else str(result)
        print(f"🔧 Feature result: {result_text[:200]}", flush=True)

        image_url = extract_media_url(result_text)

        if image_url:
            # Ensure a generated_content record exists (tool may have already inserted one)
            try:
                storage_path = image_url
                if image_url.startswith("/api/file/"):
                    storage_path = image_url.replace("/api/file/", "", 1)
                elif "supabase" in image_url and "/storage/v1/" in image_url:
                    storage_path = f"{user_id}/{image_url.rsplit('/', 1)[-1]}"
                already = await db_service.content_exists_by_storage_path(
                    user_id, storage_path
                )
                if not already:
                    content_metadata = {
                        "public_url": image_url,
                        "feature_type": req.feature_type,
                    }
                    if req.character_id:
                        content_metadata["character_id"] = req.character_id
                    if req.input_images:
                        content_metadata["input_images"] = req.input_images
                    await db_service.insert_generated_content(
                        {
                            "user_id": user_id,
                            "type": "image",
                            "storage_path": storage_path,
                            "prompt": req.prompt,
                            "model": tool_id,
                            "metadata": content_metadata,
                        }
                    )
                else:
                    # Record was already inserted by the tool — patch in feature_type
                    await db_service.update_content_feature_type(
                        user_id, storage_path, req.feature_type
                    )
            except Exception as persist_err:
                print(
                    f"Warning: Failed to persist feature-generated content: {persist_err}"
                )

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
        print(f"❌ Feature error: {type(e).__name__}: {e}", flush=True)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


def _extract_format_keys(template: str) -> list[str]:
    """Extract {key} placeholders from a format string."""
    import string

    formatter = string.Formatter()
    return [
        field_name for _, field_name, _, _ in formatter.parse(template) if field_name
    ]
