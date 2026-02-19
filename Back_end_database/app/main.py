from __future__ import annotations

from fastapi import FastAPI

from app.core.db import engine
from app.models import Base
from app.api.routes import router

def create_app() -> FastAPI:
    app = FastAPI(title="Butyrka", version="0.1")
    app.include_router(router)

    @app.on_event("startup")
    def _startup():
        # For learning/dev; later replace with Alembic migrations
        Base.metadata.create_all(bind=engine)

    return app

app = create_app()
