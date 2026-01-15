from sqlalchemy.ext.asyncio import AsyncSession

from app.models.member import Member
from sqlalchemy import select
from app.schemas.members import MemberCreate

async def create(db: AsyncSession, member: MemberCreate) -> Member:
    db_member = Member(**member.model_dump())
    db.add(db_member)
    await db.commit()
    await db.refresh(db_member)
    return db_member

async def get_by_id(db: AsyncSession, member_id: int) -> Member | None:
    result = await db.execute(
        select(Member).where(Member.id == member_id)
    )
    return result.scalars().first()

from sqlalchemy import func

async def get_all_members(db: AsyncSession, skip: int = 0, limit: int = 10):
    total_result = await db.execute(select(func.count()).select_from(Member))
    total = total_result.scalar()

    result = await db.execute(
        select(Member).offset(skip).limit(limit)
    )
    items = result.scalars().all()
    return items, total


async def delete_by_id(db: AsyncSession, member_id: int) -> Member | None:
    result = await db.execute(select(Member).where(Member.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        return None
    await db.delete(member)
    await db.commit()
    return member