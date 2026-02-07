"""
xAI (Grok) Image Generation Provider
Direct integration with xAI API for Grok Imagine
"""

import os
import asyncio
import traceback
from typing import Optional, Any, Dict, List, Tuple

from .image_base_provider import ImageProviderBase
from utils.http_client import HttpClient
from services.config_service import config_service, FILES_DIR
from ..utils.image_utils import get_image_info_and_save, generate_image_id


class XAIImageProvider(ImageProviderBase):
    """xAI (Grok) image generation provider implementation"""

    def __init__(self):
        """Initialize the xAI provider"""
        config = config_service.app_config.get('xai', {})
        self.api_key = str(config.get("api_key", ""))

        if not self.api_key:
            # Fallback to environment variable
            self.api_key = os.environ.get("XAI_API_KEY", "")

        self.base_url = "https://api.x.ai/v1"

    def _build_headers(self) -> Dict[str, str]:
        """Build request headers"""
        if not self.api_key:
            raise ValueError("xAI API key is not configured")

        return {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
        }

    def _build_payload(
        self,
        prompt: str,
        model: str,
        aspect_ratio: str = "1:1",
        input_images: Optional[List[str]] = None,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        """Build request payload for xAI API"""
        # Note: xAI API does not support 'size' parameter
        payload: Dict[str, Any] = {
            "model": model,
            "prompt": prompt,
            "n": kwargs.get("num_images", 1),
        }

        # Handle input image for image-to-image generation
        if input_images and len(input_images) > 0:
            payload["image"] = input_images[0]

        return payload

    async def generate(
        self,
        prompt: str,
        model: str,
        aspect_ratio: str = "1:1",
        input_images: Optional[list[str]] = None,
        metadata: Optional[dict[str, Any]] = None,
        **kwargs: Any,
    ) -> Tuple[str, int, int, str]:
        """
        Generate image using xAI Grok Imagine API

        Returns:
            tuple[str, int, int, str]: (mime_type, width, height, filename)
        """
        try:
            headers = self._build_headers()
            payload = self._build_payload(
                prompt=prompt,
                model=model,
                aspect_ratio=aspect_ratio,
                input_images=input_images,
                **kwargs,
            )

            print(f"🎨 xAI Grok image request with model: {model}")
            print(f"🎨 Payload: {payload}")

            # Submit the request
            url = f"{self.base_url}/images/generations"

            async with HttpClient.create_aiohttp() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        print(f"❌ xAI API error: {error_text}")
                        raise Exception(
                            f"xAI API error ({response.status}): {error_text}"
                        )

                    result_data = await response.json()
                    print(f"✅ xAI response: {result_data}")

                    # Extract image URL from response
                    data = result_data.get("data", [])
                    if not data or len(data) == 0:
                        raise Exception("No image data in xAI response")

                    image_url = data[0].get("url")
                    if not image_url:
                        raise Exception("No image URL in xAI response")

                    # Generate a unique image ID and save
                    image_id = generate_image_id()
                    file_path_without_extension = os.path.join(FILES_DIR, f"im_{image_id}")
                    mime_type, width, height, extension = await get_image_info_and_save(
                        url=image_url,
                        file_path_without_extension=file_path_without_extension,
                        is_b64=False,
                        metadata=metadata or {},
                    )
                    filename = f"im_{image_id}.{extension}"

                    print(f"✅ xAI Grok image generated: {filename} ({width}x{height})")
                    return mime_type, width, height, filename

        except Exception as e:
            print(f"❌ xAI Grok image generation error: {e}")
            print(traceback.format_exc())
            raise
