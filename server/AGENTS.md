# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the Python backend server for Higgs, an AI-powered creative assistant that supports chat interactions with multiple LLM providers and integrates image/video generation capabilities through various AI model providers.

## Build and Run Commands

```powershell
# Install dependencies
pip install -r requirements.txt

# Run development server (default port 57988)
python main.py

# Run on custom port
python main.py --port 8000

# Run tests
pytest tests/

# Run a specific test file
pytest tests/test_product_scraper.py -v

# Run specific test class/method
pytest tests/test_product_scraper.py::TestExtractProductData -v
```

## Architecture

### Core Flow
1. Client connects via WebSocket (SocketIO) and sends chat messages through `chat_router`
2. `chat_service` orchestrates the request, creating database records and spawning an async task
3. `langgraph_service` uses LangGraph Swarm to manage multi-agent chat with tool-calling capabilities
4. Tools (image/video generation) are invoked by the LLM and executed against various providers
5. Results stream back to client via WebSocket events (`session_update`, `done`, `error`)

### Directory Structure

- **`main.py`** - FastAPI entry with lifespan management, router registration, and SocketIO setup. Manually loads `.env` before imports.
- **`routers/`** - FastAPI route handlers. Key routers:
  - `chat_router.py` - Main chat endpoint
  - `websocket_router.py` - SocketIO event handlers (must be imported with `*` in main.py)
  - `canvas.py`, `workspace.py` - Project/canvas management
  - `config_router.py`, `settings.py` - Configuration endpoints
- **`services/`** - Business logic:
  - `langgraph_service/` - Multi-agent orchestration using LangGraph Swarm
  - `chat_service.py` - Chat request handling and task management
  - `config_service.py` - Configuration management (TOML-based, with provider configs)
  - `tool_service.py` - Tool registration and lookup (TOOL_MAPPING defines all available tools)
  - `db_service.py` - SQLite database operations with async support (aiosqlite)
  - `websocket_service.py` - WebSocket broadcasting utilities
- **`tools/`** - LangChain tool implementations:
  - Each tool is decorated with `@tool()` from langchain_core
  - `image_providers/` - Provider-specific image generation (fal, jaaz, openai, google, replicate, volces)
  - `video_providers/` - Video generation providers
  - `utils/image_generation_core.py` - Shared image generation logic
- **`models/`** - Pydantic/TypedDict data models
- **`user_data/`** - Runtime data (SQLite DB, config.toml, uploaded files)

### Key Patterns

**Tool Definition Pattern** (see `tools/fal_image_tools.py`):
```python
@tool(
    "tool_name",
    description="Description for LLM",
    args_schema=PydanticInputSchema,
)
async def tool_function(prompt: str, config: RunnableConfig, ...) -> str:
    ctx = config.get("configurable", {})
    canvas_id = ctx.get("canvas_id", "")
    session_id = ctx.get("session_id", "")
    # Call provider...
```

**Tool Registration** (`services/tool_service.py`):
- `TOOL_MAPPING` dict contains all tools with metadata (provider, type, display_name)
- Tools are registered at startup based on provider API key availability
- ComfyUI workflow tools are dynamically registered from database

**Configuration** (`services/config_service.py`):
- Uses TOML files stored in `user_data/config.toml`
- `DEFAULT_PROVIDERS_CONFIG` defines available providers (jaaz, openai, vertex-ai, comfyui)
- Provider configs include: url, api_key, models, max_tokens

### Database
- SQLite with schema migrations (`services/migrations/`)
- Tables: `canvases`, `chat_sessions`, `chat_messages`, `comfy_workflows`, `db_version`
- Singleton `db_service` instance for all DB operations

### WebSocket Events
- `session_update` - Streaming chat responses
- `init_done` - Server initialization complete
- `done` - Chat stream finished
- `error` - Error occurred

## Environment Variables

Key environment variables (set in `.env`):
- `DEFAULT_PORT` - Server port (default: 57988)
- `BASE_API_URL` - Base URL for jaaz API
- `UI_DIST_DIR` - Path to React frontend build
- `USER_DATA_DIR` - User data directory path
- `CONFIG_PATH` - Config file path
- `OPENAI_API_KEY`, `GOOGLE_VERTEX_AI_API_KEY` - Provider API keys

## Conventions

- Tools return file paths (for images/videos) that are served by the frontend
- All async DB operations use `aiosqlite`
- WebSocket messages are JSON with a `type` field
- Tool context (`canvas_id`, `session_id`) is passed via `RunnableConfig.configurable`
- Provider implementations follow the base class pattern in `tools/image_providers/image_base_provider.py`
