from sqlalchemy.ext.asyncio import AsyncSession
from app.models.librarian import Librarian
from app.schemas.librarian import LibrarianCreate
from sqlalchemy import select

async def create(db_session: AsyncSession, librarian: LibrarianCreate) -> Librarian:
    # print("hehe")
    db_librarian = Librarian(**librarian.model_dump())

    db_session.add(db_librarian)
    await db_session.commit()
    await db_session.refresh(db_librarian)

    return db_librarian

async def get_by_id(db: AsyncSession, librarian_id: int) -> Librarian | None:
    result = await db.execute(
        select(Librarian).where(Librarian.id == librarian_id)
    )
    return result.scalar_one_or_none()

async def update(db: AsyncSession, librarian: Librarian) -> Librarian:
    await db.commit()
    await db.refresh(librarian)
    return librarian


async def delete_by_id(db: AsyncSession, librarian_id: int) -> Librarian | None:
    result = await db.execute(select(Librarian).where(Librarian.id == librarian_id))
    lib = result.scalar_one_or_none()
    if not lib:
        return None
    await db.delete(lib)
    await db.commit()
    return lib
