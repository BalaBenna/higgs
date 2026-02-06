import os
import traceback
from PIL import Image, PngImagePlugin
from io import BytesIO
import base64
import json
from typing import Any, Optional, Tuple
from nanoid import generate
from utils.http_client import HttpClient
from services.config_service import FILES_DIR
from services.storage_service import upload_file as storage_upload_file


def generate_image_id() -> str:
    """Generate unique image ID"""
    return generate(size=10)


async def get_image_info_and_save(
    url: str,
    file_path_without_extension: str,
    is_b64: bool = False,
    metadata: Optional[dict[str, Any]] = None
) -> Tuple[str, int, int, str]:
    """
    Download image from URL or decode base64, convert to PNG and save with metadata

    Args:
        url: Image URL or base64 string
        file_path_without_extension: File path without extension
        is_b64: Whether the url is a base64 string
        metadata: Optional metadata to be saved in PNG info

    Returns:
        tuple[str, int, int, str]: (mime_type, width, height, extension) - always PNG
    """
    try:
        if is_b64:
            image_data = base64.b64decode(url)
        else:
            # Fetch the image asynchronously
            async with HttpClient.create_aiohttp() as session:
                async with session.get(url) as response:
                    # Read the image content as bytes
                    image_data = await response.read()

        # Open image to get info
        image = Image.open(BytesIO(image_data))
        width, height = image.size
        
        # Store original format for debugging
        original_format = image.format or 'Unknown'
        print(f"Converting {original_format} image to PNG: {width}x{height}")

        # Handle different color modes properly for PNG conversion
        if image.mode == 'P':
            # Palette mode - convert to RGBA to preserve potential transparency
            if 'transparency' in image.info:
                image = image.convert('RGBA')
            else:
                image = image.convert('RGB')
        elif image.mode == 'LA':
            # Grayscale with alpha - convert to RGBA
            image = image.convert('RGBA')
        elif image.mode == 'L':
            # Grayscale - can stay as L or convert to RGB
            # PNG supports grayscale, so we can keep it
            pass
        elif image.mode == 'CMYK':
            # CMYK mode - convert to RGB
            image = image.convert('RGB')
        elif image.mode in ('RGB', 'RGBA'):
            # Already compatible with PNG
            pass
        else:
            # For any other modes, convert to RGB as a safe fallback
            print(f"Warning: Unusual color mode {image.mode}, converting to RGB")
            image = image.convert('RGB')

        # Unified format: always PNG
        extension = 'png'
        mime_type = 'image/png'

        # Prepare PNG info for metadata
        pnginfo = PngImagePlugin.PngInfo()
        
        # Add original format info
        pnginfo.add_text("original_format", original_format)
        
        if metadata:
            for key, value in metadata.items():
                try:
                    # Handle different value types
                    if isinstance(value, (dict, list)):
                        # Serialize complex types as JSON
                        text_value = json.dumps(value, ensure_ascii=False)
                    elif value is None:
                        text_value = "null"
                    else:
                        # Convert to string
                        text_value = str(value)
                    
                    pnginfo.add_text(str(key), text_value)
                except Exception as e:
                    print(f"Warning: Failed to add metadata key '{key}': {e}")
                    traceback.print_stack()

        # Save as PNG with metadata
        file_path = f"{file_path_without_extension}.{extension}"
        
        # Save with optimizations and metadata
        if metadata or original_format != 'PNG':
            image.save(file_path, format='PNG', optimize=True, pnginfo=pnginfo)
        else:
            image.save(file_path, format='PNG', optimize=True)
        
        print(f"Successfully saved as PNG: {file_path}")
        return mime_type, width, height, extension

    except Exception as e:
        print(f"Error processing image: {e}")
        raise e


async def get_image_info_and_process(
    url: str,
    is_b64: bool = False,
    metadata: Optional[dict[str, Any]] = None,
) -> Tuple[bytes, str, int, int, str]:
    """
    Download/decode image, convert to PNG, return processed bytes + metadata.
    Does NOT save to disk — caller is responsible for uploading to Supabase Storage.

    Returns:
        (image_bytes, mime_type, width, height, extension)
    """
    try:
        if is_b64:
            image_data = base64.b64decode(url)
        else:
            async with HttpClient.create_aiohttp() as session:
                async with session.get(url) as response:
                    image_data = await response.read()

        image = Image.open(BytesIO(image_data))
        width, height = image.size
        original_format = image.format or "Unknown"

        # Handle color modes (same logic as get_image_info_and_save)
        if image.mode == "P":
            image = image.convert("RGBA") if "transparency" in image.info else image.convert("RGB")
        elif image.mode == "LA":
            image = image.convert("RGBA")
        elif image.mode == "L":
            pass
        elif image.mode == "CMYK":
            image = image.convert("RGB")
        elif image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")

        extension = "png"
        mime_type = "image/png"

        pnginfo = PngImagePlugin.PngInfo()
        pnginfo.add_text("original_format", original_format)
        if metadata:
            for key, value in metadata.items():
                try:
                    if isinstance(value, (dict, list)):
                        text_value = json.dumps(value, ensure_ascii=False)
                    elif value is None:
                        text_value = "null"
                    else:
                        text_value = str(value)
                    pnginfo.add_text(str(key), text_value)
                except Exception as e:
                    print(f"Warning: Failed to add metadata key '{key}': {e}")

        buf = BytesIO()
        image.save(buf, format="PNG", optimize=True, pnginfo=pnginfo)
        image_bytes = buf.getvalue()

        return image_bytes, mime_type, width, height, extension

    except Exception as e:
        print(f"Error processing image: {e}")
        raise


# Canvas-related utilities have been moved to tools/image_generation/image_canvas_utils.py


# Canvas element generation moved to tools/image_generation/image_canvas_utils.py


# Canvas saving functionality moved to tools/image_generation/image_canvas_utils.py


# Image generation orchestration moved to tools/image_generation/image_generation_core.py
# Notification functions moved to tools/image_generation/image_canvas_utils.py


async def process_input_image(input_image: str | None) -> str | None:
    """
    Process input image and convert to base64 format.
    Supports both Supabase Storage URLs (https://...) and local file paths.

    Args:
        input_image: Image file path or URL

    Returns:
        Base64 encoded image with data URL, or None if no image
    """
    if not input_image:
        return None

    try:
        # Handle URLs (Supabase Storage or any HTTP URL)
        if input_image.startswith("http://") or input_image.startswith("https://"):
            async with HttpClient.create_aiohttp() as session:
                async with session.get(input_image) as response:
                    image_data = await response.read()
            image = Image.open(BytesIO(image_data))
            # Determine mime type from URL extension or default
            ext = os.path.splitext(input_image.split("?")[0])[1].lower()
        else:
            # Local file path (backward compat)
            full_path = os.path.join(FILES_DIR, input_image)
            if not os.path.exists(full_path):
                print(f"Warning: Image file not found: {full_path}")
                return None
            image = Image.open(full_path)
            ext = os.path.splitext(input_image)[1].lower()

        mime_type_map = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp'
        }
        mime_type = mime_type_map.get(ext, 'image/jpeg')

        with BytesIO() as output:
            image.save(output, format=str(mime_type.split('/')[1]).upper())
            compressed_data = output.getvalue()
            b64_data = base64.b64encode(compressed_data).decode('utf-8')

        data_url = f"data:{mime_type};base64,{b64_data}"
        return data_url

    except Exception as e:
        print(f"Error processing image {input_image}: {e}")
        return None
