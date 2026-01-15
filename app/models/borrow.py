# ...existing code...
from sqlalchemy import Column, Integer, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import date, timedelta
from app.db.base import Base

class BorrowTransaction(Base):
    __tablename__ = "borrow_transactions"
    # UniqueConstraint removed to allow multiple borrows of same book by same member

    id = Column(Integer, primary_key=True)

    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)

    borrowed_date = Column(Date, default=date.today)
    due_date = Column(Date, nullable=False, default=lambda: date.today()+timedelta(days=7))  # default due date 1 weeks from borrowed date
    returned_date = Column(Date, nullable=True)

    member = relationship("Member", back_populates="borrows")
    book = relationship("Book", back_populates="borrows")

    def __repr__(self):
        return f"<Borrow member={self.member_id} book={self.book_id}>"
# ...existing code...