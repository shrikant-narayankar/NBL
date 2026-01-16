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

from sqlalchemy import func

async def get_borrows_by_member(db: AsyncSession, member_id: int, status: Status, skip: int = 0, limit: int = 10):
    query = select(BorrowTransaction).where(BorrowTransaction.member_id == member_id)
    if status == Status.borrowed:
        query = query.where(BorrowTransaction.returned_date == None)
    elif status == Status.returned:
        query = query.where(BorrowTransaction.returned_date != None)
    
    total_result = await db.execute(select(func.count()).select_from(query.alias()))
    total = total_result.scalar()

    query = query.options(selectinload(BorrowTransaction.book)).offset(skip).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    return items, total


async def get_borrows_by_book(db: AsyncSession, book_id: int, status: Status, skip: int = 0, limit: int = 10):
    query = select(BorrowTransaction).where(BorrowTransaction.book_id == book_id)
    if status == Status.borrowed:
        query = query.where(BorrowTransaction.returned_date == None)
    elif status == Status.returned:
        query = query.where(BorrowTransaction.returned_date != None)

    total_result = await db.execute(select(func.count()).select_from(query.alias()))
    total = total_result.scalar()

    query = query.options(selectinload(BorrowTransaction.member)).offset(skip).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    return items, total


async def delete_by_id(db: AsyncSession, borrow_id: int):
    result = await db.execute(select(BorrowTransaction).where(BorrowTransaction.id == borrow_id))
    borrow = result.scalar_one_or_none()
    if not borrow:
        return None
    await db.delete(borrow)
    await db.commit()
    return borrow


async def get_all_borrows(
    db: AsyncSession, 
    status: Status, 
    include: str = "all", 
    skip: int = 0, 
    limit: int = 10,
    sort_by: str = "borrowed_date",
    order: str = "desc"
):
    """Generic fetch for borrows based on status."""
    from app.models.book import Book
    from app.models.member import Member
    from sqlalchemy import asc, desc

    query = select(BorrowTransaction)
    
    if status == Status.borrowed:
        query = query.where(BorrowTransaction.returned_date == None)
    elif status == Status.returned:
        query = query.where(BorrowTransaction.returned_date != None)
    
    total_result = await db.execute(select(func.count()).select_from(query.alias()))
    total = total_result.scalar()

    # Join if sorting by related tables
    if sort_by == "book":
        query = query.join(Book, BorrowTransaction.book_id == Book.id)
        sort_attr = Book.title
    elif sort_by == "member":
        query = query.join(Member, BorrowTransaction.member_id == Member.id)
        sort_attr = Member.name
    elif sort_by == "due_date":
        sort_attr = BorrowTransaction.due_date
    else: # borrowed_date or default
        sort_attr = BorrowTransaction.borrowed_date

    if order == "asc":
        query = query.order_by(asc(sort_attr))
    else:
        query = query.order_by(desc(sort_attr))

    options = []
    if include == "book" or sort_by == "book":
        options.append(selectinload(BorrowTransaction.book))
    if include == "member" or sort_by == "member":
        options.append(selectinload(BorrowTransaction.member))
    if include == "all" and not (include == "book" or include == "member"):
        options.extend([
            selectinload(BorrowTransaction.book),
            selectinload(BorrowTransaction.member),
        ])

    query = query.options(*options).offset(skip).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    return items, total


async def get_active_borrows(db: AsyncSession, include: str = "all", skip: int = 0, limit: int = 10, sort_by: str = "borrowed_date", order: str = "desc"):
    return await get_all_borrows(db, status=Status.borrowed, include=include, skip=skip, limit=limit, sort_by=sort_by, order=order)


async def get_history_borrows(db: AsyncSession, include: str = "all", skip: int = 0, limit: int = 10, sort_by: str = "borrowed_date", order: str = "desc"):
    return await get_all_borrows(db, status=Status.returned, include=include, skip=skip, limit=limit, sort_by=sort_by, order=order)