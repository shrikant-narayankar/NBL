
import pytest
from datetime import date, timedelta
from app.crud import books_crud, members_crud, borrow_crud
from app.models.borrow import BorrowTransaction
from app.schemas.books import BookCreateRequest
from app.schemas.members import MemberCreate, Status

@pytest.mark.asyncio
async def test_borrow_crud_complex_queries(async_session):
    # Setup
    b1 = await books_crud.create(async_session, BookCreateRequest(title="Alfa", author="A", isbn="A1", total_copies=5))
    b2 = await books_crud.create(async_session, BookCreateRequest(title="Beta", author="B", isbn="B1", total_copies=5))
    
    m1 = await members_crud.create(async_session, MemberCreate(name="Alice", email="a@t.com"))
    m2 = await members_crud.create(async_session, MemberCreate(name="Bob", email="b@t.com"))
    
    # Create Borrows directly
    # Alice brows Alfa (Active)
    br1 = BorrowTransaction(member_id=m1.id, book_id=b1.id, borrowed_date=date.today(), due_date=date.today())
    await borrow_crud.create(async_session, br1)
    
    # Bob borrows Beta (Active)
    br2 = BorrowTransaction(member_id=m2.id, book_id=b2.id, borrowed_date=date.today(), due_date=date.today())
    await borrow_crud.create(async_session, br2)
    
    # Alice borrows Beta (Returned)
    br3 = BorrowTransaction(member_id=m1.id, book_id=b2.id, borrowed_date=date.today() - timedelta(days=10), due_date=date.today() - timedelta(days=5))
    br3.returned_date = date.today()
    await borrow_crud.create(async_session, br3)
    
    # Test get_active_borrow
    active = await borrow_crud.get_active_borrow(async_session, m1.id, b1.id)
    assert active is not None
    assert active.id == br1.id
    
    # Test get_borrows_by_member (Borrowed)
    items, total = await borrow_crud.get_borrows_by_member(async_session, m1.id, Status.borrowed)
    assert total == 1
    assert items[0].id == br1.id
    
    # Test get_borrows_by_member (Returned)
    items, total = await borrow_crud.get_borrows_by_member(async_session, m1.id, Status.returned)
    assert total == 1
    assert items[0].id == br3.id
    
    # Test get_borrows_by_book (Borrowed)
    items, total = await borrow_crud.get_borrows_by_book(async_session, b1.id, Status.borrowed)
    assert total == 1
    
    # Test get_borrows_by_book (Returned)
    items, total = await borrow_crud.get_borrows_by_book(async_session, b2.id, Status.returned)
    assert total == 1
    assert items[0].id == br3.id
    
    # Test get_all_borrows Sorting & Including
    
    # Sort by Book Title Asc (Alfa, Beta, Beta)
    # The order of Beta active vs Beta returned depends on secondary sort or ID. 
    items, _ = await borrow_crud.get_all_borrows(async_session, status=Status.all, sort_by="book", order="asc", include="book")
    assert items[0].book.title == "Alfa"
    assert items[1].book.title == "Beta"
    
    # Sort by Member Name Desc (Bob, Alice, Alice)
    items, _ = await borrow_crud.get_all_borrows(async_session, status=Status.all, sort_by="member", order="desc", include="member")
    assert items[0].member.name == "Bob"
    assert items[1].member.name == "Alice"
    
    # Sort by Due Date
    items, _ = await borrow_crud.get_all_borrows(async_session, status=Status.all, sort_by="due_date", order="desc")
    # br1=today, br2=today, br3=old
    assert items[-1].id == br3.id # Oldest due date should be last in desc? No, oldest date is smallest. Desc means largest (future) first.
    # br3 due date is (today-5). br1/br2 is today. Today > Old. So br1/br2 first, br3 last. Correct.
    
    # Sort by Borrowed Date
    items, _ = await borrow_crud.get_all_borrows(async_session, status=Status.all, sort_by="borrowed_date", order="asc")
    assert items[0].id == br3.id # Oldest borrowed date first.
    
    # Test delete
    deleted = await borrow_crud.delete_by_id(async_session, br1.id)
    assert deleted.id == br1.id
    assert await borrow_crud.get_by_id(async_session, br1.id) is None
    
    assert await borrow_crud.delete_by_id(async_session, 999) is None
