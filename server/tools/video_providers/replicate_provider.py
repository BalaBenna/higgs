"""
Replicate Video Generation Provider
Supports async polling for video generation models on Replicate.
"""

import os
import asyncio
import traceback
from typing import Optional, Any, List, Dict

from .video_base_provider import VideoProviderBase
from utils.http_client import HttpClient
from services.config_service import config_service, FILES_DIR


# Model mapping: friendly name -> Replicate owner/model
REPLICATE_VIDEO_MODELS = {
    # Legacy mappings (backward compat)
    "kling-3.0": "kwaivgi/kling-v2.6",
    "kling-motion-control": "kwaivgi/kling-v2.6-motion-control",
    "kling-avatars-2.0": "kwaivgi/kling-avatar-v2",
    "grok-imagine": "minimax/video-01",
    "sora-2": "minimax/video-01",
    "wan-2.6": "wan-ai/wan2.1-t2v-turbo",
    "higgsfield-dop": "luma/ray",
    "seedance-1.0-lite": "wan-ai/wan2.1-t2v-turbo",
    "hailuo-o2": "minimax/video-01-live",
    # Kling models via kwaivgi
    "kling-v2.6": "kwaivgi/kling-v2.6",
    "kling-v2.5-turbo": "kwaivgi/kling-v2.5-turbo-pro",
    "kling-v2.1-master": "kwaivgi/kling-v2.1-master",
    "kling-v2.0": "kwaivgi/kling-v2.0",
    "kling-v1.6-standard": "kwaivgi/kling-v1.6-standard",
    "kling-v1.6-pro": "kwaivgi/kling-v1.6-pro",
    "kling-v1.5-pro": "kwaivgi/kling-v1.5-pro",
    "kling-v2.1-i2v": "kwaivgi/kling-v2.1",
    "kling-v2.6-motion-control": "kwaivgi/kling-v2.6-motion-control",
    "kling-avatar-v2": "kwaivgi/kling-avatar-v2",
    "kling-lip-sync": "kwaivgi/kling-lip-sync",
}


