#server/routers/chat_router.py
from fastapi import APIRouter, Request, Depends
from services.chat_service import handle_chat
from services.magic_service import handle_magic
from services.stream_service import get_stream_task
from middleware.auth import get_current_user
from typing import Dict

router = APIRouter(prefix="/api")


@router.post("/chat")
async def chat(request: Request, user_id: str = Depends(get_current_user)):
    """
    Endpoint to handle chat requests.
    Requires authentication. Passes user_id to chat handler.
    """
    data = await request.json()
    await handle_chat(data, user_id=user_id)
    return {"status": "done"}


@router.post("/cancel/{session_id}")
async def cancel_chat(session_id: str):
    """
    Endpoint to cancel an ongoing stream task for a given session_id.
    """
    task = get_stream_task(session_id)
    if task and not task.done():
        task.cancel()
        return {"status": "cancelled"}
    return {"status": "not_found_or_done"}


@router.post("/magic")
async def magic(request: Request, user_id: str = Depends(get_current_user)):
    """
    Endpoint to handle magic generation requests.
    """
    data = await request.json()
    await handle_magic(data)
    return {"status": "done"}


@router.post("/magic/cancel/{session_id}")
async def cancel_magic(session_id: str) -> Dict[str, str]:
    """
    Endpoint to cancel an ongoing magic generation task for a given session_id.
    """
    task = get_stream_task(session_id)
    if task and not task.done():
        task.cancel()
        return {"status": "cancelled"}
    return {"status": "not_found_or_done"}
