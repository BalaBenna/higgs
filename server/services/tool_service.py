import traceback
from typing import Dict
from typing_extensions import TypedDict
from langchain_core.tools import BaseTool
from models.tool_model import ToolInfo
from tools.write_plan import write_plan_tool
from tools.generate_image_by_imagen_4_replicate import (
    generate_image_by_imagen_4_replicate,
)
from tools.generate_image_by_flux_2_pro_replicate import (
    generate_image_by_flux_2_pro_replicate,
)
from tools.generate_image_by_ideogram_v3_turbo_replicate import (
    generate_image_by_ideogram_v3_turbo_replicate,
)
from tools.generate_image_by_flux_1_1_pro_replicate import (
    generate_image_by_flux_1_1_pro_replicate,
)
from tools.generate_image_by_flux_kontext_pro_replicate import (
    generate_image_by_flux_kontext_pro_replicate,
)
from tools.generate_image_by_flux_kontext_max_replicate import (
    generate_image_by_flux_kontext_max_replicate,
)
from tools.generate_image_by_doubao_seedream_3_volces import (
    generate_image_by_doubao_seedream_3_volces,
)
from tools.generate_image_by_doubao_seededit_3_volces import (
    edit_image_by_doubao_seededit_3_volces,
)
from tools.generate_video_by_seedance_v1_pro_volces import (
    generate_video_by_seedance_v1_pro_volces,
)
from tools.generate_video_by_seedance_v1_lite_volces import (
    generate_video_by_seedance_v1_lite_t2v,
    generate_video_by_seedance_v1_lite_i2v,
)
from tools.generate_image_by_recraft_v3_replicate import (
    generate_image_by_recraft_v3_replicate,
)
from tools.generate_image_by_grok_imagine_xai import generate_image_by_grok_imagine_xai
from tools.generate_video_by_grok_imagine_xai import generate_video_by_grok_imagine_xai
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
from tools.hailuo_replicate_tools import generate_video_by_hailuo_o2_replicate
from tools.kling_replicate_tools import (
    generate_video_by_kling_v26_replicate,
    generate_video_by_kling_v25_turbo_replicate,
    generate_video_by_kling_v21_master_replicate,
    generate_video_by_kling_v20_replicate,
    generate_video_by_kling_v16_standard_replicate,
    generate_video_by_kling_v16_pro_replicate,
    generate_video_by_kling_v15_pro_replicate,
    generate_video_by_kling_v21_i2v_replicate,
    generate_video_by_kling_v26_motion_control_replicate,
    generate_video_by_kling_avatar_v2_replicate,
    generate_video_by_kling_lip_sync_replicate,
)

# OpenAI Sora Tool
from tools.sora_video_tools import generate_video_by_sora_openai, generate_video_by_sora_2_pro_openai

# Direct API Image Tools
from tools.direct_image_tools import (
    generate_image_by_gpt_image_openai,
    generate_image_by_dalle3_openai,
    generate_image_by_imagen_google,
    generate_image_by_imagen_4_fast_google,
    generate_image_by_imagen_4_ultra_google,
    enhance_image_by_topaz,
)

# Google Veo Tool
from tools.google_veo_tools import generate_video_by_veo_google
from services.config_service import config_service
from services.db_service import db_service
from services.supabase_service import is_supabase_configured

