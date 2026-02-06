"""
Google Veo 3 Video Generation Provider
Uses Google AI Gemini API (predictLongRunning) for Veo 3 video generation
Based on official Google AI documentation
"""

import os
import asyncio
import traceback
from typing import Optional, Any, List, Dict

from .video_base_provider import VideoProviderBase
from utils.http_client import HttpClient
from services.config_service import config_service


class GoogleVeoProvider(VideoProviderBase, provider_name="google-veo"):
    """Google Veo 3 video generation provider using Gemini API"""

    def __init__(self):
        """Initialize the Google Veo provider"""
        config = config_service.app_config.get('google', {})
        self.api_key = str(config.get("api_key", ""))

        if not self.api_key:
            self.api_key = os.environ.get("GOOGLE_API_KEY", "")

        # Google AI Gemini API base URL
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        
        # Model name from Google's documentation
        self.model_name = "veo-3.1-generate-preview"
        
    def _build_headers(self) -> Dict[str, str]:
        """Build request headers with API key"""
        return {
            'Content-Type': 'application/json',
            'x-goog-api-key': self.api_key,
        }

    def _build_payload(
        self,
        prompt: str,
        aspect_ratio: str = "16:9",
        resolution: str = "720p",
        **kwargs: Any
    ) -> Dict[str, Any]:
        """Build request payload for Google Veo API (correct format from docs)"""
        
        payload: Dict[str, Any] = {
            "instances": [
                {
                    "prompt": prompt
                }
            ]
        }
        
        # Add optional parameters
        parameters: Dict[str, Any] = {}
        
        if aspect_ratio and aspect_ratio != "16:9":
            parameters["aspectRatio"] = aspect_ratio
            
        if resolution and resolution != "720p":
            parameters["resolution"] = resolution
            
        if parameters:
            payload["parameters"] = parameters

        return payload

    async def _poll_for_result(
        self,
        operation_name: str,
        headers: Dict[str, str],
    ) -> str:
        """Poll for video generation result"""
        status_url = f"{self.base_url}/{operation_name}"

        async with HttpClient.create_aiohttp() as session:
            for attempt in range(180):  # Max 30 minutes polling (video takes time)
                await asyncio.sleep(10)  # Poll every 10 seconds as per docs
                
                print(f"🎬 Google Veo polling attempt {attempt + 1}...")
                
                async with session.get(status_url, headers=headers) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        print(f"🎬 Polling error: {response.status} - {error_text}")
                        continue
                        
                    status_data = await response.json()
                    done = status_data.get("done", False)
                    
                    print(f"🎬 Google Veo status: done={done}")

                    if done:
                        # Check for result using correct path from docs
                        response_data = status_data.get("response", {})
                        generate_response = response_data.get("generateVideoResponse", {})
                        samples = generate_response.get("generatedSamples", [])
                        
                        if samples and len(samples) > 0:
                            video = samples[0].get("video", {})
                            video_uri = video.get("uri")
                            if video_uri:
                                print(f"🎬 Got video URI: {video_uri}")
                                return video_uri
                        
                        # Check for error
                        error = status_data.get("error")
                        if error:
                            raise Exception(f"Google Veo error: {error}")
                        
                        raise Exception(f"No video in completed result: {status_data}")

            raise Exception("Google Veo video generation timeout (30 minutes)")

    async def generate(
        self,
        prompt: str,
        model: str = "veo-3",
        resolution: str = "720p",
        duration: int = 5,
        aspect_ratio: str = "16:9",
        input_images: Optional[List[str]] = None,
        **kwargs: Any
    ) -> str:
        """
        Generate video using Google Veo API

        Returns:
            str: Video URL for download
        """
        if not self.api_key:
            raise ValueError("Google API key is not configured. Please set GOOGLE_API_KEY in your .env file.")

        try:
            headers = self._build_headers()
            payload = self._build_payload(
                prompt=prompt,
                aspect_ratio=aspect_ratio,
                resolution=resolution,
                **kwargs
            )

            # Use predictLongRunning endpoint (correct from docs)
            generate_url = f"{self.base_url}/models/{self.model_name}:predictLongRunning"

            print(f"🎬 Google Veo request to: {generate_url}")
            print(f"🎬 Google Veo payload: {payload}")

            async with HttpClient.create_aiohttp() as session:
                async with session.post(generate_url, json=payload, headers=headers) as response:
                    response_text = await response.text()
                    print(f"🎬 Google Veo response status: {response.status}")
                    print(f"🎬 Google Veo response: {response_text[:1000]}")
                    
                    if response.status != 200:
                        raise Exception(f"Google Veo API error: {response.status} - {response_text}")

                    response_json = await response.json()
                    
                    # Get operation name for polling
                    operation_name = response_json.get("name")
                    if not operation_name:
                        raise Exception(f"No operation name in response: {response_json}")
                    
                    print(f"🎬 Google Veo operation started: {operation_name}")
                    
                    # Poll for result
                    video_url = await self._poll_for_result(operation_name, headers)
                    print(f"🎬 Google Veo video generation completed: {video_url}")
                    return video_url

        except Exception as e:
            print(f'🎬 Error generating video with Google Veo: {e}')
            traceback.print_exc()
            raise e
