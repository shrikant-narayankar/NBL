from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from app.services.borrow_service import BookNotAvailable, MemberNotFound

async def book_not_available_handler(request: Request, exc: BookNotAvailable):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )

async def member_not_found_handler(request: Request, exc: MemberNotFound):
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc)},
    )

async def integrity_error_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=409,
        # Typically internal details shouldn't be exposed, but we can verify constraint
        content={"detail": "Conflict: Resource already exists or constraint violation."},
    )

def register_exception_handlers(app: FastAPI):
    app.add_exception_handler(BookNotAvailable, book_not_available_handler)
    app.add_exception_handler(MemberNotFound, member_not_found_handler)
    app.add_exception_handler(IntegrityError, integrity_error_handler)
