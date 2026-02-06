"""
Fal.ai Image Generation Provider
Supports: Nano Banana Pro, Seedream, FLUX, Wan, Z-Image, Kling Image
"""

import os
import asyncio
import traceback
from typing import Optional, Any
from .image_base_provider import ImageProviderBase
from ..utils.image_utils import get_image_info_and_save, generate_image_id
from services.config_service import FILES_DIR, config_service
from utils.http_client import HttpClient


# Model endpoint mappings for Fal.ai
FAL_MODEL_ENDPOINTS = {
    # Image Generation Models
    "nano-banana-pro": "fal-ai/nano-banana-pro",
    "nano-banana": "fal-ai/nano-banana",
    "seedream-4.5": "fal-ai/seedream-v4.5",
    "seedream-4.0": "fal-ai/seedream-v4",
    "flux-2-pro": "fal-ai/flux-2-pro",
    "flux-2-max": "fal-ai/flux-2-max",
    "flux-kontext-max": "fal-ai/flux-kontext-max",
    "flux-kontext-pro": "fal-ai/flux-kontext-pro",
    "flux-1-pro": "fal-ai/flux-pro",
    "flux-1-dev": "fal-ai/flux/dev",
    "wan-2.2-image": "fal-ai/wan/v2.2",
    "z-image": "fal-ai/z-image",
    "kling-q1-image": "fal-ai/kling-ai/v1-5/standard/image-to-image",
    "reve": "fal-ai/reve",
    "ideogram-3": "fal-ai/ideogram/v3",
    "recraft-v3": "fal-ai/recraft-v3",
    "midjourney": "fal-ai/midjourney/imagine",
    # Higgsfield models
    "higgsfield-soul": "fal-ai/higgsfield/soul",
    # Inpainting models
    "nano-banana-pro-inpaint": "fal-ai/nano-banana-pro/inpaint",
    "nano-banana-inpaint": "fal-ai/nano-banana/inpaint",
}


