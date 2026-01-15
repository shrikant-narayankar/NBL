from aiosqlite import IntegrityError
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.book import Book
from app.schemas.books import BookCreateRequest

async def create(db: AsyncSession, book: BookCreateRequest) -> Book:
    # check existing by unique field (ISBN)
    result = await db.execute(select(Book).where(Book.isbn == book.isbn))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail=f"Book with ISBN {book.isbn!r} already exists")


    db_book = Book(**book.model_dump())
    db.add(db_book)
    try:
        await db.commit()
        await db.refresh(db_book)
    except IntegrityError:
        await db.rollback()
        # catch race-condition where another process inserted same ISBN
        raise HTTPException(status_code=409, detail=f"Book with ISBN {book.isbn!r} already exists")

    return db_book

async def get_by_id(db: AsyncSession, book_id: int) -> Book | None:
    result = await db.execute(
        select(Book).where(Book.id == book_id)
    )
    return result.scalar_one_or_none()


async def get_by_isbn(db: AsyncSession, isbn: str) -> Book | None:
    result = await db.execute(
        select(Book).where(Book.isbn == isbn)
    )
    return result.scalar_one_or_none()

async def get_books(db: AsyncSession) -> Book | None:
    result = await db.execute(
        select(Book)
    )
    return result.scalars().all()

async def update(db: AsyncSession, book: Book) -> Book:
    await db.commit()
    await db.refresh(book)
    return book
