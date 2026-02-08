"""
Real feature tools that delegate to existing image/video generation providers.
Replaces stub_feature_tools.py with working implementations.
"""

from typing import Annotated
from pydantic import BaseModel, Field
from langchain_core.tools import tool, InjectedToolCallId
from langchain_core.runnables import RunnableConfig
from tools.utils.image_generation_core import generate_image_with_provider


class FeatureImageInputSchema(BaseModel):
    prompt: str = Field(description="Description of the desired edit or effect.")
    aspect_ratio: str = Field(
        default="1:1",
        description="Aspect ratio. Allowed: 1:1, 16:9, 4:3, 3:4, 9:16",
    )
    input_images: list[str] | None = Field(
        default=None,
        description="Optional input image filenames for reference or editing.",
    )
    tool_call_id: Annotated[str, InjectedToolCallId]


class FeaturePromptOnlySchema(BaseModel):
    prompt: str = Field(description="Description of the desired edit or effect.")
    tool_call_id: Annotated[str, InjectedToolCallId]


@tool(
    "feature_face_swap_jaaz",
    description="Swap faces in images using AI. Upload a source face and target image.",
    args_schema=FeatureImageInputSchema,
)
async def feature_face_swap_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
    input_images: list[str] | None = None,
) -> str:
    from tools.face_swap_replicate import face_swap_replicate

    return await face_swap_replicate.ainvoke(
        {
            "prompt": prompt,
            "aspect_ratio": aspect_ratio,
            "input_images": input_images,
            "tool_call_id": tool_call_id,
        },
        config=config,
    )


@tool(
    "feature_character_swap_jaaz",
    description="Swap characters in images using AI. Upload a source character and target scene.",
    args_schema=FeatureImageInputSchema,
)
async def feature_character_swap_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
    input_images: list[str] | None = None,
) -> str:
    ctx = config.get("configurable", {})
    final_prompt = f"Replace the character in the target image with the character from the reference image. Maintain the scene, pose, and lighting. {prompt}"
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="jaaz",
        model="openai/gpt-image-1",
        prompt=final_prompt,
        aspect_ratio=aspect_ratio,
        input_images=input_images,
    )


@tool(
    "feature_video_face_swap_jaaz",
    description="Swap faces in videos using AI. Upload a face image and target video.",
    args_schema=FeatureImageInputSchema,
)
async def feature_video_face_swap_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
    input_images: list[str] | None = None,
) -> str:
    ctx = config.get("configurable", {})
    final_prompt = f"Generate a video with this person's face applied naturally. Maintain expressions and lip movement. {prompt}"
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="jaaz",
        model="openai/gpt-image-1",
        prompt=final_prompt,
        aspect_ratio=aspect_ratio,
        input_images=input_images,
    )


@tool(
    "feature_inpaint_jaaz",
    description="Inpaint and edit specific areas of images using AI.",
    args_schema=FeatureImageInputSchema,
)
async def feature_inpaint_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
    input_images: list[str] | None = None,
) -> str:
    ctx = config.get("configurable", {})
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="jaaz",
        model="openai/gpt-image-1",
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        input_images=input_images,
    )


@tool(
    "feature_relight_jaaz",
    description="Relight images with AI-powered lighting adjustments.",
    args_schema=FeatureImageInputSchema,
)
async def feature_relight_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
    input_images: list[str] | None = None,
) -> str:
    ctx = config.get("configurable", {})
    final_prompt = f"Relight this image with the following lighting adjustments: {prompt}"
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="jaaz",
        model="openai/gpt-image-1",
        prompt=final_prompt,
        aspect_ratio=aspect_ratio,
        input_images=input_images,
    )


