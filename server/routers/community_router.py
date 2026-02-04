"""
Community Router - API endpoints for community gallery and social features
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/community", tags=["community"])

# In-memory storage for now (will be migrated to DB)
gallery_items_db: Dict[str, Dict[str, Any]] = {}
likes_db: Dict[str, set] = {}  # item_id -> set of user_ids
comments_db: Dict[str, List[Dict[str, Any]]] = {}  # item_id -> list of comments

# Mock user ID (in real app, would come from auth)
MOCK_USER_ID = "user_1"


class GalleryItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: Literal["image", "video"]
    media_url: str
    thumbnail_url: Optional[str] = None
    model_used: Optional[str] = None
    prompt: Optional[str] = None
    tags: List[str] = []


class GalleryItemResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    type: str
    media_url: str
    thumbnail_url: Optional[str]
    model_used: Optional[str]
    prompt: Optional[str]
    tags: List[str]
    author_id: str
    author_name: str
    likes_count: int
    is_liked: bool
    comments_count: int
    created_at: str


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: str
    item_id: str
    author_id: str
    author_name: str
    content: str
    created_at: str


class GalleryListResponse(BaseModel):
    items: List[GalleryItemResponse]
    total: int
    page: int
    page_size: int


@router.get("/gallery", response_model=GalleryListResponse)
async def list_gallery(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    type: Optional[Literal["image", "video", "all"]] = "all",
    sort: Optional[Literal["recent", "popular", "trending"]] = "recent",
    model: Optional[str] = None,
    tag: Optional[str] = None,
):
    """List gallery items with filtering and pagination"""
    items = list(gallery_items_db.values())

    # Filter by type
    if type and type != "all":
        items = [i for i in items if i["type"] == type]

    # Filter by model
    if model:
        items = [i for i in items if i.get("model_used") == model]

    # Filter by tag
    if tag:
        items = [i for i in items if tag in i.get("tags", [])]

    # Sort
    if sort == "recent":
        items.sort(key=lambda x: x["created_at"], reverse=True)
    elif sort == "popular":
        items.sort(key=lambda x: len(likes_db.get(x["id"], set())), reverse=True)
    elif sort == "trending":
        # Simple trending: recent + popular
        items.sort(
            key=lambda x: (len(likes_db.get(x["id"], set())), x["created_at"]),
            reverse=True,
        )

    # Pagination
    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_items = items[start:end]

    # Build response with like info
    response_items = []
    for item in paginated_items:
        item_likes = likes_db.get(item["id"], set())
        response_items.append(
            GalleryItemResponse(
                **item,
                likes_count=len(item_likes),
                is_liked=MOCK_USER_ID in item_likes,
                comments_count=len(comments_db.get(item["id"], [])),
            )
        )

    return GalleryListResponse(
        items=response_items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/upload", response_model=GalleryItemResponse)
async def upload_to_gallery(item: GalleryItemCreate):
    """Share a creation to the community gallery"""
    item_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"

    item_data = {
        "id": item_id,
        "title": item.title,
        "description": item.description,
        "type": item.type,
        "media_url": item.media_url,
        "thumbnail_url": item.thumbnail_url or item.media_url,
        "model_used": item.model_used,
        "prompt": item.prompt,
        "tags": item.tags,
        "author_id": MOCK_USER_ID,
        "author_name": "You",  # Would come from user profile
        "created_at": now,
    }

    gallery_items_db[item_id] = item_data
    likes_db[item_id] = set()
    comments_db[item_id] = []

    return GalleryItemResponse(
        **item_data,
        likes_count=0,
        is_liked=False,
        comments_count=0,
    )


@router.get("/{item_id}", response_model=GalleryItemResponse)
async def get_gallery_item(item_id: str):
    """Get a specific gallery item"""
    if item_id not in gallery_items_db:
        raise HTTPException(status_code=404, detail="Item not found")

    item = gallery_items_db[item_id]
    item_likes = likes_db.get(item_id, set())

    return GalleryItemResponse(
        **item,
        likes_count=len(item_likes),
        is_liked=MOCK_USER_ID in item_likes,
        comments_count=len(comments_db.get(item_id, [])),
    )


@router.post("/{item_id}/like")
async def like_item(item_id: str):
    """Like or unlike a gallery item"""
    if item_id not in gallery_items_db:
        raise HTTPException(status_code=404, detail="Item not found")

    if item_id not in likes_db:
        likes_db[item_id] = set()

    is_liked = MOCK_USER_ID in likes_db[item_id]

    if is_liked:
        likes_db[item_id].discard(MOCK_USER_ID)
    else:
        likes_db[item_id].add(MOCK_USER_ID)

    return {
        "success": True,
        "is_liked": not is_liked,
        "likes_count": len(likes_db[item_id]),
    }


@router.get("/{item_id}/comments", response_model=List[CommentResponse])
async def get_comments(item_id: str):
    """Get comments for a gallery item"""
    if item_id not in gallery_items_db:
        raise HTTPException(status_code=404, detail="Item not found")

    return [CommentResponse(**c) for c in comments_db.get(item_id, [])]


@router.post("/{item_id}/comments", response_model=CommentResponse)
async def add_comment(item_id: str, comment: CommentCreate):
    """Add a comment to a gallery item"""
    if item_id not in gallery_items_db:
        raise HTTPException(status_code=404, detail="Item not found")

    comment_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"

    comment_data = {
        "id": comment_id,
        "item_id": item_id,
        "author_id": MOCK_USER_ID,
        "author_name": "You",  # Would come from user profile
        "content": comment.content,
        "created_at": now,
    }

    if item_id not in comments_db:
        comments_db[item_id] = []
    comments_db[item_id].append(comment_data)

    return CommentResponse(**comment_data)


@router.delete("/{item_id}")
async def delete_gallery_item(item_id: str):
    """Delete a gallery item (only owner can delete)"""
    if item_id not in gallery_items_db:
        raise HTTPException(status_code=404, detail="Item not found")

    item = gallery_items_db[item_id]
    if item["author_id"] != MOCK_USER_ID:
        raise HTTPException(status_code=403, detail="Not authorized to delete this item")

    del gallery_items_db[item_id]
    likes_db.pop(item_id, None)
    comments_db.pop(item_id, None)

    return {"success": True, "message": "Item deleted"}


@router.get("/user/{user_id}/items", response_model=List[GalleryItemResponse])
async def get_user_items(user_id: str):
    """Get all gallery items by a specific user"""
    items = [i for i in gallery_items_db.values() if i["author_id"] == user_id]

    response_items = []
    for item in items:
        item_likes = likes_db.get(item["id"], set())
        response_items.append(
            GalleryItemResponse(
                **item,
                likes_count=len(item_likes),
                is_liked=MOCK_USER_ID in item_likes,
                comments_count=len(comments_db.get(item["id"], [])),
            )
        )

    return response_items
