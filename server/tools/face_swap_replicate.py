"""
Face swap tool using Replicate's codeplugtech/face-swap model.
Takes a swap_image (source face) and input_image (target) and produces a face-swapped result.
"""

import os
import traceback
from typing import Annotated, Optional

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import InjectedToolCallId, tool
from pydantic import BaseModel, Field

from services.config_service import FILES_DIR, config_service
from tools.utils.image_utils import (
    generate_image_id,
    get_image_info_and_save,
    process_input_image,
)
from tools.utils.image_canvas_utils import save_image_to_canvas
from common import DEFAULT_PORT
from utils.http_client import HttpClient

FACE_SWAP_MODEL_VERSION = "278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34"


class FaceSwapInputSchema(BaseModel):
    prompt: str = Field(
        default="",
        description="Optional additional instructions for the face swap.",
    )
    aspect_ratio: str = Field(
        default="1:1",
        description="Aspect ratio (unused by this model, kept for compatibility).",
    )
    input_images: list[str] | None = Field(
        default=None,
        description="Two image filenames: [swap_image (source face), input_image (target)].",
    )
    tool_call_id: Annotated[str, InjectedToolCallId]


async def _run_face_swap(
    swap_image_url: str,
    input_image_url: str,
) -> str:
    """
    Call Replicate's codeplugtech/face-swap model and return the output image URL.
    """
    config = config_service.app_config.get("replicate", {})
    api_key = config.get("api_key", "")
    if not api_key:
        raise ValueError("Replicate API key is not configured")

    url = "https://api.replicate.com/v1/predictions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Prefer": "wait",
    }
    data = {
        "version": FACE_SWAP_MODEL_VERSION,
        "input": {
            "swap_image": swap_image_url,
            "input_image": input_image_url,
        },
    }

    async with HttpClient.create_aiohttp() as session:
        print(f"🔄 Face Swap Replicate API request: codeplugtech/face-swap")
        async with session.post(url, headers=headers, json=data) as response:
            json_data = await response.json()
            print(f"🔄 Face Swap Replicate API response status: {json_data.get('status')}")

    output = json_data.get("output", "")
    if not output:
        detail = json_data.get("detail", "")
        error = json_data.get("error", "")
        raise Exception(
            f"Face swap failed: {detail or error or 'no output returned'}"
        )

    return output


@tool(
    "face_swap_replicate",
    description="Swap faces between two images using AI. Upload a source face photo and a target image. Uses codeplugtech/face-swap model on Replicate.",
    args_schema=FaceSwapInputSchema,
)
async def face_swap_replicate(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
    input_images: list[str] | None = None,
) -> str:
    """Swap faces using Replicate codeplugtech/face-swap model."""
    ctx = config.get("configurable", {})
    canvas_id = ctx.get("canvas_id", "")
    session_id = ctx.get("session_id", "")

    if not input_images or len(input_images) < 2:
        raise ValueError(
            "Face swap requires exactly 2 images: [source face, target image]"
        )

    # Process input images to data URLs (base64)
    swap_image_url = await process_input_image(input_images[0])
    input_image_url = await process_input_image(input_images[1])

    if not swap_image_url or not input_image_url:
        raise ValueError("Failed to process one or both input images")

    try:
        # Call the Replicate face swap model
        output_url = await _run_face_swap(swap_image_url, input_image_url)

        # Download and save the result
        image_id = generate_image_id()
        mime_type, width, height, extension = await get_image_info_and_save(
            output_url, os.path.join(FILES_DIR, f"{image_id}")
        )
        filename = f"{image_id}.{extension}"

        # Save to canvas
        image_url = await save_image_to_canvas(
            session_id,
            canvas_id,
            filename,
            mime_type,
            width,
            height,
            prompt=prompt or "Face swap",
            model="codeplugtech/face-swap",
            provider="replicate",
            aspect_ratio=aspect_ratio,
        )

        if image_url.startswith("http"):
            return f"image generated successfully ![image_id: {filename}]({image_url})"
        return f"image generated successfully ![image_id: {filename}](http://localhost:{DEFAULT_PORT}{image_url})"

    except Exception as e:
        print(f"Error in face_swap_replicate: {e}")
        traceback.print_exc()
        raise


__all__ = ["face_swap_replicate"]
