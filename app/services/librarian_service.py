from app.crud.librarian_crud import create
from app.schemas.librarian import LibrarianCreate
from sqlalchemy.ext.asyncio import AsyncSession

async def create_librarian(db: AsyncSession, librarian: LibrarianCreate):
    return await create(db, librarian=librarian)


async def delete_librarian(db: AsyncSession, librarian_id: int):
    from app.crud.librarian_crud import delete_by_id
    from fastapi import HTTPException

    deleted = await delete_by_id(db, librarian_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Librarian with id {librarian_id} not found")
    return None