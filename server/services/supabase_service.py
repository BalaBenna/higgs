"""
Supabase client singleton service.
Provides a service-role client for backend operations (bypasses RLS).
"""

import os
from typing import Optional
from supabase import create_client, Client


_supabase_client: Optional[Client] = None


def get_supabase() -> Client:
    """Get or create the Supabase client singleton."""
    global _supabase_client
    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment"
            )
        _supabase_client = create_client(url, key)
    return _supabase_client


def is_supabase_configured() -> bool:
    """Check if Supabase environment variables are set."""
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    return bool(url and key)
