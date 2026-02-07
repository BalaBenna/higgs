# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Jaaz is an open-source multimodal canvas creative agent - a privacy-first AI design platform (Canva alternative) with built-in AI capabilities for image and video generation. It supports chat-driven interactions with multiple LLM providers and integrates various image/video generation tools.

## Development Commands

### Frontend (Next.js)
```powershell
cd app
npm install
npm run dev          # Dev server on localhost:3000
npm run build        # Production build
npm run lint         # ESLint
```

### Backend (Python 3.12+)
```powershell
cd server
pip install -r requirements.txt
python main.py       # FastAPI server on localhost:57988
python main.py --port 57989  # Use port 57989 to match Next.js proxy
```

### Testing
```powershell
# Frontend tests (vitest)
cd app && npm test
cd app && npm run test:run    # Run once
cd app && npm run test:watch  # Watch mode

# Backend tests (pytest)
cd server && pytest tests/
pytest tests/test_file.py -v                    # Single file
pytest tests/test_file.py::TestClass::test_method -v  # Single test
```

### Linting/Formatting
- **Python:** Black (line-length 88), isort (black profile), Ruff (rules: E, W, F, I, B, C4, UP)
- **TypeScript/JS:** Prettier (no semicolons, single quotes, 100 char width)

## Architecture

### Monorepo Structure
- `app/` - Next.js 15 + React 18 + TypeScript frontend
- `server/` - FastAPI + Python backend

### API Communication
Next.js proxies `/api/*` and `/ws` to backend port 57989 (configured in `app/next.config.js`). Backend defaults to 57988 - start with `--port 57989` or update the proxy config.

### Core Data Flow
1. Client connects via WebSocket (Socket.io) → `websocket_router.py`
2. Chat requests go through `chat_router.py` → `chat_service.py`
3. `langgraph_service/` orchestrates multi-agent chat using LangGraph Swarm
4. Tools (image/video gen) are invoked by LLM and executed against providers
5. Results stream back via WebSocket events (`session_update`, `done`, `error`)

### Frontend Key Locations
- `app/src/app/(main)/` - Feature pages using route group with shared layout
- `app/src/components/` - UI components (ui/, generation/, gallery/, layout/)
- `app/src/hooks/` - React hooks (use-generation.ts, use-feature.ts, use-upload.ts)
- `app/src/stores/` - Zustand stores
- `app/src/config/model-mappings.ts` - Frontend model IDs → backend tool IDs

### Backend Key Locations
- `server/routers/` - FastAPI routes (chat_router, canvas, workspace, config_router)
- `server/services/` - Business logic (chat_service, langgraph_service/, tool_service, db_service)
- `server/tools/` - LangChain @tool decorated functions for image/video generation
- `server/services/tool_service.py` - `TOOL_MAPPING` dict defines all available tools

### Tool Definition Pattern
Tools are async functions in `server/tools/` decorated with LangChain's `@tool`:
```python
@tool("tool_name", description="...", args_schema=PydanticSchema)
async def tool_function(prompt: str, config: RunnableConfig, ...) -> str:
    ctx = config.get("configurable", {})
    canvas_id = ctx.get("canvas_id", "")
    session_id = ctx.get("session_id", "")
    # Implementation...
```
Tools are registered at startup in `tool_service.py` based on available provider API keys.

### Database
SQLite via aiosqlite. Tables: `canvases`, `chat_sessions`, `chat_messages`, `comfy_workflows`, `db_version`. Schema migrations in `server/services/migrations/`.

## Key Configuration

- Config stored in `user_data/config.toml` (TOML format)
- Provider configs: jaaz, openai, vertex-ai, comfyui
- Environment variables: `DEFAULT_PORT`, `BASE_API_URL`, `UI_DIST_DIR`, `USER_DATA_DIR`, provider API keys
