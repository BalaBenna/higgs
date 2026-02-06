"""
Authentication middleware for Supabase JWT verification.
Provides FastAPI dependencies for protected and optional-auth endpoints.
"""

import os
from typing import Optional
from fastapi import Request, HTTPException, Depends
from jose import jwt, JWTError


SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
# Supabase JWT secret is derived from the project; can also use JWKS.
# For simplicity we use the JWT secret directly (found in Supabase dashboard → Settings → API → JWT Secret).
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")


def _decode_token(token: str) -> dict:
    """Decode and verify a Supabase JWT token."""
    secret = SUPABASE_JWT_SECRET
    if not secret:
        raise HTTPException(
            status_code=500,
            detail="SUPABASE_JWT_SECRET not configured on server",
        )
    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")


def _extract_token(request: Request) -> Optional[str]:
    """Extract Bearer token from Authorization header."""
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:]
    return None


async def get_current_user(request: Request) -> str:
    """
    FastAPI dependency — requires a valid Supabase JWT.
    Returns the user_id (UUID string) from the token's 'sub' claim.
    Raises 401 if token is missing or invalid.
    """
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = _decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: no sub claim")
    return user_id


async def optional_auth(request: Request) -> Optional[str]:
    """
    FastAPI dependency — returns user_id if authenticated, None otherwise.
    Does not raise on missing/invalid token (for public endpoints).
    """
    token = _extract_token(request)
    if not token:
        return None
    try:
        payload = _decode_token(token)
        return payload.get("sub")
    except HTTPException:
        return None
