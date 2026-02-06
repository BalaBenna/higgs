"""
Direct API Image Generation Tools
For OpenAI and Google models using direct API access
"""

from typing import Optional
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from pydantic import BaseModel, Field

from tools.utils.image_generation_core import generate_image_with_provider


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
# TOPAZ IMAGE ENHANCER
# ============================================

@tool(
    "enhance_image_by_topaz",
    description="Enhance and upscale images using Topaz AI. 4x resolution increase with detail recovery.",
    args_schema=DirectImageInputSchema,
)
async def enhance_image_by_topaz(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    """Enhance image using Topaz Labs API"""
    if not input_images or len(input_images) == 0:
        return "Error: Topaz Enhancer requires an input image to upscale."
    
    ctx = config.get("configurable", {})
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="fal",  # Topaz via Fal.ai
        model="topaz-photo-ai",
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        input_images=input_images,
    )
