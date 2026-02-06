"""
Kling video generation tools via Replicate (kwaivgi/* models).
Each tool has a model-specific Pydantic schema matching the Replicate API.
"""

import os
from typing import Annotated, Optional, List
from pydantic import BaseModel, Field
from langchain_core.tools import tool, InjectedToolCallId
from langchain_core.runnables import RunnableConfig
from tools.video_providers.replicate_provider import ReplicateVideoProvider
from tools.video_generation.video_canvas_utils import (
    send_video_start_notification,
    process_video_result,
    send_video_error_notification,
)
from services.config_service import FILES_DIR
from tools.utils.image_canvas_utils import generate_file_id


# ---------------------------------------------------------------------------
# Shared helper
# ---------------------------------------------------------------------------

async def _resolve_file_url(filename: str) -> str:
    """Turn a local filename into a public URL for Replicate.
    If file is local, upload it to Replicate file hosting."""
    if filename.startswith("http"):
        return filename
    local_path = os.path.join(FILES_DIR, filename)
    if os.path.exists(local_path):
        provider = ReplicateVideoProvider()
        return await provider._upload_file_to_replicate(local_path)
    return filename


async def _generate_kling_video_via_replicate(
    config: RunnableConfig,
    model: str,
    model_label: str,
    prompt: str = "",
    aspect_ratio: str = "16:9",
    duration: int = 5,
    **kwargs,
) -> str:
    """Shared helper for all Kling Replicate video generation tools."""
    ctx = config.get("configurable", {})
    canvas_id = ctx.get("canvas_id", "")
    session_id = ctx.get("session_id", "")
    user_id = ctx.get("user_id", "")

    await send_video_start_notification(
        session_id, f"Generating video with {model_label}..."
    )
    try:
        # Resolve any local file paths to public URLs
        for key in ("start_image", "end_image", "video_url", "audio_url"):
            val = kwargs.get(key)
            if val and not val.startswith("http"):
                kwargs[key] = await _resolve_file_url(val)

        provider = ReplicateVideoProvider()
        video_url = await provider.generate(
            prompt=prompt,
            model=model,
            aspect_ratio=aspect_ratio,
            duration=duration,
            **kwargs,
        )
        return await process_video_result(
            video_url, session_id, canvas_id, model_label,
            user_id=user_id, prompt=prompt, model=model_label,
        )
    except Exception as e:
        await send_video_error_notification(session_id, str(e))
        return f"Video generation failed: {str(e)}"


# ---------------------------------------------------------------------------
# Per-model schemas
# ---------------------------------------------------------------------------

class KlingV26Schema(BaseModel):
    prompt: str = Field(description="Text prompt for video generation.")
    aspect_ratio: str = Field(default="16:9", description="Aspect ratio: 1:1, 16:9, 9:16")
    duration: int = Field(default=5, description="Duration in seconds: 5 or 10")
    negative_prompt: Optional[str] = Field(default=None, description="What to avoid in the video.")
    generate_audio: Optional[bool] = Field(default=None, description="Generate audio for the video.")
    start_image: Optional[str] = Field(default=None, description="Start image filename or URL for image-to-video.")
    tool_call_id: Annotated[str, InjectedToolCallId]


class KlingV25TurboSchema(BaseModel):
    prompt: str = Field(description="Text prompt for video generation.")
    aspect_ratio: str = Field(default="16:9", description="Aspect ratio: 1:1, 16:9, 9:16")
    duration: int = Field(default=5, description="Duration in seconds: 5 or 10")
    guidance_scale: Optional[float] = Field(default=None, description="Guidance scale 0-1.")
    start_image: Optional[str] = Field(default=None, description="Start image for image-to-video.")
    end_image: Optional[str] = Field(default=None, description="End image for interpolation.")
    tool_call_id: Annotated[str, InjectedToolCallId]


