"""
Character Router - API endpoints for persistent AI character management.
Characters are stored in Supabase and can generate style preview images.
"""

import asyncio
import re
import uuid
import inspect
import traceback
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from middleware.auth import get_current_user
from services import supabase_service
from services.db_service import db_service
from services.tool_service import TOOL_MAPPING, tool_service

router = APIRouter(prefix="/api/character", tags=["character"])

# Tools that natively support reference-based generation (character consistency).
# Only these tools should receive input_images for character previews.
# Other tools use input_images for inpainting/editing which requires masks.
REFERENCE_CAPABLE_TOOLS = {
    "generate_image_by_flux_kontext_pro_jaaz",
    "generate_image_by_flux_kontext_pro_replicate",
    "generate_image_by_flux_kontext_max",
    "generate_image_by_flux_kontext_max_replicate",
}


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class CharacterCreate(BaseModel):
    name: str
    style: str = "Realistic"
    description: str = ""
    reference_images: List[str] = []


class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    style: Optional[str] = None
    description: Optional[str] = None
    reference_images: Optional[List[str]] = None


# ---------------------------------------------------------------------------
# Style preview prompts used when auto-generating character images
# ---------------------------------------------------------------------------

PREVIEW_STYLES = [
    {
        "label": "Portrait",
        "prompt": "Professional portrait photo of {name}, clean background, studio lighting, sharp focus",
    },
    {
        "label": "Cinematic",
        "prompt": "Cinematic movie still of {name}, dramatic lighting, shallow depth of field, widescreen composition",
    },
    {
        "label": "Artistic",
        "prompt": "Oil painting style artistic portrait of {name}, rich vibrant colors, textured brushstrokes",
    },
    {
        "label": "Action",
        "prompt": "{name} in a dynamic action pose, full body shot, energetic, motion blur background",
    },
    {
        "label": "Fantasy",
        "prompt": "{name} in a fantasy setting, magical atmosphere, detailed environment, glowing particles",
    },
]


# ---------------------------------------------------------------------------
# CRUD endpoints
# ---------------------------------------------------------------------------

@router.post("/create")
async def create_character(
    body: CharacterCreate, user_id: str = Depends(get_current_user)
):
    """Create a new character persisted in Supabase."""
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="Character name is required")

    # Convert reference_images from plain URL strings to {url, filename} objects
    ref_images = []
    for url in body.reference_images:
        filename = url.rsplit("/", 1)[-1] if "/" in url else "reference.png"
        ref_images.append({"url": url, "filename": filename})

    character = await supabase_service.create_character(
        user_id=user_id,
        name=body.name.strip(),
        style=body.style,
        description=body.description,
        reference_images=ref_images,
    )
    return character


@router.get("/list")
async def list_characters(user_id: str = Depends(get_current_user)):
    """List all characters belonging to the authenticated user."""
    return await supabase_service.list_characters(user_id)


