"""
Database service backed by Supabase (PostgreSQL).
Replaces the previous SQLite/aiosqlite implementation.
All user-scoped methods accept a user_id parameter.
"""

import json
from typing import List, Dict, Any, Optional
from services.supabase_service import get_supabase


class DatabaseService:
    def __init__(self):
        pass

    # ── Canvases ──────────────────────────────────────────────────────────

    async def create_canvas(self, id: str, name: str, user_id: str = ""):
        """Create a new canvas."""
        sb = await get_supabase()
        await (
            sb.table("canvases")
            .insert({"id": id, "name": name, "user_id": user_id})
            .execute()
        )

    async def list_canvases(self, user_id: str = "") -> List[Dict[str, Any]]:
        """List canvases for a user."""
        sb = await get_supabase()
        query = sb.table("canvases").select(
            "id, name, description, thumbnail, created_at, updated_at"
        )
        if user_id:
            query = query.eq("user_id", user_id)
        result = await query.order("updated_at", desc=True).execute()
        return result.data or []

    async def get_canvas_data(self, id: str) -> Optional[Dict[str, Any]]:
        """Get canvas data including sessions."""
        sb = await get_supabase()
        result = await (
            sb.table("canvases")
            .select("data, name")
            .eq("id", id)
            .maybe_single()
            .execute()
        )
        row = result.data
        if not row:
            return None

        sessions = await self.list_sessions(id)
        data_raw = row.get("data")
        if isinstance(data_raw, str):
            try:
                data_raw = json.loads(data_raw)
            except (json.JSONDecodeError, TypeError):
                data_raw = {}
        return {
            "data": data_raw or {},
            "name": row.get("name", ""),
            "sessions": sessions,
        }

    async def save_canvas_data(self, id: str, data: str, thumbnail: str = None):
        """Save canvas data (JSON string)."""
        sb = await get_supabase()
        update_payload: Dict[str, Any] = {
            "data": json.loads(data) if isinstance(data, str) else data
        }
        if thumbnail is not None:
            update_payload["thumbnail"] = thumbnail
        await sb.table("canvases").update(update_payload).eq("id", id).execute()

    async def delete_canvas(self, id: str):
        """Delete canvas and related data (cascade handled by FK)."""
        sb = await get_supabase()
        await sb.table("canvases").delete().eq("id", id).execute()

    async def rename_canvas(self, id: str, name: str):
        """Rename a canvas."""
        sb = await get_supabase()
        await sb.table("canvases").update({"name": name}).eq("id", id).execute()

    # ── Chat Sessions ─────────────────────────────────────────────────────

    async def create_chat_session(
        self,
        id: str,
        model: str,
        provider: str,
        canvas_id: str,
        title: Optional[str] = None,
        user_id: str = "",
    ):
        """Create a new chat session."""
        sb = await get_supabase()
        payload: Dict[str, Any] = {
            "id": id,
            "model": model,
            "provider": provider,
            "canvas_id": canvas_id or None,
            "user_id": user_id,
        }
        if title:
            payload["title"] = title
        await sb.table("chat_sessions").insert(payload).execute()

    async def list_sessions(
        self, canvas_id: str = "", user_id: str = ""
    ) -> List[Dict[str, Any]]:
        """List chat sessions, optionally filtered by canvas_id."""
        sb = await get_supabase()
        query = sb.table("chat_sessions").select(
            "id, title, model, provider, created_at, updated_at"
        )
        if canvas_id:
            query = query.eq("canvas_id", canvas_id)
        if user_id:
            query = query.eq("user_id", user_id)
        result = await query.order("updated_at", desc=True).execute()
        return result.data or []

    # ── Chat Messages ─────────────────────────────────────────────────────

    async def create_message(self, session_id: str, role: str, message: str):
        """Save a chat message."""
        sb = await get_supabase()
        # message is a JSON string — store as JSONB
        try:
            msg_data = json.loads(message) if isinstance(message, str) else message
        except (json.JSONDecodeError, TypeError):
            msg_data = message
        await (
            sb.table("chat_messages")
            .insert({"session_id": session_id, "role": role, "message": msg_data})
            .execute()
        )

    async def get_chat_history(self, session_id: str) -> List[Dict[str, Any]]:
        """Get chat history for a session."""
        sb = await get_supabase()
        result = await (
            sb.table("chat_messages")
            .select("role, message, id")
            .eq("session_id", session_id)
            .order("id", desc=False)
            .execute()
        )
        messages = []
        for row in result.data or []:
            msg = row.get("message")
            if msg is not None:
                # msg is already a dict (JSONB), no need to parse
                if isinstance(msg, str):
                    try:
                        msg = json.loads(msg)
                    except (json.JSONDecodeError, TypeError):
                        continue
                messages.append(msg)
        return messages

    # ── Generated Content ─────────────────────────────────────────────────

    async def insert_generated_content(self, data: Dict[str, Any]):
        """Insert a row into the generated_content table."""
        sb = await get_supabase()
        await sb.table("generated_content").insert(data).execute()

    def _flatten_metadata(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Flatten metadata JSONB fields into top-level fields for frontend compatibility."""
        if not item:
            return item
        metadata = item.get("metadata", {})
        if isinstance(metadata, str):
            try:
                metadata = json.loads(metadata)
            except (json.JSONDecodeError, TypeError):
                metadata = {}
        return {
            **item,
            "filename": metadata.get("filename"),
            "public_url": metadata.get("public_url"),
            "provider": metadata.get("provider"),
            "aspect_ratio": metadata.get("aspect_ratio"),
            "width": metadata.get("width"),
            "height": metadata.get("height"),
            "metadata": metadata,
        }

    async def list_generated_content(
        self,
        user_id: str,
        content_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """List generated content for a user."""
        sb = await get_supabase()
        query = sb.table("generated_content").select("*").eq("user_id", user_id)
        if content_type:
            query = query.eq("type", content_type)
        result = await (
            query.order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        items = result.data or []
        return [self._flatten_metadata(item) for item in items]

    async def get_generated_content(
        self, id: str, user_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a single generated content item."""
        sb = await get_supabase()
        result = await (
            sb.table("generated_content")
            .select("*")
            .eq("id", id)
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        item = result.data
        return self._flatten_metadata(item) if item else None

    async def delete_generated_content(self, id: str, user_id: str):
        """Delete a generated content item."""
        sb = await get_supabase()
        await (
            sb.table("generated_content")
            .delete()
            .eq("id", id)
            .eq("user_id", user_id)
            .execute()
        )

    # ── Vibe Motion Projects ─────────────────────────────────────────────────

    async def create_vibe_motion_project(
        self,
        id: str,
        name: str,
        preset: str,
        user_id: str = "",
        prompt: str = "",
        code: str = "",
        model: str = "gpt-4o",
        style: str = None,
        theme: str = None,
        duration: int = 10,
        aspect_ratio: str = "16:9",
        transition: str = "auto",
        transition_direction: str = "from-left",
        media_urls: List[str] = None,
        thumbnail: str = "",
    ):
        """Create a new vibe motion project."""
        sb = await get_supabase()
        await (
            sb.table("vibe_motion_projects")
            .insert(
                {
                    "id": id,
                    "name": name,
                    "preset": preset,
                    "user_id": user_id,
                    "prompt": prompt,
                    "code": code,
                    "model": model,
                    "style": style,
                    "theme": theme,
                    "duration": duration,
                    "aspect_ratio": aspect_ratio,
                    "transition": transition,
                    "transition_direction": transition_direction,
                    "media_urls": json.dumps(media_urls) if media_urls else None,
                    "thumbnail": thumbnail,
                }
            )
            .execute()
        )

    async def list_vibe_motion_projects(
        self, user_id: str = "", limit: int = 50, offset: int = 0
    ) -> List[Dict[str, Any]]:
        """List vibe motion projects for a user."""
        sb = await get_supabase()
        query = sb.table("vibe_motion_projects").select("*")
        if user_id:
            query = query.eq("user_id", user_id)
        result = await (
            query.order("updated_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return result.data or []

    async def get_vibe_motion_project(self, id: str) -> Optional[Dict[str, Any]]:
        """Get a single vibe motion project."""
        sb = await get_supabase()
        result = await (
            sb.table("vibe_motion_projects")
            .select("*")
            .eq("id", id)
            .maybe_single()
            .execute()
        )
        return result.data

    async def update_vibe_motion_project(
        self,
        id: str,
        user_id: str = "",
        name: str = None,
        prompt: str = None,
        code: str = None,
        model: str = None,
        style: str = None,
        theme: str = None,
        duration: int = None,
        aspect_ratio: str = None,
        transition: str = None,
        transition_direction: str = None,
        media_urls: List[str] = None,
        thumbnail: str = None,
    ):
        """Update a vibe motion project."""
        sb = await get_supabase()
        updates = {}
        if name is not None:
            updates["name"] = name
        if prompt is not None:
            updates["prompt"] = prompt
        if code is not None:
            updates["code"] = code
        if model is not None:
            updates["model"] = model
        if style is not None:
            updates["style"] = style
        if theme is not None:
            updates["theme"] = theme
        if duration is not None:
            updates["duration"] = duration
        if aspect_ratio is not None:
            updates["aspect_ratio"] = aspect_ratio
        if transition is not None:
            updates["transition"] = transition
        if transition_direction is not None:
            updates["transition_direction"] = transition_direction
        if media_urls is not None:
            updates["media_urls"] = json.dumps(media_urls)
        if thumbnail is not None:
            updates["thumbnail"] = thumbnail

        updates["updated_at"] = "now"

        await sb.table("vibe_motion_projects").update(updates).eq("id", id).execute()

    async def delete_vibe_motion_project(self, id: str):
        """Delete a vibe motion project."""
        sb = await get_supabase()
        await sb.table("vibe_motion_projects").delete().eq("id", id).execute()


# Singleton instance
db_service = DatabaseService()
