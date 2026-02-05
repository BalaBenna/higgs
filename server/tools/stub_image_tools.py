"""
Stub image generation tools for models that are coming soon.
Each tool returns a "coming soon" message when invoked directly.
"""

from typing import Annotated
from pydantic import BaseModel, Field
from langchain_core.tools import tool, InjectedToolCallId
from langchain_core.runnables import RunnableConfig


class StubImageInputSchema(BaseModel):
    prompt: str = Field(description="The prompt for image generation.")
    aspect_ratio: str = Field(
        default="1:1",
        description="Aspect ratio of the image. Allowed: 1:1, 16:9, 4:3, 3:4, 9:16",
    )
    tool_call_id: Annotated[str, InjectedToolCallId]


@tool(
    "generate_image_by_higgsfield_soul_jaaz",
    description="[Coming Soon] Generate images using Higgsfield Soul model.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_higgsfield_soul_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    return "Higgsfield Soul is coming soon. Stay tuned!"


@tool(
    "generate_image_by_higgsfield_popcorn_jaaz",
    description="[Coming Soon] Generate images using Higgsfield Popcorn model.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_higgsfield_popcorn_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    return "Higgsfield Popcorn is coming soon. Stay tuned!"


@tool(
    "generate_image_by_nano_banana_pro_jaaz",
    description="[Coming Soon] Generate images using Nano Banana Pro model.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_nano_banana_pro_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    return "Nano Banana Pro is coming soon. Stay tuned!"


@tool(
    "generate_image_by_z_image_jaaz",
    description="[Coming Soon] Generate images using Z-Image model.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_z_image_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    return "Z-Image is coming soon. Stay tuned!"


@tool(
    "generate_image_by_kling_q1_image_jaaz",
    description="[Coming Soon] Generate images using Kling Q1 Image model.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_kling_q1_image_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    return "Kling Q1 Image is coming soon. Stay tuned!"


@tool(
    "generate_image_by_wan_2_2_image_jaaz",
    description="[Coming Soon] Generate images using Wan 2.2 Image model.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_wan_2_2_image_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    return "Wan 2.2 Image is coming soon. Stay tuned!"


@tool(
    "generate_image_by_reve_jaaz",
    description="[Coming Soon] Generate images using Reve model.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_reve_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    return "Reve is coming soon. Stay tuned!"


@tool(
    "generate_image_by_topaz_jaaz",
    description="[Coming Soon] Generate images using Topaz model.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_topaz_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    return "Topaz is coming soon. Stay tuned!"


@tool(
    "generate_image_by_nano_banana_pro_inpaint_jaaz",
    description="[Coming Soon] Inpaint images using Nano Banana Pro Inpaint model.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_nano_banana_pro_inpaint_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    return "Nano Banana Pro Inpaint is coming soon. Stay tuned!"


@tool(
    "generate_image_by_nano_banana_inpaint_jaaz",
    description="[Coming Soon] Inpaint images using Nano Banana Inpaint model.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_nano_banana_inpaint_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    return "Nano Banana Inpaint is coming soon. Stay tuned!"


@tool(
    "generate_image_by_product_placement_jaaz",
    description="[Coming Soon] Generate product placement images.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_product_placement_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    return "Product Placement is coming soon. Stay tuned!"


__all__ = [
    "generate_image_by_higgsfield_soul_jaaz",
    "generate_image_by_higgsfield_popcorn_jaaz",
    "generate_image_by_nano_banana_pro_jaaz",
    "generate_image_by_z_image_jaaz",
    "generate_image_by_kling_q1_image_jaaz",
    "generate_image_by_wan_2_2_image_jaaz",
    "generate_image_by_reve_jaaz",
    "generate_image_by_topaz_jaaz",
    "generate_image_by_nano_banana_pro_inpaint_jaaz",
    "generate_image_by_nano_banana_inpaint_jaaz",
    "generate_image_by_product_placement_jaaz",
]
