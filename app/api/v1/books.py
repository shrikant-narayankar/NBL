from fastapi import APIRouter, Depends
from app.schemas.books import BookCreateRequest, BookUpdateRequest, BookResponse
from app.db.session import get_db
from fastapi import status
from app.services import book_service
from fastapi import Response
router = APIRouter()



@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_book(book: BookCreateRequest, db_session=Depends(get_db)):
    return await book_service.create_book(db_session, book)

@router.get("/", status_code=status.HTTP_200_OK, response_model=list[BookResponse])
async def get_books(db_session=Depends(get_db)):
    return await book_service.get_all_books(db_session)

@router.patch("/{book_id}", status_code=status.HTTP_200_OK, response_model=BookResponse)
async def update_book(book_id: int, book: BookUpdateRequest, db_session=Depends(get_db)):
    return await book_service.update_book(db_session, book_id, book)


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(book_id: int, db_session=Depends(get_db)):
    await book_service.delete_book(db_session, book_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

