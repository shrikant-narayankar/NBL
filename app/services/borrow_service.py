from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
from loguru import logger
from app.models.borrow import BorrowTransaction
from app.schemas.borrow import ReturnRequest
from app.models.book import Book
from app.crud.books_crud import get_by_id, update
from app.crud import members_crud
from app.schemas.members import Status

from app.crud import borrow_crud

class BookNotAvailable(Exception):
    pass

class MemberNotFound(Exception):
    pass
async def borrow_book(
    db: AsyncSession,
    member_id: int,
    book_id: int,
    borrowed_date: date,
    due_date: date
):
    logger.debug(f"Process borrow request: member={member_id}, book={book_id}")
    book = await get_by_id(db, book_id)
    member = await members_crud.get_by_id(db, member_id)
    if not member:
        raise MemberNotFound("Member does not exist")
    if not book:
        raise BookNotAvailable("Book does not exist")

    if book.available_copies <= 0:
        raise BookNotAvailable("No copies available")

    # Business rule
    book.available_copies -= 1

    borrow = BorrowTransaction(
        member_id=member_id,
        book_id=book_id,
        borrowed_date=borrowed_date,
        due_date=due_date
    )

    await borrow_crud.create(db, borrow)
    await update(db, book)

    return borrow

async def return_book(db: AsyncSession, return_request: ReturnRequest):
    logger.debug(f"Process return request: member={return_request.member_id}, book={return_request.book_id}")
    book = await get_by_id(db, return_request.book_id)
    if not book:
        raise BookNotAvailable("Book does not exist")

    # find the active borrow (not yet returned)
    active = await borrow_crud.get_active_borrow(db, return_request.member_id, return_request.book_id)
    if not active:
        raise ValueError("No active borrow record found for this member and book")

    if active.returned_date is not None:
        # already returned
        return active

    active.returned_date = return_request.returned_date or date.today()

    # update book counts and persist
    book.available_copies += 1
    await update(db, book)
    updated = await borrow_crud.update(db, active)

    return updated


async def list_active_borrows(db: AsyncSession, include: str = "all", skip: int = 0, limit: int = 10, sort_by: str = "borrowed_date", order: str = "desc"):
    """Return all active (not returned) borrow transactions.

    include: 'book' | 'member' | 'all' to control which relationships are loaded.
    """
    return await borrow_crud.get_active_borrows(db, include=include, skip=skip, limit=limit, sort_by=sort_by, order=order)


async def list_borrows(db: AsyncSession, status: Status, include: str = "all", skip: int = 0, limit: int = 10, sort_by: str = "borrowed_date", order: str = "desc"):
    """Generic list for borrows."""
    return await borrow_crud.get_all_borrows(db, status=status, include=include, skip=skip, limit=limit, sort_by=sort_by, order=order)


async def delete_borrow(db: AsyncSession, borrow_id: int):
    deleted = await borrow_crud.delete_by_id(db, borrow_id)
    from fastapi import HTTPException
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Borrow transaction with id {borrow_id} not found")
    return None