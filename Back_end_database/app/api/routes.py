from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import PlainTextResponse, FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.images import store_image
from app.models import User, Theme, Image, Game
from app.schemas.user import UserCreate, UserOut
from app.schemas.theme import ThemeCreate, ThemeOut
from app.schemas.image import ImageOut
from app.schemas.game import GameCreate, GameOut

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/info", response_class=PlainTextResponse)
def info():
    # Reads docs/info.md (relative to project root)
    # NOTE: This file path assumes you run uvicorn from project root
    p = Path("docs") / "info.md"
    if not p.exists():
        raise HTTPException(status_code=404, detail="docs/info.md not found")
    return p.read_text(encoding="utf-8")

# ---- Users ----
@router.post("/users", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.execute(select(User).where(User.username == payload.username)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="username already exists")
    user = User(username=payload.username, display_name=payload.display_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return list(db.execute(select(User).order_by(User.id)).scalars().all())

# ---- Themes ----
@router.post("/themes", response_model=ThemeOut)
def create_theme(payload: ThemeCreate, db: Session = Depends(get_db)):
    existing = db.execute(select(Theme).where(Theme.name == payload.name)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="theme already exists")
    theme = Theme(name=payload.name, pack=payload.pack)
    db.add(theme)
    db.commit()
    db.refresh(theme)
    return theme

@router.get("/themes", response_model=list[ThemeOut])
def list_themes(db: Session = Depends(get_db)):
    return list(db.execute(select(Theme).order_by(Theme.id)).scalars().all())

# ---- Images ----
@router.post("/images", response_model=ImageOut)
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_hash, path, size = await store_image(file)

    # Deduplicate in DB by hash
    existing = db.execute(select(Image).where(Image.sha256 == file_hash)).scalar_one_or_none()
    if existing:
        return existing

    img = Image(
        sha256=file_hash,
        path=str(path),
        mime_type=file.content_type,
        size_bytes=size,
    )
    db.add(img)
    db.commit()
    db.refresh(img)
    return img

@router.get("/images/{image_id}")
def get_image(image_id: int, db: Session = Depends(get_db)):
    img = db.get(Image, image_id)
    if not img:
        raise HTTPException(status_code=404, detail="image not found")
    p = Path(img.path)
    if not p.exists():
        raise HTTPException(status_code=404, detail="image file missing on disk")
    # For browser display, you may want `media_type=img.mime_type`
    return FileResponse(p, media_type=img.mime_type or "application/octet-stream", filename=p.name)

# ---- Games ----
@router.post("/games", response_model=GameOut)
def create_game(payload: GameCreate, db: Session = Depends(get_db)):
    # Basic FK checks
    if not db.get(Theme, payload.theme_id):
        raise HTTPException(status_code=404, detail="theme not found")
    if not db.get(User, payload.player1_id):
        raise HTTPException(status_code=404, detail="player1 not found")
    if not db.get(User, payload.player2_id):
        raise HTTPException(status_code=404, detail="player2 not found")
    if payload.winner_user_id is not None and not db.get(User, payload.winner_user_id):
        raise HTTPException(status_code=404, detail="winner not found")
    if payload.result_image_id is not None and not db.get(Image, payload.result_image_id):
        raise HTTPException(status_code=404, detail="result image not found")

    game = Game(**payload.model_dump())
    db.add(game)

    # Update wins counter (simple approach)
    if payload.winner_user_id is not None:
        winner = db.get(User, payload.winner_user_id)
        winner.wins += 1

    db.commit()
    db.refresh(game)
    return game

@router.get("/games", response_model=list[GameOut])
def list_games(db: Session = Depends(get_db)):
    return list(db.execute(select(Game).order_by(Game.id.desc())).scalars().all())
