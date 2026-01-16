import logging
import sys
import time
from loguru import logger
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.settings import settings

class InterceptHandler(logging.Handler):
    """
    Default handler from loguru documentaion for intercepting standard logging messages.
    """
    def emit(self, record):
        # Get corresponding Loguru level if it exists
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find caller from where originated the logged message
        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        
        status_code = response.status_code
        method = request.method
        url = request.url.path
        
        log_msg = f"{method} {url} - {status_code} - {process_time:.2f}ms"
        
        if status_code >= 500:
            logger.error(log_msg)
        elif status_code >= 400:
            logger.warning(log_msg)
        else:
            logger.info(log_msg)
            
        return response

def setup_logging():
    """
    Configure loguru to be the sole logger for the application.
    """
    # Clear loguru's default handler and standard logging handlers
    logger.remove()
    logging.getLogger().handlers = []
    
    # Configure loguru output
    if settings.LOG_JSON:
        logger.add(sys.stdout, serialize=True)
    else:
        logger.add(
            sys.stdout, 
            serialize=False, 
            format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
        )

    # Intercept all logs from standard logging (uvicorn, fastapi, etc.)
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    
    # Optional: explicitly redirect specific loggers if they bypass basicConfig
    for name in ["uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"]:
        _logger = logging.getLogger(name)
        _logger.handlers = [InterceptHandler()]
        _logger.propagate = False