class KlingV21MasterSchema(BaseModel):
    prompt: str = Field(description="Text prompt for video generation.")
    aspect_ratio: str = Field(default="16:9", description="Aspect ratio: 1:1, 16:9, 9:16")
    duration: int = Field(default=5, description="Duration in seconds: 5 or 10")
    negative_prompt: Optional[str] = Field(default=None, description="What to avoid.")
    start_image: Optional[str] = Field(default=None, description="Start image for image-to-video.")
    tool_call_id: Annotated[str, InjectedToolCallId]


class KlingV20Schema(BaseModel):
    prompt: str = Field(description="Text prompt for video generation.")
    aspect_ratio: str = Field(default="16:9", description="Aspect ratio: 1:1, 16:9, 9:16")
    duration: int = Field(default=5, description="Duration in seconds: 5 or 10")
    cfg_scale: Optional[float] = Field(default=None, description="CFG scale 0-1.")
    negative_prompt: Optional[str] = Field(default=None, description="What to avoid.")
    start_image: Optional[str] = Field(default=None, description="Start image for image-to-video.")
    tool_call_id: Annotated[str, InjectedToolCallId]


class KlingV16StandardSchema(BaseModel):
    prompt: str = Field(description="Text prompt for video generation.")
    aspect_ratio: str = Field(default="16:9", description="Aspect ratio: 1:1, 16:9, 9:16")
    duration: int = Field(default=5, description="Duration in seconds: 5 or 10")
    cfg_scale: Optional[float] = Field(default=None, description="CFG scale 0-1.")
    negative_prompt: Optional[str] = Field(default=None, description="What to avoid.")
    start_image: Optional[str] = Field(default=None, description="Start image for image-to-video.")
    tool_call_id: Annotated[str, InjectedToolCallId]


class KlingV16ProSchema(BaseModel):
    prompt: str = Field(description="Text prompt for video generation.")
    aspect_ratio: str = Field(default="16:9", description="Aspect ratio: 1:1, 16:9, 9:16")
    duration: int = Field(default=5, description="Duration in seconds: 5 or 10")
    cfg_scale: Optional[float] = Field(default=None, description="CFG scale 0-1.")
    negative_prompt: Optional[str] = Field(default=None, description="What to avoid.")
    start_image: Optional[str] = Field(default=None, description="Start image for image-to-video.")
    end_image: Optional[str] = Field(default=None, description="End image for interpolation.")
    tool_call_id: Annotated[str, InjectedToolCallId]


class KlingV15ProSchema(BaseModel):
    prompt: str = Field(description="Text prompt for video generation.")
    aspect_ratio: str = Field(default="16:9", description="Aspect ratio: 1:1, 16:9, 9:16")
    duration: int = Field(default=5, description="Duration in seconds: 5 or 10")
    cfg_scale: Optional[float] = Field(default=None, description="CFG scale 0-1.")
    negative_prompt: Optional[str] = Field(default=None, description="What to avoid.")
    start_image: Optional[str] = Field(default=None, description="Start image for image-to-video.")
    end_image: Optional[str] = Field(default=None, description="End image for interpolation.")
    tool_call_id: Annotated[str, InjectedToolCallId]


class KlingV21I2VSchema(BaseModel):
    prompt: str = Field(description="Text prompt for motion description.")
    start_image: str = Field(description="Start image filename or URL (required).")
    aspect_ratio: str = Field(default="16:9", description="Aspect ratio: 1:1, 16:9, 9:16")
    duration: int = Field(default=5, description="Duration in seconds: 5 or 10")
    mode: Optional[str] = Field(default="standard", description="Mode: standard or pro.")
    negative_prompt: Optional[str] = Field(default=None, description="What to avoid.")
    end_image: Optional[str] = Field(default=None, description="End image (pro mode only).")
    tool_call_id: Annotated[str, InjectedToolCallId]


class KlingV26MotionControlSchema(BaseModel):
    prompt: str = Field(description="Text prompt describing the motion.")
    start_image: str = Field(description="Start image filename or URL (required).")
    video_url: str = Field(description="Motion reference video filename or URL (required).")
    aspect_ratio: str = Field(default="16:9", description="Aspect ratio: 1:1, 16:9, 9:16")
    duration: int = Field(default=5, description="Duration in seconds: 5 or 10")
    mode: Optional[str] = Field(default="standard", description="Mode: standard or pro.")
    character_orientation: Optional[str] = Field(default=None, description="Character orientation for motion control.")
    tool_call_id: Annotated[str, InjectedToolCallId]


