"""
Stub image generation tools for Higgsfield-parity models.
Each tool routes to a real provider (Replicate) via generate_image_with_provider.
"""

from typing import Annotated
from pydantic import BaseModel, Field
from langchain_core.tools import tool, InjectedToolCallId
from langchain_core.runnables import RunnableConfig
from tools.utils.image_generation_core import generate_image_with_provider


class StubImageInputSchema(BaseModel):
    prompt: str = Field(description="The prompt for image generation.")
    aspect_ratio: str = Field(
        default="1:1",
        description="Aspect ratio of the image. Allowed: 1:1, 16:9, 4:3, 3:4, 9:16",
    )
    tool_call_id: Annotated[str, InjectedToolCallId]


@tool(
    "generate_image_by_higgsfield_soul_jaaz",
    description="Generate ultra-realistic images using Higgsfield Soul model. Best for portraits, fashion, and photorealistic scenes.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_higgsfield_soul_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    ctx = config.get("configurable", {})
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="replicate",
        model="black-forest-labs/flux-kontext-max",
        prompt=prompt,
        aspect_ratio=aspect_ratio,
    )


@tool(
    "generate_image_by_higgsfield_popcorn_jaaz",
    description="Generate creative images using Higgsfield Popcorn model. Ideal for storyboards and imaginative visuals.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_higgsfield_popcorn_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    ctx = config.get("configurable", {})
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="replicate",
        model="black-forest-labs/flux-kontext-pro",
        prompt=prompt,
        aspect_ratio=aspect_ratio,
    )


@tool(
    "generate_image_by_nano_banana_pro_jaaz",
    description="Generate high-speed, high-quality images using Nano Banana Pro. Optimized for fast generation with excellent detail.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_nano_banana_pro_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    ctx = config.get("configurable", {})
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="replicate",
        model="google/imagen-4",
        prompt=prompt,
        aspect_ratio=aspect_ratio,
    )


@tool(
    "generate_image_by_z_image_jaaz",
    description="Generate best-in-class 4K images using Z-Image. Excellent for scenes, landscapes, and detailed illustrations.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_z_image_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    ctx = config.get("configurable", {})
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="replicate",
        model="recraft-ai/recraft-v3",
        prompt=prompt,
        aspect_ratio=aspect_ratio,
    )


@tool(
    "generate_image_by_kling_q1_image_jaaz",
    description="Generate images using Kling Q1 Image model. Great for high-fidelity image generation with strong composition.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_kling_q1_image_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    ctx = config.get("configurable", {})
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="replicate",
        model="ideogram-ai/ideogram-v2-turbo",
        prompt=prompt,
        aspect_ratio=aspect_ratio,
    )


@tool(
    "generate_image_by_wan_2_2_image_jaaz",
    description="Generate images using Wan 2.2 Image model from Alibaba. Strong at text rendering and artistic styles.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_wan_2_2_image_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    ctx = config.get("configurable", {})
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="replicate",
        model="black-forest-labs/flux-1.1-pro",
        prompt=prompt,
        aspect_ratio=aspect_ratio,
    )


@tool(
    "generate_image_by_reve_jaaz",
    description="Generate artistic images using Reve model. Excels at creative, stylized, and abstract visuals.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_reve_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    ctx = config.get("configurable", {})
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="replicate",
        model="recraft-ai/recraft-v3",
        prompt=prompt,
        aspect_ratio=aspect_ratio,
    )


@tool(
    "generate_image_by_topaz_jaaz",
    description="Generate enhanced, upscaled images using Topaz. Best for high-resolution output and image enhancement.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_topaz_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    ctx = config.get("configurable", {})
    enhanced_prompt = f"ultra high resolution, enhanced detail, upscaled: {prompt}"
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="replicate",
        model="philz1337x/clarity-upscaler",
        prompt=enhanced_prompt,
        aspect_ratio=aspect_ratio,
    )


@tool(
    "generate_image_by_nano_banana_pro_inpaint_jaaz",
    description="Inpaint and edit images using Nano Banana Pro Inpaint. Advanced region-based editing and object replacement.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_nano_banana_pro_inpaint_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    ctx = config.get("configurable", {})
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="replicate",
        model="black-forest-labs/flux-kontext-pro",
        prompt=prompt,
        aspect_ratio=aspect_ratio,
    )


@tool(
    "generate_image_by_nano_banana_inpaint_jaaz",
    description="Fast inpainting using Nano Banana Inpaint. Quick edits and region-based image modifications.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_nano_banana_inpaint_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    ctx = config.get("configurable", {})
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="replicate",
        model="black-forest-labs/flux-kontext-pro",
        prompt=prompt,
        aspect_ratio=aspect_ratio,
    )


@tool(
    "generate_image_by_product_placement_jaaz",
    description="Generate product placement images. Place products naturally into scenes using AI-powered compositing.",
    args_schema=StubImageInputSchema,
)
async def generate_image_by_product_placement_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
) -> str:
    ctx = config.get("configurable", {})
    placement_prompt = f"product placement, natural scene integration: {prompt}"
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="replicate",
        model="black-forest-labs/flux-kontext-pro",
        prompt=placement_prompt,
        aspect_ratio=aspect_ratio,
    )


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
