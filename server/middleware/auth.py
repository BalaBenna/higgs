"""
Authentication middleware for Supabase JWT verification.
Provides FastAPI dependencies for protected and optional-auth endpoints.
"""

import os
import logging
import httpx
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, Depends
from jose import jwt, JWTError

logger = logging.getLogger(__name__)


SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")


async def _verify_token_with_supabase(token: str) -> Optional[Dict[str, Any]]:
    """Verify token using Supabase Auth API and return user info."""
    if not SUPABASE_ANON_KEY or not SUPABASE_URL:
        logger.warning("[AUTH] SUPABASE_ANON_KEY or SUPABASE_URL not configured")
        return None

    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {token}",
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers=headers,
                timeout=10,
            )
            logger.info(f"[AUTH] Supabase API response: {response.status_code}")
            if response.status_code == 200:
                return response.json()
            logger.warning(
                f"[AUTH] Supabase API error: {response.status_code} - {response.text[:200]}"
            )
            return None
    except Exception as e:
        logger.warning(f"[AUTH] Supabase token verification failed: {e}")
        return None


def _decode_token(token: str) -> dict:
    """Decode and verify a Supabase JWT token."""
    if not SUPABASE_JWT_SECRET:
        logger.error("[AUTH] SUPABASE_JWT_SECRET not configured")
        raise HTTPException(
            status_code=500,
            detail="SUPABASE_JWT_SECRET not configured on server",
        )

    try:
        import base64
        import json

        header_segment = token.split(".")[0]
        padded = header_segment + "=" * (4 - len(header_segment) % 4)
        header = json.loads(base64.urlsafe_b64decode(padded))
        logger.info(f"[AUTH] JWT header: {header}")
        alg = header.get("alg", "HS256")
        logger.info(f"[AUTH] JWT algorithm: {alg}")
    except Exception as e:
        logger.warning(f"[AUTH] Could not decode JWT header: {e}")
        alg = "HS256"

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256", "HS384", "HS512"],
            audience="authenticated",
        )
        logger.debug(f"[AUTH] JWT decoded successfully, sub: {payload.get('sub')}")
        return payload
    except JWTError as e:
        logger.warning(f"[AUTH] JWT decode error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")


def _extract_token(request: Request) -> Optional[str]:
    """Extract Bearer token from Authorization header."""
    auth_header = request.headers.get("authorization", "")
    logger.debug(f"[AUTH] Authorization header present: {bool(auth_header)}")
    if auth_header:
        logger.debug(
            f"[AUTH] Auth header starts with 'Bearer ': {auth_header.startswith('Bearer ')}"
        )
        logger.debug(f"[AUTH] Auth header length: {len(auth_header)}")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        logger.debug(f"[AUTH] Token extracted, length: {len(token)}")
        return token
    logger.debug("[AUTH] No token extracted from header")
    return None


async def get_current_user(request: Request) -> str:
    """
    FastAPI dependency — requires a valid Supabase JWT.
    Returns the user_id (UUID string) from the token's 'sub' claim.
    Raises 401 if token is missing or invalid.
    """
    logger.info(f"[AUTH] get_current_user called for path: {request.url.path}")
    token = _extract_token(request)
    if not token:
        logger.warning("[AUTH] No token provided - returning 401")
        raise HTTPException(status_code=401, detail="Not authenticated")

    logger.info(f"[AUTH] Token preview: {token[:50]}...")

    # Try Supabase API verification first (most reliable)
    user_info = await _verify_token_with_supabase(token)
    if user_info and user_info.get("id"):
        logger.info(f"[AUTH] Verified via Supabase API: {user_info['id']}")
        return user_info["id"]

    # Fallback to JWT decode
    try:
        payload = _decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            logger.warning("[AUTH] Token has no 'sub' claim")
            raise HTTPException(status_code=401, detail="Invalid token: no sub claim")
        logger.info(f"[AUTH] Successfully authenticated user via JWT: {user_id}")
        return user_id
    except HTTPException as e:
        logger.warning(f"[AUTH] Token validation failed: {e.detail}")
        raise HTTPException(status_code=401, detail="Invalid token")


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
