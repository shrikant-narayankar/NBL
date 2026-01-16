from fastapi import APIRouter, Depends
from app.schemas.members import MemberCreate, MemberUpdate, MemberResponse, Status
from app.schemas.borrow import BorrowMemberResponse
from app.db.session import get_db

from fastapi import status
from app.services import member_service
from loguru import logger
router = APIRouter()



@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_member(member: MemberCreate, db_session=Depends(get_db)):
    logger.info(f"Creating member with name: {member.name}")
    return await member_service.create_member(db_session, member)

from app.schemas.common import PaginatedResponse
from fastapi import Query
import math

@router.get("/{member_id}/borrows", status_code=status.HTTP_200_OK, response_model=PaginatedResponse[BorrowMemberResponse])
async def get_member_borrows(
    member_id: int, 
    status: Status = Status.all, 
    db_session=Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100)
):
    skip = (page - 1) * size
    items, total = await member_service.get_member_borrows(db_session, member_id, status, skip=skip, limit=size)
    pages = math.ceil(total / size) if total > 0 else 0
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages
    )

@router.get("/", status_code=status.HTTP_200_OK, response_model=PaginatedResponse[MemberResponse])
async def get_members(
    db_session=Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100)
):
    skip = (page - 1) * size
    items, total = await member_service.get_members(db_session, skip=skip, limit=size)
    pages = math.ceil(total / size) if total > 0 else 0
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages
    )

@router.patch("/{member_id}", status_code=status.HTTP_200_OK, response_model=MemberResponse)
async def update_member(member_id: int, member: MemberUpdate, db_session=Depends(get_db)):
    logger.info(f"Updating member with id: {member_id}")
    return await member_service.update_member(db_session, member_id, member)


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(member_id: int, db_session=Depends(get_db)):
    logger.info(f"Deleting member with id: {member_id}")
    await member_service.delete_member(db_session, member_id)
    from fastapi import Response
    return Response(status_code=status.HTTP_204_NO_CONTENT)