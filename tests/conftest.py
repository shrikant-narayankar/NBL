
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.main import app
from app.db.base import Base
from app.db.session import get_db

# Import models to ensure they are registered with Base.metadata
from app.models.book import Book
from app.models.member import Member
from app.models.borrow import BorrowTransaction

# Use in-memory SQLite for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture(scope="function")
async def engine():
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False,
    )
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    yield engine
    
    await engine.dispose()

@pytest_asyncio.fixture(scope="function")
async def async_session(engine):
    TestingSessionLocal = async_sessionmaker(
        engine, expire_on_commit=False, class_=AsyncSession
    )

    async with TestingSessionLocal() as session:
        yield session

@pytest_asyncio.fixture(scope="function")
async def client(async_session: AsyncSession):
    async def override_get_db():
        yield async_session

    app.dependency_overrides[get_db] = override_get_db
    
    # Use TestClient (synchronous)
    with TestClient(app) as c:
        yield c
    
    app.dependency_overrides.clear()
