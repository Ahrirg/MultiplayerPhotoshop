from __future__ import annotations

import datetime as dt
import logging
import os
import socket
import subprocess
import sys
import random
import uuid
from enum import Enum
from pathlib import Path
from typing import Any
from argon2 import PasswordHasher
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

try:
    import markdown  # type: ignore
except Exception:  # pragma: no cover - fallback if dependency is missing on Windows
    markdown = None

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
ENV_PATH = BASE_DIR / "env" / ".env"

# Create env/.env automatically so Windows/Linux startup does not fail if the file is missing.
ENV_PATH.parent.mkdir(parents=True, exist_ok=True)
ENV_PATH.touch(exist_ok=True)
load_dotenv(ENV_PATH)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("authority")

SERVICE_PORT = int(os.getenv("SERVICE_PORT", "8000"))
DATABASE_SERVICE_URL = os.getenv("DATABASE_SERVICE_URL", "http://127.0.0.1:8001").rstrip("/")
INTERNAL_API_TOKEN = os.getenv("INTERNAL_API_TOKEN", "")
SESSION_HOST = os.getenv("SESSION_HOST", "http://127.0.0.1").rstrip("/")
SESSION_BINARY_PATH = os.getenv("SESSION_BINARY_PATH", "").strip()
SESSION_TTL_SECONDS = int(os.getenv("SESSION_TTL_SECONDS", "3600"))
REQUIRE_EXTERNAL_API_TOKEN = os.getenv("REQUIRE_EXTERNAL_API_TOKEN", "false").lower() in {"1", "true", "yes"}
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "")
VERIFICATION_CODE_TTL_SECONDS = int(os.getenv("VERIFICATION_CODE_TTL_SECONDS", "300"))  # 5 min
RESEND_COOLDOWN_SECONDS = int(os.getenv("RESEND_COOLDOWN_SECONDS", "60"))  # 1 min cooldown

# in-memory store: username -> {code, expires_at, last_sent}
_verification_store: dict[str, dict] = {}

app = FastAPI(title="Multiplayer Photoshop Authority", version="0.2")

# Static files are allowed to be absent during backend-only development.
# This fixes startup on Windows/Linux before the frontend has been built.
static_dist_dir = BASE_DIR / "static" / "dist"
static_root_dir = BASE_DIR / "static"
static_dir = static_dist_dir if static_dist_dir.exists() else static_root_dir
app.mount("/static", StaticFiles(directory=str(static_dir), check_dir=False), name="static")
app.mount("/assets", StaticFiles(directory=str(static_dir / "assets"), check_dir=False), name="assets")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Access(str, Enum):
    """Player access level. str-Enum -> serialises as plain string; backward-compatible with DB/frontend."""
    GUEST = "guest"
    PLAYER = "player"
    MODERATOR = "moderator"


class ThemeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    pack: str | None = Field(default=None, max_length=120)


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    display_name: str = Field(min_length=1, max_length=80)


class PlayerCreate(BaseModel):
    user_id: int | None = None
    guest_name: str | None = Field(default=None, min_length=1, max_length=80)
    display_name: str | None = Field(default=None, min_length=1, max_length=80)
    access: Access = Access.PLAYER


class PlayerUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=80)
    role: str | None = Field(default=None, max_length=30)


class CurrentImageUpdate(BaseModel):
    image_id: int | None = None


class LiveSessionUpdate(BaseModel):
    host: str | None = Field(default=None, min_length=1, max_length=120)
    port: int | None = Field(default=None, ge=1, le=65535)
    status: str | None = Field(default=None, max_length=30)
    expires_at: dt.datetime | None = None


class GameSessionPlayerCreate(BaseModel):
    user_id: int | None = None
    guest_name: str | None = Field(default=None, min_length=1, max_length=80)
    display_name: str = Field(min_length=1, max_length=80)
    access: Access | None = None


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

class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    display_name: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=1)
    email: str = Field(min_length=5, max_length=120)


class VerifyEmailRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    code: str = Field(min_length=6, max_length=6)


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=1)

class WinsRequest(BaseModel):
    username: str

@app.exception_handler(404)
def not_found(request, exc):
    return JSONResponse(status_code=404, content={"error": "Route not found"})


def authenticate_external(token: str | None) -> None:
    """Optional public API token check.

    Frontend currently calls Authority without a token, so this is disabled by default.
    If REQUIRE_EXTERNAL_API_TOKEN=true is set, public write endpoints also require X-API-Token.
    """
    if not REQUIRE_EXTERNAL_API_TOKEN:
        return
    if not token:
        raise HTTPException(status_code=401, detail="Missing API token")
    if token != INTERNAL_API_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid API token")


def _internal_headers() -> dict[str, str]:
    headers: dict[str, str] = {}
    if INTERNAL_API_TOKEN:
        headers["X-API-Token"] = INTERNAL_API_TOKEN
    return headers


def _db_url(path: str) -> str:
    if not path.startswith("/"):
        path = "/" + path
    return f"{DATABASE_SERVICE_URL}{path}"


def _db_request(
    method: str,
    path: str,
    *,
    json_payload: Any | None = None,
    files: Any | None = None,
    timeout: float = 8.0,
    stream: bool = False,
) -> requests.Response:
    """Call Back_end_database through its internal API."""
    try:
        response = requests.request(
            method=method,
            url=_db_url(path),
            headers=_internal_headers(),
            json=json_payload,
            files=files,
            timeout=timeout,
            stream=stream,
        )
    except requests.exceptions.RequestException as exc:
        logger.exception("Database service is unreachable")
        raise HTTPException(
            status_code=503,
            detail={
                "error": "Database service unreachable",
                "database_url": DATABASE_SERVICE_URL,
                "message": str(exc),
            },
        ) from exc

    if response.status_code >= 400:
        try:
            detail = response.json()
        except ValueError:
            detail = response.text
        raise HTTPException(status_code=response.status_code, detail=detail)

    return response


def _db_json(method: str, path: str, *, json_payload: Any | None = None, timeout: float = 8.0) -> Any:
    response = _db_request(method, path, json_payload=json_payload, timeout=timeout)
    if not response.content:
        return None
    return response.json()


def _parse_datetime(value: Any) -> dt.datetime | None:
    if value is None:
        return None
    if isinstance(value, dt.datetime):
        return value
    if isinstance(value, (int, float)):
        return dt.datetime.fromtimestamp(float(value), tz=dt.timezone.utc)
    if isinstance(value, str):
        normalized = value.replace("Z", "+00:00")
        parsed = dt.datetime.fromisoformat(normalized)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=dt.timezone.utc)
        return parsed
    return None


def _to_epoch_seconds(value: Any) -> int | None:
    parsed = _parse_datetime(value)
    if parsed is None:
        return None
    return int(parsed.timestamp())


def _is_expired(session: dict[str, Any]) -> bool:
    expires = _parse_datetime(session.get("expires_at"))
    if expires is None:
        return False
    now = dt.datetime.now(dt.timezone.utc)
    return now > expires.astimezone(dt.timezone.utc)


def _normalize_session_for_frontend(session: dict[str, Any]) -> dict[str, Any]:
    """Keep old frontend compatibility: expires_at is returned as epoch seconds."""
    result = dict(session)
    expires_at = session.get("expires_at")
    epoch = _to_epoch_seconds(expires_at)
    result["expires_at_iso"] = expires_at
    result["expires_at"] = epoch
    result["server_url"] = _session_server_url(session)
    return result


def _session_server_url(session: dict[str, Any]) -> str:
    host = str(session["host"]).rstrip("/")
    return f"{host}:{session['port']}"


def _get_live_session(session_id: str) -> dict[str, Any]:
    session = _db_json("GET", f"/internal/live-sessions/{session_id}")
    if _is_expired(session):
        raise HTTPException(status_code=401, detail="Session is expired")
    return session


