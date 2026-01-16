
from fastapi import FastAPI
from app.api.v1 import v1_router
from contextlib import asynccontextmanager
from app.core.logging_config import setup_logging, LoggingMiddleware
from loguru import logger

# Initialize Logger
setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up NBL API")
    yield
    logger.info("Shutting down NBL API")

app = FastAPI(docs_url="/docs", title="NBL API", version="1.0.0", lifespan=lifespan)

# Add Logging Middleware
app.add_middleware(LoggingMiddleware)

app.include_router(v1_router.router, prefix="/api")