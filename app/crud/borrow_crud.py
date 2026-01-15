from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.schemas.members import Status
from app.models.borrow import BorrowTransaction

async def create(db: AsyncSession, db_borrow: BorrowTransaction) -> BorrowTransaction:
    # db_borrow = BorrowTransaction(**BorrowRequest.model_dump())
    db.add(db_borrow)
    await db.commit()
    await db.refresh(db_borrow)
    return db_borrow

async def get_active_borrow(db: AsyncSession, member_id: int, book_id: int):
    result = await db.execute(
        select(BorrowTransaction)
        .where(BorrowTransaction.member_id == member_id)
        .where(BorrowTransaction.book_id == book_id)
        .where(BorrowTransaction.returned_date == None)
    )
    return result.scalar_one_or_none()

async def get_by_id(db: AsyncSession, borrow_id: int):
    result = await db.execute(select(BorrowTransaction).where(BorrowTransaction.id == borrow_id))
    return result.scalar_one_or_none()


async def update(db: AsyncSession, db_borrow: BorrowTransaction) -> BorrowTransaction:
    await db.commit()
    await db.refresh(db_borrow)
    return db_borrow

async def get_borrows_by_member(db: AsyncSession, member_id: int, status:Status):
    query = select(BorrowTransaction).where(BorrowTransaction.member_id == member_id).options(selectinload(BorrowTransaction.book))
    if status == Status.borrowed:
        query = query.where(BorrowTransaction.returned_date == None)
    elif status == Status.returned:
        query = query.where(BorrowTransaction.returned_date != None)
    result = await db.execute(query)
    borrows = result.scalars().all()
    return borrows


async def delete_by_id(db: AsyncSession, borrow_id: int):
    result = await db.execute(select(BorrowTransaction).where(BorrowTransaction.id == borrow_id))
    borrow = result.scalar_one_or_none()
    if not borrow:
        return None
    await db.delete(borrow)
    await db.commit()
    return borrow


async def get_all_borrows(db: AsyncSession, status: Status, include: str = "all"):
    """Generic fetch for borrows based on status."""
    query = select(BorrowTransaction)
    
    if status == Status.borrowed:
        query = query.where(BorrowTransaction.returned_date == None)
    elif status == Status.returned:
        query = query.where(BorrowTransaction.returned_date != None)
    # if Status.all, no filter on returned_date

    options = []
    if include == "book":
        options.append(selectinload(BorrowTransaction.book))
    elif include == "member":
        options.append(selectinload(BorrowTransaction.member))
    else:
        options.extend([
            selectinload(BorrowTransaction.book),
            selectinload(BorrowTransaction.member),
        ])

    query = query.options(*options)
    result = await db.execute(query)
    return result.scalars().all()


async def get_active_borrows(db: AsyncSession, include: str = "all"):
    return await get_all_borrows(db, status=Status.borrowed, include=include)


async def get_history_borrows(db: AsyncSession, include: str = "all"):
    return await get_all_borrows(db, status=Status.returned, include=include)