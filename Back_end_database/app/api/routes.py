from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, PlainTextResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.images import store_image
from app.core.security import verify_internal_token
from app.models import (
    GameSession,
    GameSessionPlayer,
    Image,
    LiveSession,
    SessionPhoto,
    SessionPlayer,
    Theme,
    User,
)
from app.schemas.image import ImageOut
from app.schemas.session import (
    GameSessionCreate,
    GameSessionOut,
    LiveSessionCreate,
    LiveSessionCurrentImageUpdate,
    LiveSessionOut,
    LiveSessionUpdate,
    PlayerCreate,
    PlayerUpdate,
    PlayerOut,
)
from app.schemas.theme import ThemeCreate, ThemeOut
from app.schemas.user import UserCreate, UserOut

router = APIRouter()
internal_router = APIRouter(prefix='/internal', dependencies=[Depends(verify_internal_token)])


@router.get('/health')
def health():
    return {'status': 'ok'}


@router.get('/info', response_class=PlainTextResponse)
def info():
    p = Path('docs') / 'info.md'
    if not p.exists():
        raise HTTPException(status_code=404, detail='docs/info.md not found')
    return p.read_text(encoding='utf-8')


# ---- Users ----
def _create_user(payload: UserCreate, db: Session):
    existing = db.execute(select(User).where(User.username == payload.username)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail='username already exists')

    user = User(username=payload.username, display_name=payload.display_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post('/users', response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    return _create_user(payload, db)


@internal_router.post('/users', response_model=UserOut)
def internal_create_user(payload: UserCreate, db: Session = Depends(get_db)):
    return _create_user(payload, db)


@router.get('/users', response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return list(db.execute(select(User).order_by(User.id)).scalars().all())


@internal_router.get('/users', response_model=list[UserOut])
def internal_list_users(db: Session = Depends(get_db)):
    return list_users(db)


# ---- Themes ----
def _create_theme(payload: ThemeCreate, db: Session):
    existing = db.execute(select(Theme).where(Theme.name == payload.name)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail='theme already exists')

    theme = Theme(name=payload.name, pack=payload.pack)
    db.add(theme)
    db.commit()
    db.refresh(theme)
    return theme


@router.post('/themes', response_model=ThemeOut)
def create_theme(payload: ThemeCreate, db: Session = Depends(get_db)):
    return _create_theme(payload, db)


@internal_router.post('/themes', response_model=ThemeOut)
def internal_create_theme(payload: ThemeCreate, db: Session = Depends(get_db)):
    return _create_theme(payload, db)


@router.get('/themes', response_model=list[ThemeOut])
def list_themes(db: Session = Depends(get_db)):
    return list(db.execute(select(Theme).order_by(Theme.id)).scalars().all())


@internal_router.get('/themes', response_model=list[ThemeOut])
def internal_list_themes(db: Session = Depends(get_db)):
    return list_themes(db)


# ---- Images ----
async def _upload_image(file: UploadFile, db: Session):
    file_hash, path, size = await store_image(file)

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


@router.post('/images', response_model=ImageOut)
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return await _upload_image(file, db)


@internal_router.post('/images', response_model=ImageOut)
async def internal_upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return await _upload_image(file, db)


@router.get('/images/{image_id}')
def get_image(image_id: int, db: Session = Depends(get_db)):
    img = db.get(Image, image_id)
    if not img:
        raise HTTPException(status_code=404, detail='image not found')

    p = Path(img.path)
    if not p.exists():
        raise HTTPException(status_code=404, detail='image file missing on disk')

    return FileResponse(p, media_type=img.mime_type or 'application/octet-stream', filename=p.name)


@internal_router.get('/images/{image_id}')
def internal_get_image(image_id: int, db: Session = Depends(get_db)):
    return get_image(image_id, db)


# ---- Live sessions: aktyvios sesijos, i kurias jungiasi daug zaideju ----
def _get_live_session_or_404(session_id: str, db: Session) -> LiveSession:
    session = db.execute(select(LiveSession).where(LiveSession.session_id == session_id)).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail='live session not found')
    return session


def _get_image_file_response_or_404(image_id: int, db: Session):
    img = db.get(Image, image_id)
    if not img:
        raise HTTPException(status_code=404, detail='image not found')

    p = Path(img.path)
    if not p.exists():
        raise HTTPException(status_code=404, detail='image file missing on disk')

    return FileResponse(p, media_type=img.mime_type or 'application/octet-stream', filename=p.name)


def _create_live_session(payload: LiveSessionCreate, db: Session):
    existing = db.execute(
        select(LiveSession).where(LiveSession.session_id == payload.session_id)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail='live session already exists')

    session = LiveSession(**payload.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.post('/live-sessions', response_model=LiveSessionOut)
def create_live_session(payload: LiveSessionCreate, db: Session = Depends(get_db)):
    return _create_live_session(payload, db)


@internal_router.post('/live-sessions', response_model=LiveSessionOut)
def internal_create_live_session(payload: LiveSessionCreate, db: Session = Depends(get_db)):
    return _create_live_session(payload, db)


@router.get('/live-sessions', response_model=list[LiveSessionOut])
def list_live_sessions(db: Session = Depends(get_db)):
    return list(db.execute(select(LiveSession).order_by(LiveSession.id.desc())).scalars().all())


@internal_router.get('/live-sessions', response_model=list[LiveSessionOut])
def internal_list_live_sessions(db: Session = Depends(get_db)):
    return list_live_sessions(db)


@router.get('/live-sessions/{session_id}', response_model=LiveSessionOut)
def get_live_session(session_id: str, db: Session = Depends(get_db)):
    return _get_live_session_or_404(session_id, db)


@internal_router.get('/live-sessions/{session_id}', response_model=LiveSessionOut)
def internal_get_live_session(session_id: str, db: Session = Depends(get_db)):
    return get_live_session(session_id, db)


@router.patch('/live-sessions/{session_id}', response_model=LiveSessionOut)
def update_live_session(session_id: str, payload: LiveSessionUpdate, db: Session = Depends(get_db)):
    session = _get_live_session_or_404(session_id, db)

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(session, key, value)

    db.commit()
    db.refresh(session)
    return session


@internal_router.patch('/live-sessions/{session_id}', response_model=LiveSessionOut)
def internal_update_live_session(
    session_id: str,
    payload: LiveSessionUpdate,
    db: Session = Depends(get_db),
):
    return update_live_session(session_id, payload, db)



@router.patch('/live-sessions/{session_id}/current-image', response_model=LiveSessionOut)
def set_current_game_image(
    session_id: str,
    payload: LiveSessionCurrentImageUpdate,
    db: Session = Depends(get_db),
):
    session = _get_live_session_or_404(session_id, db)

    if payload.image_id is not None and not db.get(Image, payload.image_id):
        raise HTTPException(status_code=404, detail='image not found')

    session.current_image_id = payload.image_id
    db.commit()
    db.refresh(session)
    return session


@internal_router.patch('/live-sessions/{session_id}/current-image', response_model=LiveSessionOut)
def internal_set_current_game_image(
    session_id: str,
    payload: LiveSessionCurrentImageUpdate,
    db: Session = Depends(get_db),
):
    return set_current_game_image(session_id, payload, db)


@router.get('/live-sessions/{session_id}/current-image')
def get_current_game_image(session_id: str, db: Session = Depends(get_db)):
    session = _get_live_session_or_404(session_id, db)
    if session.current_image_id is None:
        raise HTTPException(status_code=404, detail='current image not set')

    return _get_image_file_response_or_404(session.current_image_id, db)


@internal_router.get('/live-sessions/{session_id}/current-image')
def internal_get_current_game_image(session_id: str, db: Session = Depends(get_db)):
    return get_current_game_image(session_id, db)


@router.post('/live-sessions/{session_id}/players', response_model=PlayerOut)
def add_player_to_live_session(session_id: str, payload: PlayerCreate, db: Session = Depends(get_db)):
    session = _get_live_session_or_404(session_id, db)

    if payload.user_id is not None:
        user = db.get(User, payload.user_id)
        if not user:
            raise HTTPException(status_code=404, detail='user not found')

        duplicate = db.execute(
            select(SessionPlayer).where(
                SessionPlayer.session_id == session.id,
                SessionPlayer.user_id == payload.user_id,
            )
        ).scalar_one_or_none()
        if duplicate:
            return duplicate

        display_name = payload.display_name or user.display_name
        player = SessionPlayer(
            session_id=session.id,
            user_id=payload.user_id,
            display_name=display_name,
            role=payload.role,
        )
    else:
        duplicate = db.execute(
            select(SessionPlayer).where(
                SessionPlayer.session_id == session.id,
                SessionPlayer.guest_name == payload.guest_name,
            )
        ).scalar_one_or_none()
        if duplicate:
            return duplicate

        player = SessionPlayer(
            session_id=session.id,
            guest_name=payload.guest_name,
            display_name=payload.display_name or payload.guest_name,
            role=payload.role,
        )

    db.add(player)
    db.commit()
    db.refresh(player)
    return player


@internal_router.post('/live-sessions/{session_id}/players', response_model=PlayerOut)
def internal_add_player_to_live_session(
    session_id: str,
    payload: PlayerCreate,
    db: Session = Depends(get_db),
):
    return add_player_to_live_session(session_id, payload, db)



@router.patch('/live-sessions/{session_id}/players/{player_id}', response_model=PlayerOut)
def update_live_session_player(
    session_id: str,
    player_id: int,
    payload: PlayerUpdate,
    db: Session = Depends(get_db),
):
    session = _get_live_session_or_404(session_id, db)
    player = db.get(SessionPlayer, player_id)
    if not player or player.session_id != session.id:
        raise HTTPException(status_code=404, detail='player not found in this session')

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(player, key, value)

    db.commit()
    db.refresh(player)
    return player


@internal_router.patch('/live-sessions/{session_id}/players/{player_id}', response_model=PlayerOut)
def internal_update_live_session_player(
    session_id: str,
    player_id: int,
    payload: PlayerUpdate,
    db: Session = Depends(get_db),
):
    return update_live_session_player(session_id, player_id, payload, db)


@router.delete('/live-sessions/{session_id}/players/{player_id}')
def remove_player_from_live_session(session_id: str, player_id: int, db: Session = Depends(get_db)):
    session = _get_live_session_or_404(session_id, db)
    player = db.get(SessionPlayer, player_id)
    if not player or player.session_id != session.id:
        raise HTTPException(status_code=404, detail='player not found in this session')

    db.delete(player)
    db.commit()
    return {'status': 'removed'}


@internal_router.delete('/live-sessions/{session_id}/players/{player_id}')
def internal_remove_player_from_live_session(
    session_id: str,
    player_id: int,
    db: Session = Depends(get_db),
):
    return remove_player_from_live_session(session_id, player_id, db)


# ---- Game sessions: baigtu zaidimu istorija ----
def _validate_game_session_payload(payload: GameSessionCreate, db: Session) -> None:
    if payload.theme_id is not None and not db.get(Theme, payload.theme_id):
        raise HTTPException(status_code=404, detail='theme not found')
    if payload.winner_user_id is not None and not db.get(User, payload.winner_user_id):
        raise HTTPException(status_code=404, detail='winner not found')
    if payload.result_image_id is not None and not db.get(Image, payload.result_image_id):
        raise HTTPException(status_code=404, detail='result image not found')

    for player in payload.players:
        if player.user_id is not None and not db.get(User, player.user_id):
            raise HTTPException(status_code=404, detail=f'user {player.user_id} not found')

    for photo in payload.photos:
        if not db.get(Image, photo.image_id):
            raise HTTPException(status_code=404, detail=f'image {photo.image_id} not found')


def _create_game_session(payload: GameSessionCreate, db: Session):
    _validate_game_session_payload(payload, db)

    game = GameSession(
        session_id=payload.session_id,
        theme_id=payload.theme_id,
        winner_user_id=payload.winner_user_id,
        winner_guest_name=payload.winner_guest_name,
        result_image_id=payload.result_image_id,
        note=payload.note,
    )
    db.add(game)
    db.flush()

    for player in payload.players:
        db.add(
            GameSessionPlayer(
                game_session_id=game.id,
                user_id=player.user_id,
                guest_name=player.guest_name,
                display_name=player.display_name,
                role=player.role,
            )
        )

    for photo in payload.photos:
        db.add(SessionPhoto(game_session_id=game.id, image_id=photo.image_id, kind=photo.kind))

    if payload.winner_user_id is not None:
        winner = db.get(User, payload.winner_user_id)
        winner.wins += 1

    # Kai zaidimas baigiasi, aktyvia sesija pazymime kaip finished, jei ji dar egzistuoja.
    live = db.execute(select(LiveSession).where(LiveSession.session_id == payload.session_id)).scalar_one_or_none()
    if live:
        live.status = 'finished'

    db.commit()
    db.refresh(game)
    return game


@router.post('/game-sessions', response_model=GameSessionOut)
def create_game_session(payload: GameSessionCreate, db: Session = Depends(get_db)):
    return _create_game_session(payload, db)


@internal_router.post('/game-sessions', response_model=GameSessionOut)
def internal_create_game_session(payload: GameSessionCreate, db: Session = Depends(get_db)):
    return _create_game_session(payload, db)


@router.get('/game-sessions', response_model=list[GameSessionOut])
def list_game_sessions(db: Session = Depends(get_db)):
    return list(db.execute(select(GameSession).order_by(GameSession.id.desc())).scalars().all())


@internal_router.get('/game-sessions', response_model=list[GameSessionOut])
def internal_list_game_sessions(db: Session = Depends(get_db)):
    return list_game_sessions(db)


# Seni pavadinimai palikti tam, kad testuojant nebutu painiavos.
# Dabar /sessions reiskia baigtu zaidimu istorija, o /live-sessions reiskia aktyvias sesijas.
@router.post('/sessions', response_model=GameSessionOut)
def create_session_alias(payload: GameSessionCreate, db: Session = Depends(get_db)):
    return _create_game_session(payload, db)


@router.get('/sessions', response_model=list[GameSessionOut])
def list_sessions_alias(db: Session = Depends(get_db)):
    return list_game_sessions(db)


router.include_router(internal_router)
