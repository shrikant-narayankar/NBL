from app.crud.librarian_crud import create
from app.schemas.librarian import LibrarianCreate
from sqlalchemy.ext.asyncio import AsyncSession

async def create_librarian(db: AsyncSession, librarian: LibrarianCreate):
    return await create(db, librarian=librarian)