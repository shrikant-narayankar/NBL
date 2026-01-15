from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)

    borrows = relationship("BorrowTransaction", back_populates="member")

    def __repr__(self):
        return f"<Member {self.name}>"
