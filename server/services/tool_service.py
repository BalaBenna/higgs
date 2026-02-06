import traceback
from typing import Dict
from langchain_core.tools import BaseTool
from models.tool_model import ToolInfo
from tools.comfy_dynamic import build_tool
from tools.write_plan import write_plan_tool
from tools.generate_image_by_gpt_image_1_jaaz import generate_image_by_gpt_image_1_jaaz
from tools.generate_image_by_imagen_4_jaaz import generate_image_by_imagen_4_jaaz
from tools.generate_image_by_imagen_4_replicate import (
    generate_image_by_imagen_4_replicate,
)
from tools.generate_image_by_ideogram3_bal_jaaz import (
    generate_image_by_ideogram3_bal_jaaz,
)

# from tools.generate_image_by_flux_1_1_pro import generate_image_by_flux_1_1_pro
from tools.generate_image_by_flux_kontext_pro_jaaz import (
    generate_image_by_flux_kontext_pro_jaaz,
)
from tools.generate_image_by_flux_kontext_pro_replicate import (
    generate_image_by_flux_kontext_pro_replicate,
)
from tools.generate_image_by_flux_kontext_max_jaaz import (
    generate_image_by_flux_kontext_max,
)
from tools.generate_image_by_flux_kontext_max_replicate import (
    generate_image_by_flux_kontext_max_replicate,
)
from tools.generate_image_by_doubao_seedream_3_jaaz import (
    generate_image_by_doubao_seedream_3_jaaz,
)
from tools.generate_image_by_doubao_seedream_3_volces import (
    generate_image_by_doubao_seedream_3_volces,
)
from tools.generate_image_by_doubao_seededit_3_volces import (
    edit_image_by_doubao_seededit_3_volces,
)
from tools.generate_video_by_seedance_v1_jaaz import generate_video_by_seedance_v1_jaaz
from tools.generate_video_by_seedance_v1_pro_volces import (
    generate_video_by_seedance_v1_pro_volces,
)
from tools.generate_video_by_seedance_v1_lite_volces import (
    generate_video_by_seedance_v1_lite_t2v,
    generate_video_by_seedance_v1_lite_i2v,
)
from tools.generate_video_by_kling_v2_jaaz import generate_video_by_kling_v2_jaaz
from tools.generate_image_by_recraft_v3_jaaz import generate_image_by_recraft_v3_jaaz
from tools.generate_image_by_recraft_v3_replicate import (
    generate_image_by_recraft_v3_replicate,
)
from tools.generate_video_by_hailuo_02_jaaz import generate_video_by_hailuo_02_jaaz
from tools.generate_video_by_veo3_fast_jaaz import generate_video_by_veo3_fast_jaaz
from tools.generate_image_by_midjourney_jaaz import generate_image_by_midjourney_jaaz
from tools.stub_image_tools import (
    generate_image_by_higgsfield_soul_jaaz,
    generate_image_by_higgsfield_popcorn_jaaz,
    generate_image_by_nano_banana_pro_jaaz,
    generate_image_by_z_image_jaaz,
    generate_image_by_kling_q1_image_jaaz,
    generate_image_by_wan_2_2_image_jaaz,
    generate_image_by_reve_jaaz,
    generate_image_by_topaz_jaaz,
    generate_image_by_nano_banana_pro_inpaint_jaaz,
    generate_image_by_nano_banana_inpaint_jaaz,
    generate_image_by_product_placement_jaaz,
)
from tools.stub_video_tools import (
    generate_video_by_kling_3_jaaz,
    generate_video_by_grok_imagine_jaaz,
    generate_video_by_kling_motion_control_jaaz,
    generate_video_by_sora_2_jaaz,
    generate_video_by_wan_2_6_jaaz,
    generate_video_by_kling_avatars_2_jaaz,
    generate_video_by_higgsfield_dop_jaaz,
    generate_video_by_kling_q1_edit_jaaz,
    generate_video_by_kling_3_omni_edit_jaaz,
    generate_video_by_grok_imagine_edit_jaaz,
    generate_video_by_seedance_v1_lite_jaaz,
)
from tools.feature_tools import (
    feature_face_swap_jaaz,
    feature_character_swap_jaaz,
    feature_video_face_swap_jaaz,
    feature_inpaint_jaaz,
    feature_relight_jaaz,
    feature_upscale_jaaz,
    feature_skin_enhancer_jaaz,
    feature_ai_stylist_jaaz,
    feature_draw_to_edit_jaaz,
    feature_lipsync_jaaz,
    feature_soul_id_character_jaaz,
)
# Fal.ai Image Tools
from tools.fal_image_tools import (
    generate_image_by_nano_banana_fal,
    generate_image_by_seedream_fal,
    generate_image_by_flux2_fal,
    generate_image_by_flux2_max_fal,
    generate_image_by_flux_kontext_fal,
    generate_image_by_flux_kontext_max_fal,
    generate_image_by_midjourney_fal,
    generate_image_by_ideogram_fal,
    generate_image_by_recraft_fal,
    generate_image_by_reve_fal,
    generate_image_by_higgsfield_soul_fal,
    generate_image_by_z_image_fal,
    generate_image_by_kling_image_fal,
    generate_image_by_wan_image_fal,
)
# Fal.ai Video Tools
from tools.fal_video_tools import (
    generate_video_by_kling_fal,
    generate_video_by_kling_motion_fal,
    generate_video_by_kling_avatars_fal,
    generate_video_by_veo_fal,
    generate_video_by_seedance_fal,
    generate_video_by_wan_fal,
    generate_video_by_hailuo_fal,
    generate_video_by_higgsfield_dop_fal,
    generate_video_by_grok_fal,
)
# OpenAI Sora Tool
from tools.sora_video_tools import generate_video_by_sora_openai
# Direct API Image Tools
from tools.direct_image_tools import (
    generate_image_by_gpt_image_openai,
    generate_image_by_imagen_google,
    enhance_image_by_topaz,
)
# Google Veo Tool
from tools.google_veo_tools import generate_video_by_veo_google
from services.config_service import config_service
from services.db_service import db_service

