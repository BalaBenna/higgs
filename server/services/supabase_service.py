"""
Supabase client singleton service.
Provides a service-role client for backend operations (bypasses RLS).
"""

import os
from typing import Optional
from supabase._async.client import create_client, AsyncClient


_supabase_client: Optional[AsyncClient] = None


async def get_supabase() -> AsyncClient:
    """Get or create the Supabase client singleton."""
    global _supabase_client
    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment"
            )
        _supabase_client = await create_client(url, key)
    return _supabase_client


def is_supabase_configured() -> bool:
    """Check if Supabase environment variables are set."""
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    return bool(url and key)


# ---------------------------------------------------------------------------
# Character CRUD helpers
# ---------------------------------------------------------------------------

async def create_character(
    user_id: str, name: str, style: str, description: str, reference_images: list
) -> dict:
    sb = await get_supabase()
    row = {
        "user_id": user_id,
        "name": name,
        "style": style,
        "description": description or "",
        "reference_images": reference_images or [],
    }
    result = await sb.table("characters").insert(row).execute()
    return result.data[0] if result.data else {}


async def list_characters(user_id: str) -> list:
    sb = await get_supabase()
    result = (
        await sb.table("characters")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


async def get_character(character_id: str, user_id: str) -> dict | None:
    sb = await get_supabase()
    result = (
        await sb.table("characters")
        .select("*")
        .eq("id", character_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    return result.data


async def update_character(character_id: str, user_id: str, updates: dict) -> dict | None:
    sb = await get_supabase()
    result = (
        await sb.table("characters")
        .update(updates)
        .eq("id", character_id)
        .eq("user_id", user_id)
        .execute()
    )
    return result.data[0] if result.data else None


async def delete_character(character_id: str, user_id: str) -> bool:
    sb = await get_supabase()
    result = (
        await sb.table("characters")
        .delete()
        .eq("id", character_id)
        .eq("user_id", user_id)
        .execute()
    )
    return bool(result.data)
