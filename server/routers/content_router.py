"""
Content router — CRUD endpoints for user's generated content.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from middleware.auth import get_current_user
from services.db_service import db_service
from services import storage_service

router = APIRouter(prefix="/api/my-content")


@router.get("")
async def list_my_content(
    type: Optional[str] = Query(None, description="Filter by 'image' or 'video'"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    user_id: str = Depends(get_current_user),
):
    """Return paginated list of current user's generated content."""
    offset = (page - 1) * limit
    items = await db_service.list_generated_content(
        user_id=user_id,
        content_type=type,
        limit=limit,
        offset=offset,
    )
    return {"items": items, "page": page, "limit": limit}


@router.get("/{content_id}")
async def get_my_content(
    content_id: str,
    user_id: str = Depends(get_current_user),
):
    """Return a single generated content item."""
    item = await db_service.get_generated_content(content_id, user_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    return item


@router.delete("/{content_id}")
async def delete_my_content(
    content_id: str,
    user_id: str = Depends(get_current_user),
):
    """Delete a generated content item and its storage file."""
    item = await db_service.get_generated_content(content_id, user_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")

    # Delete from Supabase Storage
    storage_path = item.get("storage_path", "")
    if storage_path:
        try:
            bucket = storage_service.GENERATED_CONTENT_BUCKET
            await storage_service.delete_file(bucket, storage_path)
        except Exception as e:
            print(f"Warning: Failed to delete storage file {storage_path}: {e}")

    # Delete DB record
    await db_service.delete_generated_content(content_id, user_id)
    return {"status": "deleted", "id": content_id}
