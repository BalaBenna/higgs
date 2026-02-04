"""
Settings Router - 设置路由模块

该模块提供设置相关的 API 路由端点，包括：
- 设置文件存在性检查
- 设置的获取和更新
- ComfyUI 工作流管理
- 知识库管理

主要端点：
- GET /api/settings/exists - 检查设置文件是否存在
- GET /api/settings - 获取所有设置（敏感信息已掩码）
- POST /api/settings - 更新设置
- GET /api/settings/knowledge/enabled - 获取启用的知识库列表
依赖模块：
- services.settings_service - 设置服务
- services.db_service - 数据库服务
- services.config_service - 配置服务
- services.knowledge_service - 知识库服务
"""

import json
import os
import shutil
import httpx
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from services.db_service import db_service
from services.settings_service import settings_service
from services.tool_service import tool_service
from services.knowledge_service import list_user_enabled_knowledge
from pydantic import BaseModel

# 创建设置相关的路由器，所有端点都以 /api/settings 为前缀
router = APIRouter(prefix="/api/settings")


@router.get("/exists")
async def settings_exists():
    """
    检查设置文件是否存在

    Returns:
        dict: 包含 exists 字段的字典，指示设置文件是否存在

    Description:
        用于前端检查是否需要显示初始设置向导。
        如果设置文件不存在，通常需要引导用户进行初始配置。
    """
    return {"exists": await settings_service.exists_settings()}


@router.get("")
async def get_settings():
    """
    获取所有设置配置

    Returns:
        dict: 完整的设置配置字典，敏感信息已被掩码处理

    Description:
        返回所有应用设置，包括代理配置、系统提示词等。
        敏感信息（如密码）会被替换为 '*' 字符以保护隐私。
        设置会与默认配置合并，确保所有必需的键都存在。
    """
    return settings_service.get_settings()


@router.post("")
async def update_settings(request: Request):
    """
    更新设置配置

    Args:
        request (Request): HTTP 请求对象，包含要更新的设置数据

    Returns:
        dict: 操作结果，包含 status 和 message 字段

    Description:
        接收 JSON 格式的设置数据并更新到配置文件。
        支持部分更新，新数据会与现有设置合并而不是完全替换。

    Example:
        POST /api/settings
        {
            "system_prompt": "You are a helpful assistant."
        }
    """
    data = await request.json()
    result = await settings_service.update_settings(data)
    return result








class CreateWorkflowRequest(BaseModel):
    name: str
    api_json: dict  # or str if you want it as string
    description: str
    inputs: list   # or str if you want it as string
    outputs: str = None


@router.post("/comfyui/create_workflow")
async def create_workflow(request: CreateWorkflowRequest):
    if not request.name:
        raise HTTPException(status_code=400, detail="Name is required")
    if not request.api_json:
        raise HTTPException(status_code=400, detail="API JSON is required")
    if not request.description:
        raise HTTPException(status_code=400, detail="Description is required")
    if not request.inputs:
        raise HTTPException(status_code=400, detail="Inputs are required")
    try:
        name = request.name.replace(" ", "_")
        api_json = json.dumps(request.api_json)
        inputs = json.dumps(request.inputs)
        outputs = json.dumps(request.outputs)
        await db_service.create_comfy_workflow(name, api_json, request.description, inputs, outputs)
        await tool_service.initialize()
        return {"success": True}
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Failed to create workflow: {str(e)}")


@router.get("/comfyui/list_workflows")
async def list_workflows():
    return await db_service.list_comfy_workflows()


@router.delete("/comfyui/delete_workflow/{id}")
async def delete_workflow(id: int):
    result = await db_service.delete_comfy_workflow(id)
    await tool_service.initialize()
    return result


@router.post("/comfyui/proxy")
async def comfyui_proxy(request: Request):
    try:
        # 从请求中获取ComfyUI的目标URL和路径
        data = await request.json()
        target_url = data.get("url")  # 前端传递的ComfyUI地址（如http://127.0.0.1:8188）
        path = data.get("path", "")   # 请求的路径（如/system_stats）

        if not target_url or not path:
            raise HTTPException(
                status_code=400, detail="Missing 'url' or 'path' in request body")

        # 构造完整的ComfyUI请求URL
        full_url = f"{target_url}{path}"

        # 使用httpx转发请求（支持GET/POST等方法，这里示例用GET）
        async with httpx.AsyncClient() as client:
            response = await client.get(full_url)
            # 将ComfyUI的响应原样返回给前端
            return response.json()

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Proxy request failed: {str(e)}")


@router.get("/knowledge/enabled")
async def get_enabled_knowledge():
    """
    获取启用的知识库列表

    Returns:
        dict: 包含启用知识库列表的响应
    """
    try:
        knowledge_list = list_user_enabled_knowledge()
        return {
            "success": True,
            "data": knowledge_list,
            "count": len(knowledge_list)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "data": []
        }


@router.get("/my_assets_dir_path")
async def get_my_assets_dir_path():
    """
    获取用户的My Assets目录路径
    
    Returns:
        dict: 包含目录路径的响应
    """
    from services.config_service import FILES_DIR
    
    try:
        # 确保目录存在
        os.makedirs(FILES_DIR, exist_ok=True)
        
        return {
            "success": True,
            "path": FILES_DIR,
            "message": "My Assets directory path retrieved successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "path": ""
        }
