"""
System Prompts for Higgs Field AI Generation
Centralized prompts for consistent styling across all features
"""

# ==============================================
# IMAGE GENERATION PROMPTS
# ==============================================

IMAGE_GENERATION_SYSTEM_PROMPT = """You are a professional image generation assistant. 
Generate high-quality, visually stunning images with:
- Excellent composition and framing
- Professional lighting and color grading
- Sharp details and proper focus
- Coherent style throughout the image
- Natural, realistic proportions unless stylized is requested"""

IMAGE_STYLE_PROMPTS = {
    "photorealistic": "Ultra-realistic photography, 8K resolution, professional DSLR quality, natural lighting, sharp focus, detailed textures",
    "cinematic": "Cinematic film still, dramatic lighting, movie color grading, anamorphic lens, professional cinematography",
    "anime": "High-quality anime art style, clean lines, vibrant colors, detailed shading, professional anime illustration",
    "digital_art": "Professional digital art, detailed illustration, vibrant colors, clean rendering, artstation quality",
    "oil_painting": "Classical oil painting style, visible brushstrokes, rich colors, museum quality fine art",
    "watercolor": "Delicate watercolor painting, soft color washes, artistic paper texture, gallery quality",
    "3d_render": "High-quality 3D render, ray-traced lighting, subsurface scattering, octane render quality",
    "concept_art": "Professional concept art, detailed environment design, atmospheric perspective, industry standard",
}

# ==============================================
# VIDEO GENERATION PROMPTS
# ==============================================

VIDEO_GENERATION_SYSTEM_PROMPT = """You are a professional video generation assistant.
Create high-quality, cinematic videos with:
- Smooth, natural motion at consistent frame rate
- Professional camera work and composition
- Coherent lighting throughout the clip
- Realistic physics and motion blur
- Consistent character/object appearance across frames"""

VIDEO_STYLE_PROMPTS = {
    "cinematic": "Professional cinematic quality, 24fps film look, dramatic lighting, movie-grade production",
    "commercial": "Clean commercial style, bright lighting, smooth transitions, professional advertising quality",
    "documentary": "Documentary style, natural lighting, handheld feel, authentic atmosphere",
    "music_video": "Music video aesthetic, dynamic cuts, stylized lighting, creative visual effects",
    "social_media": "Optimized for social media, vertical format ready, engaging visuals, scroll-stopping content",
}

# ==============================================
# FEATURE-SPECIFIC PROMPTS
# ==============================================

FEATURE_PROMPTS = {
    "face_swap": """Perform a professional face swap operation:
- Seamlessly integrate source face onto target person
- Match skin tone, lighting, and shadow direction
- Preserve natural facial proportions and expressions
- Keep original background, hair, and clothing unchanged
- Ensure natural blend at face boundaries""",

    "character_swap": """Perform a character swap operation:
- Replace the character while maintaining pose and position
- Match lighting conditions and perspective
- Preserve scene context and background
- Maintain natural proportions and scale
- Ensure seamless integration with environment""",

    "inpaint": """Perform intelligent inpainting:
- Fill the specified region seamlessly
- Match surrounding textures and patterns
- Maintain consistent lighting and shadows
- Preserve perspective and depth
- Ensure natural transition at boundaries""",

    "outpaint": """Extend the image naturally:
- Continue the scene beyond original boundaries
- Match perspective and vanishing points
- Maintain consistent style and lighting
- Add logical content that fits the context
- Ensure seamless blend with original image""",

    "upscale": """Enhance image resolution:
- Increase resolution while preserving sharpness
- Recover fine details and textures
- Reduce noise and artifacts
- Maintain color accuracy
- Preserve original artistic intent""",

    "relight": """Adjust image lighting:
- Apply new lighting direction naturally
- Recalculate shadows and highlights
- Maintain material properties
- Preserve color relationships
- Create realistic light falloff""",

    "style_transfer": """Apply artistic style:
- Transfer style while preserving content
- Maintain recognizable subject matter
- Apply consistent style throughout
- Preserve important details
- Create harmonious color palette""",

    "background_removal": """Remove background cleanly:
- Extract subject with precise edges
- Handle fine details like hair
- Preserve transparency where needed
- Maintain subject quality
- Clean edge transitions""",
}

# ==============================================
# MODEL-SPECIFIC OPTIMIZATIONS
# ==============================================

MODEL_PROMPT_HINTS = {
    # FLUX models prefer detailed, structured prompts
    "flux": "Detailed scene description, specific lighting, clear subject focus",
    
    # Seedream excels at artistic interpretations
    "seedream": "Artistic style emphasis, creative composition, visual storytelling",
    
    # DALL-E/GPT Image handles natural language well
    "gpt-image": "Natural language description, context-rich, clear instructions",
    
    # Nano Banana Pro for complex scenes
    "nano-banana": "Complex scene handling, multiple subjects, detailed environments",
    
    # Reve for photorealistic content
    "reve": "Photorealistic emphasis, detailed textures, natural lighting",
    
    # Kling for video
    "kling": "Smooth motion emphasis, cinematic quality, consistent physics",
    
    # Veo for video
    "veo": "High fidelity video, audio sync, natural movements",
    
    # Sora for video
    "sora": "Creative storytelling, complex scenes, realistic physics",
}


def get_enhanced_prompt(base_prompt: str, feature: str = None, style: str = None, model: str = None) -> str:
    """
    Enhance a base prompt with system prompts and style hints
    
    Args:
        base_prompt: The user's original prompt
        feature: Optional feature type (face_swap, inpaint, etc.)
        style: Optional style (photorealistic, cinematic, etc.)
        model: Optional model hint for optimization
    
    Returns:
        Enhanced prompt string
    """
    enhanced_parts = [base_prompt]
    
    # Add feature-specific prompt
    if feature and feature in FEATURE_PROMPTS:
        enhanced_parts.insert(0, FEATURE_PROMPTS[feature])
    
    # Add style prompt
    if style and style in IMAGE_STYLE_PROMPTS:
        enhanced_parts.append(IMAGE_STYLE_PROMPTS[style])
    
    # Add model-specific hints
    if model:
        for model_key, hint in MODEL_PROMPT_HINTS.items():
            if model_key in model.lower():
                enhanced_parts.append(f"Optimization: {hint}")
                break
    
    return " ".join(enhanced_parts)


def get_video_prompt(base_prompt: str, style: str = None) -> str:
    """
    Enhance a video prompt with style hints
    
    Args:
        base_prompt: The user's original prompt
        style: Optional style (cinematic, commercial, etc.)
    
    Returns:
        Enhanced video prompt string
    """
    enhanced_parts = [base_prompt]
    
    if style and style in VIDEO_STYLE_PROMPTS:
        enhanced_parts.append(VIDEO_STYLE_PROMPTS[style])
    
    return " ".join(enhanced_parts)
