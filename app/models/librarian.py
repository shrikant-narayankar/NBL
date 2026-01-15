from sqlalchemy import Column, Integer, String
from app.db.base import Base

class Librarian(Base):
    __tablename__ = "librarians"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)

    def __repr__(self):
        return f"<Librarian {self.name}>"
