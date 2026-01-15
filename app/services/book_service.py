from app.crud.books_crud import create, get_books, get_by_id, get_by_isbn, update
from app.schemas.books import BookCreateRequest, BookUpdateRequest
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException


async def create_book(db: AsyncSession, book: BookCreateRequest):
    return await create(db, book=book)


async def get_all_books(db: AsyncSession):
    return await get_books(db)


async def update_book(db: AsyncSession, book_id: int, book_update: BookUpdateRequest):
    # fetch existing
    existing = await get_by_id(db, book_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Book with id {book_id} not found")

    # check ISBN uniqueness if updating isbn
    data = book_update.model_dump(exclude_none=True)
    new_isbn = data.get("isbn")
    if new_isbn:
        other = await get_by_isbn(db, new_isbn)
        if other and other.id != book_id:
            raise HTTPException(status_code=409, detail=f"Book with ISBN {new_isbn!r} already exists")

    # apply updates
    for key, value in data.items():
        setattr(existing, key, value)

    return await update(db, existing)


async def delete_book(db: AsyncSession, book_id: int):
    from app.crud.books_crud import delete_by_id
    from fastapi import HTTPException

    deleted = await delete_by_id(db, book_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Book with id {book_id} not found")
    return None