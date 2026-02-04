"""
Template Router - API endpoints for Vibe Motion templates and projects
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/templates", tags=["templates"])

# In-memory storage for now (will be migrated to DB)
templates_db: Dict[str, Dict[str, Any]] = {}
projects_db: Dict[str, Dict[str, Any]] = {}

# Pre-defined templates
DEFAULT_TEMPLATES = [
    {
        "id": "infographics",
        "name": "Infographics",
        "description": "Create animated data visualizations and infographics",
        "category": "data",
        "thumbnail": None,
        "settings": {
            "duration": 10,
            "resolution": "1080p",
            "aspect_ratio": "16:9",
        },
    },
    {
        "id": "text-animation",
        "name": "Text Animation",
        "description": "Bring your text to life with dynamic motion effects",
        "category": "typography",
        "thumbnail": None,
        "settings": {
            "duration": 5,
            "resolution": "1080p",
            "aspect_ratio": "16:9",
        },
    },
    {
        "id": "posters",
        "name": "Posters",
        "description": "Design eye-catching animated posters and banners",
        "category": "design",
        "thumbnail": None,
        "settings": {
            "duration": 5,
            "resolution": "1080p",
            "aspect_ratio": "9:16",
        },
    },
    {
        "id": "presentation",
        "name": "Presentation",
        "description": "Create professional animated presentation slides",
        "category": "business",
        "thumbnail": None,
        "settings": {
            "duration": 30,
            "resolution": "1080p",
            "aspect_ratio": "16:9",
        },
    },
    {
        "id": "scratch",
        "name": "From Scratch",
        "description": "Start with a blank canvas and full creative freedom",
        "category": "custom",
        "thumbnail": None,
        "settings": {
            "duration": 10,
            "resolution": "1080p",
            "aspect_ratio": "16:9",
        },
    },
]


class TemplateResponse(BaseModel):
    id: str
    name: str
    description: str
    category: str
    thumbnail: Optional[str]
    settings: Dict[str, Any]


class ProjectCreate(BaseModel):
    name: str
    template_id: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    thumbnail: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    template_id: str
    description: Optional[str]
    thumbnail: Optional[str]
    content: Dict[str, Any]
    created_at: str
    updated_at: str


@router.get("/", response_model=List[TemplateResponse])
async def list_templates():
    """List all available templates"""
    return [TemplateResponse(**t) for t in DEFAULT_TEMPLATES]


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: str):
    """Get a specific template by ID"""
    for template in DEFAULT_TEMPLATES:
        if template["id"] == template_id:
            return TemplateResponse(**template)

    raise HTTPException(status_code=404, detail="Template not found")


# Project endpoints
@router.post("/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate):
    """Create a new project from a template"""
    # Verify template exists
    template = None
    for t in DEFAULT_TEMPLATES:
        if t["id"] == project.template_id:
            template = t
            break

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    project_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"

    project_data = {
        "id": project_id,
        "name": project.name,
        "template_id": project.template_id,
        "description": project.description,
        "thumbnail": None,
        "content": {
            "settings": template["settings"].copy(),
            "layers": [],
            "animations": [],
        },
        "created_at": now,
        "updated_at": now,
    }

    projects_db[project_id] = project_data

    return ProjectResponse(**project_data)


@router.get("/projects/list", response_model=List[ProjectResponse])
async def list_projects():
    """List all user projects"""
    return [ProjectResponse(**p) for p in projects_db.values()]


@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    """Get a specific project by ID"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")

    return ProjectResponse(**projects_db[project_id])


@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, update: ProjectUpdate):
    """Update an existing project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")

    project = projects_db[project_id]

    if update.name is not None:
        project["name"] = update.name
    if update.description is not None:
        project["description"] = update.description
    if update.content is not None:
        project["content"] = update.content
    if update.thumbnail is not None:
        project["thumbnail"] = update.thumbnail

    project["updated_at"] = datetime.utcnow().isoformat() + "Z"

    return ProjectResponse(**project)


@router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    """Delete a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")

    del projects_db[project_id]
    return {"success": True, "message": "Project deleted"}


@router.post("/projects/{project_id}/duplicate", response_model=ProjectResponse)
async def duplicate_project(project_id: str):
    """Duplicate an existing project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")

    original = projects_db[project_id]
    new_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"

    duplicate = {
        "id": new_id,
        "name": f"{original['name']} (Copy)",
        "template_id": original["template_id"],
        "description": original.get("description"),
        "thumbnail": original.get("thumbnail"),
        "content": original["content"].copy(),
        "created_at": now,
        "updated_at": now,
    }

    projects_db[new_id] = duplicate

    return ProjectResponse(**duplicate)