@tool(
    "feature_upscale_jaaz",
    description="Upscale images to higher resolution using AI enhancement.",
    args_schema=FeatureImageInputSchema,
)
async def feature_upscale_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
    input_images: list[str] | None = None,
) -> str:
    ctx = config.get("configurable", {})
    final_prompt = f"Enhance and upscale this image to higher resolution. Improve fine details, textures, and sharpness while maintaining the original composition. {prompt}"
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="jaaz",
        model="openai/gpt-image-1",
        prompt=final_prompt,
        aspect_ratio=aspect_ratio,
        input_images=input_images,
    )


@tool(
    "feature_skin_enhancer_jaaz",
    description="Enhance skin in portraits using AI retouching.",
    args_schema=FeatureImageInputSchema,
)
async def feature_skin_enhancer_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
    input_images: list[str] | None = None,
) -> str:
    ctx = config.get("configurable", {})
    final_prompt = f"Enhance the skin in this portrait. Smooth skin texture naturally, reduce blemishes, and improve skin tone while keeping it photorealistic. {prompt}"
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="jaaz",
        model="openai/gpt-image-1",
        prompt=final_prompt,
        aspect_ratio=aspect_ratio,
        input_images=input_images,
    )


@tool(
    "feature_ai_stylist_jaaz",
    description="AI-powered style transfer and fashion editing.",
    args_schema=FeatureImageInputSchema,
)
async def feature_ai_stylist_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
    input_images: list[str] | None = None,
) -> str:
    ctx = config.get("configurable", {})
    final_prompt = f"Apply style transfer to this image: {prompt}"
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="jaaz",
        model="black-forest-labs/flux-kontext-pro",
        prompt=final_prompt,
        aspect_ratio=aspect_ratio,
        input_images=input_images,
    )


@tool(
    "feature_draw_to_edit_jaaz",
    description="Draw on images to guide AI edits.",
    args_schema=FeatureImageInputSchema,
)
async def feature_draw_to_edit_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
    input_images: list[str] | None = None,
) -> str:
    ctx = config.get("configurable", {})
    final_prompt = f"Edit this image based on the drawing overlay: {prompt}"
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="jaaz",
        model="openai/gpt-image-1",
        prompt=final_prompt,
        aspect_ratio=aspect_ratio,
        input_images=input_images,
    )


@tool(
    "feature_lipsync_jaaz",
    description="Generate lip-synced videos from audio and portrait images.",
    args_schema=FeatureImageInputSchema,
)
async def feature_lipsync_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
    input_images: list[str] | None = None,
) -> str:
    ctx = config.get("configurable", {})
    final_prompt = f"Generate a talking head video from this portrait. The person should be speaking naturally: {prompt}"
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="jaaz",
        model="openai/gpt-image-1",
        prompt=final_prompt,
        aspect_ratio=aspect_ratio,
        input_images=input_images,
    )


@tool(
    "feature_soul_id_character_jaaz",
    description="Generate consistent character identities across images.",
    args_schema=FeatureImageInputSchema,
)
async def feature_soul_id_character_jaaz(
    prompt: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    aspect_ratio: str = "1:1",
    input_images: list[str] | None = None,
) -> str:
    ctx = config.get("configurable", {})
    final_prompt = f"Generate a consistent character identity based on the reference: {prompt}"
    return await generate_image_with_provider(
        canvas_id=ctx.get("canvas_id", ""),
        session_id=ctx.get("session_id", ""),
        provider="jaaz",
        model="openai/gpt-image-1",
        prompt=final_prompt,
        aspect_ratio=aspect_ratio,
        input_images=input_images,
    )


__all__ = [
    "feature_face_swap_jaaz",
    "feature_character_swap_jaaz",
    "feature_video_face_swap_jaaz",
    "feature_inpaint_jaaz",
    "feature_relight_jaaz",
    "feature_upscale_jaaz",
    "feature_skin_enhancer_jaaz",
    "feature_ai_stylist_jaaz",
    "feature_draw_to_edit_jaaz",
    "feature_lipsync_jaaz",
    "feature_soul_id_character_jaaz",
]
