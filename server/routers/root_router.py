import os
from fastapi import APIRouter
import requests
import httpx
from models.tool_model import ToolInfoJson
from services.tool_service import tool_service
from services.config_service import config_service
from services.db_service import db_service
from utils.http_client import HttpClient
# services
from models.config_model import ModelInfo
from typing import List
from services.tool_service import TOOL_MAPPING

router = APIRouter(prefix="/api")


async def get_comfyui_model_list(base_url: str) -> List[str]:
    """Get ComfyUI model list from object_info API"""
    try:
        timeout = httpx.Timeout(10.0)
        async with HttpClient.create(timeout=timeout) as client:
            response = await client.get(f"{base_url}/api/object_info")
            if response.status_code == 200:
                data = response.json()
                # Extract models from CheckpointLoaderSimple node
                models = data.get('CheckpointLoaderSimple', {}).get(
                    'input', {}).get('required', {}).get('ckpt_name', [[]])[0]
                return models if isinstance(models, list) else []  # type: ignore
            else:
                print(f"ComfyUI server returned status {response.status_code}")
                return []
    except Exception as e:
        print(f"Error querying ComfyUI: {e}")
        return []

# List all LLM models
@router.get("/list_models")
async def get_models() -> list[ModelInfo]:
    config = config_service.get_config()
    res: List[ModelInfo] = []

    for provider in config.keys():
        provider_config = config[provider]
        provider_url = provider_config.get('url', '').strip()
        provider_api_key = provider_config.get('api_key', '').strip()

        # Skip provider if URL is empty or API key is empty
        if not provider_url or not provider_api_key:
            continue

        models = provider_config.get('models', {})
        for model_name in models:
            model = models[model_name]
            model_type = model.get('type', 'text')
            # Return all model types (text, image, video)
            res.append({
                'provider': provider,
                'model': model_name,
                'url': provider_url,
                'type': model_type
            })
    return res


@router.get("/list_tools")
async def list_tools() -> list[ToolInfoJson]:
    config = config_service.get_config()
    res: list[ToolInfoJson] = []
    for tool_id, tool_info in tool_service.tools.items():
        if tool_info.get('provider') == 'system':
            continue
        provider = tool_info['provider']
        provider_api_key = config[provider].get('api_key', '').strip()
        if provider != 'comfyui' and not provider_api_key:
            continue
        res.append({
            'id': tool_id,
            'provider': tool_info.get('provider', ''),
            'type': tool_info.get('type', ''),
            'display_name': tool_info.get('display_name', ''),
        })

    # Handle ComfyUI models separately
    # comfyui_config = config.get('comfyui', {})
    # comfyui_url = comfyui_config.get('url', '').strip()
    # comfyui_config_models = comfyui_config.get('models', {})
    # if comfyui_url:
    #     comfyui_models = await get_comfyui_model_list(comfyui_url)
    #     for comfyui_model in comfyui_models:
    #         if comfyui_model in comfyui_config_models:
    #             res.append({
    #                 'provider': 'comfyui',
    #                 'model': comfyui_model,
    #                 'url': comfyui_url,
    #                 'type': 'image'
    #             })

    return res


@router.get("/list_chat_sessions")
async def list_chat_sessions():
    return await db_service.list_sessions()


@router.get("/chat_session/{session_id}")
async def get_chat_session(session_id: str):
    return await db_service.get_chat_history(session_id)
