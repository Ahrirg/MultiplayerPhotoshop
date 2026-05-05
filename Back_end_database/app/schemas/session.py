from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, model_validator


class PlayerCreate(BaseModel):
    user_id: int | None = None
    guest_name: str | None = Field(default=None, min_length=1, max_length=80)
    display_name: str | None = Field(default=None, min_length=1, max_length=80)
    role: str = Field(default='player', max_length=30)

    @model_validator(mode='after')
    def validate_user_or_guest(self):
        if self.user_id is None and not self.guest_name:
            raise ValueError('user_id arba guest_name yra privalomas')
        if self.user_id is not None and self.guest_name:
            raise ValueError('naudokite tik user_id arba tik guest_name, ne abu kartu')
        return self


class PlayerUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=80)
    role: str | None = Field(default=None, max_length=30)


class PlayerOut(BaseModel):
    id: int
    user_id: int | None
    guest_name: str | None
    display_name: str
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True


class LiveSessionCreate(BaseModel):
    session_id: str = Field(min_length=1, max_length=80)
    host: str = Field(min_length=1, max_length=120)
    port: int = Field(ge=1, le=65535)
    status: str = Field(default='waiting', max_length=30)
    expires_at: datetime | None = None


class LiveSessionUpdate(BaseModel):
    host: str | None = Field(default=None, min_length=1, max_length=120)
    port: int | None = Field(default=None, ge=1, le=65535)
    status: str | None = Field(default=None, max_length=30)
    expires_at: datetime | None = None


class LiveSessionCurrentImageUpdate(BaseModel):
    image_id: int | None = None


class LiveSessionOut(BaseModel):
    id: int
    session_id: str
    host: str
    port: int
    status: str
    current_image_id: int | None
    created_at: datetime
    expires_at: datetime | None
    players: list[PlayerOut] = []

    class Config:
        from_attributes = True


class GameSessionPlayerCreate(BaseModel):
    user_id: int | None = None
    guest_name: str | None = Field(default=None, min_length=1, max_length=80)
    display_name: str = Field(min_length=1, max_length=80)
    role: str | None = Field(default=None, max_length=30)

    @model_validator(mode='after')
    def validate_user_or_guest(self):
        if self.user_id is None and not self.guest_name:
            raise ValueError('user_id arba guest_name yra privalomas')
        if self.user_id is not None and self.guest_name:
            raise ValueError('naudokite tik user_id arba tik guest_name, ne abu kartu')
        return self


class SessionPhotoCreate(BaseModel):
    image_id: int
    kind: str | None = Field(default=None, max_length=50)


class GameSessionCreate(BaseModel):
    session_id: str = Field(min_length=1, max_length=80)
    theme_id: int | None = None
    winner_user_id: int | None = None
    winner_guest_name: str | None = Field(default=None, max_length=80)
    result_image_id: int | None = None
    note: str | None = Field(default=None, max_length=250)
    players: list[GameSessionPlayerCreate] = Field(default_factory=list)
    photos: list[SessionPhotoCreate] = Field(default_factory=list)

    @model_validator(mode='after')
    def validate_winner(self):
        if self.winner_user_id is not None and self.winner_guest_name:
            raise ValueError('winner gali buti arba user_id, arba guest_name, ne abu kartu')
        return self


class GameSessionPlayerOut(BaseModel):
    id: int
    user_id: int | None
    guest_name: str | None
    display_name: str
    role: str | None

    class Config:
        from_attributes = True


class SessionPhotoOut(BaseModel):
    id: int
    image_id: int
    kind: str | None

    class Config:
        from_attributes = True


class GameSessionOut(BaseModel):
    id: int
    session_id: str
    theme_id: int | None
    winner_user_id: int | None
    winner_guest_name: str | None
    result_image_id: int | None
    note: str | None
    created_at: datetime
    players: list[GameSessionPlayerOut] = []
    photos: list[SessionPhotoOut] = []

    class Config:
        from_attributes = True


# Suderinamumui su senu importu routes.py faile, jei kazkur dar naudota SessionCreate/SessionOut.
SessionCreate = GameSessionCreate
SessionOut = GameSessionOut
