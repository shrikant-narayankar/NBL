from fastapi import APIRouter, Depends
from app.schemas.librarian import LibrarianCreate, LibrarianUpdate
from app.db.session import get_db
from app.models.librarian import Librarian
from fastapi import status
from app.services import librarian_service
router = APIRouter()



@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_librarian(librarian: LibrarianCreate, db_session=Depends(get_db)):
    return await librarian_service.create_librarian(db_session, librarian)
    
    # return await librarian_service.create_librarian(db_session, librarian)
    

@router.patch("/", status_code=status.HTTP_200_OK)
async def update_librarian(librarian: LibrarianUpdate, db_session=Depends(get_db)):
    return {"message": "Librarian updated", "librarian": librarian}


@router.delete("/{librarian_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_librarian(librarian_id: int, db_session=Depends(get_db)):
    await librarian_service.delete_librarian(db_session, librarian_id)
    from fastapi import Response
    return Response(status_code=status.HTTP_204_NO_CONTENT)