# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jaaz is an open-source multimodal canvas creative agent - a privacy-first AI design platform (Canva/Figma alternative) with built-in AI capabilities for image and video generation.

## Development Commands

### Frontend (React)
```bash
cd react
npm install --force
npm run dev          # Vite dev server on localhost:5174
npm run build        # TypeScript + Vite production build
npm run lint         # ESLint
npm run build:lib    # Build as library (@jaaz/agent-ui)
```

### Backend (Python)
```bash
cd server
pip install -r requirements.txt
python main.py       # FastAPI server on localhost:57988
```

### Testing
```bash
npm test             # Run vitest
npm run test:run     # Run tests once
npm run test:watch   # Watch mode
```

**Requirements:** Python 3.12+, Node.js

## Architecture

### Monorepo Structure
- `react/` - Frontend (React 19 + TypeScript + Vite)
- `server/` - Backend (FastAPI + Python)

### Frontend Stack
- **Routing:** TanStack Router (file-based routes in `react/src/routes/`)
- **State:** Zustand stores (`react/src/stores/`) + React Context (`react/src/contexts/`)
- **Data fetching:** TanStack React Query with IndexedDB persistence
- **UI:** Radix UI components + Tailwind CSS 4
- **Canvas:** tldraw, Excalidraw, XYFlow
- **Real-time:** Socket.io-client

### Backend Stack
- **Framework:** FastAPI with Uvicorn
- **AI Agents:** LangGraph for multi-agent orchestration
- **Multi-model:** OpenAI, Anthropic, and various image/video generation APIs
- **Real-time:** Socket.io for WebSocket communication
- **Database:** aiosqlite

### Key Directories
- `react/src/components/` - UI components organized by feature (canvas/, chat/, settings/, etc.)
- `react/src/api/` - API client functions
- `server/routers/` - FastAPI route handlers
- `server/services/` - Business logic (jaaz_service.py, chat_service.py, langgraph_service/)
- `server/tools/` - Image/video generation tool definitions and providers

### API Communication
Frontend proxies to backend:
- `/api/*` → `http://127.0.0.1:57988`
- `/ws` → `ws://127.0.0.1:57988`

## Code Style

### TypeScript/JavaScript
- Prettier: no semicolons, single quotes, 100 char width
- ESLint with React hooks and refresh plugins

### Python
- Black formatter (line-length 88, skip string normalization)
- isort (black profile)
- Ruff linter

**VSCode Extension:** Black Formatter by ms-python (ms-python.black-formatter)
