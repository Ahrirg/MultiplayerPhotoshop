from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import PlainTextResponse, FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.images import store_image
from app.models import Image
from app.schemas.image import ImageOut

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

