from app.schemas.members import MemberCreate
from app.crud.members_crud import create
from sqlalchemy.ext.asyncio import AsyncSession

async def create_member(db: AsyncSession, member: MemberCreate):
    return await create(db, member=member)

async def get_member_borrows(db: AsyncSession, member_id: int, status, skip: int = 0, limit: int = 10):
    from app.crud.borrow_crud import get_borrows_by_member
    return await get_borrows_by_member(db, member_id, status, skip=skip, limit=limit)

async def get_members(db: AsyncSession, skip: int = 0, limit: int = 10):
    from app.crud.members_crud import get_all_members
    return await get_all_members(db, skip=skip, limit=limit)


async def delete_member(db: AsyncSession, member_id: int):
    from app.crud.members_crud import delete_by_id
    from fastapi import HTTPException

    deleted = await delete_by_id(db, member_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Member with id {member_id} not found")
    return None

