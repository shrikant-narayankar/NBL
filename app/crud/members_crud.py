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

async def get_all_members(db: AsyncSession):
    result = await db.execute(
        select(Member)
    )
    return result.scalars().all()


async def delete_by_id(db: AsyncSession, member_id: int) -> Member | None:
    result = await db.execute(select(Member).where(Member.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        return None
    await db.delete(member)
    await db.commit()
    return member