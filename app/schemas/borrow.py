# ...existing code...
from pydantic import BaseModel, Field, field_validator
from app.schemas.books import BookResponse
from datetime import date
from app.schemas.members import MemberResponse
from enum import Enum


class Include(str, Enum):
    book = "book"
    member = "member"
    all = "all"



class ActiveBorrowBase(BaseModel):
    id: int
    member_id: int
    book_id: int
    borrowed_date: date
    due_date: date | None
    returned_date: date | None

    class Config:
        orm_mode = True


class ActiveBorrowWithBook(ActiveBorrowBase):
    book: BookResponse


class ActiveBorrowWithMember(ActiveBorrowBase):
    member: MemberResponse


class ActiveBorrowWithAll(ActiveBorrowBase):
    book: BookResponse
    member: MemberResponse

class BorrowMemberResponse(BaseModel):
    book_id: int = Field(..., description="ID of the book being borrowed")
    borrowed_date: date = Field(default_factory=date.today, description="Borrowed date (YYYY-MM-DD)")
    returned_date: date | None = Field(None, description="Planned return date (YYYY-MM-DD), optional")
    book: BookResponse | None = Field(None, description="Optional nested book data")

class BorrowRequest(BaseModel):
    member_id: int = Field(..., description="ID of the member borrowing the book")
    book_id: int = Field(..., description="ID of the book being borrowed")
    borrowed_date: date = Field(default_factory=date.today, description="Borrowed date (YYYY-MM-DD)")
    due_date: date = Field(..., description="Due date for return (YYYY-MM-DD)")
    returned_date: date | None = Field(None, description="Planned return date (YYYY-MM-DD), optional")
    book: BookResponse | None = Field(None, description="Optional nested book data")
    member: MemberResponse | None = Field(None, description="Optional nested member data")

    @field_validator("returned_date")
    def _check_return_after_borrow(cls, v, info):
        borrowed = info.data.get("borrowed_date")
        if v is not None and borrowed is not None and v < borrowed:
            raise ValueError("return_date cannot be before borrowed_date")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "member_id": 1,
                "book_id": 2,
                "borrowed_date": "2026-01-14",
                "return_date": "2026-01-21"
            }
        }

class ReturnRequest(BaseModel):
    member_id: int = Field(..., description="ID of the member returning the book")
    book_id: int = Field(..., description="ID of the book being returned")
    returned_date: date = Field(default_factory=date.today, description="Actual return date (YYYY-MM-DD)")

    class Config:
        json_schema_extra = {
            "example": {
                "member_id": 1,
                "book_id": 2,
                "returned_date": "2026-01-15"
            }
        }
