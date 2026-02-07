"""
Hailuo (MiniMax) video generation tool via Replicate.
Uses minimax/video-01-live model.
"""

from typing import Annotated, Optional
from pydantic import BaseModel, Field
from langchain_core.tools import tool, InjectedToolCallId
from langchain_core.runnables import RunnableConfig
from tools.video_providers.replicate_provider import ReplicateVideoProvider
from tools.video_generation.video_canvas_utils import (
    send_video_start_notification,
    process_video_result,
    send_video_error_notification,
)


class HailuoO2Schema(BaseModel):
    prompt: str = Field(description="Text prompt for video generation.")
    aspect_ratio: str = Field(
        default="16:9",
        description="Aspect ratio: 1:1, 16:9, 9:16",
    )
    duration: int = Field(
        default=5,
        description="Duration in seconds: 5 or 10",
    )
    tool_call_id: Annotated[str, InjectedToolCallId]


@tool(
    "generate_video_by_hailuo_o2_replicate",
    description="Generate video using Minimax Hailuo O2 via Replicate. High-quality video generation with text-to-video support.",
    args_schema=HailuoO2Schema,
)
async def generate_video_by_hailuo_o2_replicate(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    ctx = config.get("configurable", {})
    canvas_id = ctx.get("canvas_id", "")
    session_id = ctx.get("session_id", "")
    user_id = ctx.get("user_id", "")

    await send_video_start_notification(
        session_id, "Generating video with Hailuo O2..."
    )
    try:
        provider = ReplicateVideoProvider()
        video_url = await provider.generate(
            prompt=prompt,
            model="hailuo-o2",
            aspect_ratio=aspect_ratio,
            duration=duration,
        )
        return await process_video_result(
            video_url, session_id, canvas_id, "Hailuo O2",
            user_id=user_id, prompt=prompt, model="Hailuo O2",
        )
    except Exception as e:
        await send_video_error_notification(session_id, str(e))
        return f"Video generation failed: {str(e)}"


__all__ = ["generate_video_by_hailuo_o2_replicate"]
