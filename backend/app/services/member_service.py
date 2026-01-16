from app.schemas.members import MemberCreate, MemberUpdate
from app.crud.members_crud import create, get_by_id, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from loguru import logger
from app.core.constants import MSG_MEMBER_NOT_FOUND, MSG_MEMBER_ACTIVE_BORROWS

async def create_member(db: AsyncSession, member: MemberCreate):
    logger.debug(f"Registering member: {member.name}")
    return await create(db, member=member)

async def get_member_borrows(db: AsyncSession, member_id: int, status, skip: int = 0, limit: int = 10):
    logger.debug(f"Fetching borrows for member ID: {member_id}")
    from app.crud.borrow_crud import get_borrows_by_member
    return await get_borrows_by_member(db, member_id, status, skip=skip, limit=limit)

async def get_members(db: AsyncSession, skip: int = 0, limit: int = 10):
    logger.debug(f"Fetching members (skip={skip}, limit={limit})")
    from app.crud.members_crud import get_all_members
    return await get_all_members(db, skip=skip, limit=limit)


async def update_member(db: AsyncSession, member_id: int, member_update: MemberUpdate):
    # fetch existing
    existing = await get_by_id(db, member_id)
    if not existing:
        raise HTTPException(status_code=404, detail=MSG_MEMBER_NOT_FOUND.format(id=member_id))

    # apply updates
    data = member_update.model_dump(exclude_none=True)
    for key, value in data.items():
        setattr(existing, key, value)

    return await update(db, existing)


async def delete_member(db: AsyncSession, member_id: int):
    from app.crud.members_crud import delete_by_id
    from app.crud.borrow_crud import get_borrows_by_member
    from app.schemas.members import Status
    from fastapi import HTTPException

    # Check if member has active borrows
    _, total_active = await get_borrows_by_member(db, member_id, Status.borrowed, limit=1)
    if total_active > 0:
        raise HTTPException(
            status_code=400,
            detail=MSG_MEMBER_ACTIVE_BORROWS
        )

    deleted = await delete_by_id(db, member_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=MSG_MEMBER_NOT_FOUND.format(id=member_id))
    return None

