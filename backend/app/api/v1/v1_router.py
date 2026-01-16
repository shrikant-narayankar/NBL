from fastapi import APIRouter
from fastapi import status
from app.api.v1.books import router as books_router
from app.api.v1.members import router as members_router

from app.api.v1.borrow import router as borrow_router

router = APIRouter(prefix="/v1")
router.include_router(books_router, prefix="/books", tags=["Books"])
router.include_router(members_router, prefix="/members", tags=["Members"])
router.include_router(borrow_router, prefix="/borrow", tags=["Borrow"])