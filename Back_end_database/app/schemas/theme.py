from pydantic import BaseModel, Field

class ThemeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    pack: str | None = Field(default=None, max_length=120)

class ThemeOut(BaseModel):
    id: int
    name: str
    pack: str | None

    class Config:
        from_attributes = True
