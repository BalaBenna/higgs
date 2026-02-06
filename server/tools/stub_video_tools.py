"""
Stub video generation tools for Higgsfield-parity models.
Each tool routes to Replicate via ReplicateVideoProvider.
"""

from typing import Annotated
from pydantic import BaseModel, Field
from langchain_core.tools import tool, InjectedToolCallId
from langchain_core.runnables import RunnableConfig
from tools.video_providers.replicate_provider import ReplicateVideoProvider
from tools.video_generation.video_canvas_utils import (
    send_video_start_notification,
    process_video_result,
    send_video_error_notification,
)


class StubVideoInputSchema(BaseModel):
    prompt: str = Field(description="The prompt for video generation.")
    aspect_ratio: str = Field(
        default="16:9",
        description="Aspect ratio of the video. Allowed: 1:1, 16:9, 9:16",
    )
    duration: int = Field(
        default=5,
        description="Duration of the video in seconds. Allowed: 5, 10.",
    )
    tool_call_id: Annotated[str, InjectedToolCallId]


async def _generate_video_via_replicate(
    config: RunnableConfig,
    prompt: str,
    model: str,
    model_label: str,
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    """Shared helper for Replicate video generation."""
    ctx = config.get("configurable", {})
    canvas_id = ctx.get("canvas_id", "")
    session_id = ctx.get("session_id", "")
    await send_video_start_notification(
        session_id, f"Generating video with {model_label}..."
    )
    try:
        provider = ReplicateVideoProvider()
        video_url = await provider.generate(
            prompt=prompt,
            model=model,
            aspect_ratio=aspect_ratio,
            duration=duration,
        )
        return await process_video_result(video_url, session_id, canvas_id, model_label)
    except Exception as e:
        await send_video_error_notification(session_id, str(e))
        return f"Video generation failed: {str(e)}"


@tool(
    "generate_video_by_kling_3_jaaz",
    description="Generate high-quality cinematic videos using Kling 3.0. Supports text-to-video and image-to-video with excellent motion quality.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_kling_3_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return await _generate_video_via_replicate(
        config, prompt, "kling-3.0", "Kling 3.0", aspect_ratio, duration
    )


@tool(
    "generate_video_by_grok_imagine_jaaz",
    description="Generate creative videos using Grok Imagine from xAI. Ideal for imaginative and stylized video content.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_grok_imagine_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return await _generate_video_via_replicate(
        config, prompt, "grok-imagine", "Grok Imagine", aspect_ratio, duration
    )


@tool(
    "generate_video_by_kling_motion_control_jaaz",
    description="Generate videos with precise motion control using Kling. Guide camera movement and object trajectories.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_kling_motion_control_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return await _generate_video_via_replicate(
        config, prompt, "kling-motion-control", "Kling Motion Control", aspect_ratio, duration
    )


@tool(
    "generate_video_by_sora_2_jaaz",
    description="Generate cinematic videos using Sora 2 from OpenAI. Best for realistic, high-fidelity video generation.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_sora_2_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return await _generate_video_via_replicate(
        config, prompt, "sora-2", "Sora 2", aspect_ratio, duration
    )


@tool(
    "generate_video_by_wan_2_6_jaaz",
    description="Generate videos using Wan 2.6 from Alibaba. Strong at diverse styles with excellent text and motion rendering.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_wan_2_6_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return await _generate_video_via_replicate(
        config, prompt, "wan-2.6", "Wan 2.6", aspect_ratio, duration
    )


@tool(
    "generate_video_by_kling_avatars_2_jaaz",
    description="Generate AI avatar videos using Kling Avatars 2.0. Create talking head and full-body avatar videos.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_kling_avatars_2_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return await _generate_video_via_replicate(
        config, prompt, "kling-avatars-2.0", "Kling Avatars 2.0", aspect_ratio, duration
    )


@tool(
    "generate_video_by_higgsfield_dop_jaaz",
    description="Generate cinematic depth-of-field videos using Higgsfield DOP. Professional-grade camera effects and bokeh.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_higgsfield_dop_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return await _generate_video_via_replicate(
        config, prompt, "higgsfield-dop", "Higgsfield DOP", aspect_ratio, duration
    )


@tool(
    "generate_video_by_kling_q1_edit_jaaz",
    description="Edit and transform videos using Kling Q1 Edit. AI-powered video editing with prompt-guided changes.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_kling_q1_edit_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    edit_prompt = f"edit video: {prompt}"
    return await _generate_video_via_replicate(
        config, edit_prompt, "kling-3.0", "Kling Q1 Edit", aspect_ratio, duration
    )


@tool(
    "generate_video_by_kling_3_omni_edit_jaaz",
    description="All-in-one video editing using Kling 3.0 Omni Edit. Comprehensive editing with style transfer, effects, and transformations.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_kling_3_omni_edit_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    edit_prompt = f"edit video: {prompt}"
    return await _generate_video_via_replicate(
        config, edit_prompt, "kling-3.0", "Kling 3.0 Omni Edit", aspect_ratio, duration
    )


@tool(
    "generate_video_by_grok_imagine_edit_jaaz",
    description="Edit videos using Grok Imagine Edit from xAI. Creative video editing with AI-powered transformations.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_grok_imagine_edit_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    edit_prompt = f"edit video: {prompt}"
    return await _generate_video_via_replicate(
        config, edit_prompt, "grok-imagine", "Grok Imagine Edit", aspect_ratio, duration
    )


@tool(
    "generate_video_by_seedance_v1_lite_jaaz",
    description="Generate fast, lightweight videos using Seedance v1 Lite from ByteDance. Quick generation with good motion quality.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_seedance_v1_lite_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return await _generate_video_via_replicate(
        config, prompt, "seedance-1.0-lite", "Seedance v1 Lite", aspect_ratio, duration
    )


__all__ = [
    "generate_video_by_kling_3_jaaz",
    "generate_video_by_grok_imagine_jaaz",
    "generate_video_by_kling_motion_control_jaaz",
    "generate_video_by_sora_2_jaaz",
    "generate_video_by_wan_2_6_jaaz",
    "generate_video_by_kling_avatars_2_jaaz",
    "generate_video_by_higgsfield_dop_jaaz",
    "generate_video_by_kling_q1_edit_jaaz",
    "generate_video_by_kling_3_omni_edit_jaaz",
    "generate_video_by_grok_imagine_edit_jaaz",
    "generate_video_by_seedance_v1_lite_jaaz",
]
