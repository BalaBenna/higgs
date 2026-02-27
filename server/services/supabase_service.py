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