def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("", 0))
        return int(s.getsockname()[1])


def _candidate_session_binaries() -> list[Path]:
    if SESSION_BINARY_PATH:
        return [Path(SESSION_BINARY_PATH)]

    exe_name = "Back_end_session.exe" if sys.platform.startswith("win") else "Back_end_session"
    other_name = "Back_end_session" if exe_name.endswith(".exe") else "Back_end_session.exe"
    release_dir = PROJECT_ROOT / "Back_end_session" / "target" / "release"
    debug_dir = PROJECT_ROOT / "Back_end_session" / "target" / "debug"

    return [
        release_dir / exe_name,
        release_dir / other_name,
        debug_dir / exe_name,
        debug_dir / other_name,
    ]


def _find_session_binary() -> Path:
    for candidate in _candidate_session_binaries():
        expanded = candidate.expanduser().resolve()
        if expanded.exists() and expanded.is_file():
            return expanded

    tried = [str(p) for p in _candidate_session_binaries()]
    raise HTTPException(
        status_code=500,
        detail={
            "error": "Session server executable not found",
            "tried": tried,
            "fix": "Build Back_end_session with `cargo build --release` or set SESSION_BINARY_PATH in Back_end_authority/env/.env",
        },
    )


def start_rust_session(port: int, session_id: str) -> subprocess.Popen[Any]:
    binary = _find_session_binary()
    logger.info("Starting session server %s on port %s for %s", binary, port, session_id)

    try:
        return subprocess.Popen(
            [str(binary), "--port", str(port)],
            cwd=str(binary.parent),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except Exception as exc:
        logger.exception("Failed to start Rust session server")
        raise HTTPException(status_code=500, detail=f"Failed to start session server: {exc}") from exc


def _check_session_server(url: str, timeout: float = 2.0) -> tuple[bool, str]:
    try:
        response = requests.get(f"{url}/status", timeout=timeout)
        if response.status_code == 200:
            return True, "ok"
        return False, f"host returned {response.status_code}"
    except requests.exceptions.RequestException:
        return False, "host not reachable"


def _frontend_file(filename: str) -> FileResponse | JSONResponse:
    candidates = [
        BASE_DIR / "static" / "dist" / filename,
        BASE_DIR / "static" / filename,
    ]
    for path in candidates:
        if path.exists():
            return FileResponse(path)
    return JSONResponse(
        status_code=404,
        content={
            "error": f"{filename} not found",
            "fix": "Build frontend and copy frontpage.html/game.html into Back_end_authority/static or static/dist.",
        },
    )


@app.get("/")
def read_frontpage():
    return _frontend_file("frontpage.html")


@app.get("/game")
def read_game():
    return _frontend_file("game.html")


@app.get("/status")
def show_server_status():
    services: dict[str, Any] = {
        "api": "ok",
        "database": "unknown",
        "database_url": DATABASE_SERVICE_URL,
        "sessions": [],
    }

    try:
        db_health = requests.get(_db_url("/health"), timeout=3)
        services["database"] = "ok" if db_health.status_code == 200 else f"http {db_health.status_code}"
    except requests.exceptions.RequestException:
        services["database"] = "down"

    if services["database"] == "ok":
        try:
            sessions = _db_json("GET", "/internal/live-sessions")
            now_sessions = []
            for session in sessions:
                session_url = _session_server_url(session)
                reachable, reason = _check_session_server(session_url)
                now_sessions.append(
                    {
                        "session_id": session.get("session_id"),
                        "host": session.get("host"),
                        "port": session.get("port"),
                        "status": session.get("status"),
                        "valid": not _is_expired(session),
                        "host_reachable": reachable,
                        "reason": reason,
                    }
                )
            services["sessions"] = now_sessions
        except HTTPException:
            services["sessions"] = "unavailable"

    overall = "ok"
    if services["database"] == "down":
        overall = "down"
    elif services["database"] != "ok":
        overall = "degraded"

    return {
        "status": overall,
        "services": services,
        "timestamp": dt.datetime.now(dt.timezone.utc).isoformat(),
    }


@app.get("/join/{session_id}")
def get_ip_from_id(session_id: str, x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    session = _get_live_session(session_id)
    server_url = _session_server_url(session)
    reachable, reason = _check_session_server(server_url)

    if not reachable:
        raise HTTPException(
            status_code=503,
            detail={
                "Server ip": "None",
                "Session ID": session_id,
                "Error": reason,
            },
        )

    return {"Server ip": server_url, "Session ID": session_id}


_ph = PasswordHasher()

# verifikacija userio per gmaila
def _send_verification_email(to_email: str, username: str, code: str) -> None:
    message = Mail(
        from_email=SENDGRID_FROM_EMAIL,
        to_emails=to_email,
        subject="Multiplayer Photoshop — verify your email",
        plain_text_content=f"Hi {username},\n\nYour verification code is: {code}\n\nExpires in {VERIFICATION_CODE_TTL_SECONDS // 60} minutes.",
    )
    SendGridAPIClient(SENDGRID_API_KEY).send(message)

# sukuria coda ir storina ji in memory
def _generate_and_store_code(username: str) -> str:
    code = f"{random.randint(0, 999999):06d}"
    _verification_store[username] = {
        "code": code,
        "expires_at": dt.datetime.now(dt.timezone.utc) + dt.timedelta(seconds=VERIFICATION_CODE_TTL_SECONDS),
        "last_sent": dt.datetime.now(dt.timezone.utc),
    }
    return code


def require_moderator(session_access: str | Access) -> None:
    if Access(session_access) != Access.MODERATOR:
        raise HTTPException(status_code=403, detail="Moderator login required")


# useriu registracija
# useris turi verifikuotis jeigu nori prisijugti
@app.post("/auth/register")
def register_user(user: RegisterRequest):
    _db_json("POST", "/internal/users", json_payload={
        "username": user.username,
        "display_name": user.display_name,
        "password_hash": _ph.hash(user.password),
        "email": user.email,
    })
    code = _generate_and_store_code(user.username)
    _send_verification_email(user.email, user.username, code)
    return {"detail": "Registration successful. Check your email for a verification code."}


# šiam endpointui payload yra 
# {
# "username": "žmogaus vardas", 
# "code": "verifikacijos kodas (6 skaičiai)"
# }
@app.post("/auth/verify-email")
def verify_email(payload: VerifyEmailRequest):
    entry = _verification_store.get(payload.username)

    if not entry:
        raise HTTPException(status_code=404, detail="No pending verification for this user")

    if dt.datetime.now(dt.timezone.utc) > entry["expires_at"]:
        _verification_store.pop(payload.username, None)
        raise HTTPException(status_code=400, detail="Verification code expired")

    if payload.code != entry["code"]:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    _verification_store.pop(payload.username, None)
    _db_json("PATCH", f"/internal/users/{payload.username}", json_payload={"email_verified": True})
    return {"detail": "Email verified. You can now log in."}


@app.post("/auth/resend-verification")
def resend_verification(username: str):
    db_user = _db_json("GET", f"/internal/users/{username}")

    if db_user.get("email_verified"):
        raise HTTPException(status_code=400, detail="Email already verified")

    entry = _verification_store.get(username)
    if entry:
        elapsed = (dt.datetime.now(dt.timezone.utc) - entry["last_sent"]).total_seconds()
        if elapsed < RESEND_COOLDOWN_SECONDS:
            wait = int(RESEND_COOLDOWN_SECONDS - elapsed)
            raise HTTPException(status_code=429, detail=f"Wait {wait}s before requesting a new code")

    code = _generate_and_store_code(username)
    _send_verification_email(db_user["email"], username, code)
    return {"detail": "Verification code resent."}

#useriu login
#jeigu useris turi moderator access jis prisijungs kaip moderator
@app.post("/auth/login")
def login_user(user: LoginRequest):
    db_user = _db_json("GET", f"/internal/users/{user.username}")
    if not _ph.verify(db_user["password_hash"], user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not db_user.get("email_verified", False):
        raise HTTPException(status_code=403, detail="Email not verified. Check your inbox.")

    access = Access(db_user.get("access", Access.PLAYER))

    if access == Access.MODERATOR:
        return {
            "id": db_user["id"],
            "username": db_user["username"],
            "display_name": db_user["display_name"],
            "wins": db_user["wins"],
            "created_at": db_user["created_at"],
            "access": Access.MODERATOR,
        }

    return {
        "id": db_user["id"],
        "username": db_user["username"],
        "display_name": db_user["display_name"],
        "wins": db_user["wins"],
        "created_at": db_user["created_at"],
        "access": access,
    }

# Jeigu useris nenori registerintis, gali zaist kaip guest, bet netures skinu ir winu counterio
# taip pat neture db iraso
@app.post("/auth/guest")
def login_as_guest():
    full_id = uuid.uuid4().hex
    guest_name = f"guest_{full_id}"
    display_name = f"Guest #{full_id[:4].upper()}"
    return {
        "guest_name": guest_name,
        "display_name": display_name,
        "access": Access.GUEST,
    }


# Metodas, kuris parodo kiek wins turi useris
@app.get("/users/{username}/wins")
def get_user_wins(username: str):
    user = _db_json("GET", f"/internal/users/{username}")
    return {"username": username, "wins": user["wins"]}

# Kai žaidimas pasibaigia pažiūri ar žaidėjas laimėjo ir pakelia wins counteri DB
@app.post("/game/result")
def record_result(username: str, laimejo: bool):
    user = _db_json("GET", f"/internal/users/{username}")

    if laimejo:
        _db_json("POST", f"/internal/users/{username}/wins")

    return {"username": username, "laimejo": laimejo, "wins": user["wins"]}


@app.post("/session/create")
def create_session(x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)

    session_id = f"session-{uuid.uuid4().hex[:12]}"
    port = find_free_port()
    expires_at = dt.datetime.now(dt.timezone.utc) + dt.timedelta(seconds=SESSION_TTL_SECONDS)

    process: subprocess.Popen[Any] | None = None
    try:
        process = start_rust_session(port, session_id)
        payload = {
            "session_id": session_id,
            "host": SESSION_HOST,
            "port": port,
            "status": "waiting",
            "expires_at": expires_at.isoformat(),
        }
        session = _db_json("POST", "/internal/live-sessions", json_payload=payload)
        logger.info("Session %s created on port %s", session_id, port)
        return _normalize_session_for_frontend(session)
    except Exception:
        if process is not None and process.poll() is None:
            process.terminate()
        raise


@app.get("/session/validate/{session_id}")
def validate_session(session_id: str, x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    session = _get_live_session(session_id)
    server_url = _session_server_url(session)
    reachable, reason = _check_session_server(server_url)
    return {
        "valid": reachable and not _is_expired(session),
        "reason": reason,
        "session": _normalize_session_for_frontend(session),
    }


def _get_reachable_sessions() -> list[dict[str, Any]]:
    sessions = _db_json("GET", "/internal/live-sessions")
    active: list[dict[str, Any]] = []

    for session in sessions:
        if session.get("status") == "finished" or _is_expired(session):
            continue

        server_url = _session_server_url(session)
        reachable, _reason = _check_session_server(server_url)
        if reachable:
            active.append(_normalize_session_for_frontend(session))

    return active


@app.get("/sessions")
def get_sessions():
    return _get_reachable_sessions()


@app.get("/getallactive")
def get_all_active_server():
    return len(_get_reachable_sessions())


# ---- DB data through Authority only ----
@app.post("/users")
def create_user(payload: UserCreate, x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    return _db_json("POST", "/internal/users", json_payload=payload.model_dump())


@app.get("/users")
def list_users(x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    return _db_json("GET", "/internal/users")


@app.post("/themes")
def create_theme(payload: ThemeCreate, x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    return _db_json("POST", "/internal/themes", json_payload=payload.model_dump())


@app.get("/themes")
def list_themes(x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    return _db_json("GET", "/internal/themes")


@app.post("/images")
async def upload_image(file: UploadFile = File(...), x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    content = await file.read()
    files = {"file": (file.filename or "image.png", content, file.content_type or "application/octet-stream")}
    return _db_request("POST", "/internal/images", files=files).json()


@app.get("/images/{image_id}")
def get_image(image_id: int, x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    db_response = _db_request("GET", f"/internal/images/{image_id}", stream=True)
    return Response(
        content=db_response.content,
        media_type=db_response.headers.get("content-type", "application/octet-stream"),
        headers={"Cache-Control": "public, max-age=3600"},
    )


@app.get("/session/{session_id}")
def get_live_session(session_id: str, x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    return _normalize_session_for_frontend(_get_live_session(session_id))


@app.patch("/session/{session_id}")
def update_live_session(session_id: str, payload: LiveSessionUpdate, x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    data = payload.model_dump(exclude_unset=True)
    if isinstance(data.get("expires_at"), dt.datetime):
        data["expires_at"] = data["expires_at"].isoformat()
    session = _db_json("PATCH", f"/internal/live-sessions/{session_id}", json_payload=data)
    return _normalize_session_for_frontend(session)


@app.post("/session/{session_id}/join")
def add_player_to_session(session_id: str, payload: PlayerCreate, x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    return _db_json(
        "POST",
        f"/internal/live-sessions/{session_id}/players",
        json_payload=payload.model_dump(exclude_none=True),
    )


@app.patch("/session/{session_id}/players/{player_id}")
def update_player(session_id: str, player_id: int, payload: PlayerUpdate, x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    return _db_json(
        "PATCH",
        f"/internal/live-sessions/{session_id}/players/{player_id}",
        json_payload=payload.model_dump(exclude_unset=True),
    )


@app.delete("/session/{session_id}/players/{player_id}")
def remove_player(session_id: str, player_id: int, x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    return _db_json("DELETE", f"/internal/live-sessions/{session_id}/players/{player_id}")


@app.patch("/session/{session_id}/current-image")
def set_current_game_image(session_id: str, payload: CurrentImageUpdate, x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    session = _db_json(
        "PATCH",
        f"/internal/live-sessions/{session_id}/current-image",
        json_payload=payload.model_dump(),
    )
    return _normalize_session_for_frontend(session)


@app.get("/session/{session_id}/current-image")
def get_current_game_image(session_id: str, x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    db_response = _db_request("GET", f"/internal/live-sessions/{session_id}/current-image", stream=True)
    return Response(
        content=db_response.content,
        media_type=db_response.headers.get("content-type", "application/octet-stream"),
        headers={"Cache-Control": "no-store"},
    )


@app.post("/session/{session_id}/finish")
def finish_session(session_id: str, payload: GameSessionCreate, x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    data = payload.model_dump()
    data["session_id"] = session_id
    return _db_json("POST", "/internal/game-sessions", json_payload=data)


@app.post("/game-sessions")
def create_game_session(payload: GameSessionCreate, x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    return _db_json("POST", "/internal/game-sessions", json_payload=payload.model_dump())


@app.get("/game-sessions")
def list_game_sessions(x_api_token: str | None = Header(None)):
    authenticate_external(x_api_token)
    return _db_json("GET", "/internal/game-sessions")


@app.get("/info", response_class=HTMLResponse)
def read_info():
    info_path = BASE_DIR / "Info.md"
    if not info_path.exists():
        raise HTTPException(status_code=404, detail="Info.md not found")

    message = info_path.read_text(encoding="utf-8")
    if markdown is not None:
        html_content = markdown.markdown(message)
    else:
        html_content = f"<pre>{message}</pre>"
    return f"<html><body>{html_content}</body></html>"
