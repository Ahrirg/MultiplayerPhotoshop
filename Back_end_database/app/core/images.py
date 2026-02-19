from __future__ import annotations

import hashlib
import os
from pathlib import Path
from typing import Tuple

import aiofiles
from fastapi import UploadFile

from .config import settings

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def _safe_ext(upload: UploadFile) -> str:
    # Try to keep original extension; fallback to ".bin"
    if upload.filename and "." in upload.filename:
        ext = "." + upload.filename.rsplit(".", 1)[-1].lower()
        if len(ext) <= 10 and ext.isascii():
            return ext
    # Basic fallback based on content-type
    ct = (upload.content_type or "").lower()
    if ct == "image/png":
        return ".png"
    if ct in {"image/jpeg", "image/jpg"}:
        return ".jpg"
    if ct == "image/webp":
        return ".webp"
    return ".bin"

def build_image_path(file_hash: str, ext: str) -> Path:
    # Store as: data/images/ab/cd/<hash><ext>
    root = Path(settings.data_dir) / "images" / file_hash[:2] / file_hash[2:4]
    return root / f"{file_hash}{ext}"

async def store_image(upload: UploadFile) -> Tuple[str, Path, int]:
    data = await upload.read()
    file_hash = sha256_bytes(data)
    ext = _safe_ext(upload)
    path = build_image_path(file_hash, ext)
    path.parent.mkdir(parents=True, exist_ok=True)

    # Write only if not already present
    if not path.exists():
        async with aiofiles.open(path, "wb") as f:
            await f.write(data)

    return file_hash, path, len(data)
