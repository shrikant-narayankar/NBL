from pydantic import BaseModel, Field, validator

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
    title: str = Field(..., min_length=1, max_length=200, description="Book title")
    author: str = Field(..., min_length=1, max_length=150, description="Book author")
    isbn: str = Field(..., min_length=1, max_length=20, description="ISBN number")
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
    title: str | None = Field(None, min_length=1, max_length=200)
    author: str | None = Field(None, min_length=1, max_length=150)
    isbn: str | None = Field(None, min_length=1, max_length=20)
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