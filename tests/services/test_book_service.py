
import pytest
from app.services import book_service
from app.schemas.books import BookCreateRequest, BookUpdateRequest
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_book_service_full(async_session):
    # Create
    b = await book_service.create_book(async_session, BookCreateRequest(title="Srv Book", author="A", isbn="S1", total_copies=1))
    assert b.id is not None
    
    # Get
    items, total = await book_service.get_all_books(async_session)
    assert total >= 1
    
    # Update Happy
    u = await book_service.update_book(async_session, b.id, BookUpdateRequest(title="Srv Book Upd"))
    assert u.title == "Srv Book Upd"
    
    # Update Not Found
    with pytest.raises(HTTPException) as exc:
        await book_service.update_book(async_session, 999, BookUpdateRequest(title="X"))
    assert exc.value.status_code == 404
    
    # Update ISBN Conflict
    b2 = await book_service.create_book(async_session, BookCreateRequest(title="Srv Book 2", author="A", isbn="S2", total_copies=1))
    with pytest.raises(HTTPException) as exc:
        await book_service.update_book(async_session, b.id, BookUpdateRequest(isbn="S2"))
    assert exc.value.status_code == 409
    
    # Delete Happy
    await book_service.delete_book(async_session, b.id)
    with pytest.raises(HTTPException) as exc:
        await book_service.update_book(async_session, b.id, BookUpdateRequest(title="X"))
    assert exc.value.status_code == 404
    
    # Delete Not Found
    with pytest.raises(HTTPException) as exc:
        await book_service.delete_book(async_session, 999)
    assert exc.value.status_code == 404
