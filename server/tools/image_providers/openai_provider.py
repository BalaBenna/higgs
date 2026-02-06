import os
import traceback
from typing import Optional, Any
from openai import OpenAI
from .image_base_provider import ImageProviderBase
from ..utils.image_utils import get_image_info_and_save, generate_image_id
from services.config_service import FILES_DIR
from services.config_service import config_service


class OpenAIImageProvider(ImageProviderBase):
    """OpenAI image generation provider implementation"""

    async def generate(
        self,
        prompt: str,
        model: str,
        aspect_ratio: str = "1:1",
        input_images: Optional[list[str]] = None,
        **kwargs: Any
    ) -> tuple[str, int, int, str]:
        """
        Generate image using OpenAI API

        Returns:
            tuple[str, int, int, str]: (mime_type, width, height, filename)
        """

        config = config_service.app_config.get('openai', {})
        self.api_key = str(config.get("api_key", ""))
        self.base_url = str(config.get("url", ""))  # 可选

        if not self.api_key:
            raise ValueError("OpenAI API key is not configured")

        # Create OpenAI client
        self.client = OpenAI(api_key=self.api_key,
                             base_url=self.base_url or None)
        try:
            # Remove openai/ prefix if present
            model = model.replace('openai/', '')

            # Determine if this is an edit operation or generation
            if input_images and len(input_images) > 0:
                # Image editing mode
                input_image_path = input_images[0]
                # For OpenAI, input_image should be the file path
                full_path = os.path.join(FILES_DIR, input_image_path)

                with open(full_path, 'rb') as image_file:
                    result = self.client.images.edit(
                        model=model,
                        image=image_file,
                        prompt=prompt,
                        n=kwargs.get("num_images", 1)
                    )
            else:
                # Image generation mode
                # Map aspect ratio to size - DALL-E 3 only supports these sizes
                size_map = {
                    "1:1": "1024x1024",
                    "16:9": "1792x1024",
                    "9:16": "1024x1792",
                    "4:3": "1024x1024",  # Use square as fallback
                    "3:4": "1024x1024"   # Use square as fallback
                }
                size = size_map.get(aspect_ratio, "1024x1024")
                
                num_images = kwargs.get("num_images", 1)
                
                # result container
                generated_data = []
                
                # DALL-E 3 only supports n=1
                if 'dall-e-3' in model and num_images > 1:
                    print(f"DALL-E 3 detected, generating {num_images} images in parallel")
                    
                    import asyncio
                    from fastapi.concurrency import run_in_threadpool
                    
                    async def generate_single(idx):
                        try:
                            print(f"Starting generation {idx+1}/{num_images}")
                            res = await run_in_threadpool(
                                self.client.images.generate,
                                model=model,
                                prompt=prompt,
                                n=1,
                                size=size,
                            )
                            return res.data if res.data else []
                        except Exception as e:
                            print(f"Error in generation {idx+1}: {e}")
                            return []

                    # Run all requests in parallel
                    tasks = [generate_single(i) for i in range(num_images)]
                    results_list = await asyncio.gather(*tasks)
                    
                    for r in results_list:
                        generated_data.extend(r)
                        
                else:
                    # For other models or single image, try batching
                    # Note: DALL-E 2 limit is 10, but we assume client handles sane limits or we just trust API for now
                    result = self.client.images.generate(
                        model=model,
                        prompt=prompt,
                        n=num_images,
                        size=size,
                    )
                    if result.data:
                        generated_data = result.data

            # Process the result
            if not generated_data:
                raise Exception("No image data returned from OpenAI API")

            results = []
            
            for image_data in generated_data:
                # Handle different response formats
                if hasattr(image_data, 'b64_json') and image_data.b64_json:
                    # Base64 response
                    image_b64 = image_data.b64_json
                    image_id = generate_image_id()
                    mime_type, width, height, extension = await get_image_info_and_save(
                        image_b64, os.path.join(FILES_DIR, f'{image_id}'), is_b64=True
                    )
                elif hasattr(image_data, 'url') and image_data.url:
                    # URL response
                    image_url = image_data.url
                    image_id = generate_image_id()
                    mime_type, width, height, extension = await get_image_info_and_save(
                        image_url, os.path.join(FILES_DIR, f'{image_id}')
                    )
                else:
                    continue # Skip invalid data
                
                if mime_type:
                    filename = f'{image_id}.{extension}'
                    results.append((mime_type, width, height, filename))
            
            if not results:
                 raise Exception("Failed to process generated images")

            return results

        except Exception as e:
            print('Error generating image with OpenAI:', e)
            traceback.print_exc()
            raise e
