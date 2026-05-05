from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class LiveSession(Base):
    """Aktyvi/laukianti zaidimo sesija.

    Sita lentele skirta ne galutinei istorijai, o tam, kad authority zinotu,
    kokios sesijos dabar egzistuoja ir prie kurio host/port jungti zaidejus.
    """

    __tablename__ = 'live_sessions'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(80), unique=True, index=True)

    host: Mapped[str] = mapped_column(String(120))
    port: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(30), default='waiting', index=True)

    # Dabartinis zaidimo paveiksliukas / canvas snapshot aktyviai sesijai.
    # Pati nuotrauka saugoma diske per images lentele, cia laikomas tik image_id.
    current_image_id: Mapped[int | None] = mapped_column(ForeignKey('images.id'), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    current_image = relationship('Image', foreign_keys=[current_image_id])

    players = relationship(
        'SessionPlayer',
        back_populates='session',
        cascade='all, delete-orphan',
        lazy='selectin',
    )


class SessionPlayer(Base):
    """Vienas zaidejas aktyvioje sesijoje.

    Cia ir yra pagrindinis pataisymas: zaidejai saugomi atskiroje lenteleje,
    todel vienoje sesijoje gali buti 2, 5, 20 ar kiek reikia zaideju.
    Prisijunges vartotojas turi user_id, o guest turi guest_name.
    """

    __tablename__ = 'session_players'
    __table_args__ = (
        UniqueConstraint('session_id', 'user_id', name='uq_session_player_user'),
        UniqueConstraint('session_id', 'guest_name', name='uq_session_player_guest'),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey('live_sessions.id', ondelete='CASCADE'), index=True)

    user_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True, index=True)
    guest_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    display_name: Mapped[str] = mapped_column(String(80))
    role: Mapped[str] = mapped_column(String(30), default='player')

    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session = relationship('LiveSession', back_populates='players')
    user = relationship('User')


class GameSession(Base):
    """Baigto zaidimo istorijos ir rezultato irasas."""

    __tablename__ = 'game_sessions'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(80), index=True)

    theme_id: Mapped[int | None] = mapped_column(ForeignKey('themes.id'), nullable=True)
    winner_user_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True)
    winner_guest_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    result_image_id: Mapped[int | None] = mapped_column(ForeignKey('images.id'), nullable=True)
    note: Mapped[str | None] = mapped_column(String(250), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    theme = relationship('Theme')
    winner = relationship('User', foreign_keys=[winner_user_id])
    result_image = relationship('Image', foreign_keys=[result_image_id])
    players = relationship(
        'GameSessionPlayer',
        back_populates='game_session',
        cascade='all, delete-orphan',
        lazy='selectin',
    )
    photos = relationship(
        'SessionPhoto',
        back_populates='game_session',
        cascade='all, delete-orphan',
        lazy='selectin',
    )


class GameSessionPlayer(Base):
    """Zaidejai, kurie dalyvavo baigtame zaidime."""

    __tablename__ = 'game_session_players'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    game_session_id: Mapped[int] = mapped_column(ForeignKey('game_sessions.id', ondelete='CASCADE'), index=True)

    user_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True, index=True)
    guest_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    display_name: Mapped[str] = mapped_column(String(80))
    role: Mapped[str | None] = mapped_column(String(30), nullable=True)

    game_session = relationship('GameSession', back_populates='players')
    user = relationship('User')


class SessionPhoto(Base):
    __tablename__ = 'session_photos'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    game_session_id: Mapped[int] = mapped_column(ForeignKey('game_sessions.id', ondelete='CASCADE'), index=True)
    image_id: Mapped[int] = mapped_column(ForeignKey('images.id'))
    kind: Mapped[str | None] = mapped_column(String(50), nullable=True)

    game_session = relationship('GameSession', back_populates='photos')
    image = relationship('Image')
