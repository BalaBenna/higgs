"""
Direct API Image Generation Tools
For OpenAI and Google models using direct API access
"""

import os
import traceback
from typing import Optional
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from pydantic import BaseModel, Field

from tools.utils.image_generation_core import generate_image_with_provider
from tools.utils.image_utils import get_image_info_and_save, generate_image_id, process_input_image
from tools.utils.image_canvas_utils import save_image_to_canvas
from services.config_service import config_service, FILES_DIR
from common import DEFAULT_PORT
from utils.http_client import HttpClient


class DirectImageInputSchema(BaseModel):
    """Input schema for direct API image generation"""
    prompt: str = Field(description="The prompt describing the image to generate")
    aspect_ratio: str = Field(default="1:1", description="The aspect ratio (1:1, 16:9, 9:16, 4:3)")
    input_images: Optional[list[str]] = Field(default=None, description="Optional input images for editing")


# ============================================
# OPENAI GPT IMAGE (DALL-E 3)
# ============================================

@tool(
    "generate_image_by_gpt_image_openai",
    description="Generate images using OpenAI GPT Image / DALL-E 3. High-quality, instruction-following.",
    args_schema=DirectImageInputSchema,
)
async def generate_image_by_gpt_image_openai(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    """Generate image using OpenAI API directly"""
    ctx = config.get("configurable", {})
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="openai",
        model="gpt-image-1",
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        input_images=input_images,
    )


# ============================================
# GOOGLE IMAGEN 3
# ============================================

@tool(
    "generate_image_by_imagen_google",
    description="Generate images using Google Imagen 3. Photorealistic, high-quality outputs.",
    args_schema=DirectImageInputSchema,
)
async def generate_image_by_imagen_google(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    """Generate image using Google AI API directly"""
    ctx = config.get("configurable", {})
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="google-ai",
        model="imagen-3.0-generate-001",
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        input_images=input_images,
    )


# ============================================
# TOPAZ IMAGE ENHANCER (via Replicate)
# ============================================

class TopazUpscaleInputSchema(BaseModel):
    """Input schema for Topaz image upscaling"""
    input_images: list[str] = Field(description="The image(s) to upscale. Only the first image is used.")
    prompt: str = Field(default="upscale", description="Unused for upscaling, kept for schema compatibility")
    upscale_factor: str = Field(default="4x", description="Upscale factor: 1x, 2x, or 4x")
    face_enhancement: bool = Field(default=True, description="Enable face enhancement")
    output_format: str = Field(default="png", description="Output format: png or jpeg")


@tool(
    "enhance_image_by_topaz",
    description="Enhance and upscale images using Topaz Labs AI via Replicate. Supports 1x/2x/4x resolution increase with detail recovery and optional face enhancement. Requires an input image.",
    args_schema=TopazUpscaleInputSchema,
)
async def enhance_image_by_topaz(
    input_images: list[str],
    config: RunnableConfig,
    prompt: str = "upscale",
    upscale_factor: str = "4x",
    face_enhancement: bool = True,
    output_format: str = "png",
) -> str:
    """Enhance image using Topaz Labs via Replicate API"""
    if not input_images or len(input_images) == 0:
        return "Error: Topaz Enhancer requires an input image to upscale."

    ctx = config.get("configurable", {})
    canvas_id = ctx.get("canvas_id", "")
    session_id = ctx.get("session_id", "")

    # Get Replicate API key
    replicate_config = config_service.app_config.get("replicate", {})
    api_key = replicate_config.get("api_key", "")
    if not api_key:
        return "Error: Replicate API key is not configured. Set REPLICATE_API_KEY or configure it in settings."

    try:
        # Process input image (convert local path to data URI if needed)
        processed_image = await process_input_image(input_images[0])
        if not processed_image:
            return f"Error: Could not process input image: {input_images[0]}"

        # Call Replicate API for topazlabs/image-upscale
        url = "https://api.replicate.com/v1/models/topazlabs/image-upscale/predictions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Prefer": "wait",
        }
        data = {
            "input": {
                "image": processed_image,
                "upscale_factor": upscale_factor,
                "face_enhancement": face_enhancement,
                "output_format": output_format,
            }
        }

        print(f"🔬 Topaz upscale request: factor={upscale_factor}, face_enhancement={face_enhancement}")

        async with HttpClient.create_aiohttp() as session:
            async with session.post(url, headers=headers, json=data) as response:
                res = await response.json()
                print(f"🔬 Topaz upscale response status: {response.status}")

        # Extract output URL from response
        output_url = res.get("output", "")
        if not output_url:
            detail = res.get("detail", "")
            error_msg = res.get("error", "")
            return f"Error: Topaz upscale failed: {detail or error_msg or 'no output URL in response'}"

        # Save the upscaled image
        image_id = generate_image_id()
        file_path_without_ext = os.path.join(FILES_DIR, image_id)
        mime_type, width, height, extension = await get_image_info_and_save(
            output_url, file_path_without_ext
        )
        filename = f"{image_id}.{extension}"

        # Save to canvas
        image_url = await save_image_to_canvas(
            session_id, canvas_id, filename, mime_type, width, height
        )

        return f"image generated successfully ![image_id: {filename}](http://localhost:{DEFAULT_PORT}{image_url})"

    except Exception as e:
        print(f"Error in Topaz upscale: {e}")
        traceback.print_exc()
        return f"Error: Topaz upscale failed: {str(e)}"
