from pydantic import BaseModel, Field
from enum import Enum
from app.core.constants import MEMBER_NAME_MAX_LEN, MEMBER_EMAIL_MAX_LEN

class MemberResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True
class MemberCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=MEMBER_NAME_MAX_LEN, description="Member name")
    email: str = Field(..., min_length=1, max_length=MEMBER_EMAIL_MAX_LEN, description="Member email")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john.doe@example.com"
            }
        }


class MemberUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=MEMBER_NAME_MAX_LEN)
    email: str | None = Field(None, min_length=1, max_length=MEMBER_EMAIL_MAX_LEN)
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