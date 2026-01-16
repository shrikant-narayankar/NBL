from pydantic import BaseModel, Field, validator
from app.core.constants import BOOK_TITLE_MAX_LEN, BOOK_AUTHOR_MAX_LEN, BOOK_ISBN_MAX_LEN

class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    isbn: str
    total_copies: int
    available_copies: int

    class Config:
        from_attributes = True

class BookCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=BOOK_TITLE_MAX_LEN, description="Book title")
    author: str = Field(..., min_length=1, max_length=BOOK_AUTHOR_MAX_LEN, description="Book author")
    isbn: str = Field(..., min_length=1, max_length=BOOK_ISBN_MAX_LEN, description="ISBN number")
    total_copies: int = Field(default=1, ge=1, description="Total number of copies")
    available_copies: int = Field(default=1, ge=0, description="Available copies")

    @validator('available_copies')
    def validate_available_copies(cls, v, values):
        if 'total_copies' in values and v > values['total_copies']:
            raise ValueError('available_copies cannot exceed total_copies')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "title": "The Great Gatsby",
                "author": "F. Scott Fitzgerald",
                "isbn": "978-0-7432-7356-5",
                "total_copies": 5,
                "available_copies": 5
            }
        }


class BookUpdateRequest(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=BOOK_TITLE_MAX_LEN)
    author: str | None = Field(None, min_length=1, max_length=BOOK_AUTHOR_MAX_LEN)
    isbn: str | None = Field(None, min_length=1, max_length=BOOK_ISBN_MAX_LEN)
    total_copies: int | None = Field(None, ge=1)
    available_copies: int | None = Field(None, ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "The Great Gatsby",
                "author": "F. Scott Fitzgerald",
                "total_copies": 10,
                "available_copies": 8
            }
        }