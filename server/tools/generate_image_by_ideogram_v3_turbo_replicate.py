from typing import Annotated
from langchain_core.tools import tool, InjectedToolCallId  # type: ignore
from langchain_core.runnables import RunnableConfig
from tools.utils.image_generation_core import generate_image_with_provider
from tools.generate_image_by_imagen_4_jaaz import GenerateImageByImagen4InputSchema


@tool("generate_image_by_ideogram_v3_turbo_replicate",
      description="Generate an image by Ideogram V3 Turbo model using text prompt. This model does NOT support input images for reference or editing. Use this model for fast, high-quality text-to-image generation with Ideogram V3 Turbo through Replicate platform.",
      args_schema=GenerateImageByImagen4InputSchema)
async def generate_image_by_ideogram_v3_turbo_replicate(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    tool_call_id: Annotated[str, InjectedToolCallId],
    num_images: int = 1,
) -> str:
    ctx = config.get('configurable', {})
    canvas_id = ctx.get('canvas_id', '')
    session_id = ctx.get('session_id', '')
    print(f'🛠️ canvas_id {canvas_id} session_id {session_id}')
    return await generate_image_with_provider(
        canvas_id=canvas_id,
        session_id=session_id,
        provider='replicate',
        model='ideogram-ai/ideogram-v3-turbo',
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        num_images=num_images,
    )


# Export the tool for easy import
__all__ = ["generate_image_by_ideogram_v3_turbo_replicate"]
