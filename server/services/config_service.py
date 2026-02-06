import copy
import os
import traceback
import aiofiles
import toml
from typing import Dict, Literal, Optional
from typing_extensions import TypedDict

# 定义配置文件的类型结构


class ModelConfig(TypedDict, total=False):
    type: Literal["text", "image", "video"]
    is_custom: Optional[bool]
    is_disabled: Optional[bool]


class ProviderConfig(TypedDict, total=False):
    url: str
    api_key: str
    max_tokens: int
    models: Dict[str, ModelConfig]
    is_custom: Optional[bool]


AppConfig = Dict[str, ProviderConfig]


DEFAULT_PROVIDERS_CONFIG: AppConfig = {
    'jaaz': {
        'models': {
            # text models
            'gpt-4o': {'type': 'text'},
            'gpt-4o-mini': {'type': 'text'},
            'deepseek/deepseek-chat-v3-0324': {'type': 'text'},
            'anthropic/claude-sonnet-4': {'type': 'text'},
            'anthropic/claude-3.7-sonnet': {'type': 'text'},
        },
        'url': os.getenv('BASE_API_URL', 'https://jaaz.app').rstrip('/') + '/api/v1/',
        'api_key': '',
        'max_tokens': 8192,
    },
    'comfyui': {
        'models': {},
        'url': 'http://127.0.0.1:8188',
        'api_key': '',
    },
    'openai': {
        'models': {
            'gpt-4o': {'type': 'text'},
            'gpt-4o-mini': {'type': 'text'},
        },
        'url': 'https://api.openai.com/v1/',
        'api_key': os.getenv('OPENAI_API_KEY', ''),
        'max_tokens': 8192,
    },
    'vertex-ai': {
        'models': {
            'imagen-3.0-generate-001': {'type': 'image'},
            'veo-generate-001': {'type': 'video'},
        },
        'url': 'https://aistudio.googleapis.com/v1/',
        'api_key': os.getenv('GOOGLE_VERTEX_AI_API_KEY', ''),
        'max_tokens': 8192,
    },
    'fal': {
        'models': {},
        'url': 'https://queue.fal.run',
        'api_key': os.getenv('FAL_API_KEY', ''),
    },
    'google-ai': {
        'models': {},
        'url': 'https://generativelanguage.googleapis.com/v1/',
        'api_key': os.getenv('GOOGLE_API_KEY', ''),
    },
    'replicate': {
        'models': {},
        'url': 'https://api.replicate.com/v1/',
        'api_key': os.getenv('REPLICATE_API_KEY', '') or os.getenv('REPLICATE_API_TOKEN', ''),
    },
    'volces': {
        'models': {},
        'url': os.getenv('VOLCENGINE_URL', 'https://ark.cn-beijing.volces.com/api/v3'),
        'api_key': os.getenv('VOLCENGINE_API_KEY', ''),
    },
    'wavespeed': {
        'models': {},
        'url': 'https://api.wavespeed.ai/v1/',
        'api_key': os.getenv('WAVESPEED_API_KEY', ''),
    },
    'xai': {
        'models': {},
        'url': 'https://api.x.ai/v1',
        'api_key': os.getenv('XAI_API_KEY', ''),
    },
}

# Map of provider names to their environment variable names for API keys
_PROVIDER_ENV_KEYS: Dict[str, str] = {
    'openai': 'OPENAI_API_KEY',
    'vertex-ai': 'GOOGLE_VERTEX_AI_API_KEY',
    'fal': 'FAL_API_KEY',
    'google-ai': 'GOOGLE_API_KEY',
    'replicate': 'REPLICATE_API_KEY',
    'volces': 'VOLCENGINE_API_KEY',
    'xai': 'XAI_API_KEY',
    'wavespeed': 'WAVESPEED_API_KEY',
}


def _is_valid_api_key(key: str) -> bool:
    """Check if an API key is a real key (not empty or placeholder)."""
    if not key:
        return False
    key_lower = key.strip().lower()
    return not key_lower.startswith('your_') and key_lower not in ('', 'none', 'null')


