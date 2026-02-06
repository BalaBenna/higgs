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
cd app && npm test           # Run vitest
cd app && npm run test:run   # Run tests once
cd app && npm run test:watch # Watch mode
```

**Requirements:** Python 3.12+, Node.js

## Architecture

### Monorepo Structure
- `app/` - Frontend (Next.js 15 + React 18 + TypeScript)
- `server/` - Backend (FastAPI + Python)

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
- **AI Agents:** LangGraph for multi-agent orchestration
- **Multi-model:** OpenAI, Anthropic, Google (Gemini/Veo/Imagen), and various image/video generation APIs
- **Real-time:** Socket.io for WebSocket communication
- **Database:** aiosqlite

### Key Directories
- `app/src/components/` - UI components (ui/, generation/, gallery/, layout/, etc.)
- `app/src/hooks/` - React hooks (use-generation.ts, use-feature.ts, use-upload.ts)
- `app/src/config/model-mappings.ts` - Frontend model IDs to backend tool IDs
- `app/src/data/navigation-menus.ts` - Navigation menu definitions
- `server/routers/` - FastAPI route handlers
- `server/services/` - Business logic (jaaz_service.py, chat_service.py, langgraph_service/)
- `server/services/tool_service.py` - Tool registration via `TOOL_MAPPING` dict
- `server/tools/` - Image/video generation tool definitions (LangChain `@tool` decorated)

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

## Code Style

### TypeScript/JavaScript
- Prettier: no semicolons, single quotes, 100 char width, trailing commas (es5)
- ESLint via next lint

### Python
- Black formatter (line-length 88, skip string normalization)
- isort (black profile)
- Ruff linter (rules: E, W, F, I, B, C4, UP)
