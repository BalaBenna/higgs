"""
Auth router — provides /api/auth/me for the frontend to get the current user's profile.
"""

from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import get_current_user
from services.supabase_service import get_supabase

router = APIRouter(prefix="/api/auth")


@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user)):
    """Return the current user's profile from Supabase Auth."""
    try:
        sb = get_supabase()
        user_response = sb.auth.admin.get_user_by_id(user_id)
        user = user_response.user
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Extract user metadata (Google profile info lives here)
        meta = user.user_metadata or {}
        return {
            "id": user.id,
            "email": user.email,
            "name": meta.get("full_name") or meta.get("name", ""),
            "avatar_url": meta.get("avatar_url") or meta.get("picture", ""),
            "provider": (user.app_metadata or {}).get("provider", ""),
            "created_at": str(user.created_at) if user.created_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
