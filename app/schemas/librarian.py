from pydantic import BaseModel, Field
class LibrarianResponse(BaseModel):
    name: str
    email: str

    class Config:
        orm_mode = True
class LibrarianCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Librarian name")
    email: str = Field(..., min_length=1, max_length=150, description="Librarian email")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john.doe@example.com"
            }
        }


class LibrarianUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    email: str | None = Field(None, min_length=1, max_length=150)
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john.doe@example.com"
            }
        }