
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

from .config import settings

# Database Setup
engine = create_async_engine(
    settings.database_url,
    echo=False,
    future=True
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
