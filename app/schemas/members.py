from pydantic import BaseModel, Field
from enum import Enum

class MemberResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True
class MemberCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Member name")
    email: str = Field(..., min_length=1, max_length=150, description="Member email")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john.doe@example.com"
            }
        }


class MemberUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    email: str | None = Field(None, min_length=1, max_length=150)
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john.doe@example.com"
            }
        }

class Status(str, Enum):
    returned = "returned"
    borrowed = "borrowed"
    all = "all"