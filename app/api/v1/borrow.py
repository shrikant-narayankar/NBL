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
from app.schemas.members import Status
from fastapi import Query
from fastapi import status
from app.services import borrow_service
from app.db.session import get_db
from fastapi import Response
from loguru import logger
router = APIRouter()



from app.schemas.common import PaginatedResponse
import math

@router.get("/", status_code=status.HTTP_200_OK, response_model=PaginatedResponse[Union[ActiveBorrowWithBook, ActiveBorrowWithMember, ActiveBorrowWithAll]])
async def get_borrows(
    db_session=Depends(get_db),
    status: Status = Query(Status.all, description="Filter by status (borrowed, returned, all)"),
    include: Include = Query(Include.all, description="Include nested related data"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("borrowed_date", description="Sort by field: book, member, borrowed_date, due_date"),
    order: str = Query("desc", description="Order: asc, desc")
):
    skip = (page - 1) * size
    items, total = await borrow_service.list_borrows(db_session, status=status, include=include.value, skip=skip, limit=size, sort_by=sort_by, order=order)
    pages = math.ceil(total / size) if total > 0 else 0
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages
    )

@router.post("/", status_code=status.HTTP_201_CREATED)
async def borrow_book(member: BorrowRequest,db_session=Depends(get_db)):
    logger.info(f"Issuing book with id: {member.book_id} to member with id: {member.member_id}")
    return await borrow_service.borrow_book(
        db_session, 
        member_id=member.member_id, 
        book_id=member.book_id,
        borrowed_date=member.borrowed_date,
        due_date=member.due_date
    )

@router.patch("/", status_code=status.HTTP_200_OK)
async def return_book(return_request: ReturnRequest, db_session=Depends(get_db)):
    logger.info(f"Returning book with id: {return_request.book_id} from member with id: {return_request.member_id}")
    return await borrow_service.return_book(db_session, return_request=return_request)


@router.get(
    "/active",
    status_code=status.HTTP_200_OK,
    response_model=PaginatedResponse[Union[ActiveBorrowWithBook, ActiveBorrowWithMember, ActiveBorrowWithAll]],
)
async def get_active_borrows(
    db_session=Depends(get_db),
    include: Include = Query(Include.all, description="Include nested related data: 'book', 'member', or 'all'"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("borrowed_date", description="Sort by field: book, member, borrowed_date, due_date"),
    order: str = Query("desc", description="Order: asc, desc")
):
    """Return all currently borrowed (not-yet-returned) books."""
    skip = (page - 1) * size
    items, total = await borrow_service.list_active_borrows(db_session, include=include.value, skip=skip, limit=size, sort_by=sort_by, order=order)
    pages = math.ceil(total / size) if total > 0 else 0
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@router.delete("/{borrow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_borrow(borrow_id: int, db_session=Depends(get_db)):
    await borrow_service.delete_borrow(db_session, borrow_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

