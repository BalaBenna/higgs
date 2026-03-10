import os
import base64
import traceback
from io import BytesIO
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

                # Check if a mask image is provided (second input image)
                mask_file = None
                if len(input_images) > 1:
                    mask_path = input_images[1]
                    if mask_path.startswith("data:"):
                        _, mask_b64 = mask_path.split(",", 1)
                        mask_bytes = base64.b64decode(mask_b64)
                        mask_file = BytesIO(mask_bytes)
                        mask_file.name = "mask.png"
                    else:
                        mask_full_path = os.path.join(FILES_DIR, mask_path)
                        if os.path.exists(mask_full_path):
                            mask_file = open(mask_full_path, 'rb')

                edit_kwargs = {
                    "model": model,
                    "prompt": prompt,
                    "n": kwargs.get("num_images", 1),
                }
                if mask_file:
                    edit_kwargs["mask"] = mask_file

                if input_image_path.startswith("data:"):
                    # Base64 data URI from process_input_image
                    # Extract raw base64 after the header
                    _, b64_data = input_image_path.split(",", 1)
                    image_bytes = base64.b64decode(b64_data)
                    image_file = BytesIO(image_bytes)
                    image_file.name = "image.png"
                    edit_kwargs["image"] = image_file
                    result = self.client.images.edit(**edit_kwargs)
                else:
                    # Local file path
                    full_path = os.path.join(FILES_DIR, input_image_path)
                    with open(full_path, 'rb') as image_file:
                        edit_kwargs["image"] = image_file
                        result = self.client.images.edit(**edit_kwargs)

                # Clean up mask file handle if opened from disk
                if mask_file and hasattr(mask_file, 'close') and not isinstance(mask_file, BytesIO):
                    mask_file.close()

                # Collect results from edit operation
                generated_data = result.data if result.data else []
            else:
                # Image generation mode
                # Model-aware size mapping
                is_dalle3 = 'dall-e-3' in model
                if is_dalle3:
                    # DALL-E 3 supports: 1024x1024, 1792x1024, 1024x1792
                    size_map = {
                        "1:1": "1024x1024",
                        "16:9": "1792x1024",
                        "9:16": "1024x1792",
                        "4:3": "1792x1024",   # landscape
                        "3:4": "1024x1792",   # portrait
                    }
                else:
                    # GPT Image 1 / 1.5 supports: 1024x1024, 1536x1024, 1024x1536
                    size_map = {
                        "1:1": "1024x1024",
                        "16:9": "1536x1024",
                        "9:16": "1024x1536",
                        "4:3": "1536x1024",   # landscape
                        "3:4": "1024x1536",   # portrait
                    }
                size = size_map.get(aspect_ratio, "1024x1024")

                num_images = kwargs.get("num_images", 1)

                # DALL-E 3 native style support (vivid / natural)
                style_param = None
                if is_dalle3:
                    raw_style = kwargs.get("style", "")
                    if raw_style:
                        style_lower = raw_style.lower()
                        if style_lower in ("vivid", "natural"):
                            style_param = style_lower
                        else:
                            # Map common style names to DALL-E 3's "vivid" or "natural"
                            style_param = "vivid"  # default for artistic styles

                # result container
                generated_data = []

                # DALL-E 3 only supports n=1
                if is_dalle3 and num_images > 1:
                    print(f"DALL-E 3 detected, generating {num_images} images in parallel")

                    import asyncio
                    from fastapi.concurrency import run_in_threadpool

                    async def generate_single(idx):
                        try:
                            print(f"Starting generation {idx+1}/{num_images}")
                            gen_kwargs = dict(
                                model=model,
                                prompt=prompt,
                                n=1,
                                size=size,
                            )
                            if style_param:
                                gen_kwargs["style"] = style_param
                            res = await run_in_threadpool(
                                self.client.images.generate,
                                **gen_kwargs,
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
                    gen_kwargs = dict(
                        model=model,
                        prompt=prompt,
                        n=num_images,
                        size=size,
                    )
                    if style_param:
                        gen_kwargs["style"] = style_param
                    result = self.client.images.generate(**gen_kwargs)
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
