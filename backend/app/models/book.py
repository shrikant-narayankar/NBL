from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    author = Column(String(150), nullable=False)
    isbn = Column(String(20), unique=True, nullable=False)

    total_copies = Column(Integer, default=1)
    available_copies = Column(Integer, default=1)

    borrows = relationship("BorrowTransaction", back_populates="book")

    def __repr__(self):
        return f"<Book {self.title}>"
