from fastapi import FastAPI
from app.api.v1 import v1_router
from contextlib import asynccontextmanager
from app.core.logging_config import setup_logging, LoggingMiddleware
from loguru import logger
from app.core.settings import settings

# Initialize Logger
setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting up {settings.PROJECT_NAME}")
    yield
    logger.info(f"Shutting down {settings.PROJECT_NAME}")

app = FastAPI(
    docs_url="/docs",
    title=settings.PROJECT_NAME,
    version="1.0.0",
    lifespan=lifespan
)

# Add Logging Middleware
app.add_middleware(LoggingMiddleware)

from app.core.exception_handlers import register_exception_handlers
register_exception_handlers(app)
    
app.include_router(v1_router.router, prefix=settings.API_STR)