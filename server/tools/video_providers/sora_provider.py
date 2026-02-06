"""
OpenAI Sora 2 Video Generation Provider
Official OpenAI API for video generation
"""

import os
import asyncio
import traceback
from typing import Optional, Any, List, Dict

from .video_base_provider import VideoProviderBase
from utils.http_client import HttpClient
from services.config_service import config_service


class SoraVideoProvider(VideoProviderBase, provider_name="openai-sora"):
    """OpenAI Sora 2 video generation provider implementation"""

    def __init__(self):
        """Initialize the Sora provider"""
        config = config_service.app_config.get('openai', {})
        self.api_key = str(config.get("api_key", ""))
        self.base_url = str(config.get("url", "https://api.openai.com/v1")).rstrip("/")

        if not self.api_key:
            # Fallback to environment variable
            self.api_key = os.environ.get("OPENAI_API_KEY", "")

    def _build_headers(self) -> Dict[str, str]:
        """Build request headers"""
        if not self.api_key:
            raise ValueError("OpenAI API key is not configured for Sora")

        return {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
        }

    def _build_payload(
        self,
        prompt: str,
        model: str = "sora-2",
        resolution: str = "1080p",
        duration: int = 5,
        aspect_ratio: str = "16:9",
        input_images: Optional[List[str]] = None,
        **kwargs: Any
    ) -> Dict[str, Any]:
        """Build request payload for Sora API"""
        # Map resolution to size
        size_map = {
            "480p": "854x480",
            "720p": "1280x720",
            "1080p": "1920x1080",
        }
        
        # Map aspect ratio to size if not in resolution map
        if resolution not in size_map:
            if aspect_ratio == "16:9":
                size = "1920x1080"
            elif aspect_ratio == "9:16":
                size = "1080x1920"
            elif aspect_ratio == "1:1":
                size = "1080x1080"
            else:
                size = "1920x1080"
        else:
            size = size_map[resolution]

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
        self,
        generation_id: str,
        headers: Dict[str, str]
    ) -> str:
        """Poll for video generation result"""
        status_url = f"{self.base_url}/video/generations/{generation_id}"

        async with HttpClient.create_aiohttp() as session:
            for _ in range(300):  # Max 5 minutes polling
                await asyncio.sleep(2)
                
                async with session.get(status_url, headers=headers) as response:
                    result_data = await response.json()
                    status = result_data.get("status")
                    
                    print(f"🎬 Sora polling status: {status}")

                    if status == "completed":
                        data = result_data.get("data", [])
                        if data and len(data) > 0:
                            video_url = data[0].get("url")
                            if video_url:
                                return video_url
                        raise Exception("No video URL in completed result")

                    if status in ("failed", "cancelled"):
                        error = result_data.get("error", {}).get("message", "Unknown error")
                        raise Exception(f"Sora video generation failed: {error}")

            raise Exception("Sora video generation timeout (5 minutes)")

    async def generate(
        self,
        prompt: str,
        model: str = "sora-2",
        resolution: str = "1080p",
        duration: int = 5,
        aspect_ratio: str = "16:9",
        input_images: Optional[List[str]] = None,
        camera_fixed: bool = True,
        **kwargs: Any
    ) -> str:
        """
        Generate video using OpenAI Sora 2 API

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
                **kwargs
            )

            print(f"🎬 Sora video request with model: {model}")

            # Submit the request
            submit_url = f"{self.base_url}/video/generations"
            
            async with HttpClient.create_aiohttp() as session:
                async with session.post(submit_url, json=payload, headers=headers) as response:
                    if response.status not in (200, 201, 202):
                        error_text = await response.text()
                        raise Exception(f"Sora API error: {response.status} - {error_text}")

                    response_json = await response.json()
                    
                    # Check if immediate result
                    if response_json.get("status") == "completed":
                        data = response_json.get("data", [])
                        if data and len(data) > 0:
                            return data[0].get("url", "")

                    # Get generation ID for polling
                    generation_id = response_json.get("id")
                    if not generation_id:
                        raise Exception("No generation ID returned from Sora API")

            # Poll for result
            video_url = await self._poll_for_result(generation_id, headers)
            print(f"🎬 Sora video generation completed: {video_url}")
            return video_url

        except Exception as e:
            print(f'🎬 Error generating video with Sora: {e}')
            traceback.print_exc()
            raise e
