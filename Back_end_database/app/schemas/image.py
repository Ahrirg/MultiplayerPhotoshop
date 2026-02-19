from pydantic import BaseModel

class ImageOut(BaseModel):
    id: int
    sha256: str
    mime_type: str | None
    size_bytes: int

    class Config:
        from_attributes = True