TOOL_MAPPING: Dict[str, ToolInfo] = {
    "generate_image_by_gpt_image_1_jaaz": {
        "display_name": "GPT Image 1",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_gpt_image_1_jaaz,
    },
    "generate_image_by_imagen_4_jaaz": {
        "display_name": "Imagen 4",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_imagen_4_jaaz,
    },
    "generate_image_by_recraft_v3_jaaz": {
        "display_name": "Recraft v3",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_recraft_v3_jaaz,
    },
    "generate_image_by_ideogram3_bal_jaaz": {
        "display_name": "Ideogram 3 Balanced",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_ideogram3_bal_jaaz,
    },
    # "generate_image_by_flux_1_1_pro_jaaz": {
    #     "display_name": "Flux 1.1 Pro",
    #     "type": "image",
    #     "provider": "jaaz",
    #     "tool_function": generate_image_by_flux_1_1_pro,
    # },
    "generate_image_by_flux_kontext_pro_jaaz": {
        "display_name": "Flux Kontext Pro",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_flux_kontext_pro_jaaz,
    },
    "generate_image_by_flux_kontext_max_jaaz": {
        "display_name": "Flux Kontext Max",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_flux_kontext_max,
    },
    "generate_image_by_midjourney_jaaz": {
        "display_name": "Midjourney",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_midjourney_jaaz,
    },
    "generate_image_by_doubao_seedream_3_jaaz": {
        "display_name": "Doubao Seedream 3",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_doubao_seedream_3_jaaz,
    },
    "generate_image_by_doubao_seedream_3_volces": {
        "display_name": "Doubao Seedream 3 by volces",
        "type": "image",
        "provider": "volces",
        "tool_function": generate_image_by_doubao_seedream_3_volces,
    },
    "edit_image_by_doubao_seededit_3_volces": {
        "display_name": "Doubao Seededit 3 by volces",
        "type": "image",
        "provider": "volces",
        "tool_function": edit_image_by_doubao_seededit_3_volces,
    },
    "generate_video_by_seedance_v1_jaaz": {
        "display_name": "Doubao Seedance v1",
        "type": "video",
        "provider": "jaaz",
        "tool_function": generate_video_by_seedance_v1_jaaz,
    },
    "generate_video_by_hailuo_02_jaaz": {
        "display_name": "Hailuo 02",
        "type": "video",
        "provider": "jaaz",
        "tool_function": generate_video_by_hailuo_02_jaaz,
    },
    "generate_video_by_kling_v2_jaaz": {
        "display_name": "Kling v2.1 Standard",
        "type": "video",
        "provider": "jaaz",
        "tool_function": generate_video_by_kling_v2_jaaz,
    },
    "generate_video_by_seedance_v1_pro_volces": {
        "display_name": "Doubao Seedance v1 by volces",
        "type": "video",
        "provider": "volces",
        "tool_function": generate_video_by_seedance_v1_pro_volces,
    },
    "generate_video_by_seedance_v1_lite_volces_t2v": {
        "display_name": "Doubao Seedance v1 lite(text-to-video)",
        "type": "video",
        "provider": "volces",
        "tool_function": generate_video_by_seedance_v1_lite_t2v,
    },
    "generate_video_by_seedance_v1_lite_i2v_volces": {
        "display_name": "Doubao Seedance v1 lite(images-to-video)",
        "type": "video",
        "provider": "volces",
        "tool_function": generate_video_by_seedance_v1_lite_i2v,
    },
    "generate_video_by_veo3_fast_jaaz": {
        "display_name": "Veo3 Fast",
        "type": "video",
        "provider": "jaaz",
        "tool_function": generate_video_by_veo3_fast_jaaz,
    },
    # ---------------
    # Replicate Tools
    # ---------------
    "generate_image_by_imagen_4_replicate": {
        "display_name": "Imagen 4",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_imagen_4_replicate,
    },
    "generate_image_by_recraft_v3_replicate": {
        "display_name": "Recraft v3",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_recraft_v3_replicate,
    },
    "generate_image_by_flux_kontext_pro_replicate": {
        "display_name": "Flux Kontext Pro",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_flux_kontext_pro_replicate,
    },
    "generate_image_by_flux_kontext_max_replicate": {
        "display_name": "Flux Kontext Max",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_flux_kontext_max_replicate,
    },
    # ---------------
    # Stub Image Tools (Coming Soon)
    # ---------------
    "generate_image_by_higgsfield_soul_jaaz": {
        "display_name": "Higgsfield Soul",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_higgsfield_soul_jaaz,
    },
    "generate_image_by_higgsfield_popcorn_jaaz": {
        "display_name": "Higgsfield Popcorn",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_higgsfield_popcorn_jaaz,
    },
    "generate_image_by_nano_banana_pro_jaaz": {
        "display_name": "Nano Banana Pro",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_nano_banana_pro_jaaz,
    },
    "generate_image_by_z_image_jaaz": {
        "display_name": "Z-Image",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_z_image_jaaz,
    },
    "generate_image_by_kling_q1_image_jaaz": {
        "display_name": "Kling Q1 Image",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_kling_q1_image_jaaz,
    },
    "generate_image_by_wan_2_2_image_jaaz": {
        "display_name": "Wan 2.2 Image",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_wan_2_2_image_jaaz,
    },
    "generate_image_by_reve_jaaz": {
        "display_name": "Reve",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_reve_jaaz,
    },
    "generate_image_by_topaz_jaaz": {
        "display_name": "Topaz",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_topaz_jaaz,
    },
    "generate_image_by_nano_banana_pro_inpaint_jaaz": {
        "display_name": "Nano Banana Pro Inpaint",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_nano_banana_pro_inpaint_jaaz,
    },
    "generate_image_by_nano_banana_inpaint_jaaz": {
        "display_name": "Nano Banana Inpaint",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_nano_banana_inpaint_jaaz,
    },
    "generate_image_by_product_placement_jaaz": {
        "display_name": "Product Placement",
        "type": "image",
        "provider": "jaaz",
        "tool_function": generate_image_by_product_placement_jaaz,
    },
    # ---------------
    # Stub Video Tools (Coming Soon)
    # ---------------
    "generate_video_by_kling_3_jaaz": {
        "display_name": "Kling 3.0",
        "type": "video",
        "provider": "jaaz",
        "tool_function": generate_video_by_kling_3_jaaz,
    },
    "generate_video_by_grok_imagine_jaaz": {
        "display_name": "Grok Imagine",
        "type": "video",
        "provider": "jaaz",
        "tool_function": generate_video_by_grok_imagine_jaaz,
    },
    "generate_video_by_kling_motion_control_jaaz": {
        "display_name": "Kling Motion Control",
        "type": "video",
        "provider": "jaaz",
        "tool_function": generate_video_by_kling_motion_control_jaaz,
    },
    "generate_video_by_sora_2_jaaz": {
        "display_name": "Sora 2",
        "type": "video",
        "provider": "jaaz",
        "tool_function": generate_video_by_sora_2_jaaz,
    },
    "generate_video_by_wan_2_6_jaaz": {
        "display_name": "Wan 2.6",
        "type": "video",
        "provider": "jaaz",
        "tool_function": generate_video_by_wan_2_6_jaaz,
    },
    "generate_video_by_kling_avatars_2_jaaz": {
        "display_name": "Kling Avatars 2.0",
        "type": "video",
        "provider": "jaaz",
        "tool_function": generate_video_by_kling_avatars_2_jaaz,
    },
    "generate_video_by_higgsfield_dop_jaaz": {
        "display_name": "Higgsfield DOP",
        "type": "video",
        "provider": "jaaz",
        "tool_function": generate_video_by_higgsfield_dop_jaaz,
    },
    "generate_video_by_kling_q1_edit_jaaz": {
        "display_name": "Kling Q1 Edit",
        "type": "video",
        "provider": "jaaz",
        "tool_function": generate_video_by_kling_q1_edit_jaaz,
    },
    "generate_video_by_kling_3_omni_edit_jaaz": {
        "display_name": "Kling 3.0 Omni Edit",
        "type": "video",
        "provider": "jaaz",
        "tool_function": generate_video_by_kling_3_omni_edit_jaaz,
    },
    "generate_video_by_grok_imagine_edit_jaaz": {
        "display_name": "Grok Imagine Edit",
        "type": "video",
        "provider": "jaaz",
        "tool_function": generate_video_by_grok_imagine_edit_jaaz,
    },
    "generate_video_by_seedance_v1_lite_jaaz": {
        "display_name": "Seedance v1 lite",
        "type": "video",
        "provider": "jaaz",
        "tool_function": generate_video_by_seedance_v1_lite_jaaz,
    },
    # ---------------
    # Feature Tools
    # ---------------
    "feature_face_swap_jaaz": {
        "display_name": "Face Swap",
        "type": "image",
        "provider": "jaaz",
        "tool_function": feature_face_swap_jaaz,
    },
    "feature_character_swap_jaaz": {
        "display_name": "Character Swap",
        "type": "image",
        "provider": "jaaz",
        "tool_function": feature_character_swap_jaaz,
    },
    "feature_video_face_swap_jaaz": {
        "display_name": "Video Face Swap",
        "type": "video",
        "provider": "jaaz",
        "tool_function": feature_video_face_swap_jaaz,
    },
    "feature_inpaint_jaaz": {
        "display_name": "Inpaint",
        "type": "image",
        "provider": "jaaz",
        "tool_function": feature_inpaint_jaaz,
    },
    "feature_relight_jaaz": {
        "display_name": "Relight",
        "type": "image",
        "provider": "jaaz",
        "tool_function": feature_relight_jaaz,
    },
    "feature_upscale_jaaz": {
        "display_name": "Upscale",
        "type": "image",
        "provider": "jaaz",
        "tool_function": feature_upscale_jaaz,
    },
    "feature_skin_enhancer_jaaz": {
        "display_name": "Skin Enhancer",
        "type": "image",
        "provider": "jaaz",
        "tool_function": feature_skin_enhancer_jaaz,
    },
    "feature_ai_stylist_jaaz": {
        "display_name": "AI Stylist",
        "type": "image",
        "provider": "jaaz",
        "tool_function": feature_ai_stylist_jaaz,
    },
    "feature_draw_to_edit_jaaz": {
        "display_name": "Draw to Edit",
        "type": "image",
        "provider": "jaaz",
        "tool_function": feature_draw_to_edit_jaaz,
    },
    "feature_lipsync_jaaz": {
        "display_name": "Lipsync",
        "type": "video",
        "provider": "jaaz",
        "tool_function": feature_lipsync_jaaz,
    },
    "feature_soul_id_character_jaaz": {
        "display_name": "Soul ID Character",
        "type": "image",
        "provider": "jaaz",
        "tool_function": feature_soul_id_character_jaaz,
    },
    # ---------------
    # Fal.ai Image Tools
    # ---------------
    "generate_image_by_nano_banana_fal": {
        "display_name": "Nano Banana Pro",
        "type": "image",
        "provider": "fal",
        "tool_function": generate_image_by_nano_banana_fal,
    },
    "generate_image_by_seedream_fal": {
        "display_name": "Seedream 4.5",
        "type": "image",
        "provider": "fal",
        "tool_function": generate_image_by_seedream_fal,
    },
    "generate_image_by_flux2_fal": {
        "display_name": "FLUX.2 Pro",
        "type": "image",
        "provider": "fal",
        "tool_function": generate_image_by_flux2_fal,
    },
    "generate_image_by_flux2_max_fal": {
        "display_name": "FLUX.2 Max",
        "type": "image",
        "provider": "fal",
        "tool_function": generate_image_by_flux2_max_fal,
    },
    "generate_image_by_flux_kontext_fal": {
        "display_name": "FLUX Kontext Pro",
        "type": "image",
        "provider": "fal",
        "tool_function": generate_image_by_flux_kontext_fal,
    },
    "generate_image_by_flux_kontext_max_fal": {
        "display_name": "FLUX Kontext Max",
        "type": "image",
        "provider": "fal",
        "tool_function": generate_image_by_flux_kontext_max_fal,
    },
    "generate_image_by_midjourney_fal": {
        "display_name": "Midjourney",
        "type": "image",
        "provider": "fal",
        "tool_function": generate_image_by_midjourney_fal,
    },
    "generate_image_by_ideogram_fal": {
        "display_name": "Ideogram 3",
        "type": "image",
        "provider": "fal",
        "tool_function": generate_image_by_ideogram_fal,
    },
    "generate_image_by_recraft_fal": {
        "display_name": "Recraft V3",
        "type": "image",
        "provider": "fal",
        "tool_function": generate_image_by_recraft_fal,
    },
    "generate_image_by_reve_fal": {
        "display_name": "Reve",
        "type": "image",
        "provider": "fal",
        "tool_function": generate_image_by_reve_fal,
    },
    "generate_image_by_higgsfield_soul_fal": {
        "display_name": "Higgsfield Soul",
        "type": "image",
        "provider": "fal",
        "tool_function": generate_image_by_higgsfield_soul_fal,
    },
    "generate_image_by_z_image_fal": {
        "display_name": "Z-Image",
        "type": "image",
        "provider": "fal",
        "tool_function": generate_image_by_z_image_fal,
    },
    "generate_image_by_kling_image_fal": {
        "display_name": "Kling Q1 Image",
        "type": "image",
        "provider": "fal",
        "tool_function": generate_image_by_kling_image_fal,
    },
    "generate_image_by_wan_image_fal": {
        "display_name": "Wan 2.0 Image",
        "type": "image",
        "provider": "fal",
        "tool_function": generate_image_by_wan_image_fal,
    },
    # ---------------
    # Fal.ai Video Tools
    # ---------------
    "generate_video_by_kling_fal": {
        "display_name": "Kling 3.0",
        "type": "video",
        "provider": "fal",
        "tool_function": generate_video_by_kling_fal,
    },
    "generate_video_by_kling_motion_fal": {
        "display_name": "Kling Motion Control",
        "type": "video",
        "provider": "fal",
        "tool_function": generate_video_by_kling_motion_fal,
    },
    "generate_video_by_kling_avatars_fal": {
        "display_name": "Kling Avatars 2.0",
        "type": "video",
        "provider": "fal",
        "tool_function": generate_video_by_kling_avatars_fal,
    },
    "generate_video_by_veo_fal": {
        "display_name": "Google Veo 3.1",
        "type": "video",
        "provider": "fal",
        "tool_function": generate_video_by_veo_fal,
    },
    "generate_video_by_seedance_fal": {
        "display_name": "Seedance 1.5 Pro",
        "type": "video",
        "provider": "fal",
        "tool_function": generate_video_by_seedance_fal,
    },
    "generate_video_by_wan_fal": {
        "display_name": "Wan 2.6",
        "type": "video",
        "provider": "fal",
        "tool_function": generate_video_by_wan_fal,
    },
    "generate_video_by_hailuo_fal": {
        "display_name": "MiniMax Hailuo 02",
        "type": "video",
        "provider": "fal",
        "tool_function": generate_video_by_hailuo_fal,
    },
    "generate_video_by_higgsfield_dop_fal": {
        "display_name": "Higgsfield DOP",
        "type": "video",
        "provider": "fal",
        "tool_function": generate_video_by_higgsfield_dop_fal,
    },
    "generate_video_by_grok_fal": {
        "display_name": "Grok Imagine",
        "type": "video",
        "provider": "fal",
        "tool_function": generate_video_by_grok_fal,
    },
    # ---------------
    # OpenAI Sora Tool
    # ---------------
    "generate_video_by_sora_openai": {
        "display_name": "Sora 2",
        "type": "video",
        "provider": "openai",
        "tool_function": generate_video_by_sora_openai,
    },
    # ---------------
    # Direct API Image Tools
    # ---------------
    "generate_image_by_gpt_image_openai": {
        "display_name": "GPT Image / DALL-E 3",
        "type": "image",
        "provider": "openai",
        "tool_function": generate_image_by_gpt_image_openai,
    },
    "generate_image_by_imagen_google": {
        "display_name": "Google Imagen 3",
        "type": "image",
        "provider": "google-ai",
        "tool_function": generate_image_by_imagen_google,
    },
    "enhance_image_by_topaz": {
        "display_name": "Topaz Enhancer",
        "type": "image",
        "provider": "fal",
        "tool_function": enhance_image_by_topaz,
    },
    # ---------------
    # Google Veo Tool
    # ---------------
    "generate_video_by_veo_google": {
        "display_name": "Google Veo 3",
        "type": "video",
        "provider": "google-ai",
        "tool_function": generate_video_by_veo_google,
    },
}


