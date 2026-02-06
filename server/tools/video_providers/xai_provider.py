"""
xAI (Grok) Video Generation Provider
Direct integration with xAI API for Grok Imagine video generation
"""

import os
import asyncio
import traceback
from typing import Optional, Any, List, Dict

from .video_base_provider import VideoProviderBase
from utils.http_client import HttpClient
from services.config_service import config_service


class XAIVideoProvider(VideoProviderBase, provider_name="xai"):
    """xAI (Grok) video generation provider implementation"""

    def __init__(self):
        """Initialize the xAI video provider"""
        config = config_service.app_config.get('xai', {})
        self.api_key = str(config.get("api_key", ""))

        if not self.api_key:
            # Fallback to environment variable
            self.api_key = os.environ.get("XAI_API_KEY", "")

        self.base_url = "https://api.x.ai/v1"

    def _build_headers(self) -> Dict[str, str]:
        """Build request headers"""
        if not self.api_key:
            raise ValueError("xAI API key is not configured for Grok video")

        return {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
        }

    def _map_aspect_ratio_to_size(
        self, aspect_ratio: str, resolution: str = "1080p"
    ) -> str:
        """Map aspect ratio and resolution to video size"""
        if resolution == "480p":
            if aspect_ratio == "16:9":
                return "854x480"
            elif aspect_ratio == "9:16":
                return "480x854"
            elif aspect_ratio == "1:1":
                return "480x480"
        elif resolution == "720p":
            if aspect_ratio == "16:9":
                return "1280x720"
            elif aspect_ratio == "9:16":
                return "720x1280"
            elif aspect_ratio == "1:1":
                return "720x720"
        else:  # 1080p
            if aspect_ratio == "16:9":
                return "1920x1080"
            elif aspect_ratio == "9:16":
                return "1080x1920"
            elif aspect_ratio == "1:1":
                return "1080x1080"

        # Default
        return "1920x1080"

    def _build_payload(
        self,
        prompt: str,
        model: str,
        resolution: str = "1080p",
        duration: int = 5,
        aspect_ratio: str = "16:9",
        input_images: Optional[List[str]] = None,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        """Build request payload for xAI video API"""
        size = self._map_aspect_ratio_to_size(aspect_ratio, resolution)

        payload: Dict[str, Any] = {
            "model": model,
            "prompt": prompt,
            "size": size,
            "duration": duration,
            "n": 1,
        }

        # Handle input image for image-to-video
        if input_images and len(input_images) > 0:
            payload["image"] = input_images[0]

        return payload

    async def _poll_for_result(
        self, generation_id: str, headers: Dict[str, str]
    ) -> str:
        """Poll for video generation result"""
        status_url = f"{self.base_url}/video/generations/{generation_id}"

        async with HttpClient.create_aiohttp() as session:
            for attempt in range(300):  # Max 10 minutes polling (2s * 300)
                await asyncio.sleep(2)

                try:
                    async with session.get(status_url, headers=headers) as response:
                        if response.status != 200:
                            error_text = await response.text()
                            print(f"❌ Polling error ({response.status}): {error_text}")
                            continue

                        result_data = await response.json()
                        status = result_data.get("status")

                        print(
                            f"🎬 xAI Grok polling status: {status} (attempt {attempt + 1})"
                        )

                        if status == "completed":
                            data = result_data.get("data", [])
                            if data and len(data) > 0:
                                video_url = data[0].get("url")
                                if video_url:
                                    return video_url
                            raise Exception("No video URL in completed result")

                        if status in ("failed", "cancelled", "error"):
                            error = result_data.get("error", {}).get(
                                "message", "Unknown error"
                            )
                            raise Exception(
                                f"xAI Grok video generation failed: {error}"
                            )

                except Exception as e:
                    if attempt >= 299:  # Last attempt
                        raise
                    print(f"⚠️ Polling attempt {attempt + 1} error: {e}")
                    continue

            raise Exception("xAI Grok video generation timeout (10 minutes)")

    async def generate(
        self,
        prompt: str,
        model: str = "grok-imagine",
        resolution: str = "1080p",
        duration: int = 5,
        aspect_ratio: str = "16:9",
        input_images: Optional[List[str]] = None,
        camera_fixed: bool = True,
        **kwargs: Any,
    ) -> str:
        """
        Generate video using xAI Grok Imagine API

        Returns:
            str: Video URL for download
        """
        try:
            headers = self._build_headers()
            payload = self._build_payload(
                prompt=prompt,
                model=model,
                resolution=resolution,
                duration=duration,
                aspect_ratio=aspect_ratio,
                input_images=input_images,
                **kwargs,
            )

            print(f"🎬 xAI Grok video request with model: {model}")
            print(f"🎬 Payload: {payload}")

            # Submit the request
            submit_url = f"{self.base_url}/video/generations"

            async with HttpClient.create_aiohttp() as session:
                async with session.post(
                    submit_url, headers=headers, json=payload
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        print(f"❌ xAI video API error: {error_text}")
                        raise Exception(
                            f"xAI video API error ({response.status}): {error_text}"
                        )

                    result_data = await response.json()
                    print(f"✅ xAI video response: {result_data}")

                    generation_id = result_data.get("id")
                    if not generation_id:
                        raise Exception("No generation ID in xAI response")

                    # Check if immediately completed (unlikely)
                    status = result_data.get("status")
                    if status == "completed":
                        data = result_data.get("data", [])
                        if data and len(data) > 0:
                            video_url = data[0].get("url")
                            if video_url:
                                return video_url

                    # Poll for completion
                    print(f"🎬 Polling for xAI Grok video generation: {generation_id}")
                    video_url = await self._poll_for_result(generation_id, headers)
                    print(f"✅ xAI Grok video completed: {video_url}")
                    return video_url

        except Exception as e:
            print(f"❌ xAI Grok video generation error: {e}")
            print(traceback.format_exc())
            raise
