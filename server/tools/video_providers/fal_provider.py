"""
Fal.ai Video Generation Provider
Supports: Seedance, Kling, Wan, Hailuo, Higgsfield DOP
"""

import os
import asyncio
import traceback
from typing import Optional, Any, List, Dict

from .video_base_provider import VideoProviderBase
from utils.http_client import HttpClient
from services.config_service import config_service


# Model endpoint mappings for Fal.ai video
FAL_VIDEO_MODEL_ENDPOINTS = {
    # ByteDance Seedance
    "seedance-1.5-pro": "fal-ai/seedance-1.5-pro",
    "seedance-1.0-pro": "fal-ai/seedance-1.0-pro",
    "seedance-1.0-lite": "fal-ai/seedance-1.0-lite",
    
    # Kuaishou Kling
    "kling-3.0": "fal-ai/kling-video/v2.0/master",
    "kling-2.6": "fal-ai/kling-video/v1.6/standard",
    "kling-motion-control": "fal-ai/kling-video/v1.6/motion-control",
    "kling-avatars-2.0": "fal-ai/kling-video/v1.6/avatars",
    
    # Alibaba Wan
    "wan-2.6": "fal-ai/wan/v2.6",
    "wan-2.1": "fal-ai/wan/v2.1",
    
    # MiniMax Hailuo
    "hailuo-02": "fal-ai/minimax/video-02",
    "hailuo-02-pro": "fal-ai/minimax/video-02-pro",
    
    # Higgsfield
    "higgsfield-dop": "fal-ai/higgsfield-dop-preview",
    "higgsfield-dop-lite": "fal-ai/higgsfield-dop-lite",
    
    # Google Veo
    "veo-3.1": "fal-ai/veo3",
    "veo-3.1-fast": "fal-ai/veo3/fast",
    
    # Grok
    "grok-imagine": "fal-ai/grok-imagine",
}


class FalVideoProvider(VideoProviderBase, provider_name="fal"):
    """Fal.ai video generation provider implementation"""

    def __init__(self):
        """Initialize the Fal.ai video provider"""
        self.api_url = "https://queue.fal.run"
        
        config = config_service.app_config.get('fal', {})
        self.api_key = str(config.get("api_key", ""))

        if not self.api_key:
            # Fallback to environment variable
            self.api_key = os.environ.get("FAL_API_KEY", "")

    def _build_headers(self) -> Dict[str, str]:
        """Build request headers"""
        if not self.api_key:
            raise ValueError("Fal.ai API key is not configured")

        return {
            'Authorization': f'Key {self.api_key}',
            'Content-Type': 'application/json',
        }

    def _get_endpoint(self, model: str) -> str:
        """Get the Fal.ai endpoint for a model"""
        # Remove provider prefix if present
        model = model.replace("fal/", "").replace("fal-ai/", "")
        
        endpoint = FAL_VIDEO_MODEL_ENDPOINTS.get(model)
        if not endpoint:
            # Use model as-is if not in mapping
            endpoint = f"fal-ai/{model}"
        
        return endpoint

    def _build_payload(
        self,
        prompt: str,
        resolution: str = "480p",
        duration: int = 5,
        aspect_ratio: str = "16:9",
        input_images: Optional[List[str]] = None,
        camera_fixed: bool = True,
        **kwargs: Any
    ) -> Dict[str, Any]:
        """Build request payload"""
        payload: Dict[str, Any] = {
            "prompt": prompt,
        }

        # Video settings
        if resolution:
            payload["resolution"] = resolution
        if duration:
            payload["duration"] = duration
        if aspect_ratio:
            payload["aspect_ratio"] = aspect_ratio

        # Camera settings
        if not camera_fixed:
            payload["camera_motion"] = kwargs.get("camera_motion", "auto")

        # Handle input images (for image-to-video)
        if input_images and len(input_images) > 0:
            payload["image_url"] = input_images[0]
            if len(input_images) > 1:
                payload["end_image_url"] = input_images[1]

        # Optional parameters
        if kwargs.get("negative_prompt"):
            payload["negative_prompt"] = kwargs["negative_prompt"]
        if kwargs.get("seed"):
            payload["seed"] = kwargs["seed"]

        return payload

    async def _poll_for_result(
        self,
        request_id: str,
        endpoint: str,
        headers: Dict[str, str]
    ) -> str:
        """Poll for video generation result"""
        status_url = f"{self.api_url}/{endpoint}/requests/{request_id}/status"
        result_url = f"{self.api_url}/{endpoint}/requests/{request_id}"

        async with HttpClient.create_aiohttp() as session:
            for _ in range(300):  # Max 5 minutes polling (video takes longer)
                await asyncio.sleep(2)
                
                async with session.get(status_url, headers=headers) as response:
                    status_data = await response.json()
                    status = status_data.get("status")
                    
                    print(f"🎬 Fal.ai video polling status: {status}")

                    if status == "COMPLETED":
                        # Fetch the result
                        async with session.get(result_url, headers=headers) as result_response:
                            result_data = await result_response.json()
                            video = result_data.get("video", {})
                            video_url = video.get("url") if isinstance(video, dict) else result_data.get("video_url")
                            if video_url:
                                return video_url
                        raise Exception("No video URL in completed result")

                    if status == "FAILED":
                        error = status_data.get("error", "Unknown error")
                        raise Exception(f"Fal.ai video generation failed: {error}")

            raise Exception("Fal.ai video generation timeout (5 minutes)")

    async def generate(
        self,
        prompt: str,
        model: str,
        resolution: str = "480p",
        duration: int = 5,
        aspect_ratio: str = "16:9",
        input_images: Optional[List[str]] = None,
        camera_fixed: bool = True,
        **kwargs: Any
    ) -> str:
        """
        Generate video using Fal.ai API

        Returns:
            str: Video URL for download
        """
        try:
            headers = self._build_headers()
            endpoint = self._get_endpoint(model)
            payload = self._build_payload(
                prompt=prompt,
                resolution=resolution,
                duration=duration,
                aspect_ratio=aspect_ratio,
                input_images=input_images,
                camera_fixed=camera_fixed,
                **kwargs
            )

            print(f"🎬 Fal.ai video request to endpoint: {endpoint}")
            print(f"🎬 Fal.ai video payload: {payload}")

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
                        # Synchronous response
                        video = response_json.get("video", {})
                        video_url = video.get("url") if isinstance(video, dict) else response_json.get("video_url")
                        if video_url:
                            return video_url
                        raise Exception("No video URL in response")

            # Async request - poll for result
            video_url = await self._poll_for_result(request_id, endpoint, headers)
            print(f"🎬 Fal.ai video generation completed: {video_url}")
            return video_url

        except Exception as e:
            print(f'🎬 Error generating video with Fal.ai: {e}')
            traceback.print_exc()
            raise e
