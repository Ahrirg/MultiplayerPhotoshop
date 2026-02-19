from __future__ import annotations

from datetime import datetime
from sqlalchemy import Integer, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

class Game(Base):
    __tablename__ = "games"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    theme_id: Mapped[int] = mapped_column(ForeignKey("themes.id"))
    player1_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    player2_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    winner_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    result_image_id: Mapped[int | None] = mapped_column(ForeignKey("images.id"), nullable=True)

    note: Mapped[str | None] = mapped_column(String(250), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    theme = relationship("Theme")
    player1 = relationship("User", foreign_keys=[player1_id])
    player2 = relationship("User", foreign_keys=[player2_id])
    winner = relationship("User", foreign_keys=[winner_user_id])
    result_image = relationship("Image", foreign_keys=[result_image_id])

class GamePhoto(Base):
    __tablename__ = "game_photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    game_id: Mapped[int] = mapped_column(ForeignKey("games.id"))
    image_id: Mapped[int] = mapped_column(ForeignKey("images.id"))
    kind: Mapped[str | None] = mapped_column(String(50), nullable=True)

    game = relationship("Game")
    image = relationship("Image")
