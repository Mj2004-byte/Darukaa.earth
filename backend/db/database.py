import os
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

_db_initialized = False

def init_db_on_demand():
    global _db_initialized
    if not _db_initialized:
        try:
            from backend.db.models import User
            inspector = inspect(engine)
            if not inspector.has_table("users"):
                print("Creating database tables on demand...")
                Base.metadata.create_all(bind=engine)
                from backend.db.seed_data import seed_database
                seed_database()
            _db_initialized = True
        except Exception as e:
            print(f"On-demand DB init warning: {e}")

def get_db():
    init_db_on_demand()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
