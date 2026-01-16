from fastapi import APIRouter, Depends
from app.schemas.books import BookCreateRequest, BookUpdateRequest, BookResponse
from app.db.session import get_db
from fastapi import status
from app.services import book_service
from fastapi import Response
from loguru import logger
router = APIRouter()



@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_book(book: BookCreateRequest, db_session=Depends(get_db)):
    logger.info(f"Creating book with title: {book.title}")
    return await book_service.create_book(db_session, book)

from app.schemas.common import PaginatedResponse
from fastapi import Query
import math

@router.get("/", status_code=status.HTTP_200_OK, response_model=PaginatedResponse[BookResponse])
async def get_books(
    db_session=Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    q: str | None = Query(None, description="Search query for title or author")
):
    skip = (page - 1) * size
    items, total = await book_service.get_all_books(db_session, skip=skip, limit=size, q=q)
    pages = math.ceil(total / size) if total > 0 else 0
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages
    )

@router.patch("/{book_id}", status_code=status.HTTP_200_OK, response_model=BookResponse)
async def update_book(book_id: int, book: BookUpdateRequest, db_session=Depends(get_db)):
    return await book_service.update_book(db_session, book_id, book)


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(book_id: int, db_session=Depends(get_db)):
    logger.info(f"Deleting book with id: {book_id}")
    await book_service.delete_book(db_session, book_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

