from fastapi.responses import FileResponse, RedirectResponse
from fastapi.concurrency import run_in_threadpool
from common import DEFAULT_PORT
from tools.utils.image_canvas_utils import generate_file_id
from services.config_service import FILES_DIR
from services import storage_service
from middleware.auth import get_current_user

from PIL import Image
from io import BytesIO
import os
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
import httpx
import aiofiles
from mimetypes import guess_type
from utils.http_client import HttpClient

router = APIRouter(prefix="/api")
os.makedirs(FILES_DIR, exist_ok=True)


# 上传图片接口，支持表单提交
@router.post("/upload_image")
async def upload_image(
    file: UploadFile = File(...),
    max_size_mb: float = 3.0,
    user_id: str = Depends(get_current_user),
):
    print('🦄upload_image file', file.filename)
    # 生成文件 ID 和文件名
    file_id = generate_file_id()
    filename = file.filename or ''

    # Read the file content
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {e}")
    original_size_mb = len(content) / (1024 * 1024)  # Convert to MB

    # Open the image from bytes to get its dimensions
    with Image.open(BytesIO(content)) as img:
        width, height = img.size

        # Check if compression is needed
        if original_size_mb > max_size_mb:
            print(f'🦄 Image size ({original_size_mb:.2f}MB) exceeds limit ({max_size_mb}MB), compressing...')

            # Convert to RGB if necessary (for JPEG compression)
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            compressed_content = compress_image(img, max_size_mb)
            extension = 'jpg'
            content_type = 'image/jpeg'

            with Image.open(BytesIO(compressed_content)) as compressed_img:
                width, height = compressed_img.size

            final_size_mb = len(compressed_content) / (1024 * 1024)
            print(f'🦄 Compressed from {original_size_mb:.2f}MB to {final_size_mb:.2f}MB')
            upload_bytes = compressed_content
        else:
            mime_type, _ = guess_type(filename)
            if mime_type and mime_type.startswith('image/'):
                extension = mime_type.split('/')[-1]
                if extension == 'jpeg':
                    extension = 'jpg'
            else:
                extension = 'jpg'
            content_type = f'image/{extension}'

            # Re-save via Pillow for consistency
            save_format = 'JPEG' if extension.lower() in ['jpg', 'jpeg'] else extension.upper()
            if save_format == 'JPEG':
                img = img.convert('RGB')
            buf = BytesIO()
            await run_in_threadpool(img.save, buf, format=save_format)
            upload_bytes = buf.getvalue()

    # Upload to Supabase Storage
    final_filename = f'{file_id}.{extension}'
    public_url = await storage_service.upload_file(
        user_id=user_id,
        file_bytes=upload_bytes,
        filename=final_filename,
        bucket=storage_service.UPLOADS_BUCKET,
        content_type=content_type,
    )

    print('🦄upload_image uploaded to supabase:', public_url)
    return {
        'file_id': final_filename,
        'url': public_url,
        'width': width,
        'height': height,
    }


def compress_image(img: Image.Image, max_size_mb: float) -> bytes:
    """
    Compress an image to be under the specified size limit.
    """
    quality = 95

    while quality > 10:
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=quality, optimize=True)
        size_mb = len(buffer.getvalue()) / (1024 * 1024)
        if size_mb <= max_size_mb:
            return buffer.getvalue()
        quality -= 10

    original_width, original_height = img.size
    scale_factor = 0.8

    while scale_factor > 0.3:
        new_width = int(original_width * scale_factor)
        new_height = int(original_height * scale_factor)
        resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        buffer = BytesIO()
        resized_img.save(buffer, format='JPEG', quality=70, optimize=True)
        size_mb = len(buffer.getvalue()) / (1024 * 1024)
        if size_mb <= max_size_mb:
            return buffer.getvalue()
        scale_factor -= 0.1

    buffer = BytesIO()
    resized_img.save(buffer, format='JPEG', quality=30, optimize=True)
    return buffer.getvalue()


# 文件下载接口 — serves local files or redirects to Supabase URLs
@router.get("/file/{file_id}")
async def get_file(file_id: str):
    # First check local files (backward compat)
    file_path = os.path.join(FILES_DIR, f'{file_id}')
    if os.path.exists(file_path):
        return FileResponse(file_path)
    # File not found locally — it's likely on Supabase Storage
    raise HTTPException(status_code=404, detail="File not found")
