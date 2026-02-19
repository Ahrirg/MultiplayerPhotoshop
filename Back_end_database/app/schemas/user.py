from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    display_name: str = Field(min_length=1, max_length=80)

class UserOut(BaseModel):
    id: int
    username: str
    display_name: str
    wins: int

    class Config:
        from_attributes = True
