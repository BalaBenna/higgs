"""
Content router — CRUD endpoints for user's generated content.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from middleware.auth import get_current_user
from services.db_service import db_service
from services import storage_service

router = APIRouter(prefix="/api/my-content")


class SaveVibeMotionRequest(BaseModel):
    prompt: str
    preset: str
    code: str
    model: str
    style: Optional[str] = None
    duration: int = 10
    aspect_ratio: str = "16:9"
    media_urls: Optional[List[str]] = None


@router.post("/vibe-motion")
async def save_vibe_motion_content(
    req: SaveVibeMotionRequest,
    user_id: str = Depends(get_current_user),
):
    """Save a vibe motion project as video content to My Content."""
    from tools.utils.image_canvas_utils import generate_file_id

    file_id = generate_file_id()
    metadata = {
        "preset": req.preset,
        "code": req.code[:500] if req.code else None,  # Store truncated code preview
        "style": req.style,
        "duration": req.duration,
        "aspect_ratio": req.aspect_ratio,
        "media_urls": req.media_urls,
        "provider": "vibe-motion",
    }

    storage_path = f"{user_id}/{file_id}.json"
    await storage_service.upload_file(
        user_id=user_id,
        file_bytes=req.code.encode("utf-8"),
        filename=f"{file_id}.json",
        bucket=storage_service.GENERATED_CONTENT_BUCKET,
        content_type="application/json",
    )

    await db_service.insert_generated_content(
        {
            "user_id": user_id,
            "type": "video",
            "storage_path": storage_path,
            "prompt": req.prompt,
            "model": req.model,
            "metadata": metadata,
        }
    )

    # Also save to vibe_motion_projects table for the "Your Projects" listing
    try:
        await db_service.create_vibe_motion_project(
            id=file_id,
            name=req.prompt[:80] if req.prompt else "Untitled",
            preset=req.preset,
            user_id=user_id,
            prompt=req.prompt,
            code=req.code,
            model=req.model,
            style=req.style,
            duration=req.duration,
            aspect_ratio=req.aspect_ratio,
            media_urls=req.media_urls,
        )
    except Exception as e:
        print(f"Warning: Failed to save vibe motion project: {e}")

    return {"status": "saved", "file_id": file_id}


@router.get("/vibe-motion/projects")
async def list_vibe_motion_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user),
):
    """Return paginated list of user's vibe motion projects."""
    offset = (page - 1) * limit
    items = await db_service.list_vibe_motion_projects(
        user_id=user_id, limit=limit, offset=offset
    )
    return {"items": items, "page": page, "limit": limit}


@router.get("")
async def list_my_content(
    type: Optional[str] = Query(None, description="Filter by 'image' or 'video'"),
    feature_type: Optional[str] = Query(None, description="Filter by feature type (e.g. 'character_swap', 'face_swap')"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    user_id: str = Depends(get_current_user),
):
    """Return paginated list of current user's generated content."""
    offset = (page - 1) * limit
    items = await db_service.list_generated_content(
        user_id=user_id,
        content_type=type,
        feature_type=feature_type,
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
