from typing import Annotated, Optional
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from tools.video_generation.video_generation_core import generate_video_with_provider


class GenerateVideoByGrokImagineInputSchema(BaseModel):
    prompt: str = Field(
        description="Required. The prompt for video generation. Describe what you want to see in the video in detail."
    )
    aspect_ratio: str = Field(
        default="16:9",
        description="Optional. The aspect ratio of the video. Allowed values: 1:1, 16:9, 9:16",
    )
    duration: int = Field(
        default=5,
        description="Optional. The duration of the video in seconds. Use 5 by default. Allowed values: 5, 10.",
    )
    resolution: str = Field(
        default="1080p",
        description="Optional. Video resolution. Allowed values: 480p, 720p, 1080p. Default is 1080p.",
    )
    input_images: Optional[list[str]] = Field(
        default=None,
        description="Optional. Images to use as reference or starting frame for image-to-video generation. Pass a list of image_id here, e.g. ['im_jurheut7.png'].",
    )


@tool(
    "generate_video_by_grok_imagine_xai",
    description="Generate creative and imaginative videos using xAI's Grok Imagine model. Direct integration with xAI API for high-quality, stylized video generation with optional image-to-video capabilities.",
    args_schema=GenerateVideoByGrokImagineInputSchema,
)
async def generate_video_by_grok_imagine_xai(
    prompt: str,
    config: RunnableConfig,
    aspect_ratio: str = "16:9",
    duration: int = 5,
    resolution: str = "1080p",
    input_images: Optional[list[str]] = None,
) -> str:
    """
    Generate a video using xAI Grok Imagine model
    """
    ctx = config.get('configurable', {})
    canvas_id = ctx.get('canvas_id', '')
    session_id = ctx.get('session_id', '')
    tool_call_id = ctx.get('tool_call_id', '')

    print(
        f'🛠️ Grok Imagine Video Generation - canvas_id: {canvas_id}, session_id: {session_id}'
    )

    return await generate_video_with_provider(
        prompt=prompt,
        resolution=resolution,
        duration=duration,
        aspect_ratio=aspect_ratio,
        model="grok-imagine",
        tool_call_id=tool_call_id,
        config=config,
        input_images=input_images,
        camera_fixed=True,
    )


# Export the tool for easy import
__all__ = ["generate_video_by_grok_imagine_xai"]