class FalProvider(ImageProviderBase):
    """Fal.ai image generation provider implementation"""

    def __init__(self):
        """Initialize the Fal.ai provider"""
        self.api_url = "https://queue.fal.run"

    def _build_headers(self) -> dict[str, str]:
        """Build request headers"""
        config = config_service.app_config.get('fal', {})
        api_key = str(config.get("api_key", ""))

        if not api_key:
            # Fallback to environment variable
            api_key = os.environ.get("FAL_API_KEY", "")

        if not api_key:
            raise ValueError("Fal.ai API key is not configured")

        return {
            'Authorization': f'Key {api_key}',
            'Content-Type': 'application/json',
        }

    def _get_endpoint(self, model: str) -> str:
        """Get the Fal.ai endpoint for a model"""
        # Remove provider prefix if present
        model = model.replace("fal/", "").replace("fal-ai/", "")
        
        endpoint = FAL_MODEL_ENDPOINTS.get(model)
        if not endpoint:
            # Use model as-is if not in mapping
            endpoint = f"fal-ai/{model}"
        
        return endpoint

    def _calculate_size(self, aspect_ratio: str) -> dict[str, int]:
        """Calculate width and height based on aspect ratio"""
        w_ratio, h_ratio = map(int, aspect_ratio.split(":"))
        
        # Base size calculation (target ~1 megapixel)
        factor = (1024**2 / (w_ratio * h_ratio)) ** 0.5
        width = int((factor * w_ratio) / 64) * 64
        height = int((factor * h_ratio) / 64) * 64
        
        return {"width": width, "height": height}

    def _build_payload(
        self,
        prompt: str,
        aspect_ratio: str = "1:1",
        input_images: Optional[list[str]] = None,
        **kwargs: Any
    ) -> dict[str, Any]:
        """Build request payload"""
        size = self._calculate_size(aspect_ratio)
        
        payload: dict[str, Any] = {
            "prompt": prompt,
            "image_size": size,
            "num_images": kwargs.get("num_images", 1),
        }

        # Add optional parameters
        if kwargs.get("negative_prompt"):
            payload["negative_prompt"] = kwargs["negative_prompt"]

        if kwargs.get("guidance_scale"):
            payload["guidance_scale"] = kwargs["guidance_scale"]

        if kwargs.get("num_inference_steps"):
            payload["num_inference_steps"] = kwargs["num_inference_steps"]

        # Handle input images (for image-to-image or editing)
        if input_images and len(input_images) > 0:
            payload["image_url"] = input_images[0]
            if len(input_images) > 1:
                payload["reference_images"] = input_images[1:]

        return payload

    async def _poll_for_result(
        self,
        request_id: str,
        endpoint: str,
        headers: dict[str, str]
    ) -> list[str]:
        """Poll for generation result"""
        status_url = f"{self.api_url}/{endpoint}/requests/{request_id}/status"
        result_url = f"{self.api_url}/{endpoint}/requests/{request_id}"

        async with HttpClient.create_aiohttp() as session:
            for _ in range(120):  # Max 2 minutes polling
                await asyncio.sleep(1)
                
                async with session.get(status_url, headers=headers) as response:
                    status_data = await response.json()
                    status = status_data.get("status")
                    
                    print(f"🖼️ Fal.ai polling status: {status}")

                    if status == "COMPLETED":
                        # Fetch the result
                        async with session.get(result_url, headers=headers) as result_response:
                            result_data = await result_response.json()
                            images = result_data.get("images", [])
                            if images:
                                return [img.get("url") for img in images if img.get("url")]
                        raise Exception("No images in completed result")

                    if status == "FAILED":
                        error = status_data.get("error", "Unknown error")
                        raise Exception(f"Fal.ai generation failed: {error}")

            raise Exception("Fal.ai generation timeout (2 minutes)")

    async def generate(
        self,
        prompt: str,
        model: str,
        aspect_ratio: str = "1:1",
        input_images: Optional[list[str]] = None,
        **kwargs: Any
    ) -> tuple[str, int, int, str] | list[tuple[str, int, int, str]]:
        """
        Generate image using Fal.ai API

        Args:
            prompt: Image generation prompt
            model: Model name to use for generation
            aspect_ratio: Image aspect ratio (1:1, 16:9, 4:3, 3:4, 9:16)
            input_images: Optional input images for reference or editing
            **kwargs: Additional provider-specific parameters

        Returns:
            tuple[str, int, int, str]: (mime_type, width, height, filename)
            or list of tuples for multiple images
        """
        try:
            headers = self._build_headers()
            endpoint = self._get_endpoint(model)
            payload = self._build_payload(prompt, aspect_ratio, input_images, **kwargs)

            print(f"🖼️ Fal.ai request to endpoint: {endpoint}")
            print(f"🖼️ Fal.ai payload: {payload}")

            # Submit the request
            submit_url = f"{self.api_url}/{endpoint}"
            
            async with HttpClient.create_aiohttp() as session:
                async with session.post(submit_url, json=payload, headers=headers) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise Exception(f"Fal.ai API error: {response.status} - {error_text}")

                    response_json = await response.json()
                    request_id = response_json.get("request_id")

                    if not request_id:
                        # Synchronous response (some models return immediately)
                        images = response_json.get("images", [])
                        if images:
                            image_urls = [img.get("url") for img in images if img.get("url")]
                        else:
                            raise Exception("No images in response")
                    else:
                        # Async request - poll for result
                        image_urls = await self._poll_for_result(request_id, endpoint, headers)

            # Save all generated images
            results = []
            for image_url in image_urls:
                image_id = generate_image_id()
                mime_type, width, height, extension = await get_image_info_and_save(
                    image_url,
                    os.path.join(FILES_DIR, f'{image_id}')
                )
                filename = f'{image_id}.{extension}'
                results.append((mime_type, width, height, filename))

            # Return single tuple if only one image, otherwise list
            if len(results) == 1:
                return results[0]
            return results

        except Exception as e:
            print('Error generating image with Fal.ai:', e)
            traceback.print_exc()
            raise e
