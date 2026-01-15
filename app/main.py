
from fastapi import FastAPI
from app.api.v1 import v1_router
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(docs_url="/docs", title="NBL API", version="1.0.0", lifespan=lifespan)

app.include_router(v1_router.router, prefix="/api")