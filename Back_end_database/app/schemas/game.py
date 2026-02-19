from pydantic import BaseModel, Field

class GameCreate(BaseModel):
    theme_id: int
    player1_id: int
    player2_id: int
    winner_user_id: int | None = None
    result_image_id: int | None = None
    note: str | None = Field(default=None, max_length=250)

class GameOut(BaseModel):
    id: int
    theme_id: int
    player1_id: int
    player2_id: int
    winner_user_id: int | None
    result_image_id: int | None
    note: str | None

    class Config:
        from_attributes = True