TOOL_MAPPING: Dict[str, ToolInfo] = {
    "generate_image_by_grok_imagine_xai": {
        "display_name": "Grok Imagine",
        "type": "image",
        "provider": "xai",
        "tool_function": generate_image_by_grok_imagine_xai,
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
    "generate_image_by_flux_2_pro_replicate": {
        "display_name": "FLUX 2 Pro",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_flux_2_pro_replicate,
    },
    "generate_image_by_ideogram_v3_turbo_replicate": {
        "display_name": "Ideogram V3 Turbo",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_ideogram_v3_turbo_replicate,
    },
    "generate_image_by_flux_1_1_pro_replicate": {
        "display_name": "FLUX 1.1 Pro",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_flux_1_1_pro_replicate,
    },
    # ---------------
    # Higgsfield-Parity Image Tools (via Replicate)
    # ---------------
    "generate_image_by_higgsfield_soul_jaaz": {
        "display_name": "Higgsfield Soul",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_higgsfield_soul_jaaz,
    },
    "generate_image_by_higgsfield_popcorn_jaaz": {
        "display_name": "Higgsfield Popcorn",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_higgsfield_popcorn_jaaz,
    },
    "generate_image_by_nano_banana_pro_jaaz": {
        "display_name": "Nano Banana Pro",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_nano_banana_pro_jaaz,
    },
    "generate_image_by_z_image_jaaz": {
        "display_name": "Z-Image",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_z_image_jaaz,
    },
    "generate_image_by_kling_q1_image_jaaz": {
        "display_name": "Kling Q1 Image",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_kling_q1_image_jaaz,
    },
    "generate_image_by_wan_2_2_image_jaaz": {
        "display_name": "Wan 2.2 Image",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_wan_2_2_image_jaaz,
    },
    "generate_image_by_reve_jaaz": {
        "display_name": "Reve",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_reve_jaaz,
    },
    "generate_image_by_topaz_jaaz": {
        "display_name": "Topaz",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_topaz_jaaz,
    },
    "generate_image_by_nano_banana_pro_inpaint_jaaz": {
        "display_name": "Nano Banana Pro Inpaint",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_nano_banana_pro_inpaint_jaaz,
    },
    "generate_image_by_nano_banana_inpaint_jaaz": {
        "display_name": "Nano Banana Inpaint",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_nano_banana_inpaint_jaaz,
    },
    "generate_image_by_product_placement_jaaz": {
        "display_name": "Product Placement",
        "type": "image",
        "provider": "replicate",
        "tool_function": generate_image_by_product_placement_jaaz,
    },
    # ---------------
    # Higgsfield-Parity Video Tools (via Replicate)
    # ---------------
    "generate_video_by_kling_3_jaaz": {
        "display_name": "Kling 3.0",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_3_jaaz,
    },
    "generate_video_by_grok_imagine_jaaz": {
        "display_name": "Grok Imagine",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_grok_imagine_jaaz,
    },
    "generate_video_by_grok_imagine_xai": {
        "display_name": "Grok Imagine (xAI Direct)",
        "type": "video",
        "provider": "xai",
        "tool_function": generate_video_by_grok_imagine_xai,
    },
    "generate_video_by_kling_motion_control_jaaz": {
        "display_name": "Kling Motion Control",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_motion_control_jaaz,
    },
    "generate_video_by_sora_2_jaaz": {
        "display_name": "Sora 2",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_sora_2_jaaz,
    },
    "generate_video_by_wan_2_6_jaaz": {
        "display_name": "Wan 2.6",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_wan_2_6_jaaz,
    },
    "generate_video_by_kling_avatars_2_jaaz": {
        "display_name": "Kling Avatars 2.0",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_avatars_2_jaaz,
    },
    "generate_video_by_higgsfield_dop_jaaz": {
        "display_name": "Higgsfield DOP",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_higgsfield_dop_jaaz,
    },
    "generate_video_by_kling_q1_edit_jaaz": {
        "display_name": "Kling Q1 Edit",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_q1_edit_jaaz,
    },
    "generate_video_by_kling_3_omni_edit_jaaz": {
        "display_name": "Kling 3.0 Omni Edit",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_3_omni_edit_jaaz,
    },
    "generate_video_by_grok_imagine_edit_jaaz": {
        "display_name": "Grok Imagine Edit",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_grok_imagine_edit_jaaz,
    },
    "generate_video_by_seedance_v1_lite_jaaz": {
        "display_name": "Seedance v1 Lite",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_seedance_v1_lite_jaaz,
    },
    # ---------------
    # Hailuo (MiniMax) Replicate Tool
    # ---------------
    "generate_video_by_hailuo_o2_replicate": {
        "display_name": "Hailuo O2",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_hailuo_o2_replicate,
    },
    # ---------------
    # Kling Replicate Tools (kwaivgi/*)
    # ---------------
    "generate_video_by_kling_v26_replicate": {
        "display_name": "Kling v2.6",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_v26_replicate,
    },
    "generate_video_by_kling_v25_turbo_replicate": {
        "display_name": "Kling v2.5 Turbo",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_v25_turbo_replicate,
    },
    "generate_video_by_kling_v21_master_replicate": {
        "display_name": "Kling v2.1 Master",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_v21_master_replicate,
    },
    "generate_video_by_kling_v20_replicate": {
        "display_name": "Kling v2.0",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_v20_replicate,
    },
    "generate_video_by_kling_v16_standard_replicate": {
        "display_name": "Kling v1.6 Standard",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_v16_standard_replicate,
    },
    "generate_video_by_kling_v16_pro_replicate": {
        "display_name": "Kling v1.6 Pro",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_v16_pro_replicate,
    },
    "generate_video_by_kling_v15_pro_replicate": {
        "display_name": "Kling v1.5 Pro",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_v15_pro_replicate,
    },
    "generate_video_by_kling_v21_i2v_replicate": {
        "display_name": "Kling v2.1 (I2V)",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_v21_i2v_replicate,
    },
    "generate_video_by_kling_v26_motion_control_replicate": {
        "display_name": "Kling v2.6 Motion Control",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_v26_motion_control_replicate,
    },
    "generate_video_by_kling_avatar_v2_replicate": {
        "display_name": "Kling Avatar v2",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_avatar_v2_replicate,
    },
    "generate_video_by_kling_lip_sync_replicate": {
        "display_name": "Kling Lip Sync",
        "type": "video",
        "provider": "replicate",
        "tool_function": generate_video_by_kling_lip_sync_replicate,
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
    "generate_video_by_sora_2_pro_openai": {
        "display_name": "Sora 2 Pro",
        "type": "video",
        "provider": "openai",
        "tool_function": generate_video_by_sora_2_pro_openai,
    },
    # ---------------
    # Direct API Image Tools
    # ---------------
    "generate_image_by_gpt_image_openai": {
        "display_name": "GPT Image 1",
        "type": "image",
        "provider": "openai",
        "tool_function": generate_image_by_gpt_image_openai,
    },
    "generate_image_by_dalle3_openai": {
        "display_name": "DALL-E 3",
        "type": "image",
        "provider": "openai",
        "tool_function": generate_image_by_dalle3_openai,
    },
    "generate_image_by_imagen_google": {
        "display_name": "Google Imagen 3",
        "type": "image",
        "provider": "google-ai",
        "tool_function": generate_image_by_imagen_google,
    },
    "generate_image_by_imagen_4_fast_google": {
        "display_name": "Google Imagen 4 Fast",
        "type": "image",
        "provider": "google-ai",
        "tool_function": generate_image_by_imagen_4_fast_google,
    },
    "generate_image_by_imagen_4_ultra_google": {
        "display_name": "Google Imagen 4 Ultra",
        "type": "image",
        "provider": "google-ai",
        "tool_function": generate_image_by_imagen_4_ultra_google,
    },
    "enhance_image_by_topaz": {
        "display_name": "Topaz Enhancer",
        "type": "image",
        "provider": "replicate",
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
    def _has_valid_key(self, provider_name: str) -> bool:
        """Check if a provider has a valid (non-placeholder) API key."""
        config = config_service.app_config.get(provider_name, {})
        key = config.get("api_key", "")
        return bool(key and not key.strip().lower().startswith('your_'))

    async def initialize(self):
        self.clear_tools()
        try:
            # Collect which providers have valid API keys
            active_providers = set()
            for provider_name in config_service.app_config:
                if self._has_valid_key(provider_name):
                    active_providers.add(provider_name)

            for provider_name in active_providers:
                for tool_id, tool_info in TOOL_MAPPING.items():
                    if tool_info.get("provider") == provider_name:
                        self.register_tool(tool_id, tool_info)


        except Exception as e:
            print(f"❌ Failed to initialize tool service: {e}")
            traceback.print_exc()

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
