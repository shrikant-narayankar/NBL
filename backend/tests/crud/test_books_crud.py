
import pytest
from app.crud import books_crud
from app.schemas.books import BookCreateRequest

@pytest.mark.asyncio
async def test_books_crud_pagination(async_session):
    # Create 3 books
    for i in range(3):
        await books_crud.create(async_session, BookCreateRequest(title=f"B{i}", author="A", isbn=f"ISBN{i}", total_copies=1))
    
    # Test Pagination
    items, total = await books_crud.get_books(async_session, skip=0, limit=2)
    assert len(items) == 2
    assert total == 3
    
    items, total = await books_crud.get_books(async_session, skip=2, limit=2)
    assert len(items) == 1

@pytest.mark.asyncio
async def test_books_crud_search(async_session):
    await books_crud.create(async_session, BookCreateRequest(title="Python Info", author="A", isbn="P1", total_copies=1))
    await books_crud.create(async_session, BookCreateRequest(title="Java Info", author="A", isbn="J1", total_copies=1))
    
    items, total = await books_crud.get_books(async_session, q="Python")
    assert len(items) == 1
    assert items[0].title == "Python Info"
