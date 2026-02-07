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
        sb = get_supabase()
        sb.table("canvases").insert(
            {"id": id, "name": name, "user_id": user_id}
        ).execute()

    async def list_canvases(self, user_id: str = "") -> List[Dict[str, Any]]:
        """List canvases for a user."""
        sb = get_supabase()
        query = sb.table("canvases").select(
            "id, name, description, thumbnail, created_at, updated_at"
        )
        if user_id:
            query = query.eq("user_id", user_id)
        result = query.order("updated_at", desc=True).execute()
        return result.data or []

    async def get_canvas_data(self, id: str) -> Optional[Dict[str, Any]]:
        """Get canvas data including sessions."""
        sb = get_supabase()
        result = (
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

    async def save_canvas_data(
        self, id: str, data: str, thumbnail: str = None
    ):
        """Save canvas data (JSON string)."""
        sb = get_supabase()
        update_payload: Dict[str, Any] = {"data": json.loads(data) if isinstance(data, str) else data}
        if thumbnail is not None:
            update_payload["thumbnail"] = thumbnail
        sb.table("canvases").update(update_payload).eq("id", id).execute()

    async def delete_canvas(self, id: str):
        """Delete canvas and related data (cascade handled by FK)."""
        sb = get_supabase()
        sb.table("canvases").delete().eq("id", id).execute()

    async def rename_canvas(self, id: str, name: str):
        """Rename a canvas."""
        sb = get_supabase()
        sb.table("canvases").update({"name": name}).eq("id", id).execute()

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
        sb = get_supabase()
        payload: Dict[str, Any] = {
            "id": id,
            "model": model,
            "provider": provider,
            "canvas_id": canvas_id or None,
            "user_id": user_id,
        }
        if title:
            payload["title"] = title
        sb.table("chat_sessions").insert(payload).execute()

    async def list_sessions(
        self, canvas_id: str = "", user_id: str = ""
    ) -> List[Dict[str, Any]]:
        """List chat sessions, optionally filtered by canvas_id."""
        sb = get_supabase()
        query = sb.table("chat_sessions").select(
            "id, title, model, provider, created_at, updated_at"
        )
        if canvas_id:
            query = query.eq("canvas_id", canvas_id)
        if user_id:
            query = query.eq("user_id", user_id)
        result = query.order("updated_at", desc=True).execute()
        return result.data or []

    # ── Chat Messages ─────────────────────────────────────────────────────

    async def create_message(self, session_id: str, role: str, message: str):
        """Save a chat message."""
        sb = get_supabase()
        # message is a JSON string — store as JSONB
        try:
            msg_data = json.loads(message) if isinstance(message, str) else message
        except (json.JSONDecodeError, TypeError):
            msg_data = message
        sb.table("chat_messages").insert(
            {"session_id": session_id, "role": role, "message": msg_data}
        ).execute()

    async def get_chat_history(
        self, session_id: str
    ) -> List[Dict[str, Any]]:
        """Get chat history for a session."""
        sb = get_supabase()
        result = (
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
        sb = get_supabase()
        sb.table("generated_content").insert(data).execute()

    async def list_generated_content(
        self,
        user_id: str,
        content_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """List generated content for a user."""
        sb = get_supabase()
        query = sb.table("generated_content").select("*").eq("user_id", user_id)
        if content_type:
            query = query.eq("type", content_type)
        result = (
            query.order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return result.data or []

    async def get_generated_content(
        self, id: str, user_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a single generated content item."""
        sb = get_supabase()
        result = (
            sb.table("generated_content")
            .select("*")
            .eq("id", id)
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        return result.data

    async def delete_generated_content(self, id: str, user_id: str):
        """Delete a generated content item."""
        sb = get_supabase()
        sb.table("generated_content").delete().eq("id", id).eq(
            "user_id", user_id
        ).execute()


# Singleton instance
db_service = DatabaseService()
