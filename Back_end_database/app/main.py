from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.db import engine
from app.models import Base
from app.api.routes import router

def create_app() -> FastAPI:
    app = FastAPI(title="Multiplayer Photoshop DB", version="0.1")

    # Kad front-end (Vite) galėtų kviesti API iš kito porto.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(router)

    @app.on_event("startup")
    def _startup():
        # For learning/dev; later replace with Alembic migrations
        Base.metadata.create_all(bind=engine)

    return app

app = create_app()