@router.get("/{character_id}")
async def get_character(character_id: str, user_id: str = Depends(get_current_user)):
    """Get a specific character (must belong to user)."""
    character = await supabase_service.get_character(character_id, user_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return character


@router.put("/{character_id}")
async def update_character(
    character_id: str,
    body: CharacterUpdate,
    user_id: str = Depends(get_current_user),
):
    """Update character fields. Only supplied fields are changed."""
    updates = {}
    if body.name is not None:
        updates["name"] = body.name.strip()
    if body.style is not None:
        updates["style"] = body.style
    if body.description is not None:
        updates["description"] = body.description
    if body.reference_images is not None:
        ref_images = []
        for url in body.reference_images:
            filename = url.rsplit("/", 1)[-1] if "/" in url else "reference.png"
            ref_images.append({"url": url, "filename": filename})
        updates["reference_images"] = ref_images

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    updates["updated_at"] = datetime.utcnow().isoformat()
    result = await supabase_service.update_character(character_id, user_id, updates)
    if not result:
        raise HTTPException(status_code=404, detail="Character not found")
    return result


@router.delete("/{character_id}")
async def delete_character(
    character_id: str, user_id: str = Depends(get_current_user)
):
    """Delete a character."""
    deleted = await supabase_service.delete_character(character_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Character not found")
    return {"success": True}


# ---------------------------------------------------------------------------
# Reference-image management
# ---------------------------------------------------------------------------

class AddImagesRequest(BaseModel):
    urls: List[str]


class GenerateRequest(BaseModel):
    tool_id: Optional[str] = None
    media_type: str = "image"  # "image" or "video"
    prompt: Optional[str] = None
    aspect_ratio: str = "1:1"


@router.post("/{character_id}/images")
async def add_reference_images(
    character_id: str,
    body: AddImagesRequest,
    user_id: str = Depends(get_current_user),
):
    """Append one or more reference-image URLs to a character."""
    character = await supabase_service.get_character(character_id, user_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    existing = character.get("reference_images") or []
    for url in body.urls:
        filename = url.rsplit("/", 1)[-1] if "/" in url else "reference.png"
        existing.append({"url": url, "filename": filename})

    result = await supabase_service.update_character(
        character_id, user_id, {"reference_images": existing, "updated_at": datetime.utcnow().isoformat()}
    )
    return result


# ---------------------------------------------------------------------------
# Generated content for a character
# ---------------------------------------------------------------------------

@router.get("/{character_id}/generations")
async def get_character_generations(
    character_id: str, user_id: str = Depends(get_current_user)
):
    """Return all generated_content rows linked to this character."""
    # Verify ownership
    character = await supabase_service.get_character(character_id, user_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    sb = await supabase_service.get_supabase()
    result = (
        await sb.table("generated_content")
        .select("*")
        .eq("user_id", user_id)
        .contains("metadata", {"character_id": character_id})
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


# ---------------------------------------------------------------------------
# Auto-generate style preview images
# ---------------------------------------------------------------------------

def _extract_media_url(result_text: str) -> str:
    """Extract the first media URL (image or video) from a tool result string."""
    # Markdown image: ![alt](url)
    md = re.search(r"!\[.*?\]\(((?:https?://|/api/file/)[^\s\)]+)\)", result_text)
    if md:
        return re.sub(r"http://localhost:\d+", "", md.group(1))
    # Markdown link: [text](url)
    link = re.search(r"\[.*?\]\(((?:https?://|/api/file/)[^\s\)]+)\)", result_text)
    if link:
        return re.sub(r"http://localhost:\d+", "", link.group(1))
    # Plain URL
    url = re.search(r"((?:https?://|/api/file/)[^\s\)]+)", result_text)
    if url:
        return re.sub(r"http://localhost:\d+", "", url.group(1))
    return ""


@router.post("/{character_id}/generate-previews")
async def generate_previews(
    character_id: str,
    body: Optional[GenerateRequest] = None,
    user_id: str = Depends(get_current_user),
):
    """
    Generate 4-5 style-variant images/videos for a character using its reference
    image(s). Runs generations in parallel via asyncio.gather.
    Accepts optional tool_id and media_type in request body.
    """
    character = await supabase_service.get_character(character_id, user_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    ref_images = character.get("reference_images") or []
    input_image_urls = [img["url"] for img in ref_images if img.get("url")]

    # Allow caller to pick the model, fall back to GPT Image
    media_type = (body.media_type if body else "image") or "image"
    aspect_ratio = (body.aspect_ratio if body else "1:1") or "1:1"
    tool_id = (
        body.tool_id
        if body and body.tool_id
        else "generate_image_by_gpt_image_openai"
    )
    custom_prompt = body.prompt if body else None
    tool_info = TOOL_MAPPING.get(tool_id) or tool_service.tools.get(tool_id)
    if not tool_info:
        raise HTTPException(
            status_code=503,
            detail="Image generation tool not available. Check provider configuration.",
        )
    tool_fn = tool_info.get("tool_function")
    if not tool_fn:
        raise HTTPException(status_code=503, detail="Tool function missing")

    char_name = character.get("name", "the character")

    async def _generate_one(style_info: dict) -> dict | None:
        """Generate a single style-variant image."""
        prompt = style_info["prompt"].format(name=char_name)
        if character.get("style"):
            prompt += f". Art style: {character['style']}."
        if character.get("description"):
            prompt += f" {character['description']}."
        # Only add reference-identity instruction for tools that actually
        # receive the reference images; for other tools this text is
        # misleading and can trigger content-moderation filters.
        if tool_id in REFERENCE_CAPABLE_TOOLS and input_image_urls:
            prompt += " Maintain the exact same face, features, and identity as the reference image."

        session_id = f"charprev_{uuid.uuid4().hex[:8]}"
        config = {
            "configurable": {
                "canvas_id": "",
                "session_id": session_id,
                "user_id": user_id,
                "feature_type": "character_preview",
            }
        }
        try:
            invoke_args: dict = {"prompt": prompt}
            sig = (
                inspect.signature(tool_fn.coroutine)
                if hasattr(tool_fn, "coroutine")
                else None
            )
            # Only pass input_images to tools that support reference-based
            # generation. Other tools (e.g. OpenAI) treat input_images as
            # an inpainting/edit request which fails with character JPEGs.
            if (
                sig
                and "input_images" in sig.parameters
                and input_image_urls
                and tool_id in REFERENCE_CAPABLE_TOOLS
            ):
                invoke_args["input_images"] = input_image_urls
            if sig and "start_image" in sig.parameters and input_image_urls:
                invoke_args["start_image"] = input_image_urls[0]
            if sig and "aspect_ratio" in sig.parameters:
                invoke_args["aspect_ratio"] = aspect_ratio
            if sig and "duration" in sig.parameters:
                invoke_args["duration"] = 5

            call_id = f"call_{uuid.uuid4().hex[:8]}"
            tool_call = {
                "args": invoke_args,
                "name": tool_id,
                "type": "tool_call",
                "id": call_id,
            }
            print(f"[CharGen] Invoking tool '{tool_id}' for '{style_info['label']}' with args keys: {list(invoke_args.keys())}")
            result = await tool_fn.ainvoke(tool_call, config=config)
            result_text = result.content if hasattr(result, "content") else str(result)
            print(f"[CharGen] Tool result for '{style_info['label']}': {result_text[:300]}")
            image_url = _extract_media_url(result_text)
            print(f"[CharGen] Extracted URL for '{style_info['label']}': {image_url or '(empty)'}")

            if image_url:
                # The tool's save_image_to_canvas already inserted into
                # generated_content, but without character_id in metadata.
                # Patch the existing row so the character gallery query can
                # find it via .contains("metadata", {"character_id": ...}).
                try:
                    storage_path = image_url
                    if image_url.startswith("/api/file/"):
                        storage_path = image_url.replace("/api/file/", "", 1)
                    elif "supabase" in image_url and "/storage/v1/" in image_url:
                        storage_path = f"{user_id}/{image_url.rsplit('/', 1)[-1]}"

                    sb = await supabase_service.get_supabase()
                    existing = (
                        await sb.table("generated_content")
                        .select("id, metadata")
                        .eq("user_id", user_id)
                        .eq("storage_path", storage_path)
                        .limit(1)
                        .execute()
                    )
                    if existing.data:
                        row = existing.data[0]
                        meta = row.get("metadata") or {}
                        if isinstance(meta, str):
                            import json
                            meta = json.loads(meta)
                        meta["character_id"] = character_id
                        meta["style_label"] = style_info["label"]
                        meta["feature_type"] = "character_preview"
                        await (
                            sb.table("generated_content")
                            .update({"metadata": meta})
                            .eq("id", row["id"])
                            .execute()
                        )
                    else:
                        # No existing row — insert fresh
                        await db_service.insert_generated_content(
                            {
                                "user_id": user_id,
                                "type": media_type,
                                "storage_path": storage_path,
                                "prompt": prompt,
                                "model": tool_id,
                                "metadata": {
                                    "public_url": image_url,
                                    "feature_type": "character_preview",
                                    "character_id": character_id,
                                    "style_label": style_info["label"],
                                },
                            }
                        )
                except Exception as persist_err:
                    print(f"Warning: failed to persist preview: {persist_err}")

                return {
                    "url": image_url,
                    "style": style_info["label"],
                    "prompt": prompt,
                    "type": media_type,
                }
        except Exception as e:
            print(f"[CharGen] ⚠️ Preview generation failed ({style_info['label']}): {e}")
            traceback.print_exc()
        return None

    # If a custom prompt was provided, generate a single item instead of styles
    if custom_prompt:
        single_style = {"label": "Custom", "prompt": custom_prompt}
        result = await _generate_one(single_style)
        items = [result] if result else []
    else:
        # Run all style generations in parallel
        tasks = [_generate_one(s) for s in PREVIEW_STYLES]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        items = [r for r in results if r is not None]

    return {"character_id": character_id, "media_type": media_type, "images": items}
