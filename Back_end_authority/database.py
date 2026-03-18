import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from dotenv import load_dotenv
load_dotenv("env/.env")

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_database():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logging.error(f"Database error: {e}")
        raise
    finally:
        db.close()