class KlingAvatarV2Schema(BaseModel):
    prompt: str = Field(default="", description="Optional text prompt.")
    start_image: str = Field(description="Avatar portrait image filename or URL (required).")
    audio_url: str = Field(description="Audio file URL or filename (required).")
    aspect_ratio: str = Field(default="16:9", description="Aspect ratio: 1:1, 16:9, 9:16")
    duration: int = Field(default=5, description="Duration in seconds.")
    tool_call_id: Annotated[str, InjectedToolCallId]


class KlingLipSyncSchema(BaseModel):
    prompt: str = Field(default="", description="Optional text prompt.")
    video_url: str = Field(description="Source video filename or URL (required).")
    audio_url: Optional[str] = Field(default=None, description="Audio file URL (for audio-driven lip sync).")
    text: Optional[str] = Field(default=None, description="Text for text-to-speech lip sync.")
    voice_id: Optional[str] = Field(default=None, description="Voice ID for TTS lip sync.")
    voice_speed: Optional[float] = Field(default=None, description="Voice speed for TTS lip sync.")
    tool_call_id: Annotated[str, InjectedToolCallId]


# ---------------------------------------------------------------------------
# Tool definitions
# ---------------------------------------------------------------------------

@tool(
    "generate_video_by_kling_v26_replicate",
    description="Generate video using Kling v2.6 via Replicate. Supports text-to-video and image-to-video with optional audio generation and negative prompts.",
    args_schema=KlingV26Schema,
)
async def generate_video_by_kling_v26_replicate(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
    negative_prompt: Optional[str] = None,
    generate_audio: Optional[bool] = None,
    start_image: Optional[str] = None,
) -> str:
    kwargs = {}
    if negative_prompt:
        kwargs["negative_prompt"] = negative_prompt
    if generate_audio is not None:
        kwargs["generate_audio"] = generate_audio
    if start_image:
        kwargs["start_image"] = start_image
    return await _generate_kling_video_via_replicate(
        config, "kling-v2.6", "Kling v2.6",
        prompt=prompt, aspect_ratio=aspect_ratio, duration=duration, **kwargs,
    )


@tool(
    "generate_video_by_kling_v25_turbo_replicate",
    description="Generate video using Kling v2.5 Turbo via Replicate. Fastest Kling model with guidance scale control and image interpolation support.",
    args_schema=KlingV25TurboSchema,
)
async def generate_video_by_kling_v25_turbo_replicate(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
    guidance_scale: Optional[float] = None,
    start_image: Optional[str] = None,
    end_image: Optional[str] = None,
) -> str:
    kwargs = {}
    if guidance_scale is not None:
        kwargs["guidance_scale"] = guidance_scale
    if start_image:
        kwargs["start_image"] = start_image
    if end_image:
        kwargs["end_image"] = end_image
    return await _generate_kling_video_via_replicate(
        config, "kling-v2.5-turbo", "Kling v2.5 Turbo",
        prompt=prompt, aspect_ratio=aspect_ratio, duration=duration, **kwargs,
    )


@tool(
    "generate_video_by_kling_v21_master_replicate",
    description="Generate video using Kling v2.1 Master via Replicate. Balanced quality video generation with text and image-to-video support.",
    args_schema=KlingV21MasterSchema,
)
async def generate_video_by_kling_v21_master_replicate(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
    negative_prompt: Optional[str] = None,
    start_image: Optional[str] = None,
) -> str:
    kwargs = {}
    if negative_prompt:
        kwargs["negative_prompt"] = negative_prompt
    if start_image:
        kwargs["start_image"] = start_image
    return await _generate_kling_video_via_replicate(
        config, "kling-v2.1-master", "Kling v2.1 Master",
        prompt=prompt, aspect_ratio=aspect_ratio, duration=duration, **kwargs,
    )


