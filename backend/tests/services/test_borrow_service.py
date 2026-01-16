
import pytest
from datetime import date
from app.services import book_service, member_service, borrow_service
from app.schemas.books import BookCreateRequest
from app.schemas.members import MemberCreate
from app.schemas.borrow import ReturnRequest
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_borrow_service_full(async_session):
    # Setup
    b = await book_service.create_book(async_session, BookCreateRequest(title="B Srv", author="A", isbn="BS1", total_copies=1))
    m = await member_service.create_member(async_session, MemberCreate(name="M Srv", email="ms@t.com"))
    
    # Borrow Happy
    br = await borrow_service.borrow_book(async_session, m.id, b.id, date.today(), date.today())
    assert br.book_id == b.id
    
    # Borrow Book Not Available
    with pytest.raises(borrow_service.BookNotAvailable):
        await borrow_service.borrow_book(async_session, m.id, b.id, date.today(), date.today())
        
    # Borrow Member Not Found
    with pytest.raises(borrow_service.MemberNotFound):
        await borrow_service.borrow_book(async_session, 999, b.id, date.today(), date.today())

    # Return Happy
    ret = await borrow_service.return_book(async_session, ReturnRequest(book_id=b.id, member_id=m.id))
    assert ret.returned_date is not None
    
    # Return Book Not Found
    with pytest.raises(borrow_service.BookNotAvailable):
         await borrow_service.return_book(async_session, ReturnRequest(book_id=999, member_id=m.id))
         
    # Return No Active Borrow
    # Try returning same book again
    with pytest.raises(ValueError, match="No active borrow"):
         await borrow_service.return_book(async_session, ReturnRequest(book_id=b.id, member_id=m.id))

    # List Active
    items, total = await borrow_service.list_active_borrows(async_session)
    # Should be 0 since we returned it
    # note: test_borrow_service_full runs in isolated session so generic list might be empty
    
    # Delete
    # Need to create one to delete
    # Reset copies or create new
    b2 = await book_service.create_book(async_session, BookCreateRequest(title="B Srv 2", author="A", isbn="BS2", total_copies=1))
    br2 = await borrow_service.borrow_book(async_session, m.id, b2.id, date.today(), date.today())
    
    await borrow_service.delete_borrow(async_session, br2.id)
    
    # Delete Not Found
    with pytest.raises(HTTPException) as exc:
        await borrow_service.delete_borrow(async_session, 999)
    assert exc.value.status_code == 404
