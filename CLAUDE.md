# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jaaz is an open-source multimodal canvas creative agent - a privacy-first AI design platform (Canva/Figma alternative) with built-in AI capabilities for image and video generation.

## Development Commands

### Frontend (Next.js)
```bash
cd app
npm install
npm run dev          # Next.js dev server on localhost:3000
npm run build        # Production build
npm run lint         # ESLint
```

### Backend (Python)
```bash
cd server
pip install -r requirements.txt
python main.py       # FastAPI server on localhost:57988
python main.py --port 57989  # Use port 57989 to match Next.js proxy
```

### Testing
```bash
# Frontend (vitest)
cd app && npm test           # Run vitest
cd app && npm run test:run   # Run tests once
cd app && npm run test:watch # Watch mode

# Backend (pytest)
cd server && pytest tests/
pytest tests/test_file.py -v                          # Single file
pytest tests/test_file.py::TestClass::test_method -v  # Single test
```

**Requirements:** Python 3.12+, Node.js

## Architecture

### Monorepo Structure
- `app/` - Frontend (Next.js 15 + React 18 + TypeScript)
- `server/` - Backend (FastAPI + Python)

### Core Data Flow
1. Client connects via WebSocket (Socket.io) → `websocket_router.py`
2. Chat requests go through `chat_router.py` → `chat_service.py`
3. `langgraph_service/` orchestrates multi-agent chat using LangGraph Swarm
4. Tools (image/video gen) are invoked by the LLM and executed against providers
5. Results stream back via WebSocket events (`session_update`, `done`, `error`)

### Frontend Stack
- **Routing:** Next.js App Router (file-based routes in `app/src/app/`)
- **Route groups:** `(main)` group for shared layout wrapping most feature pages
- **State:** Zustand stores (`app/src/stores/`) + TanStack React Query v5
- **UI:** Radix UI components + Tailwind CSS 3 + Framer Motion
- **Video rendering:** Remotion v4
- **Real-time:** Socket.io-client
- **Icons:** Tabler Icons + Lucide React

### Backend Stack
- **Framework:** FastAPI with Uvicorn, wrapped in Socket.io ASGIApp
- **AI Agents:** LangGraph Swarm for multi-agent orchestration
- **Multi-model:** OpenAI, Anthropic, Google (Gemini/Veo/Imagen), and various image/video generation APIs
- **Real-time:** Socket.io for WebSocket communication
- **Database:** aiosqlite (SQLite). Tables: `canvases`, `chat_sessions`, `chat_messages`, `comfy_workflows`, `db_version`. Migrations in `server/services/migrations/`.
- **Config:** TOML-based config stored in `user_data/config.toml`

### Key Directories
- `app/src/components/` - UI components (ui/, generation/, gallery/, layout/, etc.)
- `app/src/hooks/` - React hooks (use-generation.ts, use-feature.ts, use-upload.ts)
- `app/src/config/model-mappings.ts` - Frontend model IDs to backend tool IDs
- `app/src/data/navigation-menus.ts` - Navigation menu definitions
- `server/routers/` - FastAPI route handlers (chat_router, canvas, workspace, config_router, websocket_router)
- `server/services/` - Business logic (chat_service.py, langgraph_service/, tool_service.py, db_service.py, config_service.py)
- `server/tools/` - Image/video generation tool definitions (LangChain `@tool` decorated)
- `server/tools/image_providers/` - Provider-specific image generation (fal, jaaz, openai, google, replicate, volces)
- `server/tools/video_providers/` - Video generation providers
- `server/models/` - Pydantic/TypedDict data models

### API Communication
Next.js proxies to backend (configured in `app/next.config.js`):
- `/api/*` → `http://127.0.0.1:57989/api/:path*`
- `/ws` → `http://127.0.0.1:57989/ws`

**Note:** Backend defaults to port 57988. Start with `--port 57989` to match the Next.js proxy, or update `next.config.js`.

### Tool System
- Tools are async functions decorated with LangChain's `@tool` in `server/tools/`
- Image tools return strings like `"image generated successfully ![image_id: filename](url)"`
- Video tools use `process_video_result()` helper from `tools/video_generation/video_canvas_utils.py`
- `server/tools/utils/image_generation_core.py` has `generate_image_with_provider()` orchestrator
- Registration: `TOOL_MAPPING` in `tool_service.py` → `ToolService.initialize()` registers tools based on available provider API keys
- ComfyUI workflow tools are dynamically registered from the database
- Tool context (`canvas_id`, `session_id`) is passed via `RunnableConfig.configurable`
- Provider implementations follow base class pattern in `tools/image_providers/image_base_provider.py`

### Tool Definition Pattern
```python
@tool("tool_name", description="...", args_schema=PydanticSchema)
async def tool_function(prompt: str, config: RunnableConfig, ...) -> str:
    ctx = config.get("configurable", {})
    canvas_id = ctx.get("canvas_id", "")
    session_id = ctx.get("session_id", "")
    # Implementation...
```

### Environment Variables
Set in `.env`:
- `DEFAULT_PORT` - Server port (default: 57988)
- `BASE_API_URL` - Base URL for jaaz API
- `UI_DIST_DIR` - Path to frontend build
- `USER_DATA_DIR` - User data directory path
- Provider API keys: `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_VERTEX_AI_API_KEY`, etc.

## Code Style

### TypeScript/JavaScript
- Prettier: no semicolons, single quotes, 100 char width, trailing commas (es5), JSX single quotes, LF line endings
- ESLint via `next lint`

### Python
- Black formatter (line-length 88, skip string normalization)
- isort (black profile)
- Ruff linter (rules: E, W, F, I, B, C4, UP; ignores: E501, B008, C901)