SERVER_DIR = os.path.dirname(os.path.dirname(__file__))
USER_DATA_DIR = os.getenv(
    "USER_DATA_DIR",
    os.path.join(SERVER_DIR, "user_data"),
)
FILES_DIR = os.path.join(USER_DATA_DIR, "files")


IMAGE_FORMATS = (
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",  # 基础格式
    ".bmp",
    ".tiff",
    ".tif",  # 其他常见格式
    ".webp",
)
VIDEO_FORMATS = (
    ".mp4",
    ".avi",
    ".mkv",
    ".mov",
    ".wmv",
    ".flv",
)


class ConfigService:
    def __init__(self):
        self.app_config: AppConfig = copy.deepcopy(DEFAULT_PROVIDERS_CONFIG)
        self.config_file = os.getenv(
            "CONFIG_PATH", os.path.join(USER_DATA_DIR, "config.toml")
        )
        self.initialized = False

    def _get_jaaz_url(self) -> str:
        """Get the correct jaaz URL"""
        return os.getenv('BASE_API_URL', 'https://jaaz.app').rstrip('/') + '/api/v1/'

    async def initialize(self) -> None:
        try:
            # Ensure the user_data directory exists
            os.makedirs(os.path.dirname(self.config_file), exist_ok=True)

            # Check if config file exists
            if not self.exists_config():
                print(
                    f"Config file not found at {self.config_file}, creating default configuration"
                )
                # Create default config file
                with open(self.config_file, "w") as f:
                    toml.dump(self.app_config, f)
                print(f"Default config file created at {self.config_file}")
                self.initialized = True
                return

            async with aiofiles.open(self.config_file, "r") as f:
                content = await f.read()
                config: AppConfig = toml.loads(content)
            for provider, provider_config in config.items():
                if provider not in DEFAULT_PROVIDERS_CONFIG:
                    provider_config['is_custom'] = True
                self.app_config[provider] = provider_config
                # image/video models are hardcoded in the default provider config
                provider_models = DEFAULT_PROVIDERS_CONFIG.get(provider, {}).get(
                    'models', {}
                )
                for model_name, model_config in provider_config.get(
                    'models', {}
                ).items():
                    # Only text model can be self added
                    if (
                        model_config.get('type') == 'text'
                        and model_name not in provider_models
                    ):
                        provider_models[model_name] = model_config
                        provider_models[model_name]['is_custom'] = True
                self.app_config[provider]['models'] = provider_models

            # For all providers, if config.toml has an empty api_key but
            # the environment variable has a value, use the env var.
            # This prevents config.toml from overwriting env-based keys.
            for provider_name, env_key in _PROVIDER_ENV_KEYS.items():
                if provider_name in self.app_config:
                    if not _is_valid_api_key(
                        self.app_config[provider_name].get('api_key', '')
                    ):
                        env_val = os.getenv(env_key, '')
                        # For replicate, also check REPLICATE_API_TOKEN
                        if not _is_valid_api_key(env_val) and provider_name == 'replicate':
                            env_val = os.getenv('REPLICATE_API_TOKEN', '')
                        if _is_valid_api_key(env_val):
                            self.app_config[provider_name]['api_key'] = env_val

            # Ensure jaaz URL is always correct
            if 'jaaz' in self.app_config:
                self.app_config['jaaz']['url'] = self._get_jaaz_url()
        except Exception as e:
            print(f"Error loading config: {e}")
            traceback.print_exc()
        finally:
            self.initialized = True

    def get_config(self) -> AppConfig:
        if 'jaaz' in self.app_config:
            self.app_config['jaaz']['url'] = self._get_jaaz_url()
        return self.app_config

    async def update_config(self, data: AppConfig) -> Dict[str, str]:
        try:
            if 'jaaz' in data:
                data['jaaz']['url'] = self._get_jaaz_url()

            os.makedirs(os.path.dirname(self.config_file), exist_ok=True)
            with open(self.config_file, "w") as f:
                toml.dump(data, f)
            self.app_config = data

            return {
                "status": "success",
                "message": "Configuration updated successfully",
            }
        except Exception as e:
            traceback.print_exc()
            return {"status": "error", "message": str(e)}

    def exists_config(self) -> bool:
        return os.path.exists(self.config_file)


config_service = ConfigService()
