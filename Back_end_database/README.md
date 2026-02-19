# Backend skeleton (FastAPI + SQLite + image storage by hash)

## Run with uv
```bash
# 1) install uv (once)
# Windows (PowerShell):
#   iwr https://astral.sh/uv/install.ps1 -useb | iex
# macOS/Linux:
#   curl -LsSf https://astral.sh/uv/install.sh | sh

# 2) from this folder:
uv sync
uv run uvicorn app.main:app --reload
```

Open:
- http://127.0.0.1:8000/docs (Swagger)

## What is implemented
- `/info` reads `docs/info.md` and returns it as text
- Image upload: `POST /images` (DB stores sha256 + path, file stored on disk)
- Image download: `GET /images/{image_id}`
- Basic CRUD: users, themes
- Create game: stores winner + result image + optional photo links

## Configure
Environment variables:
- `DATABASE_URL` (default `sqlite:///./data/app.db`)
- `DATA_DIR` (default `./data`)
