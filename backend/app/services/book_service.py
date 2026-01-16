from app.crud.books_crud import create, get_books, get_by_id, get_by_isbn, update
from app.schemas.books import BookCreateRequest, BookUpdateRequest
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from loguru import logger
from app.core.constants import MSG_BOOK_NOT_FOUND, MSG_BOOK_ISBN_EXISTS, MSG_BOOK_BORROWED


async def create_book(db: AsyncSession, book: BookCreateRequest):
    logger.debug(f"Creating book: {book.title}")
    return await create(db, book=book)


async def get_all_books(db: AsyncSession, skip: int = 0, limit: int = 10, q: str | None = None):
    logger.debug(f"Fetching books (skip={skip}, limit={limit}, query={q})")
    return await get_books(db, skip=skip, limit=limit, q=q)


async def update_book(db: AsyncSession, book_id: int, book_update: BookUpdateRequest):
    logger.debug(f"Updating book with ID: {book_id}")
    # fetch existing
    existing = await get_by_id(db, book_id)
    if not existing:
        raise HTTPException(status_code=404, detail=MSG_BOOK_NOT_FOUND.format(id=book_id))

    # check ISBN uniqueness if updating isbn
    data = book_update.model_dump(exclude_none=True)
    new_isbn = data.get("isbn")
    if new_isbn:
        other = await get_by_isbn(db, new_isbn)
        if other and other.id != book_id:
            raise HTTPException(status_code=409, detail=MSG_BOOK_ISBN_EXISTS.format(isbn=new_isbn))

    # apply updates
    for key, value in data.items():
        setattr(existing, key, value)

    return await update(db, existing)


async def delete_book(db: AsyncSession, book_id: int):
    from app.crud.books_crud import delete_by_id
    from app.crud.borrow_crud import get_borrows_by_book
    from app.schemas.members import Status
    from fastapi import HTTPException

    # Check if book has active borrows
    _, total_active = await get_borrows_by_book(db, book_id, Status.borrowed, limit=1)
    if total_active > 0:
        raise HTTPException(
            status_code=400,
            detail=MSG_BOOK_BORROWED
        )

    deleted = await delete_by_id(db, book_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=MSG_BOOK_NOT_FOUND.format(id=book_id))
    return None