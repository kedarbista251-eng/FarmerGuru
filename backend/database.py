import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

# Use SQLite locally by default; DATABASE_URL in .env can override for production
DEFAULT_SQLITE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "farmguru.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH.replace(os.sep, '/')}")

# Normalise postgres:// -> postgresql:// (Heroku / Render quirk)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite needs check_same_thread=False; PostgreSQL doesn't need it
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def ensure_schema():
    """Apply the small compatibility migration needed by existing databases."""
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return
    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "phone" not in user_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR"))
            connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_phone ON users (phone)"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
