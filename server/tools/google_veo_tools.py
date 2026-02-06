"""
Google Veo 3 Video Generation Tool
Uses Google AI API directly
"""

from typing import Optional
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from pydantic import BaseModel, Field

from tools.video_providers.google_veo_provider import GoogleVeoProvider


class GoogleVeoInputSchema(BaseModel):
    """Input schema for Google Veo 3 video generation"""
    prompt: str = Field(description="The prompt describing the video to generate")
    aspect_ratio: str = Field(default="16:9", description="The aspect ratio of the video")
    duration: int = Field(default=5, description="Duration in seconds (5 or 10)")
    input_images: Optional[list[str]] = Field(default=None, description="Optional input image for image-to-video")


# Initialize provider
_veo_provider = None

def get_veo_provider():
    global _veo_provider
    if _veo_provider is None:
        try:
            _veo_provider = GoogleVeoProvider()
        except Exception:
            pass
    return _veo_provider


@tool(
    "generate_video_by_veo_google",
    description="Generate videos using Google Veo 3. High-fidelity, realistic physics, native audio support.",
    args_schema=GoogleVeoInputSchema,
)
async def generate_video_by_veo_google(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    duration: int = 5,
    input_images: Optional[list[str]] = None,
) -> str:
    """Generate video using Google Veo 3"""
    provider = get_veo_provider()
    if provider is None:
        return "Google API key not configured for Veo. Please ensure GOOGLE_API_KEY is set in your .env file."
    
    try:
        video_url = await provider.generate(
            prompt=prompt,
            model="veo-3",
            aspect_ratio=aspect_ratio,
            duration=duration,
            input_images=input_images,
        )
        return f"Video generated successfully with Google Veo 3: {video_url}"
    except Exception as e:
        return f"Failed to generate video with Google Veo 3: {str(e)}"
