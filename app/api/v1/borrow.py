from fastapi import APIRouter, Depends
from typing import Union
from app.schemas.borrow import (
    BorrowRequest,
    ReturnRequest,
    
    ActiveBorrowWithBook,
    ActiveBorrowWithMember,
    ActiveBorrowWithAll,
    Include,
)
from fastapi import Query
from fastapi import status
from app.services import borrow_service
from app.db.session import get_db
router = APIRouter()



@router.post("/", status_code=status.HTTP_201_CREATED)
async def borrow_book(member: BorrowRequest,db_session=Depends(get_db)):
    return await borrow_service.borrow_book(db_session, member_id=member.member_id, book_id=member.book_id)

@router.patch("/", status_code=status.HTTP_200_OK)
async def return_book(return_request: ReturnRequest, db_session=Depends(get_db)):
    return await borrow_service.return_book(db_session, return_request=return_request)


@router.get(
    "/active",
    status_code=status.HTTP_200_OK,
    response_model=list[Union[ActiveBorrowWithBook, ActiveBorrowWithMember, ActiveBorrowWithAll]],
)
async def get_active_borrows(
    db_session=Depends(get_db),
    include: Include = Query(Include.all, description="Include nested related data: 'book', 'member', or 'all'"),
):
    """Return all currently borrowed (not-yet-returned) books.

    Use the 'include' query parameter to control whether nested book/member objects are returned.
    """
    return await borrow_service.list_active_borrows(db_session, include=include.value)

