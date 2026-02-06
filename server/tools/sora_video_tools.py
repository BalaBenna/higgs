"""
OpenAI Sora 2 Video Generation Tool
"""

from typing import Optional
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from pydantic import BaseModel, Field

from tools.video_providers.sora_provider import SoraVideoProvider


class SoraVideoInputSchema(BaseModel):
    """Input schema for Sora 2 video generation"""
    prompt: str = Field(description="The prompt describing the video to generate")
    aspect_ratio: str = Field(default="16:9", description="The aspect ratio of the video")
    duration: int = Field(default=5, description="Duration in seconds (5, 10, or 20)")
    input_images: Optional[list[str]] = Field(default=None, description="Optional input image for image-to-video")


# Initialize provider
_sora_provider = None

def get_sora_provider():
    global _sora_provider
    if _sora_provider is None:
        try:
            _sora_provider = SoraVideoProvider()
        except Exception:
            pass
    return _sora_provider


@tool(
    "generate_video_by_sora_openai",
    description="Generate videos using OpenAI Sora 2. Premium quality, realistic physics, up to 20 seconds.",
    args_schema=SoraVideoInputSchema,
)
async def generate_video_by_sora_openai(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    duration: int = 5,
    input_images: Optional[list[str]] = None,
) -> str:
    """Generate video using OpenAI Sora 2"""
    provider = get_sora_provider()
    if provider is None:
        return "OpenAI API key not configured for Sora. Please ensure OPENAI_API_KEY is set in your .env file."
    
    try:
        video_url = await provider.generate(
            prompt=prompt,
            model="sora-2",
            aspect_ratio=aspect_ratio,
            duration=duration,
            input_images=input_images,
        )
        return f"Video generated successfully with Sora 2: {video_url}"
    except Exception as e:
        return f"Failed to generate video with Sora 2: {str(e)}"
