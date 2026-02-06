"""
Fal.ai Video Generation Tools
Unified tools for all Fal.ai supported video models
"""

from typing import Optional
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from pydantic import BaseModel, Field

from tools.video_providers.fal_provider import FalVideoProvider


class FalVideoInputSchema(BaseModel):
    """Input schema for Fal.ai video generation"""
    prompt: str = Field(description="The prompt describing the video to generate")
    aspect_ratio: str = Field(default="16:9", description="The aspect ratio of the video")
    duration: int = Field(default=5, description="Duration in seconds (5 or 10)")
    input_images: Optional[list[str]] = Field(default=None, description="Optional input images for image-to-video")


# Initialize provider
_fal_video_provider = None

def get_fal_provider():
    global _fal_video_provider
    if _fal_video_provider is None:
        try:
            _fal_video_provider = FalVideoProvider()
        except Exception:
            pass
    return _fal_video_provider


async def generate_video_by_fal(
    prompt: str,
    model: str,
    aspect_ratio: str = "16:9",
    duration: int = 5,
    input_images: Optional[list[str]] = None,
) -> str:
    """Generic Fal.ai video generation helper"""
    provider = get_fal_provider()
    if provider is None:
        return "Fal.ai API key not configured. Please add FAL_API_KEY to your .env file."
    
    video_url = await provider.generate(
        prompt=prompt,
        model=model,
        aspect_ratio=aspect_ratio,
        duration=duration,
        input_images=input_images,
    )
    return f"Video generated successfully: {video_url}"


# ============================================
# KLING MODELS (Kuaishou)
# ============================================

@tool(
    "generate_video_by_kling_fal",
    description="Generate videos using Kling 3.0/2.6 via Fal.ai. High-quality, cinematic video.",
    args_schema=FalVideoInputSchema,
)
async def generate_video_by_kling_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    duration: int = 5,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_video_by_fal(prompt, "kling-3.0", aspect_ratio, duration, input_images)


@tool(
    "generate_video_by_kling_motion_fal",
    description="Generate videos with motion control using Kling Motion Control via Fal.ai.",
    args_schema=FalVideoInputSchema,
)
async def generate_video_by_kling_motion_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    duration: int = 5,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_video_by_fal(prompt, "kling-motion-control", aspect_ratio, duration, input_images)


@tool(
    "generate_video_by_kling_avatars_fal",
    description="Generate avatar videos using Kling Avatars 2.0 via Fal.ai.",
    args_schema=FalVideoInputSchema,
)
async def generate_video_by_kling_avatars_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    duration: int = 5,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_video_by_fal(prompt, "kling-avatars-2.0", aspect_ratio, duration, input_images)


# ============================================
# VEO (Google)
# ============================================

@tool(
    "generate_video_by_veo_fal",
    description="Generate videos using Google Veo 3.1 via Fal.ai. High-fidelity with audio sync.",
    args_schema=FalVideoInputSchema,
)
async def generate_video_by_veo_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    duration: int = 5,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_video_by_fal(prompt, "veo-3.1", aspect_ratio, duration, input_images)


# ============================================
# SEEDANCE (ByteDance)
# ============================================

@tool(
    "generate_video_by_seedance_fal",
    description="Generate videos using ByteDance Seedance 1.5 Pro via Fal.ai.",
    args_schema=FalVideoInputSchema,
)
async def generate_video_by_seedance_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    duration: int = 5,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_video_by_fal(prompt, "seedance-1.5-pro", aspect_ratio, duration, input_images)


# ============================================
# WAN (Alibaba)
# ============================================

@tool(
    "generate_video_by_wan_fal",
    description="Generate videos using Alibaba Wan 2.6 via Fal.ai. Up to 15 seconds, 1080p.",
    args_schema=FalVideoInputSchema,
)
async def generate_video_by_wan_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    duration: int = 5,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_video_by_fal(prompt, "wan-2.6", aspect_ratio, duration, input_images)


# ============================================
# HAILUO (MiniMax)
# ============================================

@tool(
    "generate_video_by_hailuo_fal",
    description="Generate videos using MiniMax Hailuo 02 via Fal.ai. Affordable high-quality.",
    args_schema=FalVideoInputSchema,
)
async def generate_video_by_hailuo_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    duration: int = 5,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_video_by_fal(prompt, "hailuo-02", aspect_ratio, duration, input_images)


# ============================================
# HIGGSFIELD DOP
# ============================================

@tool(
    "generate_video_by_higgsfield_dop_fal",
    description="Generate cinematic videos using Higgsfield DOP via Fal.ai. Camera control.",
    args_schema=FalVideoInputSchema,
)
async def generate_video_by_higgsfield_dop_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    duration: int = 5,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_video_by_fal(prompt, "higgsfield-dop", aspect_ratio, duration, input_images)


# ============================================
# GROK (xAI)
# ============================================

@tool(
    "generate_video_by_grok_fal",
    description="Generate videos using xAI Grok Imagine via Fal.ai.",
    args_schema=FalVideoInputSchema,
)
async def generate_video_by_grok_fal(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    duration: int = 5,
    input_images: Optional[list[str]] = None,
) -> str:
    return await generate_video_by_fal(prompt, "grok-imagine", aspect_ratio, duration, input_images)
