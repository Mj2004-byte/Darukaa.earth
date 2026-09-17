import os
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.config import settings

db_url = settings.effective_database_url

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    db_url,
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
            from backend.db.models import User, Project
            inspector = inspect(engine)
            if not inspector.has_table("projects") or not inspector.has_table("users"):
                print(f"Creating database tables on demand for {db_url}...")
                Base.metadata.create_all(bind=engine)
                from backend.db.seed_data import seed_database
                seed_database()
            else:
                # Table exists, check if data is populated
                db = SessionLocal()
                try:
                    if db.query(Project).count() == 0:
                        print("Project table is empty, seeding demonstration dataset...")
                        from backend.db.seed_data import seed_database
                        seed_database()
                finally:
                    db.close()
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