@tool(
    "generate_video_by_kling_v20_replicate",
    description="Generate video using Kling v2.0 via Replicate. Supports CFG scale control for text and image-to-video generation.",
    args_schema=KlingV20Schema,
)
async def generate_video_by_kling_v20_replicate(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
    cfg_scale: Optional[float] = None,
    negative_prompt: Optional[str] = None,
    start_image: Optional[str] = None,
) -> str:
    kwargs = {}
    if cfg_scale is not None:
        kwargs["cfg_scale"] = cfg_scale
    if negative_prompt:
        kwargs["negative_prompt"] = negative_prompt
    if start_image:
        kwargs["start_image"] = start_image
    return await _generate_kling_video_via_replicate(
        config, "kling-v2.0", "Kling v2.0",
        prompt=prompt, aspect_ratio=aspect_ratio, duration=duration, **kwargs,
    )


@tool(
    "generate_video_by_kling_v16_standard_replicate",
    description="Generate video using Kling v1.6 Standard via Replicate. Supports CFG scale and reference images for guided generation.",
    args_schema=KlingV16StandardSchema,
)
async def generate_video_by_kling_v16_standard_replicate(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
    cfg_scale: Optional[float] = None,
    negative_prompt: Optional[str] = None,
    start_image: Optional[str] = None,
) -> str:
    kwargs = {}
    if cfg_scale is not None:
        kwargs["cfg_scale"] = cfg_scale
    if negative_prompt:
        kwargs["negative_prompt"] = negative_prompt
    if start_image:
        kwargs["start_image"] = start_image
    return await _generate_kling_video_via_replicate(
        config, "kling-v1.6-standard", "Kling v1.6 Standard",
        prompt=prompt, aspect_ratio=aspect_ratio, duration=duration, **kwargs,
    )


@tool(
    "generate_video_by_kling_v16_pro_replicate",
    description="Generate video using Kling v1.6 Pro via Replicate. High quality with CFG scale, end image interpolation, and 1080p support.",
    args_schema=KlingV16ProSchema,
)
async def generate_video_by_kling_v16_pro_replicate(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
    cfg_scale: Optional[float] = None,
    negative_prompt: Optional[str] = None,
    start_image: Optional[str] = None,
    end_image: Optional[str] = None,
) -> str:
    kwargs = {}
    if cfg_scale is not None:
        kwargs["cfg_scale"] = cfg_scale
    if negative_prompt:
        kwargs["negative_prompt"] = negative_prompt
    if start_image:
        kwargs["start_image"] = start_image
    if end_image:
        kwargs["end_image"] = end_image
    return await _generate_kling_video_via_replicate(
        config, "kling-v1.6-pro", "Kling v1.6 Pro",
        prompt=prompt, aspect_ratio=aspect_ratio, duration=duration, **kwargs,
    )


@tool(
    "generate_video_by_kling_v15_pro_replicate",
    description="Generate video using Kling v1.5 Pro via Replicate. Supports CFG scale and end image for interpolation.",
    args_schema=KlingV15ProSchema,
)
async def generate_video_by_kling_v15_pro_replicate(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
    cfg_scale: Optional[float] = None,
    negative_prompt: Optional[str] = None,
    start_image: Optional[str] = None,
    end_image: Optional[str] = None,
) -> str:
    kwargs = {}
    if cfg_scale is not None:
        kwargs["cfg_scale"] = cfg_scale
    if negative_prompt:
        kwargs["negative_prompt"] = negative_prompt
    if start_image:
        kwargs["start_image"] = start_image
    if end_image:
        kwargs["end_image"] = end_image
    return await _generate_kling_video_via_replicate(
        config, "kling-v1.5-pro", "Kling v1.5 Pro",
        prompt=prompt, aspect_ratio=aspect_ratio, duration=duration, **kwargs,
    )


