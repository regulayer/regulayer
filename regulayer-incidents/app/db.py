
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

from .config import settings

# Database Setup
# Handle SSL mode for asyncpg
db_url = settings.database_url
connect_args = {}
if "sslmode=require" in db_url:
    connect_args["ssl"] = "require"
    db_url = db_url.replace("?sslmode=require", "").replace("&sslmode=require", "")

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args=connect_args
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db_session() -> AsyncSession:
    """Dependency: Get a database session."""
    async with AsyncSessionLocal() as session:
        yield session
