from typing import Annotated, Optional
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from tools.utils.image_generation_core import generate_image_with_provider


class GenerateImageByGrokImagineInputSchema(BaseModel):
    prompt: str = Field(
        description="Required. The prompt for image generation. Describe the image you want to create in detail."
    )
    aspect_ratio: str = Field(
        description="Required. Aspect ratio of the image, only these values are allowed: 1:1, 16:9, 4:3, 3:4, 9:16, 21:9, 9:21. Choose the best fitting aspect ratio according to the prompt. Best ratio for posters is 3:4"
    )
    input_images: list[str] | None = Field(
        default=None,
        description="Optional; One or multiple images to use as reference for image-to-image generation. Pass a list of image_id here, e.g. ['im_jurheut7.png', 'im_hfuiut78.png'].",
    )
    num_images: int = Field(
        default=1, description="Optional. Number of images to generate. Default is 1."
    )


@tool(
    "generate_image_by_grok_imagine_xai",
    description="Generate creative and imaginative images using xAI's Grok Imagine model. Direct integration with xAI API for high-quality, stylized image generation.",
    args_schema=GenerateImageByGrokImagineInputSchema,
)
async def generate_image_by_grok_imagine_xai(
    prompt: str,
    aspect_ratio: str,
    config: RunnableConfig,
    input_images: list[str] | None = None,
    num_images: int = 1,
) -> str:
    ctx = config.get('configurable', {})
    canvas_id = ctx.get('canvas_id', '')
    session_id = ctx.get('session_id', '')
    return await generate_image_with_provider(
        canvas_id=canvas_id,
        session_id=session_id,
        provider='xai',
        model='grok-imagine',
        prompt=prompt,
        aspect_ratio=aspect_ratio,
        input_images=input_images,
        num_images=num_images,
    )


# Export the tool for easy import
__all__ = ["generate_image_by_grok_imagine_xai"]
