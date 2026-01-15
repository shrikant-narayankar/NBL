
from fastapi import FastAPI
from app.api.v1 import v1_router
from contextlib import asynccontextmanager
# import app.models
# from app.db.base import Base

# from app.models.librarian import Librarian
# from app.models.book import Book
# from app.models.member import Member
# from app.models.borrow import BorrowTransaction
# from app.db.session import init_db
@asynccontextmanager
async def lifespan(app: FastAPI):
    # await init_db()
    yield

app = FastAPI(docs_url="/docs", title="NBL API", version="1.0.0", lifespan=lifespan)

app.include_router(v1_router.router, prefix="/api")