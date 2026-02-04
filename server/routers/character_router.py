"""
Character Router - API endpoints for AI Influencer character management
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import json

router = APIRouter(prefix="/api/character", tags=["character"])

# In-memory storage for now (will be migrated to DB)
characters_db: Dict[str, Dict[str, Any]] = {}


class CharacterAttributes(BaseModel):
    character_type: str = "realistic"
    gender: str = "Female"
    ethnicity: str = "Caucasian"
    skin_color: str = "#f5d5c8"
    eye_color: str = "#634e34"
    age: str = "Adult"
    skin_conditions: List[str] = []
    eye_type: str = "Almond"
    eye_secrets: str = "Normal"
    mouth_type: str = "Full"
    face_shape: int = 50
    jaw_definition: int = 50
    cheekbones: int = 50


class CharacterCreate(BaseModel):
    name: str
    attributes: CharacterAttributes
    description: Optional[str] = None


class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    attributes: Optional[CharacterAttributes] = None
    description: Optional[str] = None


class CharacterResponse(BaseModel):
    id: str
    name: str
    attributes: CharacterAttributes
    description: Optional[str]
    preview_url: Optional[str]
    image_count: int
    created_at: str
    updated_at: str


class GenerateWithCharacterRequest(BaseModel):
    character_id: str
    prompt: str
    style: Optional[str] = None
    aspect_ratio: str = "1:1"
    num_images: int = 1


@router.post("/create", response_model=CharacterResponse)
async def create_character(character: CharacterCreate):
    """Create a new AI Influencer character"""
    character_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"

    character_data = {
        "id": character_id,
        "name": character.name,
        "attributes": character.attributes.model_dump(),
        "description": character.description,
        "preview_url": None,
        "image_count": 0,
        "created_at": now,
        "updated_at": now,
    }

    characters_db[character_id] = character_data

    return CharacterResponse(**character_data)


@router.get("/list", response_model=List[CharacterResponse])
async def list_characters():
    """List all characters for the current user"""
    return [CharacterResponse(**char) for char in characters_db.values()]


@router.get("/{character_id}", response_model=CharacterResponse)
async def get_character(character_id: str):
    """Get a specific character by ID"""
    if character_id not in characters_db:
        raise HTTPException(status_code=404, detail="Character not found")

    return CharacterResponse(**characters_db[character_id])


@router.put("/{character_id}", response_model=CharacterResponse)
async def update_character(character_id: str, update: CharacterUpdate):
    """Update an existing character"""
    if character_id not in characters_db:
        raise HTTPException(status_code=404, detail="Character not found")

    character = characters_db[character_id]

    if update.name is not None:
        character["name"] = update.name
    if update.attributes is not None:
        character["attributes"] = update.attributes.model_dump()
    if update.description is not None:
        character["description"] = update.description

    character["updated_at"] = datetime.utcnow().isoformat() + "Z"

    return CharacterResponse(**character)


@router.delete("/{character_id}")
async def delete_character(character_id: str):
    """Delete a character"""
    if character_id not in characters_db:
        raise HTTPException(status_code=404, detail="Character not found")

    del characters_db[character_id]
    return {"success": True, "message": "Character deleted"}


@router.post("/{character_id}/generate")
async def generate_with_character(character_id: str, request: GenerateWithCharacterRequest):
    """Generate images using a character's attributes for consistency"""
    if character_id not in characters_db:
        raise HTTPException(status_code=404, detail="Character not found")

    character = characters_db[character_id]
    attrs = character["attributes"]

    # Build a consistent prompt based on character attributes
    character_prompt = _build_character_prompt(attrs)
    full_prompt = f"{character_prompt}, {request.prompt}"

    # In a real implementation, this would call the image generation service
    # For now, return a placeholder response
    return {
        "success": True,
        "character_id": character_id,
        "generated_prompt": full_prompt,
        "message": "Image generation would be triggered here",
        "images": []  # Would contain generated image URLs
    }


def _build_character_prompt(attrs: dict) -> str:
    """Build a consistent prompt from character attributes"""
    parts = []

    # Character type/style
    if attrs.get("character_type"):
        style_map = {
            "realistic": "photorealistic portrait",
            "anime": "anime style character",
            "3d": "3D rendered character",
            "cartoon": "cartoon style character",
            "fantasy": "fantasy art character",
            "cyberpunk": "cyberpunk style character",
        }
        parts.append(style_map.get(attrs["character_type"], "portrait"))

    # Gender
    if attrs.get("gender"):
        parts.append(attrs["gender"].lower())

    # Ethnicity
    if attrs.get("ethnicity"):
        parts.append(f"{attrs['ethnicity']} ethnicity")

    # Age
    if attrs.get("age"):
        age_map = {
            "Young Adult": "young adult, early 20s",
            "Adult": "adult, 30s",
            "Mature": "mature, 40s-50s",
            "Senior": "elderly, senior",
        }
        parts.append(age_map.get(attrs["age"], "adult"))

    # Eye type
    if attrs.get("eye_type"):
        parts.append(f"{attrs['eye_type'].lower()} eyes")

    # Special eye features
    if attrs.get("eye_secrets") and attrs["eye_secrets"] != "Normal":
        parts.append(f"{attrs['eye_secrets'].lower()} eyes")

    return ", ".join(parts)
