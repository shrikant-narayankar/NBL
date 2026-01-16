from app.schemas.members import MemberCreate, MemberUpdate
from app.crud.members_crud import create, get_by_id, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

async def create_member(db: AsyncSession, member: MemberCreate):
    return await create(db, member=member)

async def get_member_borrows(db: AsyncSession, member_id: int, status, skip: int = 0, limit: int = 10):
    from app.crud.borrow_crud import get_borrows_by_member
    return await get_borrows_by_member(db, member_id, status, skip=skip, limit=limit)

async def get_members(db: AsyncSession, skip: int = 0, limit: int = 10):
    from app.crud.members_crud import get_all_members
    return await get_all_members(db, skip=skip, limit=limit)


async def update_member(db: AsyncSession, member_id: int, member_update: MemberUpdate):
    # fetch existing
    existing = await get_by_id(db, member_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Member with id {member_id} not found")

    # apply updates
    data = member_update.model_dump(exclude_none=True)
    for key, value in data.items():
        setattr(existing, key, value)

    return await update(db, existing)


async def delete_member(db: AsyncSession, member_id: int):
    from app.crud.members_crud import delete_by_id
    from fastapi import HTTPException

    deleted = await delete_by_id(db, member_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Member with id {member_id} not found")
    return None

