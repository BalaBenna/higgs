"""
Image generation core module
Contains the main orchestration logic for image generation across different providers
"""

from typing import Optional, Dict, Any
from common import DEFAULT_PORT
from tools.utils.image_utils import process_input_image, get_image_info_and_process
from ..image_providers.image_base_provider import ImageProviderBase

# 导入所有提供商以确保自动注册 (不要删除这些导入)
from ..image_providers.jaaz_provider import JaazImageProvider
from ..image_providers.openai_provider import OpenAIImageProvider
from ..image_providers.replicate_provider import ReplicateImageProvider
from ..image_providers.volces_provider import VolcesProvider
from ..image_providers.wavespeed_provider import WavespeedProvider
from ..image_providers.google_ai_provider import GoogleAIImageProvider
from ..image_providers.fal_provider import FalProvider
from ..image_providers.xai_provider import XAIImageProvider

# from ..image_providers.comfyui_provider import ComfyUIProvider
from .image_canvas_utils import (
    save_image_to_canvas,
)
import time

IMAGE_PROVIDERS: dict[str, ImageProviderBase] = {
    "jaaz": JaazImageProvider(),
    "openai": OpenAIImageProvider(),
    "replicate": ReplicateImageProvider(),
    "volces": VolcesProvider(),
    "wavespeed": WavespeedProvider(),
    "google-ai": GoogleAIImageProvider(),
    "fal": FalProvider(),
    "xai": XAIImageProvider(),
}


async def generate_image_with_provider(
    canvas_id: str,
    session_id: str,
    provider: str,
    model: str,
    # image generator args
    prompt: str,
    aspect_ratio: str = "1:1",
    input_images: Optional[list[str]] = None,
    num_images: int = 1,
    user_id: str = "",
    **kwargs: Any,
) -> str:
    """
    通用图像生成函数，支持不同的模型和提供商

    Args:
        prompt: 图像生成提示词
        aspect_ratio: 图像长宽比
        model: 模型标识符
        canvas_id: Canvas ID
        session_id: Session ID
        provider: Provider name
        input_images: 可选的输入参考图像列表
        num_images: 生成图像的数量
        user_id: Authenticated user ID (for Supabase storage)
    """

    provider_instance = IMAGE_PROVIDERS.get(provider)
    if not provider_instance:
        raise ValueError(f"Unknown provider: {provider}")

    # Process input images for the provider
    processed_input_images: list[str] | None = None
    if input_images:
        processed_input_images = []
        for image_path in input_images:
            processed_image = await process_input_image(image_path)
            if processed_image:
                processed_input_images.append(processed_image)

        print(f"Using {len(processed_input_images)} input images for generation")

    # Prepare metadata with all generation parameters
    metadata: Dict[str, Any] = {
        "prompt": prompt,
        "model": model,
        "provider": provider,
        "aspect_ratio": aspect_ratio,
        "input_images": input_images or [],
        "num_images": num_images,
        **{k: v for k, v in kwargs.items() if v is not None},
    }

    # Generate image using the selected provider
    generation_result = await provider_instance.generate(
        prompt=prompt,
        model=model,
        aspect_ratio=aspect_ratio,
        input_images=processed_input_images,
        metadata=metadata,
        num_images=metadata.get('num_images', 1),
        **kwargs,
    )

    # Handle both single tuple and list of tuples return types
    if isinstance(generation_result, list):
        results = generation_result
    else:
        results = [generation_result]

    image_markdowns = []

    for mime_type, width, height, filename in results:
        # If we have a user_id, re-process the saved file to get bytes for Supabase upload
        image_bytes = None
        if user_id:
            try:
                from services.config_service import FILES_DIR
                import os
                local_path = os.path.join(FILES_DIR, filename)
                if os.path.exists(local_path):
                    with open(local_path, "rb") as f:
                        image_bytes = f.read()
                    # Clean up local file after reading
                    os.remove(local_path)
            except Exception as e:
                print(f"Warning: Could not read local file for upload: {e}")

        # Save image to canvas (uploads to Supabase if user_id + bytes available)
        image_url = await save_image_to_canvas(
            session_id,
            canvas_id,
            filename,
            mime_type,
            width,
            height,
            user_id=user_id,
            image_bytes=image_bytes,
            prompt=prompt,
            model=model,
            provider=provider,
            aspect_ratio=aspect_ratio,
        )

        # Use the URL directly (Supabase public URL or local URL)
        if image_url.startswith("http"):
            image_markdowns.append(f"![image_id: {filename}]({image_url})")
        else:
            image_markdowns.append(
                f"![image_id: {filename}](http://localhost:{DEFAULT_PORT}{image_url})"
            )

    # Combine all markdown strings
    return f"image generated successfully {' '.join(image_markdowns)}"