@tool(
    "generate_video_by_kling_v21_i2v_replicate",
    description="Generate video from an image using Kling v2.1 (Image-to-Video) via Replicate. Requires a start image. Supports standard and pro modes.",
    args_schema=KlingV21I2VSchema,
)
async def generate_video_by_kling_v21_i2v_replicate(
    prompt: str,
    start_image: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
    mode: Optional[str] = "standard",
    negative_prompt: Optional[str] = None,
    end_image: Optional[str] = None,
) -> str:
    kwargs = {"start_image": start_image}
    if mode:
        kwargs["mode"] = mode
    if negative_prompt:
        kwargs["negative_prompt"] = negative_prompt
    if end_image:
        kwargs["end_image"] = end_image
    return await _generate_kling_video_via_replicate(
        config, "kling-v2.1-i2v", "Kling v2.1 (I2V)",
        prompt=prompt, aspect_ratio=aspect_ratio, duration=duration, **kwargs,
    )


@tool(
    "generate_video_by_kling_v26_motion_control_replicate",
    description="Generate video with motion control using Kling v2.6 via Replicate. Requires a start image and a motion reference video.",
    args_schema=KlingV26MotionControlSchema,
)
async def generate_video_by_kling_v26_motion_control_replicate(
    prompt: str,
    start_image: str,
    video_url: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
    mode: Optional[str] = "standard",
    character_orientation: Optional[str] = None,
) -> str:
    kwargs = {
        "start_image": start_image,
        "video_url": video_url,
    }
    if mode:
        kwargs["mode"] = mode
    if character_orientation:
        kwargs["character_orientation"] = character_orientation
    return await _generate_kling_video_via_replicate(
        config, "kling-v2.6-motion-control", "Kling v2.6 Motion Control",
        prompt=prompt, aspect_ratio=aspect_ratio, duration=duration, **kwargs,
    )


@tool(
    "generate_video_by_kling_avatar_v2_replicate",
    description="Generate avatar talking-head video using Kling Avatar v2 via Replicate. Requires a portrait image and an audio file.",
    args_schema=KlingAvatarV2Schema,
)
async def generate_video_by_kling_avatar_v2_replicate(
    start_image: str,
    audio_url: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    prompt: str = "",
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    kwargs = {
        "start_image": start_image,
        "audio_url": audio_url,
    }
    return await _generate_kling_video_via_replicate(
        config, "kling-avatar-v2", "Kling Avatar v2",
        prompt=prompt, aspect_ratio=aspect_ratio, duration=duration, **kwargs,
    )


@tool(
    "generate_video_by_kling_lip_sync_replicate",
    description="Apply lip sync to a video using Kling Lip Sync via Replicate. Requires a video and either audio or text with voice_id.",
    args_schema=KlingLipSyncSchema,
)
async def generate_video_by_kling_lip_sync_replicate(
    video_url: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    prompt: str = "",
    audio_url: Optional[str] = None,
    text: Optional[str] = None,
    voice_id: Optional[str] = None,
    voice_speed: Optional[float] = None,
) -> str:
    kwargs = {"video_url": video_url}
    if audio_url:
        kwargs["audio_url"] = audio_url
    if text:
        kwargs["text"] = text
    if voice_id:
        kwargs["voice_id"] = voice_id
    if voice_speed is not None:
        kwargs["voice_speed"] = voice_speed
    return await _generate_kling_video_via_replicate(
        config, "kling-lip-sync", "Kling Lip Sync",
        prompt=prompt, **kwargs,
    )


__all__ = [
    "generate_video_by_kling_v26_replicate",
    "generate_video_by_kling_v25_turbo_replicate",
    "generate_video_by_kling_v21_master_replicate",
    "generate_video_by_kling_v20_replicate",
    "generate_video_by_kling_v16_standard_replicate",
    "generate_video_by_kling_v16_pro_replicate",
    "generate_video_by_kling_v15_pro_replicate",
    "generate_video_by_kling_v21_i2v_replicate",
    "generate_video_by_kling_v26_motion_control_replicate",
    "generate_video_by_kling_avatar_v2_replicate",
    "generate_video_by_kling_lip_sync_replicate",
]
