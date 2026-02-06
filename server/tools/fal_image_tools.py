"""
Fal.ai Image Generation Tools
Unified tools for all Fal.ai supported image models
"""

from typing import Optional
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from pydantic import BaseModel, Field

from tools.utils.image_generation_core import generate_image_with_provider


class FalImageInputSchema(BaseModel):
    """Input schema for Fal.ai image generation"""
    prompt: str = Field(description="The prompt describing the image to generate")
    aspect_ratio: str = Field(default="1:1", description="The aspect ratio of the image (1:1, 16:9, 9:16, 4:3, 3:4)")
    input_images: Optional[list[str]] = Field(default=None, description="Optional input images for editing or reference")


# ============================================
# GENERIC FAL.AI IMAGE GENERATOR
# ============================================

async def generate_image_by_fal(
    prompt: str,
    config: RunnableConfig,
    model: str,
    aspect_ratio: str = "1:1",
    input_images: Optional[list[str]] = None,
) -> str:
    """Generic Fal.ai image generation helper"""
    ctx = config.get("configurable", {})
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="fal",
        model=model,
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        input_images=input_images,
    )


# ============================================
# NANO BANANA PRO (Google Gemini 3)
# ============================================

@tool(
    "generate_image_by_nano_banana_fal",
    description="Generate high-quality images using Google's Nano Banana Pro (Gemini 3) model via Fal.ai.",
    args_schema=FalImageInputSchema,
)
async def generate_image_by_nano_banana_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_image_by_fal(prompt, config, "nano-banana-pro", aspect_ratio, input_images)


# ============================================
# SEEDREAM (ByteDance)
# ============================================

@tool(
    "generate_image_by_seedream_fal",
    description="Generate images using ByteDance Seedream 4.5 model via Fal.ai.",
    args_schema=FalImageInputSchema,
)
async def generate_image_by_seedream_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_image_by_fal(prompt, config, "seedream-4.5", aspect_ratio, input_images)


# ============================================
# FLUX.2 (Black Forest Labs)
# ============================================

@tool(
    "generate_image_by_flux2_fal",
    description="Generate images using FLUX.2 Pro model via Fal.ai. Production-grade outputs.",
    args_schema=FalImageInputSchema,
)
async def generate_image_by_flux2_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_image_by_fal(prompt, config, "flux-2-pro", aspect_ratio, input_images)


@tool(
    "generate_image_by_flux2_max_fal",
    description="Generate images using FLUX.2 Max model via Fal.ai.",
    args_schema=FalImageInputSchema,
)
async def generate_image_by_flux2_max_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_image_by_fal(prompt, config, "flux-2-max", aspect_ratio, input_images)


@tool(
    "generate_image_by_flux_kontext_fal",
    description="Generate images using FLUX Kontext Pro via Fal.ai.",
    args_schema=FalImageInputSchema,
)
async def generate_image_by_flux_kontext_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_image_by_fal(prompt, config, "flux-kontext-pro", aspect_ratio, input_images)


@tool(
    "generate_image_by_flux_kontext_max_fal",
    description="Generate images using FLUX Kontext Max via Fal.ai.",
    args_schema=FalImageInputSchema,
)
async def generate_image_by_flux_kontext_max_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_image_by_fal(prompt, config, "flux-kontext-max", aspect_ratio, input_images)


# ============================================
# OTHER MODELS
# ============================================

@tool(
    "generate_image_by_midjourney_fal",
    description="Generate images using Midjourney model via Fal.ai.",
    args_schema=FalImageInputSchema,
)
async def generate_image_by_midjourney_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_image_by_fal(prompt, config, "midjourney", aspect_ratio, input_images)


@tool(
    "generate_image_by_ideogram_fal",
    description="Generate images using Ideogram 3 via Fal.ai.",
    args_schema=FalImageInputSchema,
)
async def generate_image_by_ideogram_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_image_by_fal(prompt, config, "ideogram-3", aspect_ratio, input_images)


@tool(
    "generate_image_by_recraft_fal",
    description="Generate images using Recraft V3 via Fal.ai.",
    args_schema=FalImageInputSchema,
)
async def generate_image_by_recraft_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_image_by_fal(prompt, config, "recraft-v3", aspect_ratio, input_images)


@tool(
    "generate_image_by_reve_fal",
    description="Generate images using Reve AI via Fal.ai.",
    args_schema=FalImageInputSchema,
)
async def generate_image_by_reve_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_image_by_fal(prompt, config, "reve", aspect_ratio, input_images)


@tool(
    "generate_image_by_higgsfield_soul_fal",
    description="Generate images using Higgsfield Soul via Fal.ai.",
    args_schema=FalImageInputSchema,
)
async def generate_image_by_higgsfield_soul_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_image_by_fal(prompt, config, "higgsfield-soul", aspect_ratio, input_images)


@tool(
    "generate_image_by_z_image_fal",
    description="Generate images using Z-Image via Fal.ai.",
    args_schema=FalImageInputSchema,
)
async def generate_image_by_z_image_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_image_by_fal(prompt, config, "z-image", aspect_ratio, input_images)


@tool(
    "generate_image_by_kling_image_fal",
    description="Generate images using Kling Q1 Image via Fal.ai.",
    args_schema=FalImageInputSchema,
)
async def generate_image_by_kling_image_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_image_by_fal(prompt, config, "kling-q1-image", aspect_ratio, input_images)


@tool(
    "generate_image_by_wan_image_fal",
    description="Generate images using Alibaba Wan 2.0 Image via Fal.ai.",
    args_schema=FalImageInputSchema,
)
async def generate_image_by_wan_image_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_image_by_fal(prompt, config, "wan-2.2-image", aspect_ratio, input_images)
