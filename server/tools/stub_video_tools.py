"""
Stub video generation tools for models that are coming soon.
Each tool returns a "coming soon" message when invoked directly.
"""

from typing import Annotated
from pydantic import BaseModel, Field
from langchain_core.tools import tool, InjectedToolCallId
from langchain_core.runnables import RunnableConfig


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


@tool(
    "generate_video_by_kling_3_jaaz",
    description="[Coming Soon] Generate videos using Kling 3.0 model.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_kling_3_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return "Kling 3.0 is coming soon. Stay tuned!"


@tool(
    "generate_video_by_grok_imagine_jaaz",
    description="[Coming Soon] Generate videos using Grok Imagine model.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_grok_imagine_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return "Grok Imagine is coming soon. Stay tuned!"


@tool(
    "generate_video_by_kling_motion_control_jaaz",
    description="[Coming Soon] Generate videos with motion control using Kling.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_kling_motion_control_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return "Kling Motion Control is coming soon. Stay tuned!"


@tool(
    "generate_video_by_sora_2_jaaz",
    description="[Coming Soon] Generate videos using Sora 2 model.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_sora_2_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return "Sora 2 is coming soon. Stay tuned!"


@tool(
    "generate_video_by_wan_2_6_jaaz",
    description="[Coming Soon] Generate videos using Wan 2.6 model.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_wan_2_6_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return "Wan 2.6 is coming soon. Stay tuned!"


@tool(
    "generate_video_by_kling_avatars_2_jaaz",
    description="[Coming Soon] Generate avatar videos using Kling Avatars 2.0.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_kling_avatars_2_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return "Kling Avatars 2.0 is coming soon. Stay tuned!"


@tool(
    "generate_video_by_higgsfield_dop_jaaz",
    description="[Coming Soon] Generate videos using Higgsfield DOP model.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_higgsfield_dop_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return "Higgsfield DOP is coming soon. Stay tuned!"


@tool(
    "generate_video_by_kling_q1_edit_jaaz",
    description="[Coming Soon] Edit videos using Kling Q1 Edit model.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_kling_q1_edit_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return "Kling Q1 Edit is coming soon. Stay tuned!"


@tool(
    "generate_video_by_kling_3_omni_edit_jaaz",
    description="[Coming Soon] Edit videos using Kling 3.0 Omni Edit model.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_kling_3_omni_edit_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return "Kling 3.0 Omni Edit is coming soon. Stay tuned!"


@tool(
    "generate_video_by_grok_imagine_edit_jaaz",
    description="[Coming Soon] Edit videos using Grok Imagine Edit model.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_grok_imagine_edit_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return "Grok Imagine Edit is coming soon. Stay tuned!"


@tool(
    "generate_video_by_seedance_v1_lite_jaaz",
    description="[Coming Soon] Generate videos using Seedance v1 lite model.",
    args_schema=StubVideoInputSchema,
)
async def generate_video_by_seedance_v1_lite_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "16:9",
    duration: int = 5,
) -> str:
    return "Seedance v1 lite is coming soon. Stay tuned!"


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
