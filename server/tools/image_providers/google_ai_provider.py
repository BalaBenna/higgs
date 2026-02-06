import os
import traceback
from typing import Optional, Any
from .image_base_provider import ImageProviderBase
from ..utils.image_utils import get_image_info_and_save, generate_image_id
from services.config_service import FILES_DIR
from services.config_service import config_service


class GoogleAIImageProvider(ImageProviderBase):
    """Google AI Studio (Gemini API) image generation provider implementation"""

    async def generate(
        self,
        prompt: str,
        model: str,
        aspect_ratio: str = "1:1",
        input_images: Optional[list[str]] = None,
        **kwargs: Any
    ) -> tuple[str, int, int, str]:
        """
        Generate image using Google AI Studio (Gemini API)

        Returns:
            tuple[str, int, int, str]: (mime_type, width, height, filename)
        """
        try:
            from google import genai
            from google.genai import types
        except ImportError:
            raise ImportError("Please install google-genai: pip install google-genai")

        config = config_service.app_config.get('vertex-ai', {})
        api_key = str(config.get("api_key", ""))

        if not api_key:
            raise ValueError("Google AI Studio API key is not configured. Set GOOGLE_VERTEX_AI_API_KEY in .env")

        try:
            client = genai.Client(api_key=api_key)

            # Remove prefix if present
            imagen_model = model.replace('google/', '')
            
            # Use passed model, or fallback to 4.0 if not specified
            if not imagen_model:
                imagen_model = "imagen-4.0-generate-001"

            # Get number of images from kwargs
            num_images = kwargs.get("num_images", 1)
            
            # Google AI Studio / Vertex AI typically limits to 4 images per request
            MAX_BATCH_SIZE = 4
            results = []
            
            # Calculate number of batches needed
            import math
            batches = math.ceil(num_images / MAX_BATCH_SIZE)
            
            for i in range(batches):
                # Calculate remaining images
                remaining = num_images - (i * MAX_BATCH_SIZE)
                current_batch_size = min(remaining, MAX_BATCH_SIZE)
                
                try:
                    # Generate image
                    response = client.models.generate_images(
                        model=imagen_model,
                        prompt=prompt,
                        config=types.GenerateImagesConfig(
                            number_of_images=current_batch_size,
                            aspect_ratio=aspect_ratio,
                        )
                    )

                    if not response.generated_images or len(response.generated_images) == 0:
                        print(f"Warning: No images generated in batch {i+1}")
                        continue

                    # Process all generated images in this batch
                    for generated_image in response.generated_images:
                        # Save the image
                        image_id = generate_image_id()
                        file_path = os.path.join(FILES_DIR, f'{image_id}')
                        
                        # The image data is in bytes format
                        image_bytes = generated_image.image.image_bytes
                        
                        # Save to file
                        with open(f'{file_path}.png', 'wb') as f:
                            f.write(image_bytes)
                        
                        # Get image dimensions using PIL
                        from PIL import Image
                        from io import BytesIO
                        img = Image.open(BytesIO(image_bytes))
                        width, height = img.size
                        
                        filename = f'{image_id}.png'
                        results.append(('image/png', width, height, filename))
                except Exception as batch_e:
                    print(f"Error in Google Imagen batch {i+1}: {batch_e}")
                    traceback.print_exc()
                    

                    # If this is a permission/quota error, we should probably stop trying
                    error_str = str(batch_e).lower()
                    if "403" in error_str or "permission" in error_str or "quota" in error_str:
                         print("Stopping further batches due to potential auth/quota error.")
                         break
                    continue

            if not results:
                print("DEBUG: Google AI Provider failed to generate any images.")
                raise Exception("No images generated from any batch. Check server logs for details.")
            
            # Return list
            return results

        except Exception as e:
            print('Error generating image with Google AI Studio:', e)
            traceback.print_exc()
            raise e
