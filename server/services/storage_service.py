"""
Supabase Storage service for file uploads/downloads.
Replaces local FILES_DIR storage with Supabase Storage buckets.
"""

import os
from typing import Optional
from services.supabase_service import get_supabase


GENERATED_CONTENT_BUCKET = "generated-content"
UPLOADS_BUCKET = "uploads"


def _get_supabase_url() -> str:
    return os.getenv("SUPABASE_URL", "")


async def upload_file(
    user_id: str,
    file_bytes: bytes,
    filename: str,
    bucket: str = GENERATED_CONTENT_BUCKET,
    content_type: str = "image/png",
) -> str:
    """
    Upload a file to Supabase Storage.

    Args:
        user_id: Owner's user ID (used as folder prefix).
        file_bytes: Raw file bytes.
        filename: Filename (e.g. 'im_abc123.png').
        bucket: Storage bucket name.
        content_type: MIME type of the file.

    Returns:
        Public URL of the uploaded file.
    """
    sb = await get_supabase()
    storage_path = f"{user_id}/{filename}"

    await sb.storage.from_(bucket).upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": content_type, "upsert": "true"},
    )

    return await get_public_url(bucket, storage_path)


async def get_public_url(bucket: str, path: str) -> str:
    """Get the public URL for a file in Supabase Storage."""
    sb = await get_supabase()
    result = await sb.storage.from_(bucket).get_public_url(path)
    return result


async def list_files(
    user_id: str,
    bucket: str = UPLOADS_BUCKET,
    limit: int = 50,
    offset: int = 0,
) -> list[dict]:
    """
    List files in a Supabase Storage bucket for a given user.

    Returns a list of dicts with 'name' and 'url' keys.
    """
    sb = await get_supabase()
    result = await sb.storage.from_(bucket).list(
        path=user_id,
        options={"limit": limit, "offset": offset, "sortBy": {"column": "created_at", "order": "desc"}},
    )
    files = []
    for item in result:
        name = item.get("name", "")
        if not name or item.get("id") is None:
            continue
        storage_path = f"{user_id}/{name}"
        url = await get_public_url(bucket, storage_path)
        files.append({"name": name, "url": url, "created_at": item.get("created_at", "")})
    return files


async def delete_file(bucket: str, path: str) -> None:
    """Delete a file from Supabase Storage."""
    sb = await get_supabase()
    await sb.storage.from_(bucket).remove([path])