class ReplicateVideoProvider(VideoProviderBase, provider_name="replicate"):
    """Replicate video generation provider implementation"""

    def __init__(self):
        """Initialize the Replicate video provider"""
        config = config_service.app_config.get('replicate', {})
        self.api_key = str(config.get("api_key", ""))

        if not self.api_key:
            self.api_key = os.environ.get("REPLICATE_API_KEY", "")

    def _build_headers(self) -> Dict[str, str]:
        """Build request headers"""
        if not self.api_key:
            raise ValueError("Replicate API key is not configured")

        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _get_replicate_model(self, model: str) -> str:
        """Map friendly model name to Replicate owner/model"""
        return REPLICATE_VIDEO_MODELS.get(model, model)

    async def _upload_file_to_replicate(self, local_path: str) -> str:
        """Upload a local file to Replicate's file hosting and return a public URL."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
        }
        import aiohttp
        import os as _os

        filename = _os.path.basename(local_path)
        async with HttpClient.create_aiohttp() as session:
            with open(local_path, "rb") as f:
                form = aiohttp.FormData()
                form.add_field("content", f, filename=filename)
                async with session.post(
                    "https://api.replicate.com/v1/files",
                    data=form,
                    headers=headers,
                ) as response:
                    if response.status not in (200, 201):
                        error_text = await response.text()
                        raise Exception(
                            f"Replicate file upload failed: {response.status} - {error_text}"
                        )
                    data = await response.json()
                    urls = data.get("urls", {})
                    return urls.get("get", data.get("url", ""))

    def _build_payload(
        self,
        prompt: str,
        resolution: str = "480p",
        duration: int = 5,
        aspect_ratio: str = "16:9",
        input_images: Optional[List[str]] = None,
        camera_fixed: bool = True,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        """Build request payload for Replicate API"""
        input_data: Dict[str, Any] = {
            "prompt": prompt,
        }

        if duration:
            input_data["duration"] = duration
        if aspect_ratio:
            input_data["aspect_ratio"] = aspect_ratio

        # Image inputs
        if input_images and len(input_images) > 0:
            input_data["image_url"] = input_images[0]

        # start_image (used by new Kling tools instead of input_images)
        if kwargs.get("start_image"):
            input_data["start_image"] = kwargs["start_image"]

        # end_image
        if kwargs.get("end_image"):
            input_data["end_image"] = kwargs["end_image"]

        # negative_prompt
        if kwargs.get("negative_prompt"):
            input_data["negative_prompt"] = kwargs["negative_prompt"]

        # generate_audio (boolean)
        if "generate_audio" in kwargs and kwargs["generate_audio"] is not None:
            input_data["generate_audio"] = kwargs["generate_audio"]

        # cfg_scale
        if kwargs.get("cfg_scale") is not None:
            input_data["cfg_scale"] = kwargs["cfg_scale"]

        # guidance_scale
        if kwargs.get("guidance_scale") is not None:
            input_data["guidance_scale"] = kwargs["guidance_scale"]

        # mode (standard/pro)
        if kwargs.get("mode"):
            input_data["mode"] = kwargs["mode"]

        # reference_images (list of URLs, for v1.6)
        if kwargs.get("reference_images"):
            input_data["reference_images"] = kwargs["reference_images"]

        # character_orientation (for motion control)
        if kwargs.get("character_orientation"):
            input_data["character_orientation"] = kwargs["character_orientation"]

        # keep_original_sound (for motion control)
        if "keep_original_sound" in kwargs and kwargs["keep_original_sound"] is not None:
            input_data["keep_original_sound"] = kwargs["keep_original_sound"]

        # video / video_url (for motion control, lip sync)
        if kwargs.get("video_url"):
            input_data["video"] = kwargs["video_url"]

        # audio / audio_file (for avatar, lip sync)
        if kwargs.get("audio_url"):
            input_data["audio"] = kwargs["audio_url"]

        # text (for lip sync text mode)
        if kwargs.get("text"):
            input_data["text"] = kwargs["text"]

        # voice_id (for lip sync)
        if kwargs.get("voice_id"):
            input_data["voice_id"] = kwargs["voice_id"]

        # voice_speed (for lip sync)
        if kwargs.get("voice_speed") is not None:
            input_data["voice_speed"] = kwargs["voice_speed"]

        return {"input": input_data}

    async def _poll_for_result(
        self,
        prediction_url: str,
        headers: Dict[str, str],
        max_polls: int = 120,
    ) -> str:
        """Poll Replicate prediction until succeeded or failed"""
        async with HttpClient.create_aiohttp() as session:
            for _ in range(max_polls):  # configurable timeout
                await asyncio.sleep(5)

                async with session.get(prediction_url, headers=headers) as response:
                    data = await response.json()
                    status = data.get("status")

                    print(f"🎬 Replicate video polling status: {status}")

                    if status == "succeeded":
                        output = data.get("output")
                        if isinstance(output, str):
                            return output
                        if isinstance(output, list) and len(output) > 0:
                            return output[0]
                        raise Exception("No video URL in succeeded prediction")

                    if status in ("failed", "canceled"):
                        error = data.get("error", "Unknown error")
                        raise Exception(
                            f"Replicate video generation failed: {error}"
                        )

            timeout_mins = (max_polls * 5) // 60
            raise Exception(f"Replicate video generation timeout ({timeout_mins} minutes)")

    async def generate(
        self,
        prompt: str,
        model: str,
        resolution: str = "480p",
        duration: int = 5,
        aspect_ratio: str = "16:9",
        input_images: Optional[list[str]] = None,
        camera_fixed: bool = True,
        **kwargs: Any,
    ) -> str:
        """
        Generate video using Replicate API with async polling.

        Returns:
            str: Video URL for download
        """
        try:
            headers = self._build_headers()
            replicate_model = self._get_replicate_model(model)
            payload = self._build_payload(
                prompt=prompt,
                resolution=resolution,
                duration=duration,
                aspect_ratio=aspect_ratio,
                input_images=input_images,
                camera_fixed=camera_fixed,
                **kwargs,
            )

            url = f"https://api.replicate.com/v1/models/{replicate_model}/predictions"
            print(f"🎬 Replicate video request: {url}")
            print(f"🎬 Replicate video payload: {payload}")

            async with HttpClient.create_aiohttp() as session:
                async with session.post(
                    url, json=payload, headers=headers
                ) as response:
                    if response.status not in (200, 201):
                        error_text = await response.text()
                        raise Exception(
                            f"Replicate API error: {response.status} - {error_text}"
                        )

                    response_json = await response.json()
                    status = response_json.get("status")

                    # If already succeeded (unlikely for video)
                    if status == "succeeded":
                        output = response_json.get("output")
                        if isinstance(output, str):
                            return output
                        if isinstance(output, list) and len(output) > 0:
                            return output[0]

                    # Get the prediction URL for polling
                    prediction_url = response_json.get("urls", {}).get("get")
                    if not prediction_url:
                        prediction_id = response_json.get("id")
                        if prediction_id:
                            prediction_url = f"https://api.replicate.com/v1/predictions/{prediction_id}"
                        else:
                            raise Exception(
                                "No prediction URL or ID in Replicate response"
                            )

            # Determine polling limit based on model (pro modes take longer)
            max_polls = kwargs.get("max_polls", 120)

            # Poll for result
            video_url = await self._poll_for_result(prediction_url, headers, max_polls)
            print(f"🎬 Replicate video generation completed: {video_url}")
            return video_url

        except Exception as e:
            print(f"🎬 Error generating video with Replicate: {e}")
            traceback.print_exc()
            raise e