class ToolService:
    def __init__(self):
        self.tools: Dict[str, ToolInfo] = {}
        self._register_required_tools()

    def _register_required_tools(self):
        """注册必须的工具"""
        try:
            self.tools["write_plan"] = {
                "provider": "system",
                "tool_function": write_plan_tool,
            }
        except ImportError as e:
            print(f"❌ 注册必须工具失败 write_plan: {e}")

    def register_tool(self, tool_id: str, tool_info: ToolInfo):
        """注册单个工具"""
        if tool_id in self.tools:
            print(f"🔄 TOOL ALREADY REGISTERED: {tool_id}")
            return

        self.tools[tool_id] = tool_info

    # TODO: Check if there will be racing conditions when server just starting up but tools are not ready yet.
    async def initialize(self):
        self.clear_tools()
        try:
            for provider_name, provider_config in config_service.app_config.items():
                # register all tools by api provider with api key
                if provider_config.get("api_key", ""):
                    for tool_id, tool_info in TOOL_MAPPING.items():
                        if tool_info.get("provider") == provider_name:
                            self.register_tool(tool_id, tool_info)
            # Register comfyui workflow tools
            if config_service.app_config.get("comfyui", {}).get("url", ""):
                await register_comfy_tools()
        except Exception as e:
            print(f"❌ Failed to initialize tool service: {e}")
            traceback.print_stack()

    def get_tool(self, tool_name: str) -> BaseTool | None:
        tool_info = self.tools.get(tool_name)
        return tool_info.get("tool_function") if tool_info else None

    def remove_tool(self, tool_id: str):
        self.tools.pop(tool_id)

    def get_all_tools(self) -> Dict[str, ToolInfo]:
        return self.tools.copy()

    def clear_tools(self):
        self.tools.clear()
        # 重新注册必须的工具
        self._register_required_tools()


tool_service = ToolService()


async def register_comfy_tools() -> Dict[str, BaseTool]:
    """
    Fetch all workflows from DB and build tool callables.
    Run inside the current event loop.
    """
    dynamic_comfy_tools: Dict[str, BaseTool] = {}
    try:
        workflows = await db_service.list_comfy_workflows()
    except Exception as exc:  # pragma: no cover
        print("[comfy_dynamic] Failed to list comfy workflows:", exc)
        traceback.print_stack()
        return {}

    for wf in workflows:
        try:
            tool_fn = build_tool(wf)
            # Export with a unique python identifier so that `dir(module)` works
            unique_name = f"comfyui_{wf['name']}"
            dynamic_comfy_tools[unique_name] = tool_fn
            tool_service.register_tool(
                unique_name,
                {
                    "provider": "comfyui",
                    "tool_function": tool_fn,
                    "display_name": wf["name"],
                    # TODO: Add comfyui workflow type! Not hardcoded!
                    "type": "image",
                },
            )
        except Exception as exc:  # pragma: no cover
            print(
                f"[comfy_dynamic] Failed to create tool for workflow {wf.get('id')}: {exc}"
            )
            print(traceback.print_stack())

    return dynamic_comfy_tools
