# ...existing code...
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from app.core.settings import settings
from app.db.base import Base

# use the async sqlalchemy URL (falls back to constructed URL if DATABASE_URL not set)
DATABASE_URL = settings.sqlalchemy_async_database_url

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession,
)

async def init_db():
    async with engine.begin() as conn:
        # create all tables from your declarative Base
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
# ...existing code...