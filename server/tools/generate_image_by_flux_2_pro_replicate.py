from typing import Annotated
from pydantic import BaseModel, Field
from langchain_core.tools import tool, InjectedToolCallId  # type: ignore
from langchain_core.runnables import RunnableConfig
from tools.utils.image_generation_core import generate_image_with_provider


class ReplicateFlux2ProInputSchema(BaseModel):
    prompt: str = Field(description="The prompt for image generation")
    aspect_ratio: str = Field(description="Aspect ratio: 1:1, 16:9, 4:3, 3:4, 9:16")
    num_images: int = Field(default=1, description="Number of images to generate")
    tool_call_id: Annotated[str, InjectedToolCallId]


@tool("generate_image_by_flux_2_pro_replicate",
      description="Generate an image by FLUX 2 Pro model using text prompt. This model does NOT support input images for reference or editing. Use this model for high-quality image generation with Black Forest Labs' FLUX 2 Pro through Replicate platform.",
      args_schema=ReplicateFlux2ProInputSchema)
async def generate_image_by_flux_2_pro_replicate(
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
        model='black-forest-labs/flux-2-pro',
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        num_images=num_images,
    )


# Export the tool for easy import
__all__ = ["generate_image_by_flux_2_pro_replicate"]